// Tests: Error classes — run `node --test tests/errors.test.js`
import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  DatabaseError, OrderNotFoundError, DuplicateOrderError,
  StockInsufficientError, AmountMismatchError, ValidationError,
  RateLimitError, SignatureError,
} from '../functions/_lib/errors.js';

describe('Error Classes', function () {
  it('DatabaseError extends Error and has code', function () {
    var e = new DatabaseError('test', 'DB_ERR', { cause: 'x' });
    assert.ok(e instanceof Error);
    assert.ok(e instanceof DatabaseError);
    assert.strictEqual(e.name, 'DatabaseError');
    assert.strictEqual(e.code, 'DB_ERR');
    assert.strictEqual(e.cause.cause, 'x');
  });

  it('OrderNotFoundError extends DatabaseError', function () {
    var e = new OrderNotFoundError('BUK-12345678-ABCDEF');
    assert.ok(e instanceof DatabaseError);
    assert.strictEqual(e.code, 'ORDER_NOT_FOUND');
  });

  it('DuplicateOrderError extends DatabaseError', function () {
    var e = new DuplicateOrderError('key123');
    assert.ok(e instanceof DatabaseError);
    assert.strictEqual(e.code, 'DUPLICATE_ORDER');
  });

  it('StockInsufficientError extends DatabaseError', function () {
    var e = new StockInsufficientError('test-shirt');
    assert.ok(e instanceof DatabaseError);
    assert.strictEqual(e.code, 'STOCK_INSUFFICIENT');
  });

  it('AmountMismatchError extends DatabaseError', function () {
    var e = new AmountMismatchError(100, 200);
    assert.ok(e instanceof DatabaseError);
    assert.strictEqual(e.code, 'AMOUNT_MISMATCH');
  });

  it('ValidationError extends Error', function () {
    var e = new ValidationError('bad input', 'email');
    assert.ok(e instanceof Error);
    assert.strictEqual(e.field, 'email');
  });

  it('RateLimitError extends Error', function () {
    var e = new RateLimitError();
    assert.ok(e instanceof Error);
    assert.strictEqual(e.message, 'Too many requests');
  });

  it('SignatureError extends Error', function () {
    var e = new SignatureError();
    assert.ok(e instanceof Error);
    assert.strictEqual(e.message, 'Invalid signature');
  });

  it('instanceof checks work correctly', function () {
    var dup = new DuplicateOrderError('k');
    var stock = new StockInsufficientError('s');
    var amt = new AmountMismatchError(1, 2);
    var val = new ValidationError('x');

    assert.ok(dup instanceof DuplicateOrderError);
    assert.ok(stock instanceof StockInsufficientError);
    assert.ok(amt instanceof AmountMismatchError);
    assert.ok(val instanceof ValidationError);

    // Cross-check: wrong types
    assert.ok(!(dup instanceof StockInsufficientError));
    assert.ok(!(val instanceof DatabaseError));
  });
});
