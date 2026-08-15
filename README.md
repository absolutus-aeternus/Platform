# AllianceHub — E-Commerce Platform

AllianceHub is a global e-commerce platform connecting buyers and sellers worldwide, built with modern web technologies and designed for scalability.

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Vue.js 3 + Pinia + Vue Router |
| **Backend** | Supabase (PostgreSQL + Auth + Realtime) |
| **Storage** | Cloudflare R2 |
| **Hosting** | Cloudflare Pages |
| **Styling** | Custom CSS (Mobile-First) |

## 📁 Project Structure

```
Platform/
├── src/
│   ├── assets/css/main.css    # Global styles
│   ├── components/            # Reusable components
│   ├── layouts/               # Page layouts (Main, Admin, Seller, User)
│   ├── views/                 # Page components
│   ├── store/user.js          # Pinia state management
│   ├── services/supabase.js   # Supabase client & API
│   ├── router/index.js        # Vue Router config
│   └── i18n/                  # Internationalization
├── supabase/migrations/       # SQL migrations
├── scripts/                   # Utility scripts
├── public/                    # Static assets
├── .env.example               # Environment template
└── vite.config.js             # Vite config
```

## 🛠️ Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env
# Edit .env with your credentials

# 3. Run development server
npm run dev

# 4. Build for production
npm run build
```

## 🔐 Environment Variables

See `.env.example` for all required variables:

- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key
- `CLOUDFLARE_API_TOKEN` — Cloudflare API token for deployment

## 📦 Features

- **Product Catalog** — Browse, search, and filter products
- **User Authentication** — Login, register, password reset via Supabase Auth
- **Shopping Cart** — Add, update, remove items
- **Checkout** — Place orders with address and payment
- **Seller Dashboard** — Manage products, orders, coupons
- **Admin Panel** — Full platform management
- **Real-time Chat** — Buyer-seller messaging
- **Multi-language** — English, Indonesian, Chinese

## 🗄️ Database

PostgreSQL via Supabase with 18+ tables:

| Table | Description |
|-------|-------------|
| `products` | Product catalog (95 items) |
| `categories` | Product categories (34) |
| `sellers` | Seller profiles (9) |
| `users` | User accounts (8) |
| `orders` | Order records (21) |
| `banners` | Homepage banners (10) |
| `notifications` | User notifications |
| `chat_messages` | Real-time messages |

## 🚀 Deployment

**Production URL:** https://platform-7f8.pages.dev

Deployed via Cloudflare Pages with GitHub Actions CI/CD.

## 📄 License

MIT License — see [LICENSE](LICENSE)
