# 🔍 COMPREHENSIVE FULL-STACK AUDIT — AllianceHub Platform

**Auditor:** Senior Full-Stack Developer & Automated Refactoring Expert  
**Date:** 2026-08-21  
**Scope:** Full codebase (Frontend, Backend/API, Database, Auth, Deployment)

---

## 📊 Architecture Overview

| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend | Vue 3 + Pinia + Vue Router + i18n | ✅ Solid |
| Backend API | Cloudflare Worker (single file, ~700 lines) | ⚠️ Monolithic |
| Database | Supabase (PostgreSQL) + 20 migrations | ⚠️ Schema drift |
| Storage | Backblaze B2 | ✅ Working |
| Search | Algolia | ✅ Working |
| Cache | Upstash Redis + CF Edge Cache | ✅ Good |
| Auth | Supabase Auth + RLS | ⚠️ Gaps exist |
| CI/CD | GitHub Actions → CF Pages/Workers + Supabase | ✅ Automated |
| Push | OneSignal | ✅ Working |
| Email | Resend + Brevo | ✅ Working |
| Analytics | Microsoft Clarity | ✅ Working |

---

## 🔴 CRITICAL ISSUES (Must Fix Immediately)

### C-1: CSRF Token Validation is Broken
**File:** `src/worker/index.js` — `verifyCSRFToken()`  
**Issue:** The worker generates a CSRF token on `/api/health` and sets it as a cookie. The `verifyCSRFToken()` function only checks if both the cookie and header *exist and match*, but there's no cryptographic validation. An attacker can set their own cookie + header to any identical string and bypass CSRF protection.

```javascript
// CURRENT (weak): just checks cookie === header
function verifyCSRFToken(req) {
  const cookie = ...token from cookie...
  const header = req.headers.get('X-CSRF-Token');
  return token && header && token === header;  // ❌ No HMAC/signature check
}
```

**Fix Required:** Use HMAC-signed tokens with server-side secret.

---

### C-2: Payment Webhook Has No Signature Verification
**File:** `src/worker/index.js` — `/api/webhook/payment`  
**Issue:** The webhook reads `X-Webhook-Signature` or `X-Signature` headers but **never verifies them**. Anyone can forge a payment completion webhook to mark orders as paid without actually paying.

```javascript
// CURRENT: reads signature but never validates
const signature = request.headers.get('X-Webhook-Signature') || '';
// ... proceeds without checking signature ❌
```

**Fix Required:** Implement HMAC-SHA256 signature verification per payment gateway.

---

### C-3: Service Role Key Used Extensively in Worker
**File:** `src/worker/index.js`  
**Issue:** `SUPABASE_SERVICE_ROLE_KEY` bypasses ALL Row Level Security. It's used in ~15 endpoints (checkout, admin, seller, follow, wishlist, etc.). If the worker has any bug, it effectively has full database access with no RLS protection.

**Risk:** A single SSRF or injection in the worker = full database compromise.

**Fix Required:** Minimize service role usage. Use Supabase JWT + RLS where possible.

---

### C-4: `.env.example` Contains Real Supabase URL
**File:** `.env.example`  
**Issue:** Contains `VITE_SUPABASE_URL=https://cfzmdvymqqnrzrytcrie.supabase.co` — this is a real production URL, not a placeholder.

**Fix Required:** Replace with `https://YOUR_PROJECT.supabase.co`.

---

### C-5: No Automated Tests in CI/CD
**File:** `.github/workflows/deploy.yml`  
**Issue:** The deploy workflow runs `npm ci` → `npm run build` → deploy. It **never runs** `npm test`. Tests exist (`tests/`) but are never executed in CI.

**Fix Required:** Add `npm test` step before deploy.

---

## 🟠 HIGH SEVERITY ISSUES

### H-1: Schema Drift — Init Migration vs Actual Usage
**File:** `supabase/migrations/001_init.sql`  
**Issue:** The init migration creates a `profiles` table, but the entire codebase uses a `users` table (seen in migration 007, 011, and all service code). The `profiles` table is orphaned. This means fresh database setup from migration 001 would fail.

