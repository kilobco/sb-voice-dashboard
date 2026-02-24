-- 001_create_tables.sql
-- Voice ordering system schema: restaurants, customers, menu_items,
-- calls, call_transcript_entries, orders, order_items.

-- ─── Extensions ─────────────────────────────────────────────────────

-- pgvector for embedding similarity search (menu items)
CREATE EXTENSION IF NOT EXISTS vector;

-- gen_random_uuid() for default PK values
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── restaurants ────────────────────────────────────────────────────

CREATE TABLE restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  twilio_phone_number text NOT NULL UNIQUE,
  address text,
  timezone text DEFAULT 'America/Chicago',
  operating_hours jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_restaurants_twilio_phone ON restaurants(twilio_phone_number);

-- ─── customers ──────────────────────────────────────────────────────

CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL UNIQUE,
  name text,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_phone ON customers(phone_number);

-- ─── menu_items ─────────────────────────────────────────────────────

CREATE TABLE menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  price numeric(10, 2) NOT NULL,
  description text,
  tags text[] DEFAULT '{}',
  embedding vector(1536),        -- OpenAI text-embedding-3-small dimension
  is_available boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category ON menu_items(restaurant_id, category);

-- ─── calls ──────────────────────────────────────────────────────────

CREATE TABLE calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  twilio_call_sid text UNIQUE,
  twilio_stream_sid text,
  caller_phone text,
  restaurant_phone text,
  status text NOT NULL DEFAULT 'in_progress',  -- in_progress, completed, abandoned, error
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_calls_restaurant_created ON calls(restaurant_id, created_at DESC);
CREATE INDEX idx_calls_customer ON calls(customer_id);
CREATE INDEX idx_calls_twilio_sid ON calls(twilio_call_sid);
CREATE INDEX idx_calls_status ON calls(status);

-- ─── call_transcript_entries ────────────────────────────────────────
-- Streamed in real-time during calls (fire-and-forget INSERTs).
-- No in-memory accumulation — each entry is written as it happens.

CREATE TABLE call_transcript_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id uuid NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  role text NOT NULL,              -- 'customer', 'ai', 'tool_call', 'tool_result'
  content text,                    -- speech text (customer/ai roles)
  tool_name text,                  -- function name (tool_call/tool_result roles)
  tool_args jsonb,                 -- tool call arguments
  tool_result jsonb,               -- tool response data
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_transcript_entries_call_id ON call_transcript_entries(call_id);

-- ─── orders ─────────────────────────────────────────────────────────

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  call_id uuid REFERENCES calls(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'in_progress',  -- in_progress, confirmed, cancelled
  total_amount numeric(10, 2) DEFAULT 0,
  special_instructions text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_restaurant_status ON orders(restaurant_id, status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_call ON orders(call_id);

-- ─── order_items ────────────────────────────────────────────────────

CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
  item_name text NOT NULL,          -- denormalized: readable even if menu item deleted
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10, 2) NOT NULL,
  customizations jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ─── Row Level Security ─────────────────────────────────────────────
-- Enable RLS on all tables. The service-role key bypasses RLS,
-- so server-side operations are not affected. These policies are
-- placeholders for future client-side access patterns.

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_transcript_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ─── updated_at trigger ─────────────────────────────────────────────
-- Automatically set updated_at on row modification.

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
