# AllianceHub QA Report
**Date:** 2026-08-18
**QA Engineer:** Automated QA Agent
**Platform:** AllianceHub E-Commerce v3.0.0

---

## 📊 Test Coverage Summary

| Category | Tests | Status |
|----------|-------|--------|
| Unit: Utils (helpers.js, currency.js) | 59 | ✅ All Pass |
| Unit: Store (user.js Pinia store) | 29 | ✅ All Pass |
| Unit: Composables (useAuth.js) | 40 | ✅ All Pass |
| Integration: Worker API Routes | 39 | ✅ All Pass |
| **TOTAL** | **167** | **✅ 100% Pass** |

### Test Infrastructure
- **Framework:** Vitest 4.1.10 with jsdom environment
- **Mocks:** Supabase client, Vue Router, localStorage, navigator.clipboard, fetch
- **Config:** `vitest.config.js` with Vue plugin and `@/` alias
- **Run:** `npm test` or `npx vitest run`

---

## 🐛 Bug Findings from Codebase Review

### BUG-001: `truncate()` returns `null` for falsy input (not `undefined`)
- **File:** `src/utils/helpers.js:66`
- **Severity:** Low
- **Details:** `truncate(null)` returns `null` instead of `undefined`. The function checks `!str` which is true for null, then returns `str` (null). Not a runtime error but inconsistent with expected behavior.
- **Fix:** Change to `if (!str) return ''` or `return str || ''`

### BUG-002: `formatPrice()` in helpers.js doesn't use `toLocaleString()` for IDR
- **File:** `src/utils/helpers.js:8`
- **Severity:** Low
- **Details:** `formatPrice(100000, 'IDR')` returns `Rp100000.00` instead of `Rp100,000.00`. The function only applies `toLocaleString()` to JPY, KRW, VND but not IDR, which also uses large numbers.
- **Fix:** Add 'IDR' to the no-decimal formatting list, or use `toLocaleString()` for all currencies.

### BUG-003: `prevent_role_escalation()` trigger has syntax error in SQL
- **File:** `supabase/migrations/003_security_fixes.sql:15-16`
- **Severity:** High
- **Details:** The trigger function references `current_setting(request.jwt.claims, true)::json->>role = service_role` which is invalid PostgreSQL syntax. `request.jwt.claims` should be a string literal `'request.jwt.claims'`, and `role` and `service_role` should be string literals too.
- **Fix:** Already fixed in migration `007_rls_hardening.sql` with correct syntax.

### BUG-004: Duplicate `prevent_role_escalation()` function definitions
- **File:** `003_security_fixes.sql` vs `007_rls_hardening.sql`
- **Severity:** Medium
- **Details:** Two conflicting definitions of the same trigger function. The first has a syntax error, the second is correct. If both migrations run in order, the second overrides the first. But if `003` fails, it could block subsequent migrations.
- **Fix:** Remove the broken trigger from `003_security_fixes.sql` or add `OR REPLACE`.

### BUG-005: Duplicate RLS policy creation without `IF NOT EXISTS`
- **File:** Multiple migration files (`004_fix_rls_security.sql`, `fix_rls_policies.sql`, `fix_rls_security.sql`)
- **Severity:** Medium
- **Details:** Several migrations create the same policies (e.g., `products_public_read`) without `IF NOT EXISTS`. Running them in sequence will fail on duplicate policy names.
- **Fix:** Use `CREATE POLICY IF NOT EXISTS` consistently, or drop existing policies before re-creating.

### BUG-006: Home.vue `toggleFollow()` is client-side only (no API call)
- **File:** `src/views/Home.vue:172-182`
- **Severity:** Medium
- **Details:** The follow/unfollow button on the Home page only updates local state (`followedSellers` Set). It does NOT call `followSeller()`/`unfollowSeller()` from the Supabase service. Following is lost on page refresh.
- **Fix:** Import and call `followSeller`/`unfollowSeller` from `@/services/supabase`.

### BUG-007: ProductDetail.vue `chatSeller()` uses `window.location.hash` instead of router
- **File:** `src/views/ProductDetail.vue:196`
- **Severity:** Low
- **Details:** When user is not logged in, `chatSeller()` does `window.location.hash = '#/login'` instead of `router.push('/login')`. This bypasses Vue Router's navigation guards.
- **Fix:** Use `router.push('/login')` consistently.

### BUG-008: `product_comments` table not in any migration
- **File:** `src/views/ProductDetail.vue:163` references `supabase.from('product_comments')`
- **Severity:** High
- **Details:** The comments feature in ProductDetail.vue queries `product_comments` table, but no migration creates this table. Comments will fail at runtime.
- **Fix:** Create migration for `product_comments` table with proper RLS policies.

