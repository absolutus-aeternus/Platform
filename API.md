# AllianceHub API Documentation

Base URL: `https://alliancehub-api.absolutus-aeternus.workers.dev`

## Public Endpoints

### GET /api/health
Health check.
- Response: `{ "status": "ok", "version": "2.2", "storage": "backblaze-b2" }`

### GET /api/products
Get products list with optimized select.
- Query params: `limit` (1-100, default 40), `category` (UUID), `search` (string), `sort` (newest|price|sales|rating)
- Response: `{ "data": [...products] }`
- Response includes: `id, name, slug, price, original_price, images, status, sales_count, rating, category_id, seller_id, stock, sellers(name, store_name, logo)`
- Edge cached: 60s TTL with stale-while-revalidate 300s

### GET /api/product/:slug
Get single product detail by slug.
- Response: `{ "data": product }` or `{ "data": null }`

### GET /api/categories
Get all categories ordered by sort_order.
- Response: `{ "data": [...categories] }`

### GET /api/sellers
Get all sellers.
- Query params: `recommended` (boolean)
- Response: `{ "data": [...sellers] }`

### GET /api/sellers/top
Get top sellers ordered by follower count.
- Query params: `limit` (1-50, default 10)
- Response: `{ "data": [{ id, name, store_name, logo, description, rating, follower_count }] }`

### GET /api/search
Search products via Algolia.
- Query params: `q` (search term, max 200 chars), `limit` (1-50, default 20)
- Response: `{ "hits": [...] }`

### GET /api/coupons/validate
Validate a coupon code.
- Query params: `code` (required), `total` (order total, default 0)
- Response (valid): `{ "valid": true, "coupon_id": "...", "discount_type": "percentage|fixed|free_shipping", "discount_value": 10, "discount_amount": 5.00 }`
- Response (invalid): `{ "valid": false, "error": "Invalid or expired coupon code" }`

### GET /api/shipping/estimate
Get shipping cost estimates.
- Query params: `seller_id` (UUID, optional), `region` (domestic|international, default domestic)
- Response: `{ "data": [{ id, courier, service, rate, estimated_days, region }] }`

### GET /api/products/:id/variants
Get product variants (size, color, etc.).
- Path param: `:id` (product UUID)
- Response: `{ "data": [{ id, name, sku, price, stock, attributes }] }`

## Authenticated Endpoints

All authenticated endpoints require header: `Authorization: Bearer <token>`

### GET /api/dashboard
Get dashboard data (top products, categories, recommended sellers).
- Response: `{ "products": [...], "categories": [...], "sellers": [...] }`

### GET /api/orders
Get user's orders.
- Response: `{ "data": [...orders with order_items and product names/images] }`

### POST /api/checkout
Create an order.
- Headers: `Authorization`, `X-CSRF-Token`, optional `Idempotency-Key`
- Body:
```json
{
  "items": [{ "product_id": "uuid", "quantity": 1 }],
  "address": { "name": "...", "phone": "...", "address_line1": "..." },
  "payment_method": "wallet",
  "total": 99.99
}
```
- Response: `{ "order": {...}, "order_no": "ORD-xxx" }`
- Rate limited: 10 req/min per IP

### GET /api/wishlist
Get user's wishlist.
- Response: `{ "data": [{ id, product_id, created_at, products: { id, name, price, images, slug } }] }`

### POST /api/wishlist
Toggle product in wishlist (add if not present, remove if present).
- Body: `{ "product_id": "uuid" }`
- Response: `{ "action": "added" }` or `{ "action": "removed" }`

### POST /api/follow
Follow a seller.
- Body: `{ "seller_id": "uuid" }`
- Response: `{ "action": "followed" }` or `{ "action": "already_following" }`

### DELETE /api/follow
Unfollow a seller.
- Body: `{ "seller_id": "uuid" }`
- Response: `{ "action": "unfollowed" }`

### POST /api/review
Submit a product review.
- Body: `{ "product_id": "uuid", "rating": 1-5, "comment": "min 20 chars", "images": ["url"] }`
- Requires: verified purchase (delivered order containing the product)
- Limit: 5 reviews per user per day
- Response: `{ "success": true, "review": {...}, "commission_earned": 0.10 }`

### POST /api/seller/register
Register as a seller (requires MEMBER role).
- Body: `{ "storeName": "...", "description": "..." }`
- Response: `{ "success": true, "status": "pending" }`

### POST /api/seller/markup
Set custom product price (requires approved seller).
- Body: `{ "product_id": "uuid", "custom_price": 29.99 }`
- Response: `{ "success": true, "price": 29.99, "min": 10, "max": 50 }`

### GET /api/seller/wallet
View seller wallet and recent commissions.
- Response: `{ "wallet": { balance, pending_balance, total_earned }, "commissions": [...] }`

### POST /api/seller/payout
Request a payout.
- Body: `{ "amount": 100, "method": "bank_transfer", "account_details": {...} }`
- Response: `{ "success": true, "remaining_balance": 500 }`

### POST /api/log/login
Log login event (IP, device, browser).
- Body: `{ "email", "role", "login_type", "login_status", "device_type", "browser_name", "os_name" }`
- Response: `{ "ok": true, "ip": "..." }`

## Admin Endpoints

All admin endpoints require: `Authorization: Bearer <token>` with ADMIN or SUPER_ADMIN role.

