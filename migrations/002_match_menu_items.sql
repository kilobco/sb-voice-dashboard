-- 002_match_menu_items.sql
-- PostgreSQL function for semantic menu search using pgvector.
-- Called via Supabase RPC: supabase.rpc('match_menu_items', { ... })
--
-- Depends on: 001_create_tables.sql (menu_items table, vector extension)

CREATE OR REPLACE FUNCTION match_menu_items(
  query_embedding vector(1536),
  match_restaurant_id uuid DEFAULT NULL,
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 8
)
RETURNS TABLE (
  id uuid,
  name text,
  category text,
  price numeric,
  description text,
  tags text[],
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mi.id,
    mi.name,
    mi.category,
    mi.price,
    mi.description,
    mi.tags,
    (1 - (mi.embedding <=> query_embedding))::float AS similarity
  FROM menu_items mi
  WHERE mi.is_available = true
    AND mi.embedding IS NOT NULL
    AND (match_restaurant_id IS NULL OR mi.restaurant_id = match_restaurant_id)
    AND (1 - (mi.embedding <=> query_embedding)) > match_threshold
  ORDER BY mi.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