**Fix Required:** Create a consolidated migration or fix 001_init.sql.

---

### H-2: Duplicate Favorites/Wishlist Systems
**Files:** `src/services/supabase.js`  
**Issue:** Code has BOTH `favorites` table (with `toggleFavorite`, `fetchFavorites`) AND `wishlists` table (with `toggleWishlist`, `fetchWishlist`). Two separate stores, two separate tables, two separate UI paths. This creates data inconsistency and user confusion.

**Fix Required:** Consolidate into one system (recommend `wishlists` as the canonical).

---

### H-3: XSS via `unsafe-inline` in CSP
**File:** `public/_headers` + `src/worker/index.js`  
**Issue:** Content-Security-Policy allows `script-src 'self' 'unsafe-inline'`. This defeats the purpose of CSP — any injected script will execute.

**Fix Required:** Use nonce-based CSP or move all inline scripts to external files.

---

### H-4: No Rate Limiting on Login Endpoint
**File:** `src/worker/index.js`  
**Issue:** Rate limiting exists for `/api/log/login` (10 req/min) but that's the **IP logging** endpoint, not the actual login. The actual login goes through Supabase Auth directly from the client — no worker-level rate limiting.

**Fix Required:** Add rate limiting on Supabase Auth calls or use Supabase's built-in rate limits.

---

### H-5: `[[path]].js` Pages Function Has No Auth/Validation
**File:** `functions/api/[[path]].js`  
**Issue:** This Cloudflare Pages Function blindly proxies ALL `/api/*` requests to the worker. No authentication, no rate limiting, no input validation. It forwards the raw request including all headers.

```javascript
// CURRENT: blind proxy
const response = await fetch(workerUrl, {
  method: context.request.method,
  headers: context.request.headers,  // ❌ Forwards everything
  body: ...,
});
```

**Fix Required:** Add origin validation and strip sensitive headers.

---

### H-6: Monolithic Worker File (~700+ lines)
**File:** `src/worker/index.js`  
**Issue:** Single file handles: auth, products, cart, orders, checkout, admin, seller, wishlist, follow, coupons, shipping, reviews, payments, webhooks, file proxy, email, cron. No separation of concerns.

**Fix Required:** Split into modules (router, handlers, middleware, utils).

---

## 🟡 MEDIUM SEVERITY ISSUES

### M-1: No Input Sanitization on Many Endpoints
**Affected:** `/api/seller/register`, `/api/review`, `/api/email/send`, multiple admin endpoints  
**Issue:** Request body fields are used directly without validation (length, type, format).

---

### M-2: `updateProfile()` Strips Role Client-Side But Not Server-Side
**File:** `src/store/user.js` — `updateProfile()`  
**Issue:** Client-side code deletes `role` from updates before sending to Supabase. However, Supabase RLS policy `Users can update own profile` allows updating ALL columns. A malicious user could bypass the client and update their own role via Supabase client directly.

**Fix Required:** Add database trigger or RLS policy to prevent role changes.

---

### M-3: Checkout Race Condition
**File:** `src/worker/index.js` — `/api/checkout`  
**Issue:** The checkout uses `process_checkout` RPC but the worker also creates order records directly. If the RPC exists, great — but the fallback path has no atomic stock deduction.

---

### M-4: No API Versioning
**Issue:** All endpoints are `/api/...` with no version prefix. Breaking changes will break all clients simultaneously.

**Fix Required:** Use `/api/v1/...` prefix.

---

### M-5: Service Worker Caches API Responses Without Auth Awareness
**File:** `public/sw.js`  
**Issue:** The SW caches `/api/products` and `/api/categories` responses. If authenticated user data leaks into these responses, it could be served to another user from cache.

---

### M-6: No Database Connection Pooling Configuration
**Issue:** Supabase client is created with default settings. No connection pooling, no retry logic, no timeout configuration.

---

