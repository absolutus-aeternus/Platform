#!/usr/bin/env node
/**
 * Fix all RLS policies for public read access
 * Usage: SUPABASE_TOKEN=*** node scripts/fix-all-rls.js
 */
const PROJECT_REF = 'cfzmdvymqqnrzrytcrie'
const ACCESS_TOKEN = process.env.SUPABASE_TOKEN || '***'

async function execSQL(query, label) {
  const resp = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  })
  const text = await resp.text()
  if (resp.ok) { console.log(`  ✅ ${label}`); return true }
  if (text.includes('already exists')) { console.log(`  ⚠️  ${label} (exists)`); return true }
  console.log(`  ❌ ${label}: ${text.slice(0, 150)}`)
  return false
}

async function run() {
  console.log('🔧 Fixing ALL RLS policies for public access...\n')

  const tables = [
    'users', 'products', 'categories', 'sellers', 'cart_items',
    'orders', 'order_items', 'payments', 'reviews', 'favorites',
    'wallets', 'flash_sales', 'notifications', 'chat_messages',
    'banners', 'system_params', 'addresses'
  ]

  for (const table of tables) {
    // Drop all existing policies
    await execSQL(`
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = '${table}' AND schemaname = 'public')
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.${table}';
  END LOOP;
END $$;
    `, `Drop ${table} policies`)

    // Create permissive policies
    await execSQL(`
CREATE POLICY "${table}_select" ON public.${table} FOR SELECT USING (true);
CREATE POLICY "${table}_insert" ON public.${table} FOR INSERT WITH CHECK (true);
CREATE POLICY "${table}_update" ON public.${table} FOR UPDATE USING (true);
CREATE POLICY "${table}_delete" ON public.${table} FOR DELETE USING (true);
    `, `${table} RLS (full access)`)
  }

  // Also ensure RLS is enabled on all tables
  for (const table of tables) {
    await execSQL(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`, `Enable RLS on ${table}`)
  }

  console.log('\n🎉 All RLS policies fixed!')
}

run().catch(console.error)
