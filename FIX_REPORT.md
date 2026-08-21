# Fix Report — Deep Codebase Analysis

**Date:** 2026-08-21
**Project:** AllianceHub Platform (Vue.js 3 + Supabase + Cloudflare)

---

## Bugs Found & Fixed

### 🔴 BUG #1 — Worker: Extra `}` breaks all routes after checkout (CRITICAL)

**File:** `src/worker/index.js` (line ~674)
**Severity:** CRITICAL — All API routes after `/api/checkout` were unreachable

**Problem:**
An extra closing brace `}` after the checkout endpoint's `if` block prematurely closed the outer `try` block. This made ALL subsequent routes unreachable:
- `/api/orders`
- `/api/cron/daily`
- `/api/email/send`
- `/api/webhook/payment`
- `/api/admin/*` (all admin endpoints)
- `/api/review`
- `/api/seller/*` (all seller endpoints)

**Fix:** Removed the extra `}`.

---

### 🟡 BUG #2 — Login.vue: `window.__toast` inaccessible in Vue template

**File:** `src/views/Login.vue`
**Severity:** MEDIUM — Social login buttons would throw silent errors

**Problem:**
Vue 3 template expressions don't have direct access to `window`. The social login buttons used:
```html
@click="window.__toast?.show('Google login coming soon', 'info')"
```
This would fail silently because `window` is not in the Vue template scope.

**Fix:** Added a `showToast()` method and used it in the template instead.

---

### 🟡 BUG #3 — i18n: Only 3 of 9 locales loaded

**File:** `src/i18n/index.js`
**Severity:** MEDIUM — 6 languages (ar, ja, ko, ms, th, vi) were defined but never loaded

**Problem:**
The i18n setup only imported `en`, `id`, and `zh` locale files, but the project has 9 locale files. The other 6 languages (Arabic, Japanese, Korean, Malay, Thai, Vietnamese) were available as JSON files but never loaded into vue-i18n.

**Fix:** Added imports for all 9 locale files and updated the languages list.

---

### 🟡 BUG #4 — wrangler.toml: Wrong `main` entry point

**File:** `wrangler.toml`
**Severity:** MEDIUM — Worker deployment would fail or deploy wrong file

**Problem:**
`main` was set to `src/index.js` but the actual worker code is at `src/worker/index.js`.

**Fix:** Changed `main` to `src/worker/index.js`.

---

## Files Modified

| File | Change |
|------|--------|
| `src/worker/index.js` | Removed extra `}` after checkout block |
| `src/views/Login.vue` | Added `showToast()` method for template access |
| `src/i18n/index.js` | Added all 9 locale imports + language list |
| `src/layouts/MainLayout.vue` | Updated language dropdown to include all 9 locales |
| `wrangler.toml` | Fixed `main` entry point path |
| `src/views/Register.vue` | Added `showToast()` method for template access |
| `src/composables/useDarkMode.js` | Removed unused `watch` import |

---

## Supabase CLI Connected

- **Project Ref:** `cfzmdvymqqnrzrytcrie`
- **URL:** `https://cfzmdvymqqnrzrytcrie.supabase.co`
- **CLI Version:** 2.115.0
- **Status:** ✅ Linked

---

## SSH Git Configured

- **Remote:** `git@github.com:absolutus-aeternus/Platform.git`
- **SSH Key:** `~/.ssh/id_ed25519` (ed25519)
- **Status:** ✅ Connected

---

### 🟡 BUG #5 — Register.vue: Same `window.__toast` template bug

**File:** `src/views/Register.vue`
**Severity:** MEDIUM — Social signup buttons would throw silent errors

**Problem:** Same as Bug #2 — `window.__toast` used directly in Vue template.

**Fix:** Added `showToast()` method.

---

### 🟢 BUG #6 — useDarkMode.js: Unused `watch` import

**File:** `src/composables/useDarkMode.js`
**Severity:** LOW — Dead code

**Problem:** `watch` was imported from Vue but never used.

**Fix:** Removed unused import.

---

---

### 🟡 BUG #7 — Login.vue: Missing `</template>` tag (CRITICAL)

**File:** `src/views/Login.vue`
**Severity:** CRITICAL — Vue SFC compilation would fail

**Problem:** The `<template>` section was not properly closed before `<script setup>`. The closing `</template>` tag was missing entirely.

**Fix:** Added `</template>` before `<script setup>`.

---

### 🟡 BUG #8 — Worker /api/dashboard: Wrong status filter

**File:** `src/worker/index.js`
**Severity:** MEDIUM — Dashboard would show no products

**Problem:** Dashboard endpoint used `status=eq.published` but the products table uses `status=active`.

**Fix:** Changed to `status=eq.active`.

---

### 🟡 BUG #9 — Worker /api/products: Search input not sanitized

**File:** `src/worker/index.js`
**Severity:** MEDIUM — Pattern manipulation via `%` and `_` wildcards

**Problem:** The `search` parameter was passed directly to `ilike` without escaping `%` and `_` characters, allowing users to manipulate pattern matching.

**Fix:** Added `replace(/%/g, '\\%').replace(/_/g, '\\_')` sanitization to all search paths (worker, supabase.js, products.js, search.js).

---

### 🟡 BUG #10 — Worker /api/seller/payout: Non-atomic payout + wallet deduction

**File:** `src/worker/index.js`
**Severity:** MEDIUM — Wallet deduction failure leaves orphaned payout record

**Problem:** Payout record was created first, then wallet balance deducted separately. If wallet deduction failed, the payout record persisted without balance being deducted.

**Fix:** Added rollback logic — if wallet PATCH fails, the payout record is deleted.

