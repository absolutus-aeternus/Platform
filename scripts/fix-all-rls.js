#!/usr/bin/env node
/**
 * Fix all RLS policies with proper per-table security rules.
 * Usage: SUPABASE_TOKEN=*** node scripts/fix-all-rls.js
 *
 * IMPORTANT: This script requires a valid Supabase Management API token.
 * Set SUPABASE_TOKEN environment variable before running.
 */
const PROJECT_REF = 'cfzmdvymqqnrzrytcrie';
const ACCESS_TOKEN = process.env.SUPABASE_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('❌ SUPABASE_TOKEN environment variable is required.');
  console.error('   Usage: SUPABASE_TOKEN=your_token node scripts/fix-all-rls.js');
  process.exit(1);
}

async function execSQL(query, label) {
  const resp = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  const text = await resp.text();
  if (resp.ok) { console.log(`  ✅ ${label}`); return true; }
  if (text.includes('already exists')) { console.log(`  ⚠️  ${label} (exists)`); return true; }
  console.log(`  ❌ ${label}: ${text.slice(0, 200)}`);
  return false;
}

async function run() {
  console.log('🔧 Fixing ALL RLS policies with proper security rules...\n');

  // Enable RLS on all tables first
  const tables = [
    'users', 'products', 'categories', 'sellers', 'cart_items',
    'orders', 'order_items', 'payments', 'reviews', 'favorites',
    'wallets', 'flash_sales', 'notifications', 'chat_messages',
    'banners', 'system_params', 'addresses'
  ];

  for (const table of tables) {
    await execSQL(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`, `Enable RLS on ${table}`);
  }

  // Drop all existing policies on each table
  for (const table of tables) {
    await execSQL(`
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = '${table}' AND schemaname = 'public')
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.${table}';
  END LOOP;
END $$;
    `, `Drop existing ${table} policies`);
  }

  // ─── USERS ───
  // Users can read their own row; admins can read all
  await execSQL(`
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_select_admin" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_admin" ON public.users FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
CREATE POLICY "users_insert_service" ON public.users FOR INSERT WITH CHECK (true);
  `, 'users RLS');

  // ─── PRODUCTS ───
  // Public read; seller writes own; admin writes all
  await execSQL(`
CREATE POLICY "products_select_public" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_insert_seller" ON public.products FOR INSERT WITH CHECK (
  seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);
CREATE POLICY "products_insert_admin" ON public.products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
CREATE POLICY "products_update_seller" ON public.products FOR UPDATE USING (
  seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);
CREATE POLICY "products_update_admin" ON public.products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
CREATE POLICY "products_delete_admin" ON public.products FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
  `, 'products RLS');

  // ─── ORDERS ───
  // Users read own orders only
  await execSQL(`
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_select_admin" ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_update_admin" ON public.orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
  `, 'orders RLS');

  // ─── PAYMENTS ───
  // Users read own payments only
  await execSQL(`
CREATE POLICY "payments_select_own" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "payments_select_admin" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
CREATE POLICY "payments_insert_own" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
  `, 'payments RLS');

  // ─── WALLETS ───
  // Users read own wallet only
  await execSQL(`
CREATE POLICY "wallets_select_own" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wallets_select_admin" ON public.wallets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
CREATE POLICY "wallets_update_own" ON public.wallets FOR UPDATE USING (auth.uid() = user_id);
  `, 'wallets RLS');

  // ─── SELLERS ───
  // Public read; seller writes own
  await execSQL(`
CREATE POLICY "sellers_select_public" ON public.sellers FOR SELECT USING (true);
CREATE POLICY "sellers_insert_own" ON public.sellers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sellers_update_own" ON public.sellers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "sellers_update_admin" ON public.sellers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
  `, 'sellers RLS');

  // ─── CATEGORIES ───
  // Public read; admin write
  await execSQL(`
CREATE POLICY "categories_select_public" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_insert_admin" ON public.categories FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
CREATE POLICY "categories_update_admin" ON public.categories FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
CREATE POLICY "categories_delete_admin" ON public.categories FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
  `, 'categories RLS');

  // ─── CART_ITEMS ───
  // User read/write own only
  await execSQL(`
CREATE POLICY "cart_items_select_own" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cart_items_insert_own" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cart_items_update_own" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cart_items_delete_own" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);
  `, 'cart_items RLS');

  // ─── ORDER_ITEMS ───
  // User read own only (via order ownership)
  await execSQL(`
CREATE POLICY "order_items_select_own" ON public.order_items FOR SELECT USING (
  order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
);
CREATE POLICY "order_items_select_admin" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
CREATE POLICY "order_items_insert_own" ON public.order_items FOR INSERT WITH CHECK (
  order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
);
  `, 'order_items RLS');

  // ─── REVIEWS ───
  // Public read; user write own
  await execSQL(`
CREATE POLICY "reviews_select_public" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update_own" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reviews_delete_own" ON public.reviews FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "reviews_delete_admin" ON public.reviews FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
  `, 'reviews RLS');

  // ─── FAVORITES ───
  // User read/write own only
  await execSQL(`
CREATE POLICY "favorites_select_own" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorites_insert_own" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_delete_own" ON public.favorites FOR DELETE USING (auth.uid() = user_id);
  `, 'favorites RLS');

  // ─── NOTIFICATIONS ───
  // User read own only
  await execSQL(`
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert_service" ON public.notifications FOR INSERT WITH CHECK (true);
  `, 'notifications RLS');

  // ─── CHAT_MESSAGES ───
  // Participants read only
  await execSQL(`
CREATE POLICY "chat_messages_select_participant" ON public.chat_messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "chat_messages_insert_own" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
  `, 'chat_messages RLS');

  // ─── BANNERS ───
  // Public read; admin write
  await execSQL(`
CREATE POLICY "banners_select_public" ON public.banners FOR SELECT USING (true);
CREATE POLICY "banners_insert_admin" ON public.banners FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
CREATE POLICY "banners_update_admin" ON public.banners FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
CREATE POLICY "banners_delete_admin" ON public.banners FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
  `, 'banners RLS');

  // ─── SYSTEM_PARAMS ───
  // Admin only
  await execSQL(`
CREATE POLICY "system_params_select_admin" ON public.system_params FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
CREATE POLICY "system_params_insert_admin" ON public.system_params FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
CREATE POLICY "system_params_update_admin" ON public.system_params FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
CREATE POLICY "system_params_delete_admin" ON public.system_params FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
  `, 'system_params RLS');

  // ─── ADDRESSES ───
  // User read/write own only
  await execSQL(`
CREATE POLICY "addresses_select_own" ON public.addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "addresses_insert_own" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "addresses_update_own" ON public.addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "addresses_delete_own" ON public.addresses FOR DELETE USING (auth.uid() = user_id);
  `, 'addresses RLS');

  // ─── FLASH_SALES ───
  // Public read; admin write
  await execSQL(`
CREATE POLICY "flash_sales_select_public" ON public.flash_sales FOR SELECT USING (true);
CREATE POLICY "flash_sales_insert_admin" ON public.flash_sales FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
CREATE POLICY "flash_sales_update_admin" ON public.flash_sales FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
CREATE POLICY "flash_sales_delete_admin" ON public.flash_sales FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
  `, 'flash_sales RLS');

  console.log('\n🎉 All RLS policies fixed with proper security rules!');
}

run().catch(console.error);
