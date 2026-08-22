-- =============================================================
-- 023_fulltext_search_products.sql
-- Full-Text Search for products (replaces Algolia)
-- =============================================================

-- 1. Add tsvector column for full-text search
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS fts tsvector;

-- 2. Populate fts from name, description, and category name
--    Uses 'english' config for stemming (handles plurals, tenses)
UPDATE public.products p
SET fts = to_tsvector('english',
  coalesce(p.name, '') || ' ' ||
  coalesce(p.description, '') || ' ' ||
  coalesce((SELECT c.name FROM public.categories c WHERE c.id = p.category_id), '')
);

-- 3. GIN index for fast full-text lookups
CREATE INDEX IF NOT EXISTS idx_products_fts
  ON public.products USING gin (fts);

-- 4. Trigger function: auto-update fts on INSERT or UPDATE
CREATE OR REPLACE FUNCTION public.products_fts_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.fts := to_tsvector('english',
    coalesce(NEW.name, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce((SELECT c.name FROM public.categories c WHERE c.id = NEW.category_id), '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_fts ON public.products;
CREATE TRIGGER trg_products_fts
  BEFORE INSERT OR UPDATE OF name, description, category_id
  ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.products_fts_trigger();

-- 5. RPC: search_products — weighted full-text search with fuzzy fallback
--
--    Weighting:  name:A (highest) > description:B > category:C
--    Returns:    matching products with rank score, seller info
--    Supports:   pagination (p_offset, p_limit), optional category filter
--
CREATE OR REPLACE FUNCTION public.search_products(
  search_term  text,
  p_limit      int  DEFAULT 20,
  p_offset     int  DEFAULT 0,
  p_category   uuid DEFAULT NULL
)
RETURNS TABLE (
  id            uuid,
  name          text,
  slug          text,
  description   text,
  price         numeric,
  original_price numeric,
  images        text[],
  status        text,
  sales_count   int,
  rating        numeric,
  stock         int,
  category_id   uuid,
  seller_id     uuid,
  seller_name   text,
  store_name    text,
  seller_logo   text,
  rank          real,
  total_count   bigint
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  tsquery_text text;
  total        bigint;
BEGIN
  -- Sanitize & convert search term to tsquery
  -- Handles multi-word: "wireless earbuds" → 'wireless & earbuds'
  tsquery_text := trim(regexp_replace(search_term, '\s+', ' & ', 'g'));

  -- Count total matches first
  SELECT count(*) INTO total
  FROM public.products p
  WHERE p.status = 'active'
    AND p.fts @@ to_tsquery('english', tsquery_text || ':*')
    AND (p_category IS NULL OR p.category_id = p_category);

  -- Return results with ranking
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    p.description,
    p.price,
    p.original_price,
    p.images,
    p.status,
    p.sales_count,
    p.rating,
    p.stock,
    p.category_id,
    p.seller_id,
    s.name        AS seller_name,
    s.store_name  AS store_name,
    s.logo        AS seller_logo,
    ts_rank(p.fts, to_tsquery('english', tsquery_text || ':*')) AS rank,
    total         AS total_count
  FROM public.products p
  LEFT JOIN public.sellers s ON s.id = p.seller_id
  WHERE p.status = 'active'
    AND p.fts @@ to_tsquery('english', tsquery_text || ':*')
    AND (p_category IS NULL OR p.category_id = p_category)
  ORDER BY
    -- Primary: weighted ts_rank (name:A, description:B, category:C is already baked into fts)
    ts_rank(p.fts, to_tsquery('english', tsquery_text || ':*')) DESC,
    -- Secondary: sales popularity
    p.sales_count DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- 6. RPC: search_products_simple — trigram fuzzy fallback for short/typo queries
--    Uses pg_trgm for "did you mean" style matching when FTS returns nothing
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram index on product name for fuzzy matching
CREATE INDEX IF NOT EXISTS idx_products_name_trgm
  ON public.products USING gin (name gin_trgm_ops);

CREATE OR REPLACE FUNCTION public.search_products_simple(
  search_term text,
  p_limit     int DEFAULT 20,
  p_offset    int DEFAULT 0,
  p_category  uuid DEFAULT NULL
)
RETURNS TABLE (
  id            uuid,
  name          text,
  slug          text,
  description   text,
  price         numeric,
  original_price numeric,
  images        text[],
  status        text,
  sales_count   int,
  rating        numeric,
  stock         int,
  category_id   uuid,
  seller_id     uuid,
  seller_name   text,
  store_name    text,
  seller_logo   text,
  similarity    real,
  total_count   bigint
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  total bigint;
BEGIN
  SELECT count(*) INTO total
  FROM public.products p
  WHERE p.status = 'active'
    AND similarity(p.name, search_term) > 0.1
    AND (p_category IS NULL OR p.category_id = p_category);

  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    p.description,
    p.price,
    p.original_price,
    p.images,
    p.status,
    p.sales_count,
    p.rating,
    p.stock,
    p.category_id,
    p.seller_id,
    s.name        AS seller_name,
    s.store_name  AS store_name,
    s.logo        AS seller_logo,
    similarity(p.name, search_term)::real AS similarity,
    total         AS total_count
  FROM public.products p
  LEFT JOIN public.sellers s ON s.id = p.seller_id
  WHERE p.status = 'active'
    AND similarity(p.name, search_term) > 0.1
    AND (p_category IS NULL OR p.category_id = p_category)
  ORDER BY similarity(p.name, search_term) DESC, p.sales_count DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- 7. Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.search_products(text, int, int, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_products_simple(text, int, int, uuid) TO anon, authenticated;
