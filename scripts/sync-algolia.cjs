const { algoliasearch } = require("algoliasearch");
const { createClient } = require("@supabase/supabase-js");

// Read from environment variables (never hardcode keys!)
const ALGOLIA_APP_ID = process.env.VITE_ALGOLIA_APP_ID || "GLRKXLGDD9";
const ALGOLIA_WRITE_KEY = process.env.ALGOLIA_WRITE_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://cfzmdvymqqnrzrytcrie.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!ALGOLIA_WRITE_KEY) {
  console.error("Missing ALGOLIA_WRITE_KEY env var");
  process.exit(1);
}
if (!SUPABASE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY env var");
  process.exit(1);
}

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_KEY);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function sync() {
  console.log("Fetching products from Supabase...");
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, description, price, original_price, discount, category_id, seller_id, slug, rating, review_count, sales_count, stock, images, status, is_recommended")
    .eq("is_active", true);
  if (error) { console.error("Supabase error:", error); process.exit(1); }
  console.log("Found " + products.length + " products");

  const algoliaObjects = products.map(function(p) {
    return {
      objectID: p.id, name: p.name, description: p.description,
      price: p.price, original_price: p.original_price, discount: p.discount,
      category_id: p.category_id, seller_id: p.seller_id, slug: p.slug,
      rating: p.rating, review_count: p.review_count, sales_count: p.sales_count,
      stock: p.stock, images: p.images, status: p.status, is_recommended: p.is_recommended
    };
  });

  console.log("Uploading to Algolia...");
  const result = await client.saveObjects({ indexName: "products", objects: algoliaObjects });
  console.log("Synced " + result.objectIDs.length + " products to Algolia");
}

sync().catch(console.error);
