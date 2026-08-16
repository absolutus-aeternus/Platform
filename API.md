# AllianceHub API Documentation

Base URL: `https://alliancehub-api.absolutus-aeternus.workers.dev`

## Public Endpoints

### GET /
API information and endpoint list.

### GET /api/health
Health check.
- Response: `{ "status": "ok", "version": "2.1", "storage": "backblaze-b2" }`

### GET /api/products
Get products list.
- Query params: `limit`, `offset`, `category`, `sort`
- Response: `{ "data": [...products] }`

### GET /api/categories
Get all categories.
- Response: `{ "data": [...categories] }`

### GET /api/sellers
Get all sellers.
- Response: `{ "data": [...sellers] }`

### GET /api/search
Search products.
- Query params: `q` (search term), `limit`
- Response: `{ "hits": [...] }`

## Authenticated Endpoints

### GET /api/dashboard
Get dashboard data (products, categories, sellers).
- Headers: `Authorization: Bearer <token>`
- Response: `{ "products": [...], "categories": [...], "sellers": [...] }`

### GET /api/orders
Get user orders.
- Headers: `Authorization: Bearer <token>`
- Response: `{ "data": [...orders] }`

### POST /api/checkout
Create an order.
- Headers: `Authorization: Bearer <token>`
- Body: `{ "items": [...], "address": {...} }`
- Response: `{ "order": {...} }`

### POST /api/log/login
Log login event (IP, device, browser).
- Body: `{ "email", "role", "login_type", "login_status", "device_type", "browser_name", "os_name", ... }`
- Response: `{ "ok": true, "ip": "..." }`

## Admin Endpoints

### POST /api/cron/daily
Run daily cron job.
- Headers: `X-Cron-Token: <token>`
- Response: `{ "ok": true }`

### POST /api/upload/presign
Get presigned URL for B2 upload.
- Headers: `Authorization: Bearer <token>`
- Body: `{ "filename", "contentType" }`
- Response: `{ "url": "...", "fileId": "..." }`

### GET /api/file/:filename
Proxy to B2 file download.
- Response: File content

## Error Responses

- 401: `{ "error": "Authentication required" }`
- 403: `{ "error": "Forbidden" }`
- 404: `{ "error": "Not found" }`
- 429: `{ "error": "Rate limit exceeded" }`
- 500: `{ "error": "Internal server error" }`

## Rate Limiting
- 60 requests per minute per IP
- Returns 429 when exceeded

## CORS
- Allowed origins: `alliancehub.pages.dev`, `alliancehub.dpdns.org`