### GET /api/admin/system-params
Get all system parameters.
- Response: `{ "data": [...system_params] }`

### GET /api/admin/orders
Get all orders.
- Query params: `limit` (1-200, default 50)
- Response: `{ "data": [...orders] }`

### GET /api/admin/users
Get all users.
- Query params: `limit` (1-200, default 50)
- Response: `{ "data": [{ id, email, username, role, created_at }] }`

### POST /api/admin/change-role
Change a user's role (SUPER_ADMIN can assign any role, ADMIN cannot assign SUPER_ADMIN).
- Body: `{ "userId": "uuid", "newRole": "MEMBER|SELLER|ADMIN|SUPER_ADMIN", "reason": "..." }`
- Response: `{ "success": true, "oldRole": "MEMBER", "newRole": "SELLER" }`

### POST /api/admin/seller-approval
Approve or reject a seller registration.
- Body: `{ "sellerId": "uuid", "action": "approve|reject", "reason": "..." }`
- Response: `{ "success": true, "status": "approved" }`

### GET /api/admin/sellers/pending
Get pending seller registrations.
- Response: `{ "data": [...sellers] }`

### GET /api/admin/commissions
Get all commissions.
- Query params: `limit` (1-200), `status` (pending|approved|paid|cancelled)
- Response: `{ "data": [...commissions] }`

### POST /api/admin/commission/approve
Approve or cancel a commission.
- Body: `{ "commission_id": "uuid", "action": "approve|cancel" }`
- Response: `{ "success": true, "status": "approved" }`

### GET /api/admin/payouts
Get all payout requests.
- Response: `{ "data": [...payouts] }`

### POST /api/admin/payout/process
Process a payout (complete or reject).
- Body: `{ "payout_id": "uuid", "action": "complete|reject", "notes": "..." }`
- Response: `{ "success": true, "status": "completed" }`

### POST /api/cron/daily
Run daily cron job.
- Headers: `X-Cron-Token: <token>`
- Response: `{ "status": "executed", "timestamp": "..." }`

## File Endpoints

### POST /api/upload/presign
Get presigned URL for B2 upload (auth required).
- Headers: `Authorization`, `X-CSRF-Token`
- Body: `{ "filename": "image.jpg" }`
- Response: `{ "key": "products/...", "uploadUrl": "...", "uploadToken": "...", "publicUrl": "/api/file/..." }`

### GET /api/file/:filename
Proxy to B2 file download. Cached for 24h.

## Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Bad Request — invalid input |
| 401 | Unauthorized — missing or invalid token |
| 403 | Forbidden — insufficient permissions |
| 404 | Not Found |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error (includes errorId for debugging) |

## Rate Limiting
- **Global**: 60 requests per minute per IP
- **Authenticated users**: 120 requests per minute per user
- **Sensitive endpoints** (checkout, upload, login): 10 requests per minute per IP
- Returns `429` with `{ "error": "Rate limit exceeded" }`

## CORS
- Allowed origins: `alliancehub.pages.dev`, `alliancehub.dpdns.org`, `localhost:3000`
- Methods: `GET, POST, PUT, DELETE, OPTIONS`
- Headers: `Content-Type, Authorization, X-Cron-Token, X-API-Key, X-CSRF-Token`

## CSRF Protection
POST/PUT/DELETE endpoints require a valid CSRF token:
1. Token is set via `Set-Cookie: csrf=...` on `GET /api/health`
2. Include token in both cookie and `X-CSRF-Token` header
3. Exception: `GET`, `HEAD`, `OPTIONS` methods are exempt

## Database Tables (Supabase/PostgreSQL)

### Core Tables
- `users` — User accounts with roles (MEMBER, SELLER, ADMIN, SUPER_ADMIN)
- `products` — Product catalog with pricing, stock, images
- `categories` — Product categories
- `sellers` — Seller store profiles with approval workflow
- `orders` — Order records with idempotency support
- `order_items` — Order line items

### Feature Tables
- `coupons` — Discount coupons (percentage, fixed, free_shipping)
- `wishlists` — User product wishlists (unique per user+product)
- `follows` — User-seller follow relationships (unique per user+seller)
- `product_variants` — Product variants with separate pricing/stock (JSONB attributes)
- `shipping_rates` — Configurable shipping rates per seller/courier/region
- `evaluations` — Product reviews with helpful count, verified purchase flag, seller reply

### Commerce Tables
- `seller_products` — Seller-level product markup
- `commissions` — Seller commission tracking
- `seller_wallets` — Seller earnings balance
- `payouts` — Seller withdrawal requests
- `payments` — Payment transaction records

### System Tables
- `platform_settings` — Global configuration (JSONB)
- `system_params` — System parameters
- `audit_logs` — Admin action audit trail
- `notifications` — User notifications
- `banners` — Homepage banners

## Payment Gateway Integration

Payment methods: Binance Pay, OKX, Coinbase, MetaMask, KuCoin, Kraken, Bitfinex, Huobi.

Client-side interface functions (in `src/utils/payment.js`):
- `initiatePayment(orderId, amount, method)` — Start payment flow
- `verifyPayment(paymentId)` — Check payment status
- `handlePaymentCallback(callbackData)` — Process gateway webhooks
- `getAvailablePaymentMethods()` — List available methods with limits

> **Note**: Gateway-specific SDK integration is stubbed. Implement each gateway's API calls in the respective switch cases.
