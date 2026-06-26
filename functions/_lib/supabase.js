import { createClient } from '@supabase/supabase-js';
import { DatabaseError, DuplicateOrderError, OrderNotFoundError, StockInsufficientError, AmountMismatchError, ValidationError } from './errors.js';
import { ERROR_CODES, RPC_ERRORS, DB_TIMEOUT } from './constants.js';

let client = null;

function getClient(env) {
  if (client) return client;
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new DatabaseError('Supabase not configured', 'DB_CONFIG');
  client = createClient(url, key);
  return client;
}

function withTimeout(promise, timeoutMs) {
  const t = timeoutMs || DB_TIMEOUT;
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new DatabaseError('DB timeout', 'DB_TIMEOUT')), t)),
  ]);
}

function classifyRpcError(error, amountPaid, orderTotal) {
  if (!error) return;
  const code = error.code || '';
  if (code === RPC_ERRORS.STOCK_INSUFFICIENT) throw new StockInsufficientError('stock');
  if (code === RPC_ERRORS.AMOUNT_MISMATCH) throw new AmountMismatchError(amountPaid || 0, orderTotal || 0);
  if (code === RPC_ERRORS.ORDER_ALREADY_PAID) return;
  if (code === ERROR_CODES.UNIQUE_VIOLATION) {
    const msg = error.message || '';
    if (msg.includes('idempotency_key') || msg.includes('payment_id')) throw new DuplicateOrderError('via unique');
  }
  throw new DatabaseError(error.message || 'DB error', code || 'DB_ERROR', error);
}

function _validateOrderId(id) {
  if (!id || typeof id !== 'string' || !/^BUK-[A-F0-9]{8}-[A-F0-9]{6}$/.test(id)) throw new ValidationError('Invalid order_id: ' + id, 'orderId');
}
function _validateIdempotencyKey(key) {
  if (key && (typeof key !== 'string' || key.length > 128)) throw new ValidationError('Invalid idempotency_key', 'idempotencyKey');
}
function _validateItemsArray(items) {
  if (items && (!Array.isArray(items) || !items.length)) throw new ValidationError('Items must be non-empty array', 'items');
}

// ============================================================================
// Order Operations
// ============================================================================
export async function saveOrder(env, order) {
  _validateOrderId(order.order_id);
  _validateIdempotencyKey(order.idempotency_key);
  const supabase = getClient(env);
  const { data, error } = await withTimeout(supabase.from('orders').insert(order).select('order_id, total, status').single());
  if (error) {
    if (error.code === ERROR_CODES.UNIQUE_VIOLATION && (error.message || '').includes('idempotency_key')) {
      throw new DuplicateOrderError(order.idempotency_key || 'unknown');
    }
    classifyRpcError(error);
  }
  return data;
}

export async function getOrderByIdempotencyKey(env, key) {
  _validateIdempotencyKey(key);
  const supabase = getClient(env);
  const { data, error } = await withTimeout(supabase.from('orders').select('*').eq('idempotency_key', key).single());
  if (error) { if (error.code === ERROR_CODES.NO_ROWS) return null; classifyRpcError(error); }
  return data;
}

export async function getOrderByRef(env, orderId) {
  _validateOrderId(orderId);
  const supabase = getClient(env);
  const { data, error } = await withTimeout(supabase.from('orders').select('*').eq('order_id', orderId).single());
  if (error) { if (error.code === ERROR_CODES.NO_ROWS) throw new OrderNotFoundError(orderId); classifyRpcError(error); }
  return data;
}

export async function updateOrderStatus(env, orderId, updates) {
  _validateOrderId(orderId);
  if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) throw new ValidationError('No update fields', 'updates');
  const supabase = getClient(env);
  const { data, error } = await withTimeout(supabase.from('orders').update(updates).eq('order_id', orderId).select('id').single());
  if (error) { if (error.code === ERROR_CODES.NO_ROWS) throw new OrderNotFoundError(orderId); classifyRpcError(error); }
  if (!data) throw new OrderNotFoundError(orderId);
  return true;
}

// ============================================================================
// Payment Operations
// ============================================================================
export async function markOrderPaidWithStock(env, orderId, paymentId, amountPaid, orderTotal, items) {
  _validateOrderId(orderId);
  if (!paymentId || typeof paymentId !== 'string') throw new ValidationError('Invalid payment_id', 'paymentId');
  if (typeof amountPaid !== 'number' || amountPaid <= 0) throw new ValidationError('Invalid amount_paid', 'amountPaid');
  if (typeof orderTotal !== 'number' || orderTotal <= 0) throw new ValidationError('Invalid order_total', 'orderTotal');
  _validateItemsArray(items);

  const supabase = getClient(env);
  const { data, error } = await withTimeout(supabase.rpc('mark_order_paid_with_stock', {
    p_order_id: orderId, p_payment_id: paymentId, p_amount_paid: amountPaid, p_order_total: orderTotal,
    p_items: items && items.length ? items : null,
  }));
  if (error) classifyRpcError(error, amountPaid, orderTotal);
  return !!data;
}

// ============================================================================
// Inventory Operations
// ============================================================================
export async function decreaseStockBulk(env, items) {
  _validateItemsArray(items);
  const payload = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const slug = it.slug || it.product?.slug;
    const qty = Number(it.quantity || it.qty) || 0;
    const def = Number(it.default_stock) || 99;
    if (!slug) throw new ValidationError('Missing slug at ' + i, 'items[' + i + ']');
    if (qty <= 0) throw new ValidationError('Invalid qty at ' + i, 'items[' + i + ']');
    payload.push({ slug, qty, default_stock: def });
  }
  const supabase = getClient(env);
  const { error } = await withTimeout(supabase.rpc('decrease_stock_bulk', { p_items: payload }));
  if (error) classifyRpcError(error);
  return true;
}

export async function getStock(env, slug) {
  if (!slug || typeof slug !== 'string') throw new ValidationError('Invalid slug', 'slug');
  const supabase = getClient(env);
  const { data, error } = await withTimeout(supabase.rpc('get_stock', { product_slug: slug }));
  if (error) classifyRpcError(error);
  return data;
}
