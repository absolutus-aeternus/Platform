# AllianceHub Routing, Auth & Function Audit Report

**Date:** 2026-08-22  
**Domain:** https://alliancehub.dpdns.org/  
**Auditor:** Senior Full-Stack Engineer (Automated)

---

## 1. Router Configuration Summary

| Aspect | Details |
|--------|---------|
| **Router Mode** | `createWebHistory()` — HTML5 History Mode (no hash) |
| **Total Routes** | 107 routes across 6 layout groups |
| **Route Guards** | `beforeEach` global guard with role-based access control |
| **Auth Meta** | `requiresAuth`, `requiresMember`, `requiresSeller`, `requiresAdmin`, `requiresSuperAdmin`, `requiresRatingPlus` |
| **SPA Fallback** | `public/_redirects`: `/* /index.html 200` (Cloudflare Pages) |

### Route Groups

| Group | Path Prefix | Layout | Auth Required | Role Required |
|-------|-------------|--------|---------------|---------------|
| Main (Public) | `/` | `MainLayout.vue` | Some routes | — |
| User Portal | `/user` | `UserLayout.vue` | ✅ All | MEMBER |
| Seller Portal | `/seller` | `SellerLayout.vue` | ✅ All | SELLER |
| Admin Portal | `/admin` | `AdminLayout.vue` | ✅ All | ADMIN/SUPER_ADMIN |
| Super Admin | `/superadmin` | `SuperAdminLayout.vue` | ✅ All | SUPER_ADMIN |
| Standalone | `/login`, `/register`, etc. | None | ❌ | — |

---

## 2. Auth Flow Analysis

| Component | Status | Details |
|-----------|--------|---------|
| **Supabase Client** | ✅ OK | `persistSession: true`, `autoRefreshToken: true`, `detectSessionInUrl: true` |
| **Session Init** | ✅ OK | `initFromStorage()` in `App.vue` onMounted, with 3s timeout in router guard |
| **Role Fetching** | ✅ OK | Fresh from DB on every sign-in and token refresh (not from JWT) |
| **Auth State Listener** | ✅ OK | `onAuthStateChange` handles SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED |
| **Route Guard Logic** | ✅ OK | Checks `store.isLoggedIn && !!store.token`, redirects to appropriate login |
| **Role Hierarchy** | ✅ OK | SUPER_ADMIN(5) > ADMIN(4) > SELLER(3) > RATING_PLUS(2) > MEMBER(1) > GUEST(0) |
| **Login Redirect** | ✅ OK | Logged-in users on login pages → redirected to their portal |
| **Password Reset** | ⚠️ **FIXED** | Was using hash mode `/#/login-password-reset`, corrected to `/login-password-reset` |

### useAuth Composable

| Feature | Status | Notes |
|---------|--------|-------|
| `hasRole()` | ✅ | Single or array role check |
| `hasRoleLevel()` | ✅ | Hierarchy-based comparison |
| `hasPermission()` | ✅ | 23 permission keys defined |
| `canAccess()` | ✅ | Route meta → role validation |
| `filterNav()` | ✅ | Dynamic nav filtering by role/permission |

---

## 3. Views/Pages Audit

### All Route Imports vs Actual Files

| Status | Count | Details |
|--------|-------|---------|
| **Total route imports** | 107 | All lazy-loaded via `() => import(...)` |
| **Matching files** | 107 | ✅ All imports resolve to existing `.vue` files |
| **Missing files** | 0 | ✅ No broken imports |
| **Broken component imports** | 0 | ✅ All `@/` imports resolve correctly |

### View Files by Directory

| Directory | Files | Status |
|-----------|-------|--------|
| `src/views/` (root) | 62 | ✅ All exist |
| `src/views/admin/` | 22 | ✅ All exist |
| `src/views/seller/` | 18 | ✅ All exist |
| `src/views/superadmin/` | 7 | ✅ All exist |
| `src/views/user/` | 14 | ✅ All exist |

---

## 4. API Integration Audit

### Supabase Service (`src/services/supabase.js`)

