export class DatabaseError extends Error {
  constructor(message, code, cause) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code || 'DB_UNKNOWN';
    this.cause = cause || null;
  }
}
export class OrderNotFoundError extends DatabaseError {
  constructor(orderId) { super(`Order not found: ${orderId}`, 'ORDER_NOT_FOUND'); this.name = 'OrderNotFoundError'; }
}
export class DuplicateOrderError extends DatabaseError {
  constructor(key) { super(`Duplicate: idempotency_key=${key}`, 'DUPLICATE_ORDER'); this.name = 'DuplicateOrderError'; }
}
export class StockInsufficientError extends DatabaseError {
  constructor(slug) { super(`Insufficient stock: ${slug}`, 'STOCK_INSUFFICIENT'); this.name = 'StockInsufficientError'; }
}
export class AmountMismatchError extends DatabaseError {
  constructor(paid, total) { super(`Amount mismatch: paid ${paid}, total ${total}`, 'AMOUNT_MISMATCH'); this.name = 'AmountMismatchError'; }
}
export class ValidationError extends Error {
  constructor(message, field) { super(message); this.name = 'ValidationError'; this.field = field || null; }
}
export class RateLimitError extends Error {
  constructor() { super('Too many requests'); this.name = 'RateLimitError'; }
}
export class SignatureError extends Error {
  constructor() { super('Invalid signature'); this.name = 'SignatureError'; }
}
