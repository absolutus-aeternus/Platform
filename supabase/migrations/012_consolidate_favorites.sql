-- Migration 012: Consolidate favorites → wishlists
-- Both tables serve the same purpose (user saves products)
-- Keep wishlists as the primary, create view for backward compatibility

-- Step 1: Migrate any data from favorites to wishlists (if not already there)
INSERT INTO public.wishlists (user_id, product_id, created_at)
SELECT f.user_id, f.product_id, f.created_at
FROM public.favorites f
WHERE NOT EXISTS (
  SELECT 1 FROM public.wishlists w
  WHERE w.user_id = f.user_id AND w.product_id = f.product_id
)
ON CONFLICT DO NOTHING;

-- Step 2: Drop favorites table and create view for backward compatibility
DROP TABLE IF EXISTS public.favorites CASCADE;
CREATE VIEW public.favorites AS
SELECT id, user_id, product_id, created_at FROM public.wishlists;

-- Step 3: Create a function to redirect favorites inserts to wishlists
CREATE OR REPLACE FUNCTION redirect_favorites_to_wishlists()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wishlists (user_id, product_id)
  VALUES (NEW.user_id, NEW.product_id)
  ON CONFLICT (user_id, product_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create trigger on the view (if supported) or note for manual cleanup
-- Note: PostgreSQL doesn't support triggers on views directly.
-- The frontend code should be updated to use 'wishlists' instead of 'favorites'.
-- This migration ensures data consistency in the meantime.

COMMENT ON VIEW public.favorites IS 'Backward-compatible view — use wishlists table instead (migration 012)';
