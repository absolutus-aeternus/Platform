# 🛍️ TikTok Shop Clone — E-Commerce Platform

Full-stack e-commerce platform inspired by TikTok Shop / TK-Alliance. Built with Vue.js 3, Express.js, and Supabase.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vue.js 3 + Pinia + Vue Router |
| **Backend** | Express.js + JWT Authentication |
| **Database** | Supabase (PostgreSQL) |
| **Styling** | Custom CSS (Tailwind-ready) |
| **Build** | Vite 5 |

## 📦 Features

### 🌐 Buyer Portal
- Product catalog with 22 categories
- Product search & filtering
- Shopping cart (add/remove/quantity)
- Checkout with crypto payment (USDT/USDC/BTC/ETH)
- Order management (history, tracking)
- Wallet system (balance, rebate, frozen funds)
- Address book
- Favorites / Wishlist
- Live chat with sellers
- Notifications center

### 🏪 Seller Portal
- Seller dashboard with analytics
- Product management (CRUD)
- Order processing
- Store profile & settings
- Revenue tracking

### 💳 Payment Integration
- Binance
- Huobi
- OKX
- KraKen
- Coinbase
- MetaMask
- KuCoin
- Bitfinex

### 💬 Live Chat Module
- Real-time messaging (Supabase Realtime)
- Chat history
- Unread message counter
- Seller-buyer communication

### 🔒 Security
- JWT authentication
- Supabase Row Level Security (RLS)
- Password hashing (bcrypt)
- CORS protection
- Input validation

## 📂 Project Structure

```
platform/
├── src/
│   ├── views/              # Page components
│   │   ├── Home.vue        # Landing page
│   │   ├── Login.vue       # Buyer login
│   │   ├── Register.vue    # Buyer registration
│   │   ├── ProductDetail.vue
│   │   ├── Cart.vue
│   │   ├── Checkout.vue
│   │   ├── Chat.vue        # Live chat
│   │   ├── Category.vue
│   │   ├── Search.vue
│   │   ├── Discounts.vue
│   │   ├── Credit.vue      # Loan service
│   │   ├── Store.vue       # Seller store page
│   │   ├── Verification.vue # Entry gate
│   │   ├── user/           # Buyer dashboard
│   │   │   ├── Dashboard.vue
│   │   │   ├── Orders.vue
│   │   │   ├── Wallet.vue
│   │   │   ├── Favorites.vue
│   │   │   ├── Addresses.vue
│   │   │   ├── Notifications.vue
│   │   │   └── Settings.vue
│   │   └── seller/         # Seller dashboard
│   │       ├── Dashboard.vue
│   │       ├── Products.vue
│   │       ├── Orders.vue
│   │       └── Analytics.vue
│   ├── layouts/
│   │   ├── MainLayout.vue  # Public layout
│   │   ├── UserLayout.vue  # Buyer layout
│   │   └── SellerLayout.vue # Seller layout
│   ├── store/
│   │   └── user.js         # Pinia state management
│   ├── services/
│   │   └── supabase.js     # Supabase client & helpers
│   ├── router/
│   │   └── index.js        # Vue Router (25+ routes)
│   ├── api/
│   │   └── index.js        # Axios instance
│   └── assets/
│       └── css/main.css    # Global styles
├── server/
│   └── index.js            # Express.js API server
├── supabase/
│   └── schema.sql          # Database schema (15 tables)
├── dist/                   # Production build
├── index.html              # Entry HTML
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
└── package.json
```

## 🗄️ Database Schema

15 tables with Row Level Security:

| Table | Description |
|-------|-------------|
| `users` | User accounts (buyer/seller) |
| `sellers` | Seller store profiles |
| `categories` | Product categories (22) |
| `products` | Product listings |
| `cart_items` | Shopping cart items |
| `orders` | Order records |
| `order_items` | Order line items |
| `addresses` | Shipping addresses |
| `wallets` | User wallet (balance/rebate/frozen) |
| `chat_messages` | Live chat messages |
| `favorites` | Product favorites/wishlist |
| `followed_sellers` | Seller follows |
| `blockchain_channels` | Crypto payment channels |
| `banners` | Homepage banners |
| `system_params` | System configuration |
| `notifications` | User notifications |

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
Update `src/services/supabase.js` with your credentials:
```js
const supabaseUrl = 'https://YOUR_PROJECT.supabase.co'
const supabaseAnonKey = 'YOUR_ANON_KEY'
```

### 3. Run Database Schema
Execute `supabase/schema.sql` in your Supabase SQL Editor.

### 4. Start Development
```bash
# Terminal 1: Backend
node server/index.js

# Terminal 2: Frontend
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user/login` | User login |
| POST | `/api/user/register` | User registration |
| POST | `/api/user/info` | Get user profile |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sellerGoods/recommend_new` | Get recommended products |
| POST | `/api/sellerGoods/search-keyword` | Search products |
| POST | `/api/category/recommend` | Get categories |

### Cart & Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cart/list` | Get cart items |
| POST | `/api/cart/add` | Add to cart |
| POST | `/api/address/list` | Get addresses |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/newOnlinechat/unread` | Get unread count |
| POST | `/api/newOnlinechat/list` | Get chat list |

### Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/wallet/getUsdt` | Get wallet balance |
| POST | `/api/channelBlockchain/list` | Get crypto channels |

## 📱 Screenshots

| Page | Description |
|------|-------------|
| Home | Landing page with categories, deals, stores |
| Login | Email/password authentication |
| Product | Product detail with add-to-cart |
| Cart | Shopping cart with quantity controls |
| Checkout | Order summary with crypto payment |
| Chat | Live messaging with sellers |
| Dashboard | User orders, wallet, favorites |
| Seller | Store management & analytics |

## 🔐 Environment Variables

```env
VITE_SUPABASE_URL=https://your_project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
JWT_SECRET=your_jwt_secret
PORT=5000
```

## 📄 License

MIT License — Free to use and modify.

## 👨‍💻 Author

**absolutus-aeternus**
- GitHub: [@absolutus-aeternus](https://github.com/absolutus-aeternus)
- Email: Panas.dingin@gmail.com

---

⭐ Star this repo if you find it useful!
