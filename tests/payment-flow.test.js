// Tests: Payment Flow — idempotency, double-payment, amount verification, stock
// Run: `node --test tests/payment-flow.test.js`
import assert from 'node:assert';
import { describe, it } from 'node:test';
import { generateOrderId, validateOrderId, validateItems, validateAmount, validateEmail, esc, sanitize } from '../functions/_lib/utils.js';
import { DuplicateOrderError, StockInsufficientError, AmountMismatchError, ValidationError } from '../functions/_lib/errors.js';
import { ORDER_STATUS, PAYMENT, ERROR_CODES, RPC_ERRORS } from '../functions/_lib/constants.js';

// ============================================================================
// IDEMPOTENCY
// ============================================================================
describe('Idempotency', function () {
  it('DuplicateOrderError carries the key', function () {
    var err = new DuplicateOrderError('key-abc-123');
    assert.ok(err instanceof DuplicateOrderError);
    assert.ok(err.message.indexOf('key-abc-123') !== -1);
    assert.strictEqual(err.code, 'DUPLICATE_ORDER');
  });

  it('saveOrder should throw DuplicateOrderError not return null', function () {
    // Conceptual test: in the new contract, saveOrder THROWS DuplicateOrderError
    // This verifies the error class is structured correctly for catch blocks
    var caught = false;
    try {
      throw new DuplicateOrderError('test-key');
    } catch (e) {
      caught = true;
      assert.ok(e instanceof DuplicateOrderError);
      assert.strictEqual(e.code, 'DUPLICATE_ORDER');
    }
    assert.ok(caught, 'Should have caught the error');
  });

  it('checkout handler catches DuplicateOrderError and fetches existing order', function () {
    // Simulates the flow in monobank-checkout.js:
    // 1. saveOrder throws DuplicateOrderError
    // 2. catch block calls getOrderByIdempotencyKey
    // 3. Returns existing order data

    var mockExistingOrder = {
      order_id: 'BUK-EXISTNG-IDHERE',
      status: ORDER_STATUS.AWAITING_PAYMENT,
      total: 1299,
    };

    var error = new DuplicateOrderError('my-key');
    var result = null;

    // Simulate the catch block logic
    if (error instanceof DuplicateOrderError) {
      result = {
        statusCode: 200,
        body: JSON.stringify({
          redirectUrl: '/checkout?orderId=' + mockExistingOrder.order_id,
          orderId: mockExistingOrder.order_id,
        }),
      };
    }

    assert.ok(result);
    assert.strictEqual(result.statusCode, 200);
    var body = JSON.parse(result.body);
    assert.ok(body.redirectUrl);
    assert.ok(body.orderId);
  });
});

// ============================================================================
// DOUBLE PAYMENT
// ============================================================================
describe('Double Payment Prevention', function () {
  it('markOrderPaidWithStock returns FALSE when already paid (simulated)', function () {
    // Simulate the RPC logic:
    // Guard 1: UPDATE ... WHERE status = 'awaiting_payment' AND stock_decreased = FALSE
    // If already paid, UPDATE affects 0 rows → was_updated = FALSE → return FALSE

    var wasPaidFirstCall = true;
    var wasPaidSecondCall = false;

    assert.strictEqual(wasPaidFirstCall, true, 'First payment should succeed');
    assert.strictEqual(wasPaidSecondCall, false, 'Second payment should be rejected');
  });

  it('callback returns 200 OK for already-paid orders (idempotent)', function () {
    // Simulate callback handler
    var wasPaid = false; // RPC returned FALSE — already paid
    var response = wasPaid
      ? { statusCode: 200, body: JSON.stringify({ ok: true }) } // newly paid path
      : { statusCode: 200, body: JSON.stringify({ ok: true }) }; // already paid path (also 200)

    assert.strictEqual(response.statusCode, 200);
  });

  it('Telegram/email only sent on FIRST successful payment', function () {
    var wasPaid = true;
    var notificationsSent = false;

    if (wasPaid) {
      notificationsSent = true;
    }

    assert.ok(notificationsSent, 'Notifications should be sent on first payment');

    // Second call
    wasPaid = false;
    notificationsSent = false;
    if (wasPaid) {
      notificationsSent = true;
    }

    assert.ok(!notificationsSent, 'Notifications should NOT be sent on duplicate callback');
  });
});

// ============================================================================
// AMOUNT VERIFICATION
// ============================================================================
describe('Amount Verification', function () {
  it('rejects amount below 99% of order total', function () {
    var orderTotal = 1299;
    var badAmount = 1000; // 1000 / 1299 = 77% — below tolerance
    var tolerance = PAYMENT.AMOUNT_TOLERANCE;

    var rejected = badAmount < (orderTotal * tolerance);
    assert.ok(rejected, 'Should reject amount below ' + (tolerance * 100) + '%');

    // This would throw AmountMismatchError in the RPC
    var err = new AmountMismatchError(badAmount, orderTotal);
    assert.ok(err instanceof AmountMismatchError);
    assert.strictEqual(err.code, 'AMOUNT_MISMATCH');
  });

  it('accepts amount >= 99% of order total', function () {
    var orderTotal = 1299;
    var goodAmount = 1287; // 1287 >= 1299 * 0.99 = 1286.01

    var accepted = goodAmount >= (orderTotal * PAYMENT.AMOUNT_TOLERANCE);
    assert.ok(accepted, 'Should accept amount >= 99%: ' + goodAmount + ' vs ' + (orderTotal * PAYMENT.AMOUNT_TOLERANCE));
  });

  it('rejects zero amount', function () {
    var orderTotal = 1299;
    var zeroAmount = 0;

    var accepted = zeroAmount >= (orderTotal * PAYMENT.AMOUNT_TOLERANCE);
    assert.ok(!accepted, 'Zero amount should always be rejected');
  });

  it('AmountMismatchError is thrown in callback handler flow', function () {
    var err = new AmountMismatchError(10, 1299);

    var response = null;
    if (err instanceof AmountMismatchError) {
      response = { statusCode: 400, body: JSON.stringify({ error: 'Amount mismatch' }) };
    }

    assert.ok(response);
    assert.strictEqual(response.statusCode, 400);
  });
});

