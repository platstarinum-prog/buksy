// Tests: _utils.js — validation, sanitization, parsing, rate limiting
// Run: `node --test tests/utils.test.js`
import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  esc, sanitize, sanitizeShippingInfo,
  validateOrderId, validatePaymentId, validateAmount, validateItems,
  validateEmail, validateIdempotencyKey, validatePaymentMethod,
  parseBody, generateOrderId,
} from '../functions/_lib/utils.js';

// ============================================================================
// esc
// ============================================================================
describe('esc()', function () {
  it('escapes HTML special chars', function () {
    assert.strictEqual(esc('<script>'), '&lt;script&gt;');
    assert.strictEqual(esc('"hello"'), '&quot;hello&quot;');
    assert.strictEqual(esc("it's"), 'it&#39;s');
    assert.strictEqual(esc('a & b'), 'a &amp; b');
  });
  it('returns empty string for non-strings', function () {
    assert.strictEqual(esc(null), '');
    assert.strictEqual(esc(undefined), '');
    assert.strictEqual(esc(123), '');
  });
});

// ============================================================================
// sanitize
// ============================================================================
describe('sanitize()', function () {
  it('strips angle brackets and quotes', function () {
    var result = sanitize('<script>alert("x")</script>');
    // sanitize strips < > " ' — leaves parentheses and slashes
    assert.strictEqual(result, 'scriptalert(x)/script');
  });
  it('truncates to max length', function () {
    assert.strictEqual(sanitize('abcdefghij', 5), 'abcde');
  });
  it('trims whitespace', function () {
    assert.strictEqual(sanitize('  hello  '), 'hello');
  });
  it('handles empty input', function () {
    assert.strictEqual(sanitize(''), '');
    assert.strictEqual(sanitize(null), '');
  });
});

// ============================================================================
// sanitizeShippingInfo
// ============================================================================
describe('sanitizeShippingInfo()', function () {
  it('sanitizes all fields', function () {
    var result = sanitizeShippingInfo({
      firstName: '  John<script>  ',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+380501234567',
      address: 'Main St. 1',
      apartment: '42',
      city: 'Kyiv',
      country: 'Ukraine',
      postalCode: '01001',
      novaPoshtaBranch: '123',
    });
    assert.strictEqual(result.firstName, 'Johnscript');
    assert.strictEqual(result.lastName, 'Doe');
    assert.strictEqual(result.email, 'john@example.com');
    assert.strictEqual(result.phone, '+380501234567');
  });
  it('handles null/undefined', function () {
    var result = sanitizeShippingInfo(null);
    // sanitizeShippingInfo returns {} for null input (no fields populated)
    assert.deepStrictEqual(result, {});
  });
});

// ============================================================================
// validateOrderId
// ============================================================================
describe('validateOrderId()', function () {
  it('accepts valid format', function () {
    assert.doesNotThrow(function () { validateOrderId('BUK-A1B2C3D4-EF5678'); });
  });
  it('rejects lowercase', function () {
    assert.throws(function () { validateOrderId('buk-a1b2c3d4-ef5678'); });
  });
  it('rejects wrong format', function () {
    assert.throws(function () { validateOrderId('ORD-123'); });
    assert.throws(function () { validateOrderId(''); });
    assert.throws(function () { validateOrderId(null); });
  });
});

// ============================================================================
// validatePaymentId
// ============================================================================
describe('validatePaymentId()', function () {
  it('accepts valid payment ID', function () {
    assert.doesNotThrow(function () { validatePaymentId('inv_12345', 'invoiceId'); });
  });
  it('rejects empty', function () {
    assert.throws(function () { validatePaymentId('', 'invoiceId'); });
    assert.throws(function () { validatePaymentId(null, 'invoiceId'); });
  });
});

// ============================================================================
// validateAmount
// ============================================================================
describe('validateAmount()', function () {
  it('accepts positive numbers', function () {
    assert.strictEqual(validateAmount(100), 100);
    assert.strictEqual(validateAmount('50.5'), 50.5);
  });
  it('rejects zero and negative', function () {
    assert.throws(function () { validateAmount(0); });
    assert.throws(function () { validateAmount(-10); });
  });
  it('rejects non-numbers', function () {
    assert.throws(function () { validateAmount('abc'); });
    assert.throws(function () { validateAmount(null); });
  });
});

