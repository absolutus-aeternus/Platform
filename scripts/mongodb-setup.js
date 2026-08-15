// MongoDB Atlas Setup Script for AllianceHub
// Run with: node scripts/mongodb-setup.js
// Uses Atlas Data API format — collections and indexes

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'alliancehub';

// This script documents the MongoDB schema and can be run via Atlas Data API or mongosh
const schema = {
  collections: {
    products: {
      description: 'Product catalog with dynamic attributes',
      indexes: [
        { keys: { name: 'text', description: 'text' }, name: 'text_search' },
        { keys: { seller_id: 1 }, name: 'idx_seller' },
        { keys: { category: 1 }, name: 'idx_category' },
        { keys: { slug: 1 }, options: { unique: true }, name: 'idx_slug' },
        { keys: { created_at: -1 }, name: 'idx_created' },
        { keys: { is_active: 1, sales_count: -1 }, name: 'idx_active_sales' },
        { keys: { price: 1 }, name: 'idx_price' }
      ],
      sampleDocument: {
        _id: 'ObjectId',
        name: 'Wireless Bluetooth Earbuds Pro',
        slug: 'wireless-bluetooth-earbuds-pro',
        description: 'High quality earbuds with ANC...',
        price: 29.99,
        original_price: 59.99,
        discount: 50,
        stock: 500,
        sales_count: 15234,
        rating: 4.8,
        review_count: 234,
        category: 'electronics',
        category_id: 'a1111111-1111-1111-1111-111111111101',
        seller_id: 'seller-uuid-from-supabase',
        images: ['https://r2-url/products/earbuds-1.webp', 'https://r2-url/products/earbuds-2.webp'],
        attributes: { color: ['Black', 'White'], weight: '50g' },
        is_active: true,
        is_recommended: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      }
    },
    reviews: {
      description: 'Product reviews (denormalized)',
      indexes: [
        { keys: { product_id: 1, created_at: -1 }, name: 'idx_product_reviews' },
        { keys: { user_id: 1 }, name: 'idx_user_reviews' }
      ],
      sampleDocument: {
        _id: 'ObjectId',
        product_id: 'product-slug-or-id',
        user_id: 'user-uuid-from-supabase',
        username: 'john_doe',
        rating: 5,
        comment: 'Great product!',
        images: [],
        created_at: '2025-01-01T00:00:00Z'
      }
    },
    chats: {
      description: 'Chat messages — capped collection (max 10MB)',
      capped: true,
      size: 10485760, // 10MB
      max: 50000,
      indexes: [
        { keys: { room_id: 1, created_at: -1 }, name: 'idx_room_chat' }
      ]
    },
    activity_logs: {
      description: 'User activity logs — TTL 30 days',
      indexes: [
        { keys: { created_at: 1 }, options: { expireAfterSeconds: 2592000 }, name: 'idx_ttl_30d' },
        { keys: { user_id: 1 }, name: 'idx_user_activity' }
      ]
    }
  }
};

console.log('AllianceHub MongoDB Schema:');
console.log(JSON.stringify(schema, null, 2));
console.log('\n--- Create these via Atlas Dashboard or mongosh ---');
console.log(`
// mongosh commands:
use ${DB_NAME};

// Products collection with indexes
db.createCollection("products");
db.products.createIndex({ name: "text", description: "text" }, { name: "text_search" });
db.products.createIndex({ seller_id: 1 }, { name: "idx_seller" });
db.products.createIndex({ category: 1 }, { name: "idx_category" });
db.products.createIndex({ slug: 1 }, { unique: true, name: "idx_slug" });
db.products.createIndex({ created_at: -1 }, { name: "idx_created" });
db.products.createIndex({ is_active: 1, sales_count: -1 }, { name: "idx_active_sales" });
db.products.createIndex({ price: 1 }, { name: "idx_price" });

// Reviews collection
db.createCollection("reviews");
db.reviews.createIndex({ product_id: 1, created_at: -1 }, { name: "idx_product_reviews" });
db.reviews.createIndex({ user_id: 1 }, { name: "idx_user_reviews" });

// Chats — capped collection
db.createCollection("chats", { capped: true, size: 10485760, max: 50000 });
db.chats.createIndex({ room_id: 1, created_at: -1 }, { name: "idx_room_chat" });

// Activity logs — TTL 30 days
db.createCollection("activity_logs");
db.activity_logs.createIndex({ created_at: 1 }, { expireAfterSeconds: 2592000, name: "idx_ttl_30d" });
db.activity_logs.createIndex({ user_id: 1 }, { name: "idx_user_activity" });
`);

export default schema;