### BUG-009: `updateProfile()` deletes role/kyc_status AFTER Supabase update
- **File:** `src/store/user.js:112-115`
- **Severity:** Medium (Security)
- **Details:** The `delete updates.role` lines run AFTER the Supabase update call. If the client sends `role` in the updates object, it's already been sent to Supabase. The RLS trigger should catch this, but the client-side guard is in the wrong position.
- **Fix:** Move the `delete` statements BEFORE the Supabase `update()` call.

### BUG-010: Missing `skeleton-shimmer` CSS animation
- **File:** `src/views/Home.vue` uses class `skeleton-shimmer` but no CSS defines it
- **Severity:** Low
- **Details:** Skeleton loading cards use `skeleton-shimmer` class but only `pulse` animation is defined. Shimmer effect won't render.
- **Fix:** Add `@keyframes shimmer` and `.skeleton-shimmer` CSS.

---

## ⚡ Performance Issues

### PERF-001: Top Sellers N+1 query
- **File:** `src/worker/index.js` (top sellers endpoint) and `src/services/supabase.js` (`fetchTopSellers`)
- **Severity:** High
- **Details:** For each seller, a separate query fetches follower count. With 20 sellers, that's 21 database queries. This should be a single query with a JOIN or subquery.
- **Fix:** Use Supabase RPC or a single query with `count` in the select.

### PERF-002: Home.vue loads 100 products on mount
- **File:** `src/views/Home.vue:195`
- **Severity:** Medium
- **Details:** `fetchProducts({ limit: 100 })` loads 100 products with all fields including seller data. For the initial view, only 20 are shown. Consider lazy loading.
- **Fix:** Load 20 initially, fetch more on scroll.

### PERF-003: Realtime subscription triggers full reload
- **File:** `src/views/Home.vue:214`
- **Severity:** Medium
- **Details:** Any change to the `products` table triggers a full `loadData()` which re-fetches all categories, products, and sellers. This is excessive for individual product updates.
- **Fix:** Debounce the realtime handler, or update only the changed product.

### PERF-004: Currency `getCurrency()` reads localStorage on every call
- **File:** `src/utils/currency.js:26-33`
- **Severity:** Low
- **Details:** Every call to `getCurrency()` (and by extension `convertPrice()`) reads from localStorage. This is called frequently during rendering.
- **Fix:** Cache the result and only re-read on `setCurrency()`.

---

## ♿ Accessibility Issues

### A11Y-001: Flash sale countdown lacks aria labels
- **File:** `src/views/Home.vue:51-54`
- **Severity:** Medium
- **Details:** The countdown timer (`hours:minutes:seconds`) has no `aria-label` or `role="timer"`. Screen readers will read individual numbers without context.
- **Fix:** Add `role="timer" aria-label="Flash sale ends in"` wrapper.

### A11Y-002: Banner carousel lacks keyboard navigation
- **File:** `src/views/Home.vue:28-35`
- **Severity:** Medium
- **Details:** Banner arrows are `<button>` elements (good), but the carousel doesn't support arrow key navigation. Auto-rotation has no pause mechanism for screen readers.
- **Fix:** Add `aria-roledescription="carousel"`, pause on focus/hover.

### A11Y-003: Category sidebar items missing button/link semantics
- **File:** `src/views/Home.vue:17-21`
- **Severity:** Medium
- **Details:** Sidebar items use `<div @click>` instead of `<button>` or `<a>`. Not keyboard accessible, no `role="button"`, no `tabindex`.
- **Fix:** Use `<button>` or `<router-link>` with proper semantics.

### A11Y-004: Product images missing alt text fallback
- **File:** `src/views/Home.vue` (multiple locations)
- **Severity:** Low
- **Details:** Image placeholders (emoji divs) don't have alt text. When images fail to load, there's no accessible fallback.
- **Fix:** Add `aria-label` to placeholder divs.