// ============================================================================
// validateItems
// ============================================================================
describe('validateItems()', function () {
  it('accepts valid items array', function () {
    assert.doesNotThrow(function () {
      validateItems([{ product: { slug: 'test' }, quantity: 2 }]);
    });
  });
  it('rejects empty array', function () {
    assert.throws(function () { validateItems([]); });
    assert.throws(function () { validateItems(null); });
  });
  it('rejects quantity out of range', function () {
    assert.throws(function () { validateItems([{ product: { slug: 't' }, quantity: 0 }]); });
    assert.throws(function () { validateItems([{ product: { slug: 't' }, quantity: 11 }]); });
  });
  it('rejects missing slug', function () {
    assert.throws(function () { validateItems([{ product: {}, quantity: 1 }]); });
  });
  it('rejects too many items', function () {
    var items = [];
    for (var i = 0; i < 21; i++) items.push({ product: { slug: 's' + i }, quantity: 1 });
    assert.throws(function () { validateItems(items); });
  });
});

// ============================================================================
// validateEmail
// ============================================================================
describe('validateEmail()', function () {
  it('accepts valid emails', function () {
    assert.ok(validateEmail('test@example.com'));
    assert.ok(validateEmail('a@b.co'));
  });
  it('rejects invalid emails', function () {
    assert.strictEqual(validateEmail(''), false);
    assert.strictEqual(validateEmail('notanemail'), false);
    assert.strictEqual(validateEmail('@example.com'), false);
    assert.strictEqual(validateEmail(null), false);
  });
});

// ============================================================================
// validatePaymentMethod
// ============================================================================
describe('validatePaymentMethod()', function () {
  it('accepts valid methods', function () {
    assert.strictEqual(validatePaymentMethod('monobank'), 'monobank');
    assert.strictEqual(validatePaymentMethod('card'), 'card');
  });
  it('defaults to card for empty', function () {
    assert.strictEqual(validatePaymentMethod(''), 'card');
    assert.strictEqual(validatePaymentMethod(null), 'card');
  });
  it('rejects invalid methods', function () {
    assert.throws(function () { validatePaymentMethod('bitcoin'); });
  });
});

// ============================================================================
// parseBody
// ============================================================================
describe('parseBody()', function () {
  it('parses valid JSON', async function () {
    var req = new Request('http://localhost', { method: 'POST', body: '{"a":1}' });
    var result = await parseBody(req, 1000);
    assert.deepStrictEqual(result.data, { a: 1 });
    assert.strictEqual(result.error, undefined);
  });
  it('rejects oversized body', async function () {
    var req = new Request('http://localhost', { method: 'POST', body: '{"a":1}' });
    var result = await parseBody(req, 5);
    assert.ok(result.error);
  });
  it('rejects malformed JSON', async function () {
    var req = new Request('http://localhost', { method: 'POST', body: '{bad' });
    var result = await parseBody(req, 1000);
    assert.ok(result.error);
  });
  it('rejects non-object JSON', async function () {
    var req = new Request('http://localhost', { method: 'POST', body: '123' });
    var result = await parseBody(req, 1000);
    assert.ok(result.error);
  });
  it('rejects null', async function () {
    var req = new Request('http://localhost', { method: 'POST', body: 'null' });
    var result = await parseBody(req, 1000);
    assert.ok(result.error);
  });
  it('handles empty body', async function () {
    var req = new Request('http://localhost', { method: 'POST', body: '' });
    var result = await parseBody(req, 1000);
    assert.ok(result.error);
  });
});

// ============================================================================
// generateOrderId
// ============================================================================
describe('generateOrderId()', function () {
  it('generates valid format', function () {
    var id = generateOrderId();
    assert.ok(/^BUK-[A-F0-9]{8}-[A-F0-9]{6}$/.test(id), 'Got: ' + id);
  });
  it('generates unique IDs', function () {
    var ids = new Set();
    for (var i = 0; i < 100; i++) ids.add(generateOrderId());
    assert.strictEqual(ids.size, 100);
  });
});

// ============================================================================
// validateIdempotencyKey
// ============================================================================
describe('validateIdempotencyKey()', function () {
  it('accepts valid key', function () {
    assert.doesNotThrow(function () { validateIdempotencyKey('abc-123'); });
    assert.doesNotThrow(function () { validateIdempotencyKey(undefined); });
    assert.doesNotThrow(function () { validateIdempotencyKey(null); });
  });
  it('rejects too long key', function () {
    var long = 'x'.repeat(129);
    assert.throws(function () { validateIdempotencyKey(long); });
  });
});
