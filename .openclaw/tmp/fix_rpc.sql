DROP FUNCTION IF EXISTS public.search_products(text, int, int, uuid);
DROP FUNCTION IF EXISTS public.search_products_simple(text, int, int, uuid);

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
LANGUAGE plpgsql STABLE AS $$
DECLARE
  tsquery_text text;
  total        bigint;
BEGIN
  tsquery_text := trim(regexp_replace(search_term, '\s+', ' & ', 'g'));
  SELECT count(*) INTO total
  FROM public.products p
  WHERE p.status = 'active'
    AND p.fts @@ to_tsquery('english', tsquery_text || ':*')
    AND (p_category IS NULL OR p.category_id = p_category);
  RETURN QUERY
  SELECT
    p.id,
    p.name::text,
    p.slug::text,
    p.description::text,
    p.price,
    p.original_price,
    p.images,
    p.status::text,
    p.sales_count,
    p.rating,
    p.stock,
    p.category_id,
    p.seller_id,
    s.name::text,
    s.store_name::text,
    s.logo::text,
    ts_rank(p.fts, to_tsquery('english', tsquery_text || ':*'))::real,
    total
  FROM public.products p
  LEFT JOIN public.sellers s ON s.id = p.seller_id
  WHERE p.status = 'active'
    AND p.fts @@ to_tsquery('english', tsquery_text || ':*')
    AND (p_category IS NULL OR p.category_id = p_category)
  ORDER BY ts_rank(p.fts, to_tsquery('english', tsquery_text || ':*')) DESC, p.sales_count DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

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
LANGUAGE plpgsql STABLE AS $$
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
    p.name::text,
    p.slug::text,
    p.description::text,
    p.price,
    p.original_price,
    p.images,
    p.status::text,
    p.sales_count,
    p.rating,
    p.stock,
    p.category_id,
    p.seller_id,
    s.name::text,
    s.store_name::text,
    s.logo::text,
    similarity(p.name, search_term)::real,
    total
  FROM public.products p
  LEFT JOIN public.sellers s ON s.id = p.seller_id
  WHERE p.status = 'active'
    AND similarity(p.name, search_term) > 0.1
    AND (p_category IS NULL OR p.category_id = p_category)
  ORDER BY similarity(p.name, search_term) DESC, p.sales_count DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_products(text, int, int, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_products_simple(text, int, int, uuid) TO anon, authenticated;
