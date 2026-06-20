const { createClient } = require('@supabase/supabase-js');

let client = null;

function getClient() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn('Supabase not configured — skipping DB operations');
    return null;
  }
  client = createClient(url, key);
  return client;
}

async function saveOrder(order) {
  const supabase = getClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from('orders').insert(order).select('id').single();
  if (error) {
    if (error.code === '23505' && error.message.includes('idempotency_key')) {
      return { duplicate: true };
    }
    console.error('Supabase saveOrder error:', error.message);
    return null;
  }
  return data;
}

async function updateOrderStatus(orderId, updates) {
  const supabase = getClient();
  if (!supabase) return null;
  const { error } = await supabase.from('orders').update(updates).eq('order_id', orderId);
  if (error) console.error('Supabase updateOrder error:', error.message);
  return !error;
}

async function markOrderPaidWithStock(orderId, paymentId, itemsJson) {
  var supabase = getClient();
  if (!supabase) throw new Error('Supabase not configured');
  var { data, error } = await supabase.rpc('mark_order_paid_with_stock', {
    p_order_id: orderId,
    p_payment_id: paymentId,
    p_items: itemsJson
  });
  if (error) {
    if (error.message && error.message.includes('Insufficient stock')) {
      throw new Error('STOCK_INSUFFICIENT: ' + error.message);
    }
    console.error('Supabase markOrderPaidWithStock error:', error.message);
    throw new Error('Failed to process payment');
  }
  return !!data;
}

async function decreaseStock(items) {
  var supabase = getClient();
  if (!supabase) return [];
  var errors = [];
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var slug = item.product?.slug;
    var qty = Number(item.quantity) || 0;
    var defaultStock = Number(item.default_stock) || 99;
    if (!slug || qty <= 0) continue;
    var resp = await supabase.rpc('decrease_stock', { product_slug: slug, qty: qty, default_stock: defaultStock });
    if (resp.error) {
      console.error('decreaseStock failed for', slug, ':', resp.error.message);
      errors.push(slug);
    }
  }
  return errors;
}

async function getStock(slug) {
  var supabase = getClient();
  if (!supabase) return null;
  var { data, error } = await supabase.rpc('get_stock', { product_slug: slug });
  if (error) { console.error('getStock error:', error.message); return null; }
  return data;
}

async function getOrderByRef(orderId) {
  var supabase = getClient();
  if (!supabase) return null;
  var { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_id', orderId)
    .single();
  if (error) { console.error('Supabase getOrderByRef error:', error.message); return null; }
  return data;
}

module.exports = { saveOrder, updateOrderStatus, markOrderPaidWithStock, decreaseStock, getStock, getOrderByRef };
