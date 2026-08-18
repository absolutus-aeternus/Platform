# AllianceHub Production Checklist

**Tanggal:** 2026-08-18  
**Versi:** 3.0.0  
**Status:** Pre-Launch Review

---

## 🔴 BLOCKERS (Harus selesai sebelum launch)

### Backend / API
- [ ] **BUG-001: Race Condition Stock Decrement** — Sudah ada fungsi `decrement_stock()` SQL tapi worker masih melakukan loop individual per item. Pastikan SEMUA checkout menggunakan RPC atomic. — Assigned to: Backend Dev
- [ ] **BUG-003: Idempotency Key di Checkout** — Sudah ditambahkan `idempotency_key` column di orders table, tapi frontend belum mengirim `Idempotency-Key` header. Implementasi di `Checkout.vue`. — Assigned to: Frontend Dev
- [ ] **BUG-004: Rollback Stock Gagal** — Jika stock decrement gagal untuk 1 item, order tetap dibuat. Sudah ada partial fix (stockErrors check) tapi perlu transaction-level rollback. — Assigned to: Backend Dev
- [ ] **Payment Gateway Integration** — Checkout hanya menyimpan order ke DB, tidak ada integrasi payment gateway nyata. Hanya crypto exchanges (Binance, Huobi, dll) yang dipilih sebagai "payment method" tanpa actual payment processing. — Assigned to: Full-stack Dev
- [ ] **CSRF Token di Frontend** — Backend sudah generate CSRF token via cookie di `/api/health`, tapi frontend tidak mengambil atau mengirim `X-CSRF-Token` header di POST requests. — Assigned to: Frontend Dev
- [ ] **Missing `users` table reference** — Migrasi `003_security_fixes.sql` mereferensi `users` table tapi migrasi awal (`001_init.sql`) membuat `profiles` table. Perlu konsistensi nama tabel. — Assigned to: Backend/DBA

### Frontend
- [ ] **Cart Item Selection Bug** — `Cart.vue` inisialisasi `item.selected = true` di script setup, tapi ini hanya sekali saat mount. Item baru yang ditambahkan ke cart tidak otomatis ter-select. — Assigned to: Frontend Dev
- [ ] **Missing Error Boundary** — Tidak ada global error handler untuk Vue components. Jika komponen child crash, seluruh halaman blank. — Assigned to: Frontend Dev
- [ ] **Product Detail: Comment Replies Tidak Load** — Replies untuk comments tidak di-fetch saat load halaman. `product_comments` query hanya mengambil top-level comments. — Assigned to: Frontend Dev

### Security
- [ ] **CSRF Protection Tidak Lengkap** — Hanya `/api/checkout` dan `/api/upload/presign` yang verify CSRF. Endpoint sensitif lain (`/api/review`, `/api/seller/markup`, `/api/admin/change-role`) tidak terlindungi. — Assigned to: Backend Dev
- [ ] **Rate Limit Register Endpoint** — Tidak ada rate limit khusus untuk endpoint register. Rawan spam/abuse. — Assigned to: Backend Dev
- [ ] **Admin/Seller Path di robots.txt** — Admin dan seller portal bisa di-crawl search engine. Tambahkan `Disallow: /admin/` dan `Disallow: /seller/`. — Assigned to: DevOps

### Database
- [ ] **Konsistensi Nama Tabel** — Migrasi awal pakai `profiles`, migrasi berikutnya pakai `users`. Perlu dipastikan view/table mapping benar. — Assigned to: DBA
- [ ] **RLS Policy untuk `product_comments`** — Tabel `product_comments` digunakan di `ProductDetail.vue` tapi tidak ada di migrasi SQL manapun. Perlu dibuat + RLS policy. — Assigned to: DBA
- [ ] **RLS Policy untuk `seller_products`** — Tabel sudah dibuat di `006_commission_system.sql` tapi belum ada RLS policy. — Assigned to: DBA

---

## 🟠 IMPORTANT (Sebaiknya sebelum launch)

