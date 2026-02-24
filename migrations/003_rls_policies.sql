-- 003_rls_policies.sql
-- Row Level Security policies for multi-restaurant data isolation.
--
-- Architecture:
--   The server uses the service_role key, which BYPASSES RLS entirely.
--   These policies serve as defense-in-depth and preparation for future
--   client-side access (e.g., a restaurant dashboard authenticated via
--   Supabase Auth with restaurant_id stored in app_metadata).
--
-- How it works:
--   When RLS is enabled (already done in 001), PostgreSQL denies all
--   access by default for non-superuser roles. The policies below
--   grant scoped access to the "authenticated" role based on the
--   restaurant_id claim in the user's JWT app_metadata.
--
--   service_role  → full access (bypasses RLS)
--   anon          → NO access   (no policies grant anything)
--   authenticated → scoped to their restaurant_id

-- ─── Helper: extract restaurant_id from JWT ─────────────────────────
-- Supabase stores custom claims in auth.jwt() → 'app_metadata'.
-- We expect: { "restaurant_id": "<uuid>" }

CREATE OR REPLACE FUNCTION auth_restaurant_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb
      -> 'app_metadata' ->> 'restaurant_id')::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid  -- never matches any real row
  );
$$;

-- ═══════════════════════════════════════════════════════════════════════
-- restaurants
-- ═══════════════════════════════════════════════════════════════════════
-- Authenticated users can only READ their own restaurant. No create/update/delete.

CREATE POLICY "restaurants_select_own"
  ON restaurants
  FOR SELECT
  TO authenticated
  USING (id = auth_restaurant_id());

-- ═══════════════════════════════════════════════════════════════════════
-- customers
-- ═══════════════════════════════════════════════════════════════════════
-- Customers are shared (phone_number is globally unique), but we still
-- restrict authenticated access to read-only for safety.

CREATE POLICY "customers_select_authenticated"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

-- ═══════════════════════════════════════════════════════════════════════
-- menu_items  (has restaurant_id)
-- ═══════════════════════════════════════════════════════════════════════

CREATE POLICY "menu_items_select_own_restaurant"
  ON menu_items
  FOR SELECT
  TO authenticated
  USING (restaurant_id = auth_restaurant_id());

CREATE POLICY "menu_items_insert_own_restaurant"
  ON menu_items
  FOR INSERT
  TO authenticated
  WITH CHECK (restaurant_id = auth_restaurant_id());

CREATE POLICY "menu_items_update_own_restaurant"
  ON menu_items
  FOR UPDATE
  TO authenticated
  USING (restaurant_id = auth_restaurant_id())
  WITH CHECK (restaurant_id = auth_restaurant_id());

CREATE POLICY "menu_items_delete_own_restaurant"
  ON menu_items
  FOR DELETE
  TO authenticated
  USING (restaurant_id = auth_restaurant_id());

-- ═══════════════════════════════════════════════════════════════════════
-- calls  (has restaurant_id)
-- ═══════════════════════════════════════════════════════════════════════

CREATE POLICY "calls_select_own_restaurant"
  ON calls
  FOR SELECT
  TO authenticated
  USING (restaurant_id = auth_restaurant_id());

CREATE POLICY "calls_insert_own_restaurant"
  ON calls
  FOR INSERT
  TO authenticated
  WITH CHECK (restaurant_id = auth_restaurant_id());

CREATE POLICY "calls_update_own_restaurant"
  ON calls
  FOR UPDATE
  TO authenticated
  USING (restaurant_id = auth_restaurant_id())
  WITH CHECK (restaurant_id = auth_restaurant_id());

-- ═══════════════════════════════════════════════════════════════════════
-- call_transcript_entries  (linked via call_id → calls.restaurant_id)
-- ═══════════════════════════════════════════════════════════════════════

CREATE POLICY "transcript_select_own_restaurant"
  ON call_transcript_entries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM calls
      WHERE calls.id = call_transcript_entries.call_id
        AND calls.restaurant_id = auth_restaurant_id()
    )
  );

CREATE POLICY "transcript_insert_own_restaurant"
  ON call_transcript_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM calls
      WHERE calls.id = call_transcript_entries.call_id
        AND calls.restaurant_id = auth_restaurant_id()
    )
  );

-- ═══════════════════════════════════════════════════════════════════════
-- orders  (has restaurant_id)
-- ═══════════════════════════════════════════════════════════════════════

CREATE POLICY "orders_select_own_restaurant"
  ON orders
  FOR SELECT
  TO authenticated
  USING (restaurant_id = auth_restaurant_id());

CREATE POLICY "orders_insert_own_restaurant"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (restaurant_id = auth_restaurant_id());

CREATE POLICY "orders_update_own_restaurant"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (restaurant_id = auth_restaurant_id())
  WITH CHECK (restaurant_id = auth_restaurant_id());

-- ═══════════════════════════════════════════════════════════════════════
-- order_items  (linked via order_id → orders.restaurant_id)
-- ═══════════════════════════════════════════════════════════════════════

CREATE POLICY "order_items_select_own_restaurant"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.restaurant_id = auth_restaurant_id()
    )
  );

CREATE POLICY "order_items_insert_own_restaurant"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.restaurant_id = auth_restaurant_id()
    )
  );

CREATE POLICY "order_items_update_own_restaurant"
  ON order_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.restaurant_id = auth_restaurant_id()
    )
  );
