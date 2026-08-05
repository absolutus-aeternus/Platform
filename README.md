# 🛍️ TikTok Shop Clone — Full-Stack E-Commerce Platform

Complete e-commerce platform inspired by TikTok Shop / TK-Alliance. Built with Vue.js 3, Express.js, Supabase, and deployable to GitHub Pages.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vue.js 3 + Pinia + Vue Router |
| **Backend** | Express.js + JWT Authentication |
| **Database** | Supabase (PostgreSQL) with RLS |
| **Styling** | Custom CSS + Tailwind-ready |
| **Build** | Vite 5 |
| **Deploy** | GitHub Pages (auto-deploy) |

## 📦 Features

### 🌐 Buyer Portal (24 pages)
- Home with categories, daily deals, popular stores, hot deals
- Product catalog with 22 categories
- Product search & filtering (price, sales)
- Shopping cart (add/remove/quantity)
- Checkout with crypto payment (8 exchanges)
- Order management (history, detail, return, evaluation)
- Wallet system (balance, recharge, withdraw)
- Address book (CRUD)
- Favorites / Wishlist
- Followed shops
- Live chat with sellers
- Notifications center
- Credit/loan service
- Multi-language support (22 languages)

### 🏪 Seller Portal (21 pages)
- Seller dashboard with analytics
- Product management (CRUD, inventory)
- Order processing with status updates
- Finance (revenue, balance, transactions)
- Customer management with order stats
- Shipping settings
- Coupon & promotion management
- Store profile & settings
- Reports (sales, products, customers)
- Live chat & messages
- Returns management

### 🔐 Admin Panel (21 pages)
- Dashboard with stats, charts, recent orders
- Product management with search/filter/pagination
- Order management with status filters
- User management with roles
- Transaction volume & history
- System settings (general, payment, features)
- Banner management
- Blockchain channel management
- Activity logs
- Sales/Product/Customer reports

### 💳 Payment Integration
- Binance, Huobi, OKX, KraKen, Coinbase, MetaMask, KuCoin, Bitfinex
- Blockchain: USDC (ERC20/TRC20), USDT (ERC20/TRC20), ETH, BTC

### 💬 Live Chat Module
- Real-time messaging via Supabase
- Chat history
- Unread message counter
- Seller-buyer communication

### 🔒 Security
- JWT authentication
- Supabase Row Level Security (RLS)
- Password validation (6-20 chars)
- CORS protection
- Input validation
- CAPTCHA slider on seller login

## 📂 Project Structure

```
platform/
├── src/
│   ├── views/              # 66 page components
│   │   ├── Home.vue
│   │   ├── Login.vue / Register.vue
│   │   ├── ProductDetail.vue / Cart.vue / Checkout.vue
│   │   ├── Chat.vue / Search.vue / Store.vue
│   │   ├── user/           # 14 buyer pages
│   │   ├── seller/         # 21 seller pages
│   │   └── admin/          # 21 admin pages
│   ├── layouts/
│   │   ├── MainLayout.vue  # Public layout
│   │   ├── UserLayout.vue  # Buyer layout
│   │   ├── SellerLayout.vue # Seller layout
│   │   └── AdminLayout.vue # Admin layout
│   ├── store/user.js       # Pinia state
│   ├── services/supabase.js # 38 Supabase functions
│   ├── router/index.js     # 75+ routes
│   └── assets/css/main.css
├── server/index.js         # Express API (20 endpoints)
├── supabase/schema.sql     # 23 tables + RLS + sample data
├── dist/                   # Production build
└── .github/workflows/deploy.yml
```

## 🗄️ Database Schema

23 tables with Row Level Security:

| Table | Description |
|-------|-------------|
| `users` | User accounts |
| `sellers` | Seller store profiles |
| `categories` | Product categories (22) |
| `products` | Product listings |
| `cart_items` | Shopping cart |
| `orders` | Order records |
| `order_items` | Order line items |
| `addresses` | Shipping addresses |
| `wallets` | User wallet (balance/rebate/frozen) |
| `chat_messages` | Live chat messages |
| `favorites` | Product favorites |
| `followed_sellers` | Seller follows |
| `blockchain_channels` | Crypto payment channels |
| `banners` | Homepage banners |
| `system_params` | System configuration |
| `notifications` | User notifications |
| `evaluations` | Product reviews |
| `subscribers` | Newsletter subscribers |
| `withdrawals` | Withdrawal records |
| `recharges` | Recharge records |
| `order_logs` | Order activity logs |
| `lotteries` | Lottery/rewards |
| `user_activity` | User heartbeat |

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- Supabase account

### 1. Clone & Install
```bash
git clone https://github.com/absolutus-aeternus/Platform.git
cd Platform
npm install
```

### 2. Configure Supabase
Update `src/services/supabase.js`:
```js
const supabaseUrl = 'https://YOUR_PROJECT.supabase.co'
const supabaseAnonKey = 'YOUR_ANON_KEY'
```

### 3. Run Database Schema
Execute `supabase/schema.sql` in Supabase SQL Editor.

### 4. Start Development
```bash
npm run dev    # Frontend (port 3000)
node server/index.js  # Backend (port 5000)
```

### 5. Build & Deploy
```bash
npm run build
git add -A && git commit -m "Update" && git push
# Auto-deploys to GitHub Pages
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user/login` | User login |
| POST | `/api/user/register` | User registration |
| POST | `/api/user/info` | Get user profile |

### Products
| POST | `/api/sellerGoods/recommend_new` | Recommended products |
| POST | `/api/sellerGoods/search-keyword` | Search products |
| POST | `/api/category/recommend` | Get categories |
| POST | `/api/seller/list` | Get sellers |

### Cart & Orders
| POST | `/api/cart/list` | Get cart items |
| POST | `/api/cart/add` | Add to cart |
| POST | `/api/address/list` | Get addresses |

### Chat
| POST | `/api/newOnlinechat/unread` | Unread count |
| POST | `/api/newOnlinechat/list` | Chat list |

### Wallet
| POST | `/api/wallet/getUsdt` | Wallet balance |
| POST | `/api/channelBlockchain/list` | Crypto channels |

## 🌐 Live Demo

**GitHub Pages:** https://absolutus-aeternus.github.io/Platform/

## 📄 License

MIT License

## 👨‍💻 Author

**absolutus-aeternus**
- GitHub: [@absolutus-aeternus](https://github.com/absolutus-aeternus)

---

⭐ Star this repo if you find it useful!
