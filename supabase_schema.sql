-- Run this in your Supabase SQL Editor to set up the database.
-- Safe to re-run — uses IF NOT EXISTS / OR REPLACE.

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  idempotency_key TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  payment_method TEXT DEFAULT 'card',
  shipping_method TEXT DEFAULT 'standard',
  customer JSONB DEFAULT '{}',
  shipping JSONB DEFAULT '{}',
  items JSONB DEFAULT '[]',
  subtotal NUMERIC(12,2) DEFAULT 0,
  shipping_cost NUMERIC(12,2) DEFAULT 0,
  tax NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  payment_id TEXT,
  tracking_number TEXT,
  stock_decreased BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint auto-creates index; drop redundant explicit index
DROP INDEX IF EXISTS idx_orders_order_id;
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 99,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_stock_nonnegative CHECK (stock >= 0)
);

DROP INDEX IF EXISTS idx_inventory_slug;

-- Atomic stock decrease: seeds product row with default_stock if missing, then atomically decreases.
-- Uses catalog stock as initial value when inventory row is first created.
-- RAISEs if insufficient stock.
CREATE OR REPLACE FUNCTION decrease_stock(product_slug TEXT, qty INTEGER, default_stock INTEGER DEFAULT 99)
RETURNS VOID AS $$
BEGIN
  INSERT INTO inventory (slug, name, stock)
  VALUES (product_slug, product_slug, default_stock)
  ON CONFLICT (slug) DO NOTHING;

  UPDATE inventory
  SET stock = stock - qty,
      updated_at = NOW()
  WHERE slug = product_slug AND stock >= qty;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for %', product_slug;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark order as paid AND decrease stock atomically.
-- Returns TRUE if order was newly marked paid, FALSE if already paid.
-- Idempotent: safe for duplicate webhook calls.
CREATE OR REPLACE FUNCTION mark_order_paid_with_stock(
  p_order_id TEXT,
  p_payment_id TEXT,
  p_items JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  item_record RECORD;
  was_updated BOOLEAN := FALSE;
BEGIN
  UPDATE orders
  SET status = 'paid',
      payment_id = p_payment_id,
      paid_at = NOW(),
      updated_at = NOW()
  WHERE order_id = p_order_id AND status != 'paid'
  RETURNING TRUE INTO was_updated;

  IF was_updated IS NULL OR was_updated = FALSE THEN
    RETURN FALSE;
  END IF;

  IF p_items IS NOT NULL AND jsonb_array_length(p_items) > 0 THEN
    FOR item_record IN SELECT * FROM jsonb_to_recordset(p_items) AS (slug TEXT, qty INTEGER, default_stock INTEGER)
    LOOP
      INSERT INTO inventory (slug, name, stock)
      VALUES (item_record.slug, item_record.slug, COALESCE(item_record.default_stock, 99))
      ON CONFLICT (slug) DO NOTHING;

      UPDATE inventory
      SET stock = stock - item_record.qty,
          updated_at = NOW()
      WHERE slug = item_record.slug AND stock >= item_record.qty;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient stock for %', item_record.slug;
      END IF;
    END LOOP;
  END IF;

  UPDATE orders SET stock_decreased = TRUE, updated_at = NOW()
  WHERE order_id = p_order_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current stock for a product (returns 99 if product not in inventory yet)
CREATE OR REPLACE FUNCTION get_stock(product_slug TEXT)
RETURNS INTEGER AS $$
DECLARE
  s INTEGER;
BEGIN
  SELECT stock INTO s FROM inventory WHERE slug = product_slug;
  RETURN COALESCE(s, 99);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Row-Level Security (bypassed by service_role key used in functions)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- DO NOT CREATE POLICIES — service_role bypasses RLS.
-- Anon/authenticated keys get empty result sets (intentional).
