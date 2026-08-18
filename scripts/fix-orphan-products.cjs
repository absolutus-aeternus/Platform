#!/usr/bin/env node
/**
 * Fix Orphan Products — Assign seller_id and category_id to products that are null
 * 
 * Usage: SUPABASE_URL=url SUPABASE_KEY=key node scripts/fix-orphan-products.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Category mapping by product name keywords
const CATEGORY_KEYWORDS = {
  'electronics': ['earbuds', 'headphone', 'speaker', 'keyboard', 'mouse', 'charger', 'power bank', 'webcam', 'tablet', 'phone', 'usb', 'hdmi', 'bluetooth', 'wireless', 'led', 'light', 'bulb', 'camera', 'microphone', 'watch', 'tracker'],
  'fashion': ['dress', 'shirt', 't-shirt', 'pants', 'jeans', 'jacket', 'sneakers', 'shoes', 'belt', 'sunglasses', 'cap', 'hat', 'cotton', 'denim', 'canvas', 'lipstick', 'cargo'],
  'beauty': ['skincare', 'cream', 'serum', 'toner', 'cleanser', 'lipstick', 'makeup', 'beauty', 'collagen', 'cosmetic'],
  'sports': ['yoga', 'fitness', 'gym', 'running', 'exercise', 'sport', 'workout', 'mat'],
  'home-living': ['candle', 'pillow', 'blanket', 'organizer', 'decor', 'home', 'kitchen', 'shelf', 'stand', 'holder', 'cooler', 'trash'],
  'food-beverage': ['food', 'snack', 'coffee', 'tea', 'drink', 'beverage', 'protein', 'vitamin'],
  'automotive': ['car', 'auto', 'vehicle', 'tire', 'motor'],
  'toys-games': ['toy', 'game', 'puzzle', 'doll', 'lego', 'figure'],
};

function matchCategory(productName) {
  const name = productName.toLowerCase();
  for (const [catSlug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => name.includes(kw))) {
      return catSlug;
    }
  }
  return 'fashion'; // default fallback
}

async function run() {
  console.log('🔧 Fix Orphan Products\n');

  // Fetch all categories
  const { data: categories } = await supabase.from('categories').select('id, slug');
  const catMap = {};
  for (const c of categories || []) {
    catMap[c.slug] = c.id;
  }
  console.log(`  Categories loaded: ${Object.keys(catMap).length}`);

  // Fetch all sellers
  const { data: sellers } = await supabase.from('sellers').select('id, store_name').eq('status', 'active');
  console.log(`  Sellers loaded: ${sellers?.length || 0}`);

  if (!sellers || sellers.length === 0) {
    console.error('  ❌ No active sellers found. Create a seller first.');
    process.exit(1);
  }

  // Find orphan products (no seller or no category)
  const { data: orphans, count } = await supabase
    .from('products')
    .select('id, name, seller_id, category_id', { count: 'exact' })
    .or('seller_id.is.null,category_id.is.null');

  console.log(`  Orphan products found: ${count || 0}\n`);

  if (!orphans || orphans.length === 0) {
    console.log('  ✅ No orphan products. All products have seller and category assigned.');
    return;
  }

  let fixedSeller = 0;
  let fixedCategory = 0;
  let failed = 0;

  // Round-robin seller assignment
  let sellerIdx = 0;

  for (const product of orphans) {
    const updates = {};

    if (!product.seller_id) {
      updates.seller_id = sellers[sellerIdx % sellers.length].id;
      sellerIdx++;
      fixedSeller++;
    }

    if (!product.category_id) {
      const matchedSlug = matchCategory(product.name);
      const catId = catMap[matchedSlug] || catMap['fashion'] || Object.values(catMap)[0];
      if (catId) {
        updates.category_id = catId;
        fixedCategory++;
      }
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', product.id);

      if (error) {
        console.error(`  ❌ Failed: ${product.name}: ${error.message}`);
        failed++;
      }
    }
  }

  console.log('\n📊 Summary:');
  console.log(`  ✅ Seller assigned: ${fixedSeller}`);
  console.log(`  ✅ Category assigned: ${fixedCategory}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log('\n🎉 Done!');
}

run().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
