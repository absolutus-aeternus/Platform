const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');

// Supabase config
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://cfzmdvymqqnrzrytcrie.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Amazon categories to scrape
const CATEGORIES = [
  { name: 'Electronics', url: 'https://www.amazon.com/s?k=electronics&ref=nb_sb_noss', slug: 'electronics' },
  { name: 'Fashion', url: 'https://www.amazon.com/s?k=fashion+clothing&ref=nb_sb_noss', slug: 'fashion' },
  { name: 'Home & Living', url: 'https://www.amazon.com/s?k=home+living&ref=nb_sb_noss', slug: 'home-living' },
  { name: 'Beauty', url: 'https://www.amazon.com/s?k=beauty+products&ref=nb_sb_noss', slug: 'beauty' },
  { name: 'Sports', url: 'https://www.amazon.com/s?k=sports+fitness&ref=nb_sb_noss', slug: 'sports' },
  { name: 'Pet Supplies', url: 'https://www.amazon.com/s?k=pet+supplies&ref=nb_sb_noss', slug: 'pet-supplies' },
  { name: 'Toys & Games', url: 'https://www.amazon.com/s?k=toys+games&ref=nb_sb_noss', slug: 'toys-games' },
  { name: 'Books', url: 'https://www.amazon.com/s?k=books+bestseller&ref=nb_sb_noss', slug: 'books' },
  { name: 'Automotive', url: 'https://www.amazon.com/s?k=automotive+parts&ref=nb_sb_noss', slug: 'automotive' },
  { name: 'Garden & Outdoor', url: 'https://www.amazon.com/s?k=garden+outdoor&ref=nb_sb_noss', slug: 'garden-outdoor' },
];

// Headers to mimic browser
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Cache-Control': 'max-age=0',
};

// Scrape products from Amazon search page
async function scrapeCategory(category, maxProducts = 20) {
  console.log(`\n=== Scraping: ${category.name} ===`);
  const products = [];
  
  try {
    const response = await axios.get(category.url, { 
      headers: HEADERS,
      timeout: 30000,
    });
    
    const $ = cheerio.load(response.data);
    
    // Parse product cards
    $('[data-component-type="s-search-result"]').each((i, el) => {
      if (products.length >= maxProducts) return false;
      
      const $el = $(el);
      
      // Extract basic info
      const name = $el.find('h2 a span').first().text().trim();
      const link = $el.find('h2 a').attr('href');
      const priceWhole = $el.find('.a-price-whole').first().text().replace(/[,\.]/g, '');
      const priceFraction = $el.find('.a-price-fraction').first().text();
      const price = parseFloat(`${priceWhole}.${priceFraction}`) || 0;
      const originalPriceEl = $el.find('.a-price[data-a-strike] .a-offscreen').first();
      const originalPrice = parseFloat(originalPriceEl.text().replace(/[^0-9.]/g, '')) || null;
      const rating = parseFloat($el.find('.a-icon-alt').first().text()) || 0;
      const reviewCount = parseInt($el.find('.a-size-base.s-underline-text').first().text().replace(/[^0-9]/g, '')) || 0;
      const image = $el.find('img.s-image').first().attr('src') || '';
      const asin = $el.attr('data-asin') || '';
      
      if (name && price > 0) {
        const slug = name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .substring(0, 80);
        
        products.push({
          name: name.substring(0, 200),
          description: generateDescription(name, category.name),
          price: price,
          original_price: originalPrice || (price * 1.5).toFixed(2),
          discount: originalPrice ? Math.round((1 - price / originalPrice) * 100) : Math.floor(Math.random() * 30 + 10),
          stock: Math.floor(Math.random() * 500 + 50),
          rating: rating || (Math.random() * 1.5 + 3.5).toFixed(1),
          review_count: reviewCount || Math.floor(Math.random() * 5000 + 100),
          specs: generateSpecs(category.name),
          images: [image || `https://picsum.photos/seed/${slug}/600/600`],
          slug: slug + '-' + asin.toLowerCase(),
          category: category.name,
          status: 'active',
          is_recommended: Math.random() > 0.7,
          sales_count: Math.floor(Math.random() * 3000 + 100),
          asin: asin,
        });
      }
    });
    
    console.log(`  Found ${products.length} products`);
  } catch (error) {
    console.log(`  Error: ${error.message}`);
  }
  
  return products;
}

// Generate detailed description based on product name and category
function generateDescription(name, category) {
  const templates = {
    'Electronics': `${name} - Premium quality electronics with advanced technology. Features include high-performance components, durable construction, and user-friendly design. Perfect for tech enthusiasts and everyday use. Comes with manufacturer warranty and excellent customer support.`,
    'Fashion': `${name} - Trendy and comfortable fashion piece made with premium materials. Available in multiple sizes and colors. Perfect for casual and semi-formal occasions. Machine washable and easy to care for. True to size fit.`,
    'Home & Living': `${name} - Enhance your living space with this high-quality home product. Designed for both functionality and aesthetics. Easy to install and maintain. Perfect for modern homes.`,
    'Beauty': `${name} - Premium beauty product with clinically tested ingredients. Suitable for all skin types. Cruelty-free and paraben-free. Visible results in 2-4 weeks of regular use.`,
    'Sports': `${name} - Professional-grade sports equipment for athletes and fitness enthusiasts. Durable construction withstands intense workouts. Ergonomic design for maximum comfort and performance.`,
    'Pet Supplies': `${name} - High-quality pet product designed for your furry friend's comfort and safety. Made with pet-safe materials. Easy to clean and maintain. Suitable for all breeds.`,
    'Toys & Games': `${name} - Fun and educational toy that promotes creativity and learning. Safe for children with non-toxic materials. Durable construction for long-lasting play.`,
    'Books': `${name} - Bestselling book with compelling content. Perfect for book lovers and collectors. High-quality printing and binding. Great gift idea.`,
    'Automotive': `${name} - High-quality automotive part/accessory. Compatible with most vehicles. Easy installation with included instructions. Durable construction for long-lasting performance.`,
    'Garden & Outdoor': `${name} - Weather-resistant outdoor product designed for durability. Perfect for gardens, patios, and outdoor spaces. Easy to assemble and maintain.`,
  };
  return templates[category] || `${name} - High-quality product with excellent features and durable construction. Perfect for everyday use.`;
}

