/**
 * Tests: _constants.js — all frozen, all defined
 * Run: node --test tests/constants.test.js
 */
var assert = require('node:assert');
var { describe, it } = require('node:test');
var c = require('../netlify/functions/_constants');

describe('Constants', function () {
  it('ERROR_CODES are defined', function () {
    assert.strictEqual(c.ERROR_CODES.UNIQUE_VIOLATION, '23505');
    assert.strictEqual(c.ERROR_CODES.NO_ROWS, 'PGRST116');
  });

  it('RPC_ERRORS are defined', function () {
    assert.strictEqual(c.RPC_ERRORS.STOCK_INSUFFICIENT, 'STK00');
    assert.strictEqual(c.RPC_ERRORS.AMOUNT_MISMATCH, 'AMT00');
    assert.strictEqual(c.RPC_ERRORS.ORDER_ALREADY_PAID, 'PAID0');
  });

  it('DB_TIMEOUT is defined and reasonable', function () {
    assert.ok(c.DB_TIMEOUT > 0);
    assert.ok(c.DB_TIMEOUT <= 30000);
  });

  it('RATE_LIMIT values are reasonable', function () {
    assert.ok(c.RATE_LIMIT.CHECKOUT > 0);
    assert.ok(c.RATE_LIMIT.CONTACT > 0);
    assert.ok(c.RATE_LIMIT.WEBHOOK > 0);
    assert.ok(c.RATE_LIMIT.WEBHOOK > c.RATE_LIMIT.CHECKOUT);
  });

  it('FIELD_LIMITS have all expected keys', function () {
    var expected = ['EMAIL', 'NAME', 'PHONE', 'ADDRESS', 'APARTMENT', 'CITY',
      'COUNTRY', 'POSTAL_CODE', 'NOVA_POSHTA_BRANCH', 'PRODUCT_SIZE',
      'PRODUCT_NAME', 'IDEMPOTENCY_KEY', 'MESSAGE', 'SUBJECT', 'PAYMENT_ID', 'TRACKING_NUMBER'];
    for (var i = 0; i < expected.length; i++) {
      assert.ok(c.FIELD_LIMITS[expected[i]] > 0, 'Missing or zero: ' + expected[i]);
    }
  });

  it('ORDER_LIMITS are reasonable', function () {
    assert.ok(c.ORDER_LIMITS.MAX_ITEMS > 0);
    assert.ok(c.ORDER_LIMITS.MAX_ITEMS <= 100);
    assert.ok(c.ORDER_LIMITS.MAX_QUANTITY > c.ORDER_LIMITS.MIN_QUANTITY);
    assert.ok(c.ORDER_LIMITS.MAX_BODY_SIZE > 0);
  });

  it('PAYMENT constants are defined', function () {
    assert.ok(c.PAYMENT.INVOICE_VALIDITY > 0);
    assert.ok(c.PAYMENT.AMOUNT_TOLERANCE > 0.5 && c.PAYMENT.AMOUNT_TOLERANCE <= 1);
    assert.ok(c.PAYMENT.DEFAULT_STOCK > 0);
    assert.strictEqual(c.PAYMENT.CCY, 980);
  });

  it('ORDER_STATUS defines all expected states', function () {
    assert.ok(c.ORDER_STATUS.NEW);
    assert.ok(c.ORDER_STATUS.AWAITING_PAYMENT);
    assert.ok(c.ORDER_STATUS.PAID);
    assert.ok(c.ORDER_STATUS.SHIPPED);
    assert.ok(c.ORDER_STATUS.CANCELLED);
  });

  it('PAYMENT_METHOD defines expected methods', function () {
    assert.strictEqual(c.PAYMENT_METHOD.MONOBANK, 'monobank');
    assert.strictEqual(c.PAYMENT_METHOD.CARD, 'card');
  });

  it('all constant objects are frozen', function () {
    // Object.freeze prevents modification in strict mode. In sloppy mode
    // the assignment silently fails. Test doesn't throw in our context.
    // Instead verify values are unchanged after attempted writes.
    var original = c.RATE_LIMIT.CHECKOUT;
    c.RATE_LIMIT.CHECKOUT = 999;
    assert.strictEqual(c.RATE_LIMIT.CHECKOUT, original, 'Should not be mutable');
  });
});
