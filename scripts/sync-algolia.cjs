const { algoliasearch } = require('algoliasearch');
const { createClient } = require('@supabase/supabase-js');

const client = algoliasearch('GLRKXLGDD9', 'b53a5d4abd0d5908b5a875c80b44c4fc');
const supabase = createClient(
  'https://cfzmdvymqqnrzrytcrie.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmem1kdnltcXFucnpyeXRjcmllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk0OTE5MCwiZXhwIjoyMTAxNTI1MTkwfQ.or22ilKxhmeq-AOOKvZPGJb_EiGYX4qTNDxw89c5gz0'
);

async function sync() {
  console.log('Fetching products from Supabase...');
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, description, price, original_price, discount, category_id, seller_id, slug, rating, review_count, sales_count, stock, images, status, is_recommended')
    .eq('is_active', true);
  if (error) { console.error('Supabase error:', error); process.exit(1); }
  console.log('Found ' + products.length + ' products');

  const algoliaObjects = products.map(function(p) {
    return {
      objectID: p.id, name: p.name, description: p.description,
      price: p.price, original_price: p.original_price, discount: p.discount,
      category_id: p.category_id, seller_id: p.seller_id, slug: p.slug,
      rating: p.rating, review_count: p.review_count, sales_count: p.sales_count,
      stock: p.stock, images: p.images, status: p.status, is_recommended: p.is_recommended
    };
  });

  console.log('Uploading to Algolia...');
  const result = await client.saveObjects({ indexName: 'products', objects: algoliaObjects });
  console.log('Synced ' + result[0].objectIDs.length + ' products to Algolia');

  await client.setSettings({ indexName: 'products', indexSettings: {
    searchableAttributes: ['name', 'description'],
    attributesForFaceting: ['filterOnly(category_id)', 'filterOnly(seller_id)', 'filterOnly(status)', 'filterOnly(is_recommended)']
  }});
  console.log('Algolia settings configured');
}
sync().catch(console.error);