### M-7: Missing `X-Robots-Tag` for Admin Pages
**Issue:** Admin/Seller portals (`/admin/*`, `/seller/*`, `/superadmin/*`) have no `noindex` meta tags or headers. Search engines could index admin pages.

---

## 🟢 LOW SEVERITY ISSUES

### L-1: No `offline.html` in Static Assets
**File:** `public/sw.js` references `/offline.html` but the file doesn't exist in the repo.

### L-2: `window.__syncBus` — Custom Event Bus Instead of Vue's
**File:** `src/main.js`  
**Issue:** Uses a custom global event bus when Vue 3's `provide/inject` or Pinia would be cleaner.

### L-3: No Error Boundary Component
**Issue:** Vue's global error handler exists but there's no `<ErrorBoundary>` component for graceful degradation.

### L-4: Hardcoded Worker URL in Multiple Places
**Files:** `.env.example`, `functions/api/[[path]].js`, `src/utils/csrf.js`  
**Issue:** Worker URL `alliancehub-api.absolutus-aeternus.workers.dev` is hardcoded in the Pages Function instead of using env vars.

### L-5: No Structured Logging
**Issue:** Worker uses `console.error` and `console.warn` throughout. No structured JSON logging for observability.

### L-6: `sourcemap: false` in Production Build
**File:** `vite.config.js`  
**Issue:** No source maps = impossible to debug production errors. Consider `sourcemap: 'hidden'`.

---

## 📋 MISSING COMPONENTS CHECKLIST

| Component | Status | Priority |
|-----------|--------|----------|
| TypeScript | ❌ Missing | Medium |
| API Documentation (OpenAPI/Swagger) | ❌ Missing | Medium |
| Automated Testing in CI | ❌ Missing | High |
| Structured Logging (e.g., Sentry) | ❌ Missing | Medium |
| Health Check Dashboard | ❌ Missing | Low |
| Database Backup Automation | ❌ Missing | High |
| Load Testing | ❌ Missing | Medium |
| API Rate Limit Dashboard | ❌ Missing | Low |
| Error Monitoring (Sentry/LogRocket) | ❌ Missing | Medium |
| Image CDN/Optimization | ❌ Missing | Low |
| SSR/SSG for SEO | ❌ Missing | Low |
| E2E Tests (Playwright/Cypress) | ❌ Missing | Medium |

---

## ✅ WHAT'S DONE WELL

1. **RLS Hardening** — Migration 007 adds `prevent_role_escalation()` trigger
2. **Edge Caching** — Products API has 60s TTL + stale-while-revalidate
3. **Security Headers** — Comprehensive CSP, HSTS, X-Frame-Options in `_headers`
4. **CI/CD Pipeline** — Automated deploy with Supabase migration push
5. **Weekly Security Scan** — CodeQL + dependency audit + secret detection
6. **Performance Indexes** — Migration 010 adds 20+ targeted indexes
7. **Rate Limiting** — IP-based + per-user rate limiting in worker
8. **Idempotency** — Checkout supports idempotency keys
9. **RBAC System** — 5-tier role hierarchy (GUEST → SUPER_ADMIN)
10. **i18n** — 9 languages supported
11. **PWA** — Service worker with offline support + background sync
12. **Input Sanitization** — Search inputs escaped for ilike patterns

---

## 🎯 PRIORITY ACTION PLAN

### Phase 1: Critical Security (Do Now)
1. Fix CSRF token validation (HMAC-signed)
2. Add payment webhook signature verification
3. Fix `.env.example` (remove real Supabase URL)
4. Add automated tests to CI/CD pipeline

### Phase 2: Architecture (This Week)
5. Split monolithic worker into modules
6. Fix schema drift (consolidate migrations)
7. Consolidate favorites/wishlist
8. Add rate limiting to actual login flow

### Phase 3: Hardening (This Month)
9. Replace `unsafe-inline` CSP with nonce-based
10. Minimize service role key usage
11. Add structured logging + error monitoring
12. Add API versioning
13. Add database backup automation

---

_Audit complete. 5 Critical, 6 High, 7 Medium, 6 Low issues identified._
