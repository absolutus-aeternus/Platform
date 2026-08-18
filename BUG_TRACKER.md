# AllianceHub Bug Tracker
**Last Updated:** 2026-08-18
**Maintained by:** QA Team

---

## 🔴 Critical (P0)

| ID | Title | File | Status |
|----|-------|------|--------|
| BUG-008 | `product_comments` table missing from migrations | `views/ProductDetail.vue` | 🔴 Open |
| BUG-003 | `prevent_role_escalation()` syntax error in SQL | `003_security_fixes.sql` | 🟡 Superseded by 007 |

---

## 🟠 High (P1)

| ID | Title | File | Status |
|----|-------|------|--------|
| BUG-004 | Duplicate `prevent_role_escalation()` definitions | `003` vs `007` migrations | 🔴 Open |
| BUG-005 | Duplicate RLS policies without `IF NOT EXISTS` | Multiple migrations | 🔴 Open |
| BUG-009 | `updateProfile()` deletes role AFTER Supabase call | `store/user.js:112` | 🔴 Open |
| MIG-001 | `profiles` vs `users` table naming conflict | `001_init.sql` | 🔴 Open |
| PERF-001 | Top Sellers N+1 query (21 DB calls) | `worker/index.js` + `services/supabase.js` | 🔴 Open |

---

## 🟡 Medium (P2)

| ID | Title | File | Status |
|----|-------|------|--------|
| BUG-006 | Home.vue follow button is client-side only | `views/Home.vue:172` | 🔴 Open |
| MIG-002 | `fix_rls_security.sql` drops ALL policies | `fix_rls_security.sql` | 🔴 Open |
| MIG-003 | `CREATE POLICY IF NOT EXISTS` needs PG15+ | Multiple migrations | 🔴 Open |
| SEC-001 | CSP allows `unsafe-inline` for scripts | `worker/index.js` | 🔴 Open |
| SEC-003 | `system_params` may have permissive RLS | `fix_rls_policies.sql` | 🔴 Open |
| PERF-002 | Home loads 100 products, shows 20 | `views/Home.vue:195` | 🔴 Open |
| PERF-003 | Realtime triggers full page reload | `views/Home.vue:214` | 🔴 Open |
| A11Y-001 | Countdown lacks aria labels | `views/Home.vue:51` | 🔴 Open |
| A11Y-002 | Banner carousel no keyboard nav | `views/Home.vue:28` | 🔴 Open |
| A11Y-003 | Category items missing button semantics | `views/Home.vue:17` | 🔴 Open |
| A11Y-005 | Orange on white fails WCAG contrast | Multiple files | 🔴 Open |

---

## 🟢 Low (P3)

| ID | Title | File | Status |
|----|-------|------|--------|
| BUG-001 | `truncate()` returns null for falsy input | `utils/helpers.js:66` | 🔴 Open |
| BUG-002 | `formatPrice()` IDR missing toLocaleString | `utils/helpers.js:8` | 🔴 Open |
| BUG-007 | `chatSeller()` uses location.hash not router | `views/ProductDetail.vue:196` | 🔴 Open |
| BUG-010 | Missing `skeleton-shimmer` CSS animation | `views/Home.vue` | 🔴 Open |
| SEC-002 | Error response includes errorId | `worker/index.js` | 🔴 Open |
| SEC-004 | CSRF token no freshness validation | `worker/index.js` | 🔴 Open |
| PERF-004 | `getCurrency()` reads localStorage every call | `utils/currency.js:26` | 🔴 Open |
| A11Y-004 | Image placeholders missing alt text | `views/Home.vue` | 🔴 Open |

---

## ✅ Fixed

| ID | Title | Fixed By | Date |
|----|-------|----------|------|
| *(none yet)* | | | |

---

## Legend

- 🔴 **Open** — Not yet addressed
- 🟡 **Superseded** — Replaced by a better fix
- 🟢 **Fixed** — Resolved and verified
- **P0** — Critical, blocks core functionality
- **P1** — High, significant impact
- **P2** — Medium, should fix soon
- **P3** — Low, nice to have

---

## Notes

- All bugs found via code review of `src/worker/index.js`, `src/views/Home.vue`, `src/views/ProductDetail.vue`, `src/store/user.js`, `src/utils/`, and all SQL migrations
- Test coverage established for: utils, store, composables, API routes
- Missing test coverage: Vue components (requires component test setup), E2E flows
