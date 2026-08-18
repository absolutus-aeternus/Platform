# AllianceHub — Product Requirements Document (PRD)

**Versi:** 3.0  
**Tanggal:** 2026-08-18  
**Author:** PM & Product Owner  
**Status:** Pre-Launch Review

---

## 1. Executive Summary

**AllianceHub** adalah platform e-commerce multi-vendor (marketplace) yang terinspirasi dari Amazon/Shopee, dengan fokus pada model bisnis dropship. Platform ini memungkinkan multiple sellers menjual produk mereka, dengan sistem komisi dan markup harga per seller.

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3 + Pinia + Vue Router |
| Backend | Cloudflare Workers |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (JWT) |
| Storage | Backblaze B2 |
| Search | Algolia |
| Cache | Upstash Redis + Cloudflare Edge |
| Hosting | Cloudflare Pages |
| Domain | alliancehub.dpdns.org / alliancehub.pages.dev |

### Target Users
1. **Buyer (MEMBER)** — Browse, search, add to cart, checkout, track orders
2. **Seller (SELLER)** — Manage products, process orders, view analytics, withdraw earnings
3. **Admin (ADMIN)** — Manage users, products, orders, approve sellers
4. **Super Admin (SUPER_ADMIN)** — Full platform control, security, audit logs

---

## 2. Current State Assessment

### What Works (28 features)
- ✅ User registration & authentication (Supabase Auth)
- ✅ Role-based access control (4 roles)
- ✅ Product listing with categories, search (Algolia), filtering
- ✅ Product detail page (images, zoom, lightbox, reviews, comments)
- ✅ Shopping cart (add, remove, quantity update)
- ✅ Checkout flow (address selection, order creation)
- ✅ Seller registration with approval workflow
- ✅ Commission system (sale + review commissions)
- ✅ Seller wallet & payout system
- ✅ Admin panel (users, products, orders, sellers, banners, etc.)
- ✅ Super Admin panel (audit logs, security, IP logs)
- ✅ Rate limiting (Upstash Redis + memory fallback)
- ✅ RLS (Row Level Security) on all sensitive tables
- ✅ CSRF token generation
- ✅ Audit logging for sensitive operations
- ✅ Edge caching for product API
- ✅ Responsive design (4 breakpoints)
- ✅ Skeleton loading states
- ✅ Error states with retry
- ✅ Realtime updates (Supabase Realtime)
- ✅ Trust elements (VerifiedBadge, TrustBar, DiscountTag)
- ✅ Mobile bottom navigation
- ✅ Sticky CTA bar (mobile)
- ✅ Image zoom + lightbox
- ✅ B2 file storage integration
- ✅ CSP headers
- ✅ IP logging for login events
- ✅ Atomic stock decrement (SQL function)

### What's Missing (Critical)
- ❌ Payment gateway integration
- ❌ Order status lifecycle (only `pending`)
- ❌ Shipping integration
- ❌ Image upload for sellers
- ❌ CSRF on all POST endpoints
- ❌ Search autocomplete (frontend)
- ❌ Wishlist sync to database
- ❌ Email notifications

---

## 3. Database Schema (Current)

### Core Tables
```
profiles/users    ← User accounts (MEMBER, SELLER, ADMIN, SUPER_ADMIN)
categories        ← Product categories
sellers           ← Seller stores (with approval_status)
products          ← Product catalog (with cost_price, commission_rate)
seller_products   ← Per-seller pricing (dropship markup)
cart_items        ← Shopping cart
orders            ← Order headers
order_items       ← Order line items
```

### Financial Tables
```
commissions       ← Sale & review commissions
seller_wallets    ← Seller balance tracking
payouts           ← Withdrawal requests
platform_settings ← Configurable rates & limits
```

### Communication Tables
```
chat_messages     ← Buyer-seller chat
notifications     ← In-app notifications
banners           ← Promotional banners
```

### Trust & Security Tables
```
evaluations       ← Product reviews
review_validations ← Anti-fraud tracking
audit_logs        ← Immutable audit trail
system_params     ← IP logs & config
wishlists         ← User favorites
addresses         ← Shipping addresses
flash_sales       ← Flash sale schedules
```

### Missing Tables (Need Creation)
```
product_comments  ← Used in ProductDetail.vue but not in migrations
coupons           ← Referenced in admin UI but not in migrations
```

---

## 4. API Endpoints (Current)

### Public (No Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check + CSRF token |
| GET | `/api/products` | Product listing (cached) |
| GET | `/api/product/:slug` | Product detail |
| GET | `/api/categories` | Category list |
| GET | `/api/sellers` | Seller list |
| GET | `/api/search` | Algolia search |
| GET | `/api/file/:name` | B2 file proxy |

### Authenticated
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Dashboard data |
| POST | `/api/checkout` | Create order |
| GET | `/api/orders` | User orders |
| POST | `/api/review` | Submit review |
| POST | `/api/seller/register` | Register as seller |
| POST | `/api/seller/markup` | Set product price |
| GET | `/api/seller/wallet` | View wallet |
| POST | `/api/seller/payout` | Request payout |
| POST | `/api/log/login` | Log login event |
| POST | `/api/upload/presign` | Get upload URL |

