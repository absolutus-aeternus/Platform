// MongoDB Atlas Seed Script for AllianceHub
// Uses Atlas Data API to seed product data
// Run: node scripts/seed-mongodb.js

const MONGODB_DATA_API_URL = 'https://data.mongodb-api.com/app/data-api/endpoint/data/v1';
const MONGODB_DATA_API_KEY = process.env.MONGODB_DATA_API_KEY; // Atlas Data API key
const DB_NAME = 'alliancehub';

async function mongoInsert(collection, documents) {
  const res = await fetch(`${MONGODB_DATA_API_URL}/action/insertMany`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': MONGODB_DATA_API_KEY },
    body: JSON.stringify({
      collection,
      database: DB_NAME,
      dataSource: 'platfrom',
      documents,
    }),
  });
  return res.json();
}

const products = [
  {
    name: 'Wireless Bluetooth Earbuds Pro with Active Noise Cancelling',
    slug: 'wireless-bluetooth-earbuds-pro',
    description: 'Premium wireless earbuds with advanced ANC technology, 30-hour battery life, IPX5 water resistance, and crystal-clear audio. Perfect for music lovers and professionals.',
    price: 29.99, original_price: 59.99, discount: 50,
    stock: 500, sales_count: 15234, rating: 4.8, review_count: 234,
    category: 'electronics', category_id: 'a1111111-1111-1111-1111-111111111101',
    seller_id: 'seller-001',
    images: ['https://picsum.photos/seed/earbuds1/400/400', 'https://picsum.photos/seed/earbuds2/400/400'],
    attributes: { color: ['Black', 'White', 'Blue'], connectivity: 'Bluetooth 5.3' },
    is_active: true, is_recommended: true,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    name: 'Smart Watch Ultra Fitness Tracker Heart Rate Monitor IP68',
    slug: 'smart-watch-ultra-fitness',
    description: 'Advanced smartwatch with always-on display, heart rate monitoring, blood oxygen tracking, GPS, and 14-day battery life. Swim-proof with IP68 rating.',
    price: 45.99, original_price: 89.99, discount: 49,
    stock: 300, sales_count: 8921, rating: 4.6, review_count: 178,
    category: 'electronics', category_id: 'a1111111-1111-1111-1111-111111111101',
    seller_id: 'seller-001',
    images: ['https://picsum.photos/seed/watch1/400/400'],
    attributes: { color: ['Silver', 'Black', 'Rose Gold'], screen: '1.9 inch AMOLED' },
    is_active: true, is_recommended: true,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    name: 'Portable Power Bank 20000mAh Fast Charging USB-C',
    slug: 'portable-power-bank-20000mah',
    description: 'High-capacity 20000mAh power bank with 65W PD fast charging, dual USB-C ports, LED display, and aircraft-safe design.',
    price: 19.99, original_price: 39.99, discount: 50,
    stock: 800, sales_count: 23456, rating: 4.7, review_count: 456,
    category: 'electronics', category_id: 'a1111111-1111-1111-1111-111111111101',
    seller_id: 'seller-002',
    images: ['https://picsum.photos/seed/powerbank/400/400'],
    attributes: { capacity: '20000mAh', output: '65W PD' },
    is_active: true, is_recommended: false,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    name: 'LED Ring Light 10 inch with Tripod Stand for Live Streaming',
    slug: 'led-ring-light-10-inch',
    description: 'Professional 10-inch ring light with adjustable color temperature, phone holder, and extendable tripod. Perfect for content creators.',
    price: 15.99, original_price: 29.99, discount: 47,
    stock: 400, sales_count: 6789, rating: 4.5, review_count: 123,
    category: 'electronics', category_id: 'a1111111-1111-1111-1111-111111111101',
    seller_id: 'seller-002',
    images: ['https://picsum.photos/seed/ringlight/400/400'],
    is_active: true, is_recommended: false,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    name: 'Mechanical Gaming Keyboard RGB Backlit Hot-Swappable',
    slug: 'mechanical-gaming-keyboard-rgb',
    description: 'Premium mechanical keyboard with hot-swappable switches, per-key RGB lighting, PBT keycaps, and detachable USB-C cable.',
    price: 35.99, original_price: 69.99, discount: 49,
    stock: 250, sales_count: 11234, rating: 4.9, review_count: 312,
    category: 'electronics', category_id: 'a1111111-1111-1111-1111-111111111101',
    seller_id: 'seller-003',
    images: ['https://picsum.photos/seed/keyboard/400/400'],
    attributes: { switch: ['Red', 'Blue', 'Brown'], layout: 'Full Size' },
    is_active: true, is_recommended: true,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    name: 'Summer Floral Print Maxi Dress Elegant Casual Beach Wear',
    slug: 'summer-floral-maxi-dress',
    description: 'Beautiful floral print maxi dress with lightweight fabric, side pockets, and flattering silhouette. Perfect for summer outings.',
    price: 22.99, original_price: 45.99, discount: 50,
    stock: 600, sales_count: 18765, rating: 4.7, review_count: 289,
    category: 'fashion', category_id: 'a1111111-1111-1111-1111-111111111102',
    seller_id: 'seller-004',
    images: ['https://picsum.photos/seed/dress1/400/400'],
    attributes: { size: ['S', 'M', 'L', 'XL', 'XXL'], material: 'Polyester Blend' },
    is_active: true, is_recommended: true,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    name: 'Oversized Vintage Graphic Tee Cotton Unisex Streetwear',
    slug: 'oversized-vintage-graphic-tee',
    description: 'Premium cotton oversized t-shirt with vintage graphic print. Relaxed fit, pre-shrunk fabric, reinforced stitching.',
    price: 14.99, original_price: 29.99, discount: 50,
    stock: 1000, sales_count: 25432, rating: 4.5, review_count: 567,
    category: 'fashion', category_id: 'a1111111-1111-1111-1111-111111111102',
    seller_id: 'seller-004',
    images: ['https://picsum.photos/seed/tshirt/400/400'],
    attributes: { size: ['S', 'M', 'L', 'XL', 'XXL'], material: '100% Cotton' },
    is_active: true, is_recommended: false,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    name: 'High Waist Yoga Pants Stretchy Workout Leggings Fitness',
    slug: 'high-waist-yoga-pants',
    description: 'Buttery-soft high waist yoga leggings with 4-way stretch, moisture-wicking fabric, hidden pocket, and squat-proof design.',
    price: 16.99, original_price: 34.99, discount: 51,
    stock: 700, sales_count: 32100, rating: 4.8, review_count: 678,
    category: 'fashion', category_id: 'a1111111-1111-1111-1111-111111111102',
    seller_id: 'seller-005',
    images: ['https://picsum.photos/seed/yogapants/400/400'],
    attributes: { size: ['XS', 'S', 'M', 'L', 'XL'], color: ['Black', 'Navy', 'Grey'] },
    is_active: true, is_recommended: true,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    name: 'Korean Skincare Set Hydrating Toner Essence Cream 5-Piece',
    slug: 'korean-skincare-set-5piece',
    description: 'Complete K-beauty skincare routine with gentle cleanser, hydrating toner, essence, moisturizer, and sunscreen. Suitable for all skin types.',
    price: 34.99, original_price: 69.99, discount: 50,
    stock: 350, sales_count: 41234, rating: 4.9, review_count: 890,
    category: 'beauty', category_id: 'a1111111-1111-1111-1111-111111111104',
    seller_id: 'seller-006',
    images: ['https://picsum.photos/seed/skincare/400/400'],
    is_active: true, is_recommended: true,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    name: 'Matte Liquid Lipstick Set Long Lasting 6 Colors Gift',
    slug: 'matte-liquid-lipstick-set',
    description: 'Velvety matte liquid lipstick collection with 6 stunning shades. Long-lasting formula, non-drying, and transfer-proof.',
    price: 12.99, original_price: 25.99, discount: 50,
    stock: 500, sales_count: 19876, rating: 4.5, review_count: 345,
    category: 'beauty', category_id: 'a1111111-1111-1111-1111-111111111104',
    seller_id: 'seller-006',
    images: ['https://picsum.photos/seed/lipstick/400/400'],
    is_active: true, is_recommended: false,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    name: 'Scented Soy Candle Set Aromatherapy Relaxation Gift Box',
    slug: 'soy-candle-aromatherapy-set',
    description: 'Hand-poured soy wax candle set with 6 relaxing scents. Natural essential oils, cotton wicks, 40-hour burn time each.',
    price: 18.99, original_price: 36.99, discount: 49,
    stock: 450, sales_count: 8765, rating: 4.7, review_count: 198,
    category: 'home-living', category_id: 'a1111111-1111-1111-1111-111111111103',
    seller_id: 'seller-007',
    images: ['https://picsum.photos/seed/candle/400/400'],
    is_active: true, is_recommended: true,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    name: 'Yoga Mat Non-Slip Extra Thick 6mm Exercise Fitness Mat',
    slug: 'yoga-mat-non-slip-6mm',
    description: 'Premium TPE yoga mat with alignment lines, non-slip texture, and eco-friendly materials. Includes carrying strap.',
    price: 19.99, original_price: 39.99, discount: 50,
    stock: 600, sales_count: 14567, rating: 4.6, review_count: 234,
    category: 'sports', category_id: 'a1111111-1111-1111-1111-111111111105',
    seller_id: 'seller-008',
    images: ['https://picsum.photos/seed/yogamat/400/400'],
    attributes: { thickness: '6mm', material: 'TPE', size: '183x61cm' },
    is_active: true, is_recommended: false,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    name: 'Insulated Water Bottle Stainless Steel 750ml Sports',
    slug: 'insulated-water-bottle-750ml',
    description: 'Double-wall vacuum insulated stainless steel water bottle. Keeps drinks cold 24h or hot 12h. BPA-free, leak-proof lid.',
    price: 14.99, original_price: 29.99, discount: 50,
    stock: 800, sales_count: 33210, rating: 4.8, review_count: 567,
    category: 'sports', category_id: 'a1111111-1111-1111-1111-111111111105',
    seller_id: 'seller-008',
    images: ['https://picsum.photos/seed/bottle/400/400'],
    attributes: { capacity: '750ml', material: 'Stainless Steel' },
    is_active: true, is_recommended: true,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    name: 'Building Blocks Educational STEM Toy 500 Pieces Set',
    slug: 'building-blocks-stem-500pcs',
    description: 'Creative building block set with 500 pieces in various shapes and colors. Includes instruction booklet for 50+ models. Develops STEM skills.',
    price: 24.99, original_price: 49.99, discount: 50,
    stock: 300, sales_count: 8765, rating: 4.7, review_count: 156,
    category: 'toys-games', category_id: 'a1111111-1111-1111-1111-111111111106',
    seller_id: 'seller-009',
    images: ['https://picsum.photos/seed/blocks/400/400'],
    is_active: true, is_recommended: true,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    name: 'Leather Crossbody Bag Women Small Quilted Chain Shoulder',
    slug: 'leather-crossbody-bag-quilted',
    description: 'Elegant quilted leather crossbody bag with gold chain strap, magnetic closure, and multiple compartments. Perfect for day or night.',
    price: 19.99, original_price: 39.99, discount: 50,
    stock: 400, sales_count: 22345, rating: 4.7, review_count: 345,
    category: 'bags', category_id: 'a1111111-1111-1111-1111-111111111111',
    seller_id: 'seller-010',
    images: ['https://picsum.photos/seed/bag/400/400'],
    attributes: { color: ['Black', 'White', 'Beige', 'Pink'], material: 'PU Leather' },
    is_active: true, is_recommended: true,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    name: 'Collagen Peptides Powder Supplement 500g Unflavored',
    slug: 'collagen-peptides-500g',
    description: 'Grass-fed bovine collagen peptides powder. Supports skin elasticity, joint health, and gut function. Dissolves easily in hot or cold liquids.',
    price: 22.99, original_price: 45.99, discount: 50,
    stock: 350, sales_count: 9876, rating: 4.6, review_count: 198,
    category: 'health', category_id: 'a1111111-1111-1111-1111-111111111108',
    seller_id: 'seller-011',
    images: ['https://picsum.photos/seed/collagen/400/400'],
    is_active: true, is_recommended: true,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    name: 'Pet Automatic Feeder Timer Programmable Cat Dog Food',
    slug: 'pet-automatic-feeder-programmable',
    description: 'Smart automatic pet feeder with 4L capacity, programmable timer, portion control, voice recording, and dual power supply.',
    price: 28.99, original_price: 57.99, discount: 50,
    stock: 250, sales_count: 6543, rating: 4.4, review_count: 123,
    category: 'pet-supplies', category_id: 'a1111111-1111-1111-1111-111111111112',
    seller_id: 'seller-012',
    images: ['https://picsum.photos/seed/petfeeder/400/400'],
    is_active: true, is_recommended: false,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    name: 'Vitamin C Brightening Face Serum Anti-Aging Hyaluronic Acid',
    slug: 'vitamin-c-face-serum',
    description: 'Potent Vitamin C serum with hyaluronic acid and vitamin E. Brightens skin, reduces dark spots, and boosts collagen production.',
    price: 15.99, original_price: 31.99, discount: 50,
    stock: 600, sales_count: 28765, rating: 4.7, review_count: 456,
    category: 'beauty', category_id: 'a1111111-1111-1111-1111-111111111104',
    seller_id: 'seller-006',
    images: ['https://picsum.photos/seed/serum/400/400'],
    is_active: true, is_recommended: true,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    name: 'USB-C Hub 7-in-1 Multiport Adapter HDMI SD Card Reader',
    slug: 'usb-c-hub-7in1',
    description: 'Compact 7-in-1 USB-C hub with 4K HDMI, USB 3.0 x2, SD/TF card reader, PD 100W charging, and Gigabit Ethernet.',
    price: 24.99, original_price: 49.99, discount: 50,
    stock: 350, sales_count: 5678, rating: 4.4, review_count: 89,
    category: 'electronics', category_id: 'a1111111-1111-1111-1111-111111111101',
    seller_id: 'seller-002',
    images: ['https://picsum.photos/seed/usbhub/400/400'],
    is_active: true, is_recommended: false,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    name: 'Resistance Bands Set 5 Levels Exercise Loop Fitness',
    slug: 'resistance-bands-set-5levels',
    description: 'Premium latex resistance bands with 5 tension levels (10-50lbs). Includes carry bag, door anchor, and exercise guide.',
    price: 9.99, original_price: 19.99, discount: 50,
    stock: 900, sales_count: 21345, rating: 4.4, review_count: 345,
    category: 'sports', category_id: 'a1111111-1111-1111-1111-111111111105',
    seller_id: 'seller-008',
    images: ['https://picsum.photos/seed/bands/400/400'],
    is_active: true, is_recommended: false,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
];

const reviews = [
  { product_id: 'wireless-bluetooth-earbuds-pro', user_id: 'user-001', username: 'john_doe', rating: 5, comment: 'Amazing sound quality! The ANC is incredible for the price.', created_at: new Date().toISOString() },
  { product_id: 'wireless-bluetooth-earbuds-pro', user_id: 'user-002', username: 'jane_smith', rating: 4, comment: 'Great earbuds, comfortable fit. Battery lasts long.', created_at: new Date().toISOString() },
  { product_id: 'smart-watch-ultra-fitness', user_id: 'user-003', username: 'fitness_fan', rating: 5, comment: 'Best fitness tracker I have ever used. Accurate heart rate.', created_at: new Date().toISOString() },
  { product_id: 'korean-skincare-set-5piece', user_id: 'user-004', username: 'beauty_queen', rating: 5, comment: 'My skin has never looked better! Love this set.', created_at: new Date().toISOString() },
  { product_id: 'mechanical-gaming-keyboard-rgb', user_id: 'user-005', username: 'gamer_pro', rating: 5, comment: 'The switches feel amazing. RGB is beautiful.', created_at: new Date().toISOString() },
];

async function seed() {
  if (!MONGODB_DATA_API_KEY) {
    console.log('MONGODB_DATA_API_KEY not set. Showing seed data instead:');
    console.log(`Products: ${products.length} items`);
    console.log(`Reviews: ${reviews.length} items`);
    console.log('\nTo seed via Atlas Data API, set MONGODB_DATA_API_KEY and run again.');
    console.log('\nOr use mongosh:');
    console.log(`use ${DB_NAME}`);
    console.log(`db.products.insertMany(${JSON.stringify(products.slice(0, 2), null, 2)})`);
    return;
  }

  console.log('Seeding products...');
  const prodResult = await mongoInsert('products', products);
  console.log('Products seeded:', prodResult);

  console.log('Seeding reviews...');
  const revResult = await mongoInsert('reviews', reviews);
  console.log('Reviews seeded:', revResult);

  console.log('Done!');
}

seed().catch(console.error);