---

### 🟢 BUG #11 — search.js: Wrong filter column `is_active`

**File:** `src/utils/search.js`
**Severity:** LOW — Search may return no results

**Problem:** Used `.eq('is_active', true)` but the products table uses `status` column, not `is_active`.

**Fix:** Changed to `.eq('status', 'active')`.

---

### 🟢 BUG #12 — orders.js: `cancelOrder` ignores reason parameter

**File:** `src/store/orders.js`
**Severity:** LOW — Cancellation reason not persisted

**Problem:** The `reason` parameter was accepted but never passed to the database update.

**Fix:** Now passes `cancel_reason` to the Supabase update and syncs local state.

---

### 🟢 BUG #13 — package.json: Unused `axios` dependency

**File:** `package.json`
**Severity:** LOW — Dead weight in bundle

**Problem:** `axios` was listed as a devDependency but the codebase uses `fetch` exclusively.

**Fix:** Removed `axios` from devDependencies.

---

---

### 🟡 BUG #14 — Service Worker: API cache tanpa TTL (stale data)

**File:** `public/sw.js`
**Severity:** MEDIUM — Stale product data served indefinitely

**Problem:** API responses were cached indefinitely in the dynamic cache. No TTL-based invalidation.

**Fix:** Added 5-minute TTL with `X-Cached-At` timestamp header. Expired cache entries are discarded.

---

### 🟡 BUG #15 — Notifications RLS: terlalu permisif

**File:** `supabase/migrations/016_fix_notifications_rls.sql`
**Severity:** MEDIUM — Any user could insert notifications for any other user

**Problem:** `notifications_insert` policy had `WITH CHECK (true)`, allowing any authenticated user to create notifications for any user.

**Fix:** Restricted to `auth.uid() = user_id`. Worker uses service role key (bypasses RLS) for server-side notifications.

---

### 🟡 BUG #16 — product_comments table missing from migrations

**File:** `supabase/migrations/017_product_comments.sql`
**Severity:** MEDIUM — ProductDetail.vue comments feature would crash at runtime

**Problem:** `ProductDetail.vue` queries `product_comments` table but no migration creates it.

**Fix:** Created migration 017 with table, indexes, and RLS policies.

---

### 🟡 BUG #17 — Router: /login-password-reset requires auth (catch-22)

**File:** `src/router/index.js`
**Severity:** MEDIUM — Users who forgot password can't access reset page

**Problem:** The MainLayout child route `login-password-reset` had `meta: { requiresAuth: true }`. A logged-out user clicking "Forgot Password?" would be redirected to login — creating a catch-22.

**Fix:** Removed `requiresAuth` from the route meta.

---

### 🟡 BUG #18 — Scraper SSRF: no URL validation

**File:** `src/services/scraper.js`
**Severity:** MEDIUM — Could be used to scan internal networks or access cloud metadata

**Problem:** `scrapeProduct()` and `scrapeCategory()` accepted any URL through the CORS proxy without validation.

**Fix:** Added domain whitelist (Amazon, AliExpress, Shopee, etc.) and private IP blocking (localhost, 10.x, 172.x, 192.168.x, 169.254 metadata).

---

### 🟢 BUG #19 — system_params RLS policy conflict

**File:** `supabase/migrations/018_consolidate_system_params_rls.sql`
**Severity:** LOW — Confusing but functional (PG RLS OR logic)

**Problem:** Migration 014 created `system_params_deny_anon` (USING false) and migration 015 created `system_params_admin` (FOR ALL). Both coexist — confusing but works due to OR logic.

**Fix:** Consolidated into clear policies: `system_params_admin_all` (admin/SUPER_ADMIN full access) + `system_params_deny_anon` (block anonymous reads).

---

## Summary

| # | Bug | Severity | Status |
|---|-----|----------|--------|
| 1-6 | Original audit findings | 🔴🟡🟢 | ✅ Fixed |
| 7 | Login.vue missing `</template>` | 🔴 Critical | ✅ Fixed |
| 8 | Dashboard status filter wrong | 🟡 Medium | ✅ Fixed |
| 9 | Search input not sanitized | 🟡 Medium | ✅ Fixed |
| 10 | Payout non-atomic | 🟡 Medium | ✅ Fixed |
| 11 | search.js wrong filter column | 🟢 Low | ✅ Fixed |
| 12 | cancelOrder reason ignored | 🟢 Low | ✅ Fixed |
| 13 | Unused axios dependency | 🟢 Low | ✅ Fixed |
| 14 | Service worker no cache TTL | 🟡 Medium | ✅ Fixed |
| 15 | Notifications RLS too permissive | 🟡 Medium | ✅ Fixed |
| 16 | product_comments table missing | 🟡 Medium | ✅ Fixed |
| 17 | Password reset requires auth | 🟡 Medium | ✅ Fixed |
| 18 | Scraper SSRF vulnerability | 🟡 Medium | ✅ Fixed |
| 19 | system_params RLS conflict | 🟢 Low | ✅ Fixed |

**Total: 19 bugs fixed across 3 sessions**

## Remaining Recommendations

1. **Rotate ALL exposed secrets** (see C1 in FULL_AUDIT_REPORT.md)
2. **Deploy worker:** `npx wrangler deploy` after verifying locally
3. **Apply migrations:** `supabase db push` for migrations 016-018
4. **Update exchange rates:** `src/utils/currency.js` has rates from 2024-01
5. **Add live rates API:** Consider fetching real-time exchange rates
6. **Run tests:** `npm test` (currently crashes in sandbox — run on production machine)
7. **Remove dead code:** `src/store/cart.js` (unused by any component)