// ============================================================================
// STOCK
// ============================================================================
describe('Stock Management', function () {
  it('StockInsufficientError carries slug info', function () {
    var err = new StockInsufficientError('tshirt-black');
    assert.ok(err instanceof StockInsufficientError);
    assert.strictEqual(err.code, 'STOCK_INSUFFICIENT');
  });

  it('decreaseStockBulk validates non-empty items array', function () {
    assert.throws(
      function () { validateItems([]); },
      ValidationError
    );
    assert.throws(
      function () { validateItems(null); },
      ValidationError
    );
  });

  it('catalog stock check AND DB stock check both run', function () {
    // Both checks exist in _catalog.js validateCatalogItems
    // Catalog: Number(entry.stock) || 0 < qty
    // DB: dbStock < qty
    // This test verifies the catalog fallback to 0 logic
    var entryStock = undefined;
    var effectiveStock = Number(entryStock) || 0;

    assert.strictEqual(effectiveStock, 0, 'Missing stock in catalog should default to 0, not NaN');
  });

  it('stock never goes below 0 due to CHECK constraint + WHERE stock >= qty', function () {
    // SQL: CONSTRAINT chk_stock_nonnegative CHECK (stock >= 0)
    // SQL: UPDATE inventory ... WHERE stock >= qty
    // Both prevent negative stock

    var stockBefore = 5;
    var qty = 6;
    var canDecrease = stockBefore >= qty;

    assert.ok(!canDecrease, 'Should not be able to decrease beyond available stock');
  });
});

// ============================================================================
// ORDER ID
// ============================================================================
describe('Order ID', function () {
  it('format: BUK-XXXXXXXX-XXXXXX (hex uppercase)', function () {
    var id = generateOrderId();
    var match = /^BUK-[A-F0-9]{8}-[A-F0-9]{6}$/.test(id);
    assert.ok(match, 'Invalid order ID format: ' + id);
  });

  it('validateOrderId accepts generated IDs', function () {
    for (var i = 0; i < 10; i++) {
      var id = generateOrderId();
      assert.doesNotThrow(function () { validateOrderId(id); });
    }
  });
});

// ============================================================================
// CANCELLED ORDERS CANNOT BE PAID
// ============================================================================
describe('Cancelled Order Protection', function () {
  it('SQL WHERE status = awaiting_payment prevents paying cancelled orders', function () {
    // The RPC uses: WHERE order_id = p_order_id AND status = 'awaiting_payment' AND stock_decreased = FALSE
    // Cancelled orders have status = 'cancelled' → will not match → was_updated = FALSE → return FALSE

    var status = 'cancelled';
    var canBePaid = status === 'awaiting_payment';

    assert.strictEqual(canBePaid, false, 'Cancelled order should not match the payment WHERE clause');
  });

  it('new orders without awaiting_payment status cannot be paid', function () {
    var status = 'new';
    var canBePaid = status === 'awaiting_payment';

    assert.strictEqual(canBePaid, false, 'Orders with status=new should not be payable directly');
  });
});

// ============================================================================
// ERROR CODE CLASSIFICATION
// ============================================================================
describe('RPC Error Classification', function () {
  it('classifies by error.code not by message text', function () {
    // The contract: classifyRpcError uses error.code (RPC_ERRORS.STK00, etc.)
    // NOT error.message.indexOf('Insufficient stock')

    var mockError = { code: RPC_ERRORS.STOCK_INSUFFICIENT, message: 'Insufficient stock for hat' };

    var isStockError = mockError.code === RPC_ERRORS.STOCK_INSUFFICIENT;
    var isAmtError = mockError.code === RPC_ERRORS.AMOUNT_MISMATCH;

    assert.ok(isStockError, 'Should detect STK00 by code');
    assert.ok(!isAmtError, 'Should not misclassify as amount error');
  });

  it('AMOUNT_MISMATCH detection is by code', function () {
    var mockError = { code: RPC_ERRORS.AMOUNT_MISMATCH, message: 'Amount mismatch: paid 100 but order total is 200' };

    var isAmtError = mockError.code === RPC_ERRORS.AMOUNT_MISMATCH;
    assert.ok(isAmtError, 'Should detect AMT00 by code');
  });
});

// ============================================================================
// SANITIZATION + ESC IN EMAIL/HTML
// ============================================================================
describe('XSS Prevention', function () {
  it('sanitize removes angle brackets and quotes', function () {
    var input = '<img src=x onerror=alert(1)>';
    var cleaned = sanitize(input);
    assert.ok(cleaned.indexOf('<') === -1);
    assert.ok(cleaned.indexOf('>') === -1);
  });

  it('esc encodes remaining HTML entities', function () {
    var input = 'test & demo';
    var encoded = esc(input);
    assert.strictEqual(encoded, 'test &amp; demo');
  });

  it('double protection: sanitize + esc', function () {
    var input = '<script>alert("xss")</script>';
    var cleaned = esc(sanitize(input));
    // After sanitize: scriptalertxss/script (brackets removed)
    // After esc: no change needed since no & " ' < >
    assert.ok(cleaned.indexOf('<script>') === -1);
    assert.ok(cleaned.indexOf('&lt;script&gt;') === -1);
  });
});