### Backend / API
- [ ] **BUG-005: CSRF di Semua POST Endpoints** — Tambahkan CSRF verification ke semua POST endpoint yang memodifikasi data. — Assigned to: Backend Dev
- [ ] **BUG-006: Input Validation Lengkap** — Validasi `body.address` structure di checkout, `custom_price` type check di seller markup. — Assigned to: Backend Dev
- [ ] **BUG-007: Gabungkan Duplicate Fetch** — Checkout melakukan 2 loop yang fetch data produk sama. Gabungkan jadi 1 loop. — Assigned to: Backend Dev
- [ ] **BUG-008: Service Headers Leak** — Pastikan `getServiceHeaders()` tidak pernah include key di response/error object. — Assigned to: Backend Dev
- [ ] **BUG-009: Dual Router Guards** — Hapus `src/router/guards.js` jika tidak digunakan, atau integrasikan. — Assigned to: Frontend Dev
- [ ] **BUG-013: Cache Invalidation** — Edge cache `/api/products` (60s TTL) tidak invalidate saat seller update produk. Tambahkan cache-busting mechanism. — Assigned to: Backend Dev
- [ ] **BUG-016: Rate Limit Register** — Tambahkan rate limit khusus (3 req/min per IP) untuk register endpoint. — Assigned to: Backend Dev
- [ ] **Order Status Flow** — Order hanya punya status `pending`. Tidak ada flow `paid → shipped → delivered → completed`. Perlu implementasi full order lifecycle. — Assigned to: Full-stack Dev
- [ ] **Seller Payout Flow** — Endpoint `/api/seller/payout` ada tapi tidak ada mekanisme actual payout execution. Perlu integrasi payment disbursement. — Assigned to: Backend Dev
- [ ] **Webhook/Payment Callback** — Tidak ada webhook endpoint untuk payment gateway callback. Perlu `/api/webhook/payment`. — Assigned to: Backend Dev

### Frontend
- [ ] **BUG-010: OneSignal App ID** — App ID di-expose di `window.__ONESIGNAL_APP_ID__`. Pindahkan ke environment variable yang tidak di-inject ke window. — Assigned to: Frontend Dev
- [ ] **Image Upload Flow** — `/api/upload/presign` endpoint ada tapi tidak ada UI upload component yang menggunakannya. Seller tidak bisa upload gambar produk. — Assigned to: Frontend Dev
- [ ] **Wishlist/Favorites Sync** — `toggleFav()` di `ProductDetail.vue` hanya toggle local state, tidak sync ke Supabase `wishlists` table. — Assigned to: Frontend Dev
- [ ] **Cart Badge Count** — Cart count di header tidak reactive jika cart di-update dari tab/window lain. — Assigned to: Frontend Dev
- [ ] **Search Autocomplete** — Algolia search terintegrasi di backend tapi tidak ada autocomplete dropdown di frontend search bar. — Assigned to: Frontend Dev
- [ ] **Seller Follow Button** — "Follow" button di `Home.vue` seller section tidak memiliki onclick handler. — Assigned to: Frontend Dev
- [ ] **Mobile Bottom Nav** — Ada `MobileTabBar.vue` component tapi perlu dipastikan muncul di semua halaman buyer. — Assigned to: Frontend Dev

### Database / Infrastructure
- [ ] **Database Backup Strategy** — Tidak ada dokumentasi atau cron job untuk backup Supabase database. — Assigned to: DevOps
- [ ] **Monitoring & Alerting** — Tidak ada monitoring untuk Worker API (error rate, latency, uptime). — Assigned to: DevOps
- [ ] **SSL Certificate** — Domain `alliancehub.dpdns.org` perlu dipastikan SSL valid dan auto-renew. — Assigned to: DevOps
- [ ] **Environment Variables Audit** — Pastikan semua production env vars sudah diset di Cloudflare Workers (tidak hanya di `.env`). — Assigned to: DevOps