// Generate specifications based on category
function generateSpecs(category) {
  const specsMap = {
    'Electronics': { 'Brand': 'Premium Brand', 'Connectivity': 'Bluetooth 5.0', 'Battery': 'Rechargeable Li-ion', 'Weight': '250g', 'Warranty': '1 Year', 'Color': 'Black', 'Material': 'ABS + Aluminum' },
    'Fashion': { 'Material': 'Cotton Blend', 'Fit': 'Regular', 'Sizes': 'S-XXL', 'Care': 'Machine Wash', 'Origin': 'Imported', 'Season': 'All Season', 'Style': 'Casual' },
    'Home & Living': { 'Material': 'Premium Quality', 'Dimensions': '30x20x15cm', 'Weight': '500g', 'Color': 'Multi', 'Care': 'Easy Clean', 'Warranty': '6 Months' },
    'Beauty': { 'Volume': '30ml', 'Skin Type': 'All Types', 'Ingredients': 'Natural', 'Cruelty-Free': 'Yes', 'Paraben-Free': 'Yes', 'Usage': 'Daily' },
    'Sports': { 'Material': 'Steel + Rubber', 'Weight': '2kg', 'Dimensions': '40x20cm', 'Color': 'Black/Red', 'Warranty': '1 Year', 'Level': 'All Levels' },
    'Pet Supplies': { 'Material': 'Pet-Safe', 'Size': 'One Size', 'Color': 'Multi', 'Easy Clean': 'Yes', 'Suitable For': 'All Breeds', 'Warranty': '6 Months' },
    'Toys & Games': { 'Material': 'Non-Toxic', 'Age Range': '3+', 'Battery': 'Included', 'Dimensions': '25x20cm', 'Safety': 'CE Certified', 'Weight': '300g' },
    'Books': { 'Format': 'Paperback', 'Pages': '300+', 'Language': 'English', 'Publisher': 'Major Publisher', 'ISBN': 'Included', 'Edition': 'Latest' },
    'Automotive': { 'Material': 'Steel + Plastic', 'Compatibility': 'Universal', 'Installation': 'Easy', 'Warranty': '1 Year', 'Color': 'Black', 'Weight': '1.5kg' },
    'Garden & Outdoor': { 'Material': 'Weather-Resistant', 'Dimensions': '50x30cm', 'Weight': '2kg', 'Color': 'Natural', 'UV Protection': 'Yes', 'Warranty': '1 Year' },
  };
  return specsMap[category] || { 'Brand': 'Premium', 'Quality': 'High', 'Warranty': '1 Year' };
}

// Insert products into Supabase
async function insertProducts(products) {
  console.log(`\n=== Inserting ${products.length} products into Supabase ===`);
  let inserted = 0;
  let errors = 0;
  
  for (const product of products) {
    try {
      const resp = await axios.post(`${SUPABASE_URL}/rest/v1/products`, {
        name: product.name,
        description: product.description,
        price: product.price,
        original_price: parseFloat(product.original_price),
        discount: product.discount,
        stock: product.stock,
        rating: parseFloat(product.rating),
        review_count: product.review_count,
        specs: product.specs,
        images: product.images,
        slug: product.slug,
        status: product.status,
        is_recommended: product.is_recommended,
        sales_count: product.sales_count,
        goods_id: 'AH-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      }, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        timeout: 10000,
      });
      
      if (resp.status >= 200 && resp.status < 300) {
        inserted++;
        console.log(`  ✓ ${product.name.substring(0, 60)}...`);
      } else {
        errors++;
        console.log(`  ✗ ${product.name.substring(0, 40)}... - HTTP ${resp.status}`);
      }
    } catch (error) {
      errors++;
      console.log(`  ✗ ${product.name.substring(0, 40)}... - ${error.message}`);
    }
    
    // Rate limiting - 100ms delay between inserts
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n  Results: ${inserted} inserted, ${errors} errors`);
  return { inserted, errors };
}

// Main function
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('ALLIANCEHUB PRODUCT SCRAPER');
  console.log('═══════════════════════════════════════════════════');
  
  if (!SUPABASE_KEY) {
    console.error('ERROR: VITE_SUPABASE_ANON_KEY not set');
    process.exit(1);
  }
  
  const allProducts = [];
  
  // Scrape each category
  for (const category of CATEGORIES) {
    const products = await scrapeCategory(category, 15);
    allProducts.push(...products);
    
    // Rate limiting between categories
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`TOTAL PRODUCTS SCRAPED: ${allProducts.length}`);
  console.log(`═══════════════════════════════════════════════════`);
  
  // Save to file
  fs.writeFileSync('/tmp/scraped_products.json', JSON.stringify(allProducts, null, 2));
  console.log('Saved to /tmp/scraped_products.json');
  
  // Insert into database
  const result = await insertProducts(allProducts);
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('SCRAPING COMPLETE');
  console.log(`Total: ${allProducts.length} products`);
  console.log(`Inserted: ${result.inserted}`);
  console.log(`Errors: ${result.errors}`);
  console.log('═══════════════════════════════════════════════════');
}

main().catch(console.error);