### Admin Only
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/orders` | All orders |
| GET | `/api/admin/users` | All users |
| POST | `/api/admin/change-role` | Change user role |
| GET | `/api/admin/system-params` | System config |
| POST | `/api/admin/seller-approval` | Approve/reject seller |
| GET | `/api/admin/sellers/pending` | Pending sellers |
| GET | `/api/admin/commissions` | All commissions |
| POST | `/api/admin/commission/approve` | Approve commission |
| GET | `/api/admin/payouts` | All payouts |
| POST | `/api/admin/payout/process` | Process payout |

---

## 5. User Stories (Priority Order)

### P0 — Must Have for Launch

**As a buyer, I want to:**
1. Register and login with email/password
2. Browse products by category
3. Search products with autocomplete suggestions
4. View product details (images, price, reviews, specs)
5. Add products to cart
6. Manage my cart (update quantity, remove items)
7. Select shipping address at checkout
8. Pay for my order with a real payment method
9. See my order status (pending → paid → shipped → delivered)
10. Track my order shipment
11. Leave a review for products I've received

**As a seller, I want to:**
12. Register as a seller and get approved
13. Add/edit/delete my products with images
14. View incoming orders
15. Process orders (mark as shipped)
16. View my earnings and commission
17. Request payout of my earnings
18. Chat with buyers

**As an admin, I want to:**
19. Approve/reject seller registrations
20. Manage all users and their roles
21. View and manage all orders
22. View platform analytics and reports
23. Audit all sensitive operations

### P1 — Important

**As a buyer, I want to:**
24. Save products to my wishlist
25. Apply coupon/voucher at checkout
26. Cancel my order (before shipping)
27. Request return/refund
28. Receive email notifications for order updates
29. Chat with seller about products
30. Compare products side by side

**As a seller, I want to:**
31. View sales analytics and reports
32. Manage shipping methods and costs
33. Create promotions and coupons
34. View customer feedback and ratings
35. Manage my store profile and settings

### P2 — Nice to Have

**As a buyer, I want to:**
36. Login with Google/Facebook
37. See product recommendations
38. View recently viewed products
39. Share my wishlist with friends
40. Use the app in multiple languages
41. Use dark mode

**As a seller, I want to:**
42. Import products in bulk (CSV)
43. Run advertising campaigns
44. View competitor pricing

---

## 6. Non-Functional Requirements

### Performance
| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | Unknown |
| Largest Contentful Paint | < 2.5s | Unknown |
| Time to Interactive | < 3.5s | Unknown |
| API Response Time (p95) | < 500ms | Unknown |
| Lighthouse Score | > 80 all | Unknown |

### Security
| Requirement | Status |
|-------------|--------|
| HTTPS everywhere | ✅ Cloudflare |
| CSRF protection | ⚠️ Partial |
| Rate limiting | ✅ |
| Input validation | ⚠️ Partial |
| SQL injection prevention | ✅ Supabase parameterized queries |
| XSS prevention | ✅ Vue auto-escaping |
| Role-based access control | ✅ |
| Audit logging | ✅ |
| 2FA | ❌ Not implemented |

### Scalability
| Component | Current Capacity | Target |
|-----------|-----------------|--------|
| Cloudflare Workers | Auto-scaling | ✅ |
| Supabase | Free tier (500MB, 50K rows) | Upgrade to Pro |
| B2 Storage | 10GB free | Sufficient |
| Algolia | 10K records free | May need upgrade |
| Upstash Redis | 10K commands/day free | May need upgrade |

### Availability
| Metric | Target |
|--------|--------|
| Uptime | 99.5% |
| RTO (Recovery Time Objective) | < 1 hour |
| RPO (Recovery Point Objective) | < 24 hours |
| Backup frequency | Daily |

---

## 7. Constraints & Dependencies

### External Dependencies
| Service | Purpose | Risk |
|---------|---------|------|
| Supabase | Database + Auth + Realtime | Single point of failure |
| Cloudflare | Hosting + CDN + Workers | High availability |
| Backblaze B2 | File storage | Low risk |
| Algolia | Search | Fallback to Supabase full-text |
| Upstash Redis | Rate limiting | Fallback to memory |

### Budget Constraints
- Supabase Free → Pro ($25/month) when exceeding limits
- Cloudflare Workers Paid ($5/month) for production
- Domain renewal (~$15/year)
- Total estimated: **~$50/month** for MVP

### Timeline Constraints
- Target launch: **8 September 2026** (3 weeks from today)
- Team size: 1-2 developers + PM
- Total estimated effort: ~175 hours

---

## 8. Success Metrics

### Launch Metrics (Week 1)
| Metric | Target |
|--------|--------|
| Successful registrations | > 50 |
| Products listed | > 100 |
| Orders placed | > 20 |
| Seller registrations | > 5 |
| Zero critical bugs | Must have |

### Growth Metrics (Month 1)
| Metric | Target |
|--------|--------|
| Monthly active users | > 500 |
| GMV (Gross Merchandise Value) | > $5,000 |
| Repeat purchase rate | > 15% |
| Seller retention | > 80% |
| NPS score | > 30 |

---

## 9. Appendix

### Related Documents
- `PRODUCTION_CHECKLIST.md` — Detailed production readiness checklist
- `FEATURE_GAP_ANALYSIS.md` — Feature comparison with major marketplaces
- `SPRINT_PLAN.md` — 3-sprint execution plan
- `DAILY_STANDUP.md` — Daily progress tracking
- `ANALISIS_BUGS.md` — Existing bug analysis (16 bugs)
- `DESIGN_SYSTEM_GUIDE.md` — Complete UI/UX design system
- `API.md` — API documentation

### Version History
| Version | Date | Changes |
|---------|------|---------|
| 3.0 | 2026-08-18 | Initial PRD based on codebase analysis |

---

*Last updated: 2026-08-18 21:49 GMT+8*