### Testing
- [ ] **Unit Tests** — Tidak ada unit test sama sekali. Minimal perlu test untuk store actions dan worker endpoints. — Assigned to: QA
- [ ] **E2E Tests** — Tidak ada end-to-end test. Perlu test critical flows (register → browse → add to cart → checkout). — Assigned to: QA
- [ ] **Load Testing** — Tidak ada data tentang capacity. Perlu load test untuk concurrent checkout. — Assigned to: QA

---

## 🟡 NICE TO HAVE

### Features
- [ ] **Multi-Vendor Cart Grouping** — Cart items harus dikelompokkan per seller (sesuai DESIGN_SYSTEM_GUIDE.md). Saat ini flat list. — Assigned to: Frontend Dev
- [ ] **Shipping Calculator** — Shipping selalu "Free". Perlu integrasi kurir (J&T, LBC, dll) untuk hitung ongkir per seller. — Assigned to: Full-stack Dev
- [ ] **Coupon/Voucher System** — Tabel `coupons` ada di admin panel tapi tidak ada logic apply coupon di checkout. — Assigned to: Full-stack Dev
- [ ] **Product Comparison** — Route `/comparison` ada tapi implementasi belum dicek. — Assigned to: Frontend Dev
- [ ] **Blog/Content** — Route `/blog` ada tapi belum dicek kontennya. — Assigned to: Content
- [ ] **Multi-language (i18n)** — `vue-i18n` sudah di-install tapi belum dicek implementasinya. — Assigned to: Frontend Dev
- [ ] **Dark Mode** — CSS variables untuk dark mode sudah didefinisikan di DESIGN_SYSTEM_GUIDE.md tapi belum dicek implementasinya. — Assigned to: Frontend Dev
- [ ] **Push Notifications** — OneSignal terintegrasi tapi belum dicek workflow-nya. — Assigned to: Full-stack Dev
- [ ] **Credit/Loan System** — Routes `/credit`, `/credit/application`, `/credit/my-loan` ada. Perlu dicek implementasi dan compliance. — Assigned to: Full-stack Dev
- [ ] **Blockchain Integration** — Admin panel punya halaman Blockchain. Perlu dicek purpose dan implementasinya. — Assigned to: Backend Dev
- [ ] **Rating Plus System** — Ada `RATING_PLUS` role dan routes. Perlu dicek business logic-nya. — Assigned to: Full-stack Dev
- [ ] **Scraper Tool** — Admin panel punya Scraper page. Sudah ada multi-marketplace scraper. Perlu dokumentasi. — Assigned to: Backend Dev
- [ ] **Customer Service Chat** — Multiple CS routes (`/customer-service`, `/customer-service-2`, `/customer-service-index`). Perlu konsolidasi. — Assigned to: Frontend Dev

### Performance
- [ ] **Image Optimization** — Gambar produk tidak di-resize/optimize. Perlu CDN image transformation (Cloudflare Image Resizing). — Assigned to: DevOps
- [ ] **Code Splitting** — Sudah ada lazy loading di router tapi perlu audit bundle size. — Assigned to: Frontend Dev
- [ ] **Service Worker / PWA** — Tidak ada service worker untuk offline support. — Assigned to: Frontend Dev
- [ ] **SSR/SSG** — Saat ini SPA murni. Pertimbangkan Nuxt.js untuk SEO. — Assigned to: Frontend Dev

### SEO & Marketing
- [ ] **Meta Tags** — Sudah ada dynamic title dan canonical URL. Perlu og:image, og:description per halaman. — Assigned to: Frontend Dev
- [ ] **Sitemap** — Tidak ada `sitemap.xml`. — Assigned to: DevOps
- [ ] **Structured Data** — Tidak ada JSON-LD untuk product pages (schema.org). — Assigned to: Frontend Dev
- [ ] **Analytics** — Sudah ada Microsoft Clarity tapi belum dicek Google Analytics/Tag Manager. — Assigned to: Marketing

---

## ✅ SUDAH SELESAI