| Function | Status | Notes |
|----------|--------|-------|
| `signUp` / `signIn` / `signOut` | ✅ | Standard Supabase auth |
| `getCurrentUser` | ✅ | Uses `supabase.auth.getUser()` |
| `resetPassword` | ⚠️ **FIXED** | Redirect URL corrected from `/#/` to `/` |
| `fetchProducts` | ✅ | Category, search, sort, limit support |
| `fetchProductById` | ✅ | UUID + slug fallback |
| `fetchCart` / `addToCart` / etc. | ✅ | Full CRUD |
| `createOrder` / `fetchOrders` | ✅ | With order items join |
| `fetchBanners` | ✅ | Normalizes `image_url`/`image` field |
| `searchProducts` | ✅ | ilike with sanitized input |
| `validateCoupon` | ✅ | Uses Supabase RPC |
| `fetchShippingEstimate` | ✅ | Region + seller filtering |
| `followSeller` / `unfollowSeller` | ✅ | With duplicate check |
| `toggleWishlist` | ✅ | Toggle pattern |

### Worker API (`src/worker/index.js`)

| Endpoint | Method | Auth | CSRF | Status |
|----------|--------|------|------|--------|
| `/api/health` | GET | ❌ | ❌ | ✅ Returns CSRF token |
| `/api/products` | GET | ❌ | ❌ | ✅ Edge cached (60s TTL) |
| `/api/product/:slug` | GET | ❌ | ❌ | ✅ |
| `/api/categories` | GET | ❌ | ❌ | ✅ |
| `/api/sellers` | GET | ❌ | ❌ | ✅ |
| `/api/sellers/top` | GET | ❌ | ❌ | ✅ With follower count |
| `/api/search` | GET | ❌ | ❌ | ✅ FTS + trigram fallback |
| `/api/follow` | POST/DELETE | ✅ | ✅ | ✅ |
| `/api/wishlist` | GET/POST | ✅ | ✅ (POST) | ✅ |
| `/api/coupons/validate` | GET | ❌ | ❌ | ✅ |
| `/api/shipping/estimate` | GET | ❌ | ❌ | ✅ |
| `/api/checkout` | POST | ✅ | ✅ | ✅ Atomic RPC |
| `/api/orders` | GET | ✅ | ❌ | ✅ |
| `/api/review` | POST | ✅ | ✅ | ✅ With purchase validation |
| `/api/seller/register` | POST | ✅ | ✅ | ✅ |
| `/api/seller/markup` | POST | ✅ | ✅ | ✅ |
| `/api/seller/wallet` | GET | ✅ | ❌ | ✅ |
| `/api/seller/payout` | POST | ✅ | ✅ | ✅ |
| `/api/admin/*` | Various | ✅ | ✅ | ✅ All admin-only |
| `/api/webhook/payment` | POST | ❌ | ❌ | ✅ HMAC signature verification |
| `/api/email/send` | POST | ✅ | ✅ | ✅ Own-email-only restriction |
| `/api/log/login` | POST | ❌ | ❌ | ✅ IP logging |
| `/api/file/:key` | GET | ❌ | ❌ | ✅ B2 proxy with caching |

### CORS Configuration

| Aspect | Status | Details |
|--------|--------|---------|
| Allowed Origins | ✅ | `alliancehub.dpdns.org`, `alliancehub.pages.dev`, `localhost:3000` |
| Methods | ✅ | GET, POST, PUT, DELETE, OPTIONS |
| Headers | ✅ | Content-Type, Authorization, X-Cron-Token, X-API-Key, X-CSRF-Token |
| CSP Header | ✅ | Set on all responses |
| Rate Limiting | ✅ | 60 req/min global, 10 req/min sensitive, 120 req/min per-user |

---

## 5. Build Output

| Metric | Value |
|--------|-------|
| **Build Status** | ✅ Success |
| **Build Time** | 13.72s |
| **Total Modules** | 197 |
| **Output Dir** | `dist/` |
| **Vendor Chunks** | `vendor-vue` (109KB), `vendor-supabase` (217KB), `vendor-i18n` (56KB) |
| **Largest Chunk** | `vendor-supabase-DGyy41YE.js` (217KB / 57KB gzip) |

### Build Fixes Applied

| File | Issue | Fix |
|------|-------|-----|
| `src/components/base/BasePagination.vue` | Missing `</template>` closing tag | Added `</template>` before `<script>` |
| `src/components/base/BaseSkeleton.vue` | Self-closing `<div />` with stray `</div>` | Changed to `<div>...</div>` |

