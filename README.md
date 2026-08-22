# AllianceHub — Global Dropshipping Marketplace

Full-stack e-commerce marketplace built with **Vue 3**, **Supabase**, and **Cloudflare Workers**.

[![Deploy](https://github.com/absolutus-aeternus/Platform/actions/workflows/deploy.yml/badge.svg)](https://github.com/absolutus-aeternus/Platform/actions/workflows/deploy.yml)
[![Security Scan](https://github.com/absolutus-aeternus/Platform/actions/workflows/security-scan.yml/badge.svg)](https://github.com/absolutus-aeternus/Platform/actions/workflows/security-scan.yml)

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Frontend (Vue 3 + Vite)                 │
│   Pinia · Vue Router · Vue I18n (9 langs) · PWA          │
├──────────────────────────────────────────────────────────┤
│               Cloudflare Workers (API Layer)              │
│   Edge Cache · Rate Limiting · CSRF · CORS · Proxy       │
├──────────────────────────────────────────────────────────┤
│                 Supabase (PostgreSQL)                      │
│   Auth · RLS · Realtime · Full-Text Search · Storage      │
├──────────────────────────────────────────────────────────┤
│                    External Services                       │
│   Backblaze B2 · Upstash Redis · Resend/Brevo             │
│   OneSignal · Microsoft Clarity · cron-job.org            │
└──────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3, Pinia, Vue Router, Vue I18n |
| Build | Vite 5, esbuild |
| API | Cloudflare Workers (edge) |
| Database | Supabase (PostgreSQL 15) |
| Search | PostgreSQL Full-Text Search (tsvector + GIN) with pg_trgm fuzzy fallback |
| Auth | Supabase Auth + RLS (Row Level Security) |
| Storage | Backblaze B2 (S3-compatible) |
| Cache | Upstash Redis (serverless) + Cloudflare Edge Cache |
| Email | Resend (transactional) + Brevo (SMTP relay) |
| Push | OneSignal |
| Analytics | Microsoft Clarity |
| Cron | cron-job.org |
| Deploy | Cloudflare Workers + GitHub Actions |

## Project Structure

```
Platform/
├── src/
│   ├── assets/           # CSS: design tokens, responsive, animations
│   ├── components/       # Reusable UI components
│   │   ├── base/         # BaseButton, BaseInput, BaseModal, BasePagination
│   │   ├── layout/       # DynamicNav, FilterSidebar, MobileTabBar, StickyCTA
│   │   ├── product/      # ProductCard, FlashSaleCard
│   │   ├── seller/       # BentoGrid, SalesChart, StatCard
│   │   └── trust/        # TrustBar, VerifiedBadge, DiscountTag
│   ├── composables/      # useAuth, useDarkMode, useDevice, useFeatureFlags
│   ├── i18n/             # 9 locales: en, id, zh, ja, ko, ar, th, vi, ms
│   ├── layouts/          # Admin, Seller, SuperAdmin, User layouts
│   ├── router/           # Vue Router config
│   ├── services/         # Supabase client, scraper, rplus
│   ├── store/            # Pinia stores: cart, orders, products, user, wishlist
│   ├── utils/            # search, payment, shipping, email, currency, helpers
│   ├── views/            # 80+ page components
│   │   ├── admin/        # Admin panel (16 views)
│   │   ├── seller/       # Seller dashboard (17 views)
│   │   ├── superadmin/   # Super admin (7 views)
│   │   └── user/         # User account (12 views)
│   └── worker/           # Cloudflare Worker (API + edge logic)
├── supabase/
│   ├── migrations/       # 23 SQL migrations (schema, RLS, FTS)
│   └── functions/        # Edge functions
├── tests/
│   ├── integration/      # API integration tests
│   └── unit/             # Composable & store unit tests
├── scripts/              # QA check script
└── public/               # Static assets, PWA manifest, service worker
```

## Features

### Marketplace
- Product catalog with categories, search, filters, and sorting
- Full-Text Search with weighted ranking (name > description > category) and fuzzy typo tolerance
- Shopping cart, wishlist, and checkout flow
- Order tracking and logistics
- Flash sales and coupon system
- Multi-seller marketplace with seller registration and approval

### Seller Portal
- Product management (CRUD, variants, inventory)
- Order management and fulfillment
- Sales analytics and reports
- Coupon and promotion management
- Shipping rate configuration
- Wallet and payout system

### Admin Panel
- User and seller management with role-based access (MEMBER, SELLER, ADMIN, SUPER_ADMIN)
- Product and category management
- Order and payment oversight
- Banner and notification management
- Audit logs and security monitoring
- Feature flags (toggle features from UI)
- IP logging and login tracking

### Security
- Supabase RLS (Row Level Security) on all tables
- CSRF protection (HMAC-SHA256 signed tokens)
- Rate limiting (Upstash Redis + in-memory fallback)
- Per-user rate limiting on sensitive endpoints
- Webhook signature verification (HMAC-SHA256)
- CSP headers (Content Security Policy)
- Input sanitization and validation

### Internationalization
9 languages: English, Indonesian, Chinese, Japanese, Korean, Arabic, Thai, Vietnamese, Malay

## Search System

Full-Text Search powered by PostgreSQL (replaces Algolia):

```sql
-- Weighted search: name (A) > description (B) > category (C)
SELECT * FROM search_products('wireless earbuds', 20, 0, NULL);

-- Fuzzy fallback for typos
SELECT * FROM search_products_simple('earbuds', 20, 0, NULL);
```

- **tsvector + GIN index** for fast full-text lookups
- **pg_trgm** for fuzzy/typo-tolerant matching
- **Auto-update trigger** keeps search index in sync on INSERT/UPDATE
- **SECURITY DEFINER** bypasses RLS for public search access
- **Zero external dependencies** — no Algolia, no sync jobs

## Quick Start

```bash
# Clone
git clone git@github.com:absolutus-aeternus/Platform.git
cd Platform

# Install
npm install

# Environment
cp .env.example .env
# Fill in Supabase URL + keys

# Dev server
npm run dev          # Frontend → http://localhost:3000
npm run worker:dev   # Worker → http://localhost:8788

# Build
npm run build

# Test
npm run test
```

## Environment Variables

See [`.env.example`](.env.example) for all required variables:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server-only) |
| `DATABASE_PASSWORD` | Supabase DB password |
| `MANAGEMENT_API_TOKEN` | Supabase Management API token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |
| `B2_KEY_ID` / `B2_APPLICATION_KEY` | Backblaze B2 credentials |
| `RESEND_API_KEY` | Resend email API key |
| `BREVO_SMTP_KEY` | Brevo SMTP key |
| `VITE_ONESIGNAL_APP_ID` | OneSignal app ID |
| `CRON_JOB_TOKEN` | cron-job.org token |
| `VITE_CLARITY_PROJECT_ID` | Microsoft Clarity project ID |
| `VITE_WORKER_URL` | Cloudflare Worker URL |

## Deployment

### Cloudflare Workers (API)
```bash
npm run worker:deploy
# Or via GitHub Actions (auto-deploy on push to main)
```

### Supabase Migrations
```bash
# Link project
supabase link --project-ref <ref>

# Push migrations
supabase db push
```

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check |
| `/api/products` | GET | List products (cached) |
| `/api/product/:slug` | GET | Product detail |
| `/api/search?q=` | GET | Full-text search |
| `/api/categories` | GET | List categories |
| `/api/sellers` | GET | List sellers |
| `/api/sellers/top` | GET | Top sellers by followers |
| `/api/follow` | POST/DELETE | Follow/unfollow seller |
| `/api/wishlist` | GET/POST | Wishlist toggle |
| `/api/checkout` | POST | Place order |
| `/api/orders` | GET | User orders |
| `/api/coupons/validate` | GET | Validate coupon |
| `/api/shipping/estimate` | GET | Shipping estimate |
| `/api/review` | POST | Submit review |
| `/api/email/send` | POST | Send email |
| `/api/webhook/payment` | POST | Payment webhook |
| `/api/admin/*` | Various | Admin endpoints |

## Database

23 migrations in `supabase/migrations/`:

- `001_init.sql` — Core tables (profiles, categories, sellers, products, orders)
- `002-006` — Feed events, security fixes, commission system
- `007-013` — RLS hardening, rating system, atomic stock, favorites
- `014-022` — RLS policies, notifications, comments, audit logs, indexes
- `023_fulltext_search_products.sql` — Full-Text Search (replaces Algolia)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## License

[MIT](LICENSE)