### Backend / API
- [x] **Atomic Stock Decrement** — Fungsi `decrement_stock()` SQL sudah dibuat (migration `009_atomic_stock.sql`)
- [x] **Idempotency Key Column** — `idempotency_key` column sudah ditambahkan ke orders table
- [x] **Rate Limiting** — Upstash Redis rate limiting + memory fallback sudah implementasi
- [x] **Sensitive Endpoint Rate Limit** — Checkout, upload, login-log punya stricter rate limit (10 req/min)
- [x] **Input Validation** — UUID format validation, quantity range (1-999), price mismatch detection sudah ada
- [x] **Auth Verification** — JWT verification via Supabase `/auth/v1/user` sudah implementasi
- [x] **Role-Based Access Control** — MEMBER, SELLER, ADMIN, SUPER_ADMIN roles sudah implementasi
- [x] **Seller Approval Workflow** — Register → pending → approve/reject flow sudah ada
- [x] **Commission System** — Sale commission, review commission, seller wallets sudah ada
- [x] **Payout System** — Seller payout request + admin processing sudah ada
- [x] **Audit Logging** — `audit_logs` table + logging di role change, seller approval sudah ada
- [x] **Edge Caching** — Products API pakai Cloudflare Cache API dengan stale-while-revalidate
- [x] **CORS Configuration** — Allowed origins dikonfigurasi dengan benar
- [x] **CSP Headers** — Content Security Policy sudah di-set
- [x] **B2 File Storage** — Backblaze B2 integration untuk file upload/download
- [x] **CSRF Token Generation** — Generate di `/api/health` response cookie
- [x] **Structured Error Logging** — Error ID generation, no sensitive data in response

### Frontend
- [x] **Home Page** — Hero banner, flash sale, categories, sellers, product grid, services bar
- [x] **Product Detail** — Image gallery + zoom + lightbox, reviews, comments, chat seller
- [x] **Cart** — Select all, quantity control, remove, order summary
- [x] **Checkout** — Address selection, order items, payment method, place order
- [x] **Sticky CTA** — Mobile sticky bottom bar di product detail
- [x] **Trust Elements** — VerifiedBadge, TrustBar, DiscountTag components
- [x] **Skeleton Loading** — Shimmer animation untuk loading states
- [x] **Error States** — Error banner dengan retry button
- [x] **Responsive Design** — Breakpoints 480/768/1024/1280px
- [x] **Realtime Updates** — Supabase realtime subscription di Home page
- [x] **Role-Based Routing** — Router guards untuk auth, member, seller, admin, superadmin

### Database
- [x] **Core Tables** — profiles, categories, sellers, products, cart_items, orders, order_items
- [x] **RLS Policies** — Owner-only access untuk user data, public read untuk products/categories
- [x] **Role Escalation Prevention** — Trigger `prevent_role_escalation()` mencegah user ganti role sendiri
- [x] **Commission Tables** — commissions, seller_wallets, payouts, platform_settings
- [x] **Review Validation** — review_validations table untuk anti-fraud
- [x] **Seller Approval Columns** — approval_status, approved_by, approved_at, rejection_reason

### Security
- [x] **RLS Hardening** — Semua sensitive tables punya RLS enabled
- [x] **Service Role Isolation** — Worker menggunakan service role key hanya untuk operasi yang perlu bypass RLS
- [x] **IP Logging** — Login events di-log dengan IP, user agent, geo info
- [x] **Admin Audit Trail** — Semua admin actions (role change, seller approval) di-log

### Infrastructure
- [x] **CI/CD Pipeline** — GitHub Actions deploy ke Cloudflare Pages
- [x] **Worker Deployment** — Cloudflare Workers untuk API
- [x] **Supabase Integration** — Auth, Database, Realtime
- [x] **Algolia Search** — Full-text search integration
- [x] **Backblaze B2** — File storage untuk product images
- [x] **Upstash Redis** — Rate limiting cache

---

*Last updated: 2026-08-18 21:49 GMT+8*
