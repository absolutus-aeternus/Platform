-- Migration 017: Create product_comments table
-- Referenced in ProductDetail.vue but missing from migrations.

CREATE TABLE IF NOT EXISTS public.product_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  parent_id UUID REFERENCES public.product_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_comments_product ON public.product_comments(product_id);
CREATE INDEX IF NOT EXISTS idx_product_comments_user ON public.product_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_product_comments_parent ON public.product_comments(parent_id);

-- RLS
ALTER TABLE public.product_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments
CREATE POLICY "comments_select_public" ON public.product_comments
  FOR SELECT USING (true);

-- Users can insert their own comments
CREATE POLICY "comments_insert_own" ON public.product_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments (for likes, edits)
CREATE POLICY "comments_update_own" ON public.product_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "comments_delete_own" ON public.product_comments
  FOR DELETE USING (auth.uid() = user_id);