---

## 6. Live Endpoint Check

| Endpoint | URL | HTTP Status | SPA Routing | Notes |
|----------|-----|-------------|-------------|-------|
| Home | `/` | 200 ✅ | ✅ | Serves index.html |
| Login | `/login` | 200 ✅ | ✅ | Serves index.html |
| Merchant Settled | `/merchant-settled` | 200 ✅ | ✅ | Serves index.html |
| Admin Login | `/login/admin` | 200 ✅ | ✅ | Serves index.html |
| Rating Plus | `/ratingplus` | 200 ✅ | ✅ | Serves index.html |
| Super Admin | `/superadmin` | 200 ✅ | ✅ | Serves index.html |
| Admin | `/admin` | 200 ✅ | ✅ | Serves index.html |

> **Note:** All URLs return HTTP 200 because Cloudflare Pages serves `index.html` for all paths (`/* /index.html 200`). Client-side Vue Router handles the actual routing. The `/super-admin` URL (with hyphen) tested in the task does NOT match the router definition (`/superadmin` without hyphen) — it would show `NotFound.vue` on the client.

---

## 7. Issues Found & Fixed

### Critical Fixes Applied

| # | File | Issue | Fix | Commit |
|---|------|-------|-----|--------|
| 1 | `src/components/base/BasePagination.vue` | Missing `</template>` end tag — **build failure** | Added closing `</template>` tag | `f4b39b9` |
| 2 | `src/components/base/BaseSkeleton.vue` | Self-closing `<div />` with orphan `</div>` — **build failure** | Changed to proper `<div>...</div>` | `f4b39b9` |
| 3 | `src/services/supabase.js` | Password reset redirect used hash mode `/#/` but app uses history mode | Changed to `/login-password-reset` | `cc0b44e` |

### Observations (No Fix Needed)

| # | Area | Observation | Severity |
|---|------|-------------|----------|
| 1 | Router | `/super-admin` (with hyphen) is not defined; only `/superadmin` exists | Low |
| 2 | CSP | `index.html` CSP includes `*.algolia.net` / `*.algolianet.com` but app uses Supabase FTS, not Algolia | Low |
| 3 | Worker | `generateCSRFToken` function defined at module level but only used in `/api/health` | Info |
| 4 | Auth | `_initialized` flag prevents infinite guard wait — good defensive pattern | Info |
| 5 | Security | `updateProfile` strips `role`, `kyc_status`, `status` from client updates — good | Info |

---

## 8. Security Assessment

| Check | Status | Details |
|-------|--------|---------|
| CSRF Protection | ✅ | HMAC-SHA256 signed tokens on all state-changing endpoints |
| JWT Verification | ✅ | Worker verifies against Supabase Auth API |
| Role-Based Access | ✅ | Server-side role checks on all admin/seller endpoints |
| Rate Limiting | ✅ | Global (60/min), sensitive (10/min), per-user (120/min) |
| Input Sanitization | ✅ | Search queries sanitized, UUID validation, positive int checks |
| Webhook Verification | ✅ | HMAC-SHA256 signature on payment webhooks |
| RLS Enforcement | ✅ | Products filtered by `status=active` |
| Audit Logging | ✅ | Role changes, seller approvals, status changes logged |
| Self-Role-Change Prevention | ✅ | Users cannot change their own role |
| Email Restriction | ✅ | Can only send emails to own address |

---

## 9. Summary

| Category | Status |
|----------|--------|
| **Routing** | ✅ All 107 routes properly defined with matching components |
| **Authentication** | ✅ Supabase auth with session persistence, auto-refresh, role fetching |
| **Authorization** | ✅ 6-role hierarchy with route guards and permission matrix |
| **API Integration** | ✅ 30+ endpoints with proper auth, CSRF, rate limiting |
| **Build** | ✅ Successful (after fixing 2 template errors) |
| **Live Endpoints** | ✅ All tested URLs return HTTP 200 |
| **Security** | ✅ CSRF, JWT verification, role checks, audit logging |

**Total Issues Found:** 3  
**Total Issues Fixed:** 3  
**Remaining Issues:** 0 critical, 2 low-priority observations
