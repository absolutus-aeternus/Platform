# AllianceHub — Partner Global Dropshippers

> Platform e-commerce hybrid dengan arsitektur modern, semua layanan gratis, biaya $0.

## 🌐 Live

| Service | URL |
|---------|-----|
| **Website** | [alliancehub.dpdns.org](https://alliancehub.dpdns.org) |
| **API** | [alliancehub-api.absolutus-aeternus.workers.dev](https://alliancehub-api.absolutus-aeternus.workers.dev) |
| **GitHub** | [absolutus-aeternus/Platform](https://github.com/absolutus-aeternus/Platform) |

## 🏗️ Arsitektur

```
User Browser
  │
  ├─→ Cloudflare Pages (Frontend Vue 3 SPA)
  │     └─ 128 Vue components, 121 views
  │
  ├─→ Cloudflare Workers (API Backend)
  │     ├─→ Supabase (Database, Auth, RLS)
  │     ├─→ Backblaze B2 (File Storage via proxy)
  │     └─→ MongoDB Atlas (Products, Reviews)
  │
  └─→ GitHub Actions (CI/CD)
        └─ Auto-deploy on push to main
```

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Vue 3 + Vite + Pinia | SPA, state management |
| Styling | CSS (custom) | Mobile-first responsive |
| API | Cloudflare Workers | Serverless backend |
| Database | Supabase (PostgreSQL) | Auth, orders, users |
| NoSQL | MongoDB Atlas | Products, reviews |
| Storage | Backblaze B2 | Images, files (private + proxy) |
| Search | Algolia | Product search |
| Auth | Supabase Auth | Login, register, RLS |
| Email | Resend + Brevo | Transactional + marketing |
| Push | OneSignal | Web push notifications |
| Analytics | Microsoft Clarity | User behavior |
| Cache | Upstash Redis | Rate limiting, session |
| Cron | Cloudflare Cron Triggers | Daily tasks |
| CI/CD | GitHub Actions | Auto-deploy |
| Hosting | Cloudflare Pages | Frontend hosting |
| Domain | alliancehub.dpdns.org | Custom domain |

## 📁 Struktur Project

```
Platform/
├── src/
│   ├── components/     # 2 shared components
│   ├── composables/    # 6 composables (useSupabase, useAuth, etc.)
│   ├── i18n/           # Internationalization (en, id, zh)
│   ├── layouts/        # MainLayout, UserLayout, SellerLayout, AdminLayout
│   ├── router/         # Vue Router (108 routes)
│   ├── services/       # Supabase, scraper, R+ services
│   ├── stores/         # Pinia store (user)
│   ├── utils/          # 9 utility modules
│   ├── views/          # 121 Vue components
│   │   ├── admin/      # 25 admin views
│   │   ├── seller/     # 19 seller views
│   │   └── user/       # 14 user views
│   └── worker/         # Cloudflare Worker API
├── supabase/
│   └── migrations/     # SQL migrations
├── .github/
│   └── workflows/      # GitHub Actions CI/CD
├── public/             # Static assets
├── dist/               # Build output (252 files)
└── wrangler.toml       # Cloudflare Worker config
```

## 🚀 Deployment

### Automatic (GitHub Actions)
```bash
git add -A
git commit -m "feat: your changes"
git push origin main
# → GitHub Actions builds & deploys automatically
```

### Manual (from Kali)
```bash
cd ~/Platform
npm run build
wrangler deploy                    # Deploy Worker
wrangler pages deploy dist --project-name=platform  # Deploy Frontend
```

## 🔧 Environment Variables

All secrets are stored in:
- **`.env`** on Kali server (not in git)
- **Cloudflare Pages** dashboard (production env vars)
- **Cloudflare Worker** secrets (wrangler secret)
- **GitHub Actions** secrets (encrypted)

## 📊 17 Free Strategies Implemented

| # | Strategy | Status |
|---|----------|--------|
| 1 | Supabase (pooling, indexes, RLS) | ✅ |
| 2 | MongoDB (projection, compound index, TTL) | ✅ |
| 3 | Workers (cache, batch, rate limiting) | ✅ |
| 4 | B2 (private + Worker proxy, lazy loading) | ✅ |
| 5 | Algolia (debounce 300ms, cache) | ✅ |
| 6 | Resend (verification & reset) | ✅ |
| 7 | Brevo (digest, marketing, failover) | ✅ |
| 8 | Cron triggers (daily, keep-alive) | ✅ |
| 9 | OneSignal (web push) | ✅ |
| 10 | Clarity (analytics) | ✅ |
| 11 | GitHub Actions (CI/CD, cache) | ✅ |
| 12 | Upstash Redis (cache, session) | ✅ |
| 13 | Email queue & digest | ✅ |
| 14 | Pages (auto-deploy on push) | ✅ |
| 15 | Workers stale-while-revalidate | ✅ |
| 16 | Algolia cleanup | ✅ |
| 17 | Supabase Auth cleanup | ✅ |

## 📄 License

Private — AllianceHub © 2026