### A11Y-005: Color contrast issues with CSS variables
- **File:** Multiple files using `var(--brand-primary, #FF9900)`
- **Severity:** Medium
- **Details:** Orange (#FF9900) on white (#FFF) has a contrast ratio of ~2.1:1, failing WCAG AA (4.5:1 required for text). This affects prices, buttons, and links.
- **Fix:** Darken primary color for text usage or add text-shadow/background for contrast.

---

## 🔒 Security Concerns

### SEC-001: CSP allows `unsafe-inline` for scripts
- **File:** `src/worker/index.js` (CSP header)
- **Severity:** Medium
- **Details:** `script-src 'self' 'unsafe-inline'` allows inline script execution, which weakens XSS protection. Consider using nonces or hashes.
- **Fix:** Migrate to nonce-based CSP or remove `unsafe-inline`.

### SEC-002: Worker error response includes errorId (information disclosure)
- **File:** `src/worker/index.js` (catch block)
- **Severity:** Low
- **Details:** Error responses include a timestamp-based errorId that could be used for timing attacks. The errorId is also logged, which is fine, but returning it to clients is unnecessary.
- **Fix:** Remove errorId from client response; keep it server-side only.

### SEC-003: `system_params` table accessible via RLS with `true` policy
- **File:** `supabase/migrations/fix_rls_policies.sql`
- **Severity:** Medium
- **Details:** If `system_params` has a permissive SELECT policy, sensitive configuration values (like commission rates) could be exposed to all users.
- **Fix:** Restrict `system_params` SELECT to admin roles only.

### SEC-004: CSRF token stored in cookie without SameSite=Strict
- **File:** `src/worker/index.js` (health endpoint)
- **Severity:** Low
- **Details:** The CSRF cookie is set with `SameSite=Strict` which is good. However, the token validation only checks if header matches cookie - it doesn't validate token freshness or expiration beyond the 1-hour Max-Age.
- **Fix:** Consider adding token rotation on sensitive operations.

---

## 📋 Migration Consistency Issues

### MIG-001: `profiles` vs `users` table naming inconsistency
- **Severity:** High
- **Details:** Migration `001_init.sql` creates `profiles` table, but later migrations reference `users` table. The actual Supabase setup likely uses `auth.users` with a `public.users` profile table. The `001` migration creating `profiles` is orphaned.
- **Fix:** Remove `profiles` table from `001_init.sql` or consolidate naming.

### MIG-002: `fix_rls_security.sql` drops ALL policies with dynamic SQL
- **Severity:** Medium
- **Details:** The migration uses a `DO $$` block to drop ALL policies in the public schema. This is a nuclear option that could break other migrations' policies if run out of order.
- **Fix:** Make the drop selective or document the intended execution order.

### MIG-003: `CREATE POLICY IF NOT EXISTS` is PostgreSQL 15+ only
- **Severity:** Medium
- **Details:** Several migrations use `CREATE POLICY IF NOT EXISTS` which requires PostgreSQL 15+. Supabase may be on an older version.
- **Fix:** Use `DROP POLICY IF EXISTS` + `CREATE POLICY` pattern instead.

---

## ✅ Recommendations

### Immediate (P0)
1. **Fix migration ordering** — Remove duplicate/conflicting migrations, establish a single source of truth
2. **Create `product_comments` table** — Comments feature is broken without it
3. **Fix `updateProfile()` security** — Move role deletion before Supabase call

### Short-term (P1)
4. **Fix Home.vue follow button** — Wire up to actual API calls
5. **Fix Top Sellers N+1 query** — Use JOIN or RPC for follower counts
6. **Add skeleton-shimmer animation** — CSS missing for loading states
7. **Improve color contrast** — Darken orange for text accessibility

### Medium-term (P2)
8. **Add nonce-based CSP** — Remove `unsafe-inline` from script-src
9. **Debounce realtime subscriptions** — Prevent excessive re-renders
10. **Add keyboard navigation** — Banners, category sidebar, product grid
11. **Add E2E tests** — Critical user flows (login, checkout, admin)

### Long-term (P3)
12. **Performance monitoring** — Add Web Vitals tracking
13. **Error boundary components** — Catch and display Vue errors gracefully
14. **i18n coverage audit** — Ensure all strings are translated
15. **Add Storybook** — Component documentation and visual testing

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `vitest.config.js` | Test framework configuration |
| `tests/setup.js` | Global mocks (Supabase, Router, localStorage) |
| `tests/unit/utils.test.js` | 59 tests for helpers.js + currency.js |
| `tests/unit/store.test.js` | 29 tests for Pinia user store |
| `tests/unit/composables.test.js` | 40 tests for useAuth composable |
| `tests/integration/api.test.js` | 39 tests for Worker API routes |
| `scripts/validate-build.sh` | Build output validation |
| `scripts/qa-check.sh` | Full QA pipeline (lint + test + build) |
| `QA_REPORT.md` | This report |
| `BUG_TRACKER.md` | Detailed bug tracking |

---

*Report generated by AllianceHub QA Automation*
