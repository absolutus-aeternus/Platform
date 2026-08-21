# AllianceHub — Partner Global Dropshippers

> Full-stack e-commerce marketplace platform built with Vue 3, Supabase, and Cloudflare.

[![Deploy](https://github.com/absolutus-aeternus/Platform/actions/workflows/deploy.yml/badge.svg)](https://github.com/absolutus-aeternus/Platform/actions/workflows/deploy.yml)
[![Security Scan](https://github.com/absolutus-aeternus/Platform/actions/workflows/security-scan.yml/badge.svg)](https://github.com/absolutus-aeternus/Platform/actions/workflows/security-scan.yml)

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Vue 3)                   │
│  Pinia · Vue Router · Vue I18n (9 langs) · PWA       │
├─────────────────────────────────────────────────────┤
│              Cloudflare Pages + Workers               │
│  Edge Cache · Rate Limiting · CSRF · CORS            │
├─────────────────────────────────────────────────────┤
│                  Supabase (PostgreSQL)                │
│  Auth · RLS (50 tables) · Realtime · Storage         │
├─────────────────────────────────────────────────────┤
│                   External Services                   │
│  Backblaze B2 · Algolia · Upstash Redis · Resend     │
│  OneSignal · Microsoft Clarity                        │
└─────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
Platform/
├── src/
│   ├── components/       # Reusable Vue components
│   │   ├── base/         # BaseButton, BaseInput, BaseModal, etc.
│   │   ├── layout/       # DynamicNav, FilterSidebar, MobileTabBar
│   │   ├── product/      # ProductCard, FlashSaleCard
│   │   ├── seller/       # BentoGrid, SalesChart, StatCard
│   │   └── trust/        # TrustBar, VerifiedBadge, DiscountTag
│   ├── composables/      # Vue composables (useAuth, useDarkMode, useDevice)
│   ├── i18n/             # 9 languages (en, id, zh, ja, ko, ar, th, vi, ms)
│   ├── layouts/          # MainLayout, AdminLayout, SellerLayout, etc.
│   ├── router/           # Vue Router with RBAC guards
│   ├── services/         # Supabase client, API services
│   ├── store/            # Pinia stores (user, cart, orders, products, etc.)
│   ├── utils/            # Helpers (CSRF, currency, payment, shipping, etc.)
│   ├── views/            # 80+ page components
│   │   ├── admin/        # Admin panel (20+ views)
│   │   ├── seller/       # Seller dashboard (17 views)
│   │   ├── superadmin/   # Super admin portal (7 views)
│   │   └── user/         # User dashboard (13 views)
│   └── worker/           # Cloudflare Worker (API backend)
├── supabase/
│   ├── migrations/       # 21 SQL migrations
│   └── functions/        # Edge functions
├── functions/            # Cloudflare Pages Functions (proxy)
├── public/               # Static assets, PWA manifest, service worker
├── scripts/              # Build, seed, sync, and DB utilities
└── tests/                # Unit + integration tests
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Supabase project ([supabase.com](https://supabase.com))
- Cloudflare account ([cloudflare.com](https://cloudflare.com))

### 1. Clone & Install

```bash
git clone git@github.com:absolutus-aeternus/Platform.git
cd Platform
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Fill in your Supabase and Cloudflare credentials
```

### 3. Database Setup

```bash
# Option A: Via Supabase CLI
supabase link --project-ref <your-project-ref>
supabase db push

# Option B: Via Management API (scripts/supabase-sql.sh)
export SUPABASE_PROJECT_REF=<your-ref>
export SUPABASE_ACCESS_TOKEN=<your-token>
bash scripts/supabase-sql.sh --file supabase/migrations/001_init.sql
```

### 4. Run Development

```bash
npm run dev          # Frontend on http://localhost:3000
npm run worker:dev   # API worker on http://localhost:8788
```

### 5. Run Tests

```bash
npm test             # Run once
npm run test:watch   # Watch mode
npm run test:coverage # With coverage
```

## 🔐 Security

### Authentication & Authorization

- **Supabase Auth** — Email/password with JWT tokens
- **5-tier RBAC**: `SUPER_ADMIN` > `ADMIN` > `SELLER` > `RATING_PLUS` > `MEMBER`
- **Row Level Security (RLS)** on all 50 database tables
- **Role escalation prevention** — database trigger blocks client-side role changes

### API Security

- **HMAC-signed CSRF tokens** — cryptographic validation, 24h expiry
- **Rate limiting** — 60 req/min (IP), 120 req/min (user), 10 req/min (sensitive endpoints)
- **Payment webhook signature verification** — HMAC-SHA256
- **Input sanitization** — SQL injection prevention, search pattern escaping
- **CORS** — strict origin allowlist
- **CSP** — Content Security Policy with HSTS

### CI/CD Security

- **CodeQL Analysis** — weekly automated code scanning
- **Dependency Audit** — `npm audit` on every PR
- **Secret Detection** — regex scan for hardcoded credentials
- **Automated Tests** — runs before every deploy

## 🗄 Database

### Tables (50)

| Category | Tables |
|----------|--------|
| **Core** | users, profiles, products, categories, sellers |
| **Commerce** | orders, order_items, cart_items, payments, coupons |
| **User Data** | addresses, wishlists, follows, notifications, bank_cards |
| **Seller** | seller_products, seller_wallets, commissions, payouts |
| **Reviews** | evaluations, reviews, review_validations, product_comments |
| **System** | system_params, audit_logs, login_logs, banners, platform_settings |
| **Rating Plus** | rating_plus_users, rating_plus_tasks, rating_plus_chat_messages |
| **Shipping** | shipping_rates |

### Key Functions

- `process_checkout()` — Atomic checkout with stock deduction + idempotency
- `prevent_role_escalation()` — Trigger blocks unauthorized role changes
- `validate_coupon()` — Coupon validation with usage tracking
- `update_stock_on_order()` — Automatic stock deduction on order creation
- `update_product_rating()` — Recalculates product rating on review changes

## 🛠 API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check + CSRF token |
| GET | `/api/products` | List products (edge-cached, 60s) |
| GET | `/api/product/:slug` | Product detail |
| GET | `/api/categories` | List categories |
| GET | `/api/sellers` | List sellers |
| GET | `/api/sellers/top` | Top sellers with follower counts |
| GET | `/api/search` | Algolia-powered search |
| GET | `/api/shipping/estimate` | Shipping rate estimates |
| GET | `/api/coupons/validate` | Validate coupon code |

### Authenticated
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/checkout` | Create order (atomic) |
| GET | `/api/orders` | User's orders |
| POST | `/api/follow` | Follow seller |
| POST | `/api/wishlist` | Toggle wishlist |
| POST | `/api/review` | Submit review (verified purchase) |
| POST | `/api/seller/register` | Register as seller |
| POST | `/api/email/send` | Send email to self |

### Admin Only
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/change-role` | Change user role (audited) |
| GET | `/api/admin/orders` | All orders |
| POST | `/api/admin/seller-approval` | Approve/reject sellers |
| GET | `/api/admin/system-params` | System configuration |

## 🌍 Deployment

### Automatic (GitHub Actions)

Push to `main` branch triggers:
1. `npm ci` → `npm test` → `npm run build`
2. Deploy frontend to Cloudflare Pages
3. Deploy API worker to Cloudflare Workers
4. Apply Supabase migrations

### Manual

```bash
# Build & deploy frontend
npm run build
npx wrangler pages deploy dist --project-name=alliancehub

# Deploy API worker
npm run worker:deploy

# Apply database migrations
supabase db push
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) | ✅ |
| `VITE_WORKER_URL` | Cloudflare Worker URL | ✅ |
| `VITE_ALGOLIA_APP_ID` | Algolia application ID | ⬜ |
| `VITE_ONESIGNAL_APP_ID` | OneSignal push notifications | ⬜ |
| `UPSTASH_REDIS_REST_URL` | Redis for rate limiting | ⬜ |
| `B2_KEY_ID` / `B2_APPLICATION_KEY` | Backblaze B2 storage | ⬜ |
| `RESEND_API_KEY` | Email service | ⬜ |

## 🧪 Testing

```bash
npm test                    # Unit tests (Vitest)
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
npm run qa                  # QA checks (lint + test + build validation)
```

### Test Structure

```
tests/
├── setup.js                # Test environment setup
├── unit/
│   ├── composables.test.js # Composable tests
│   ├── store.test.js       # Pinia store tests
│   └── utils.test.js       # Utility function tests
└── integration/
    └── api.test.js         # API endpoint tests
```

## 📱 Features

### Multi-Role Portal System
- **Buyer Portal** — Shopping, orders, wallet, favorites, reviews
- **Seller Portal** — Product management, orders, analytics, promotions, shipping
- **Admin Portal** — User management, reports, system settings, seller approval
- **Super Admin Portal** — Full access, audit logs, feature flags, security

### E-Commerce Core
- Product catalog with categories, variants, and flash sales
- Shopping cart with real-time sync
- Atomic checkout with stock validation
- Coupon system (percentage, fixed, free shipping)
- Order tracking and logistics
- Return/refund management

### Internationalization
9 languages: English, Indonesian, Chinese, Japanese, Korean, Arabic, Thai, Vietnamese, Malay

### Progressive Web App
- Service worker with offline support
- Background sync for pending orders
- Push notifications (OneSignal)
- Installable on mobile/desktop

## 📄 License

Proprietary — © AllianceHub. All rights reserved.
