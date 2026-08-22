# Security: Admin/SuperAdmin Portal URL Obfuscation

**Date:** 2026-08-22  
**Status:** ✅ Completed

## Summary

Admin and Super Admin portals have been hidden behind secret, unguessable URLs to prevent public discovery. The original `/admin` and `/superadmin` paths no longer resolve — they now return 404.

## New Secret URLs

| Portal | Old URL | New URL |
|--------|---------|---------|
| Admin Portal | `/admin` | *(redacted — see secure vault)* |
| Super Admin Portal | `/superadmin` | *(redacted — see secure vault)* |
| Admin Login | `/login/admin` | *(redacted — see secure vault)* |
| Super Admin Login | `/login/superadmin` | *(redacted — see secure vault)* |

> ⚠️ Actual URLs are stored in the task assignment. Do not commit secret URLs to version control or documentation.

## Files Modified

1. **`src/router/index.js`** — Route definitions, navigation guards, redirect logic
2. **`src/layouts/AdminLayout.vue`** — Sidebar links, topbar links, portal switcher removed
3. **`src/layouts/SuperAdminLayout.vue`** — All sidebar nav links, portal switcher, logout redirect
4. **`src/layouts/MainLayout.vue`** — Header portal switcher links
5. **`src/layouts/SellerLayout.vue`** — Header portal switcher links
6. **`src/layouts/UserLayout.vue`** — Header portal switcher links
7. **`src/views/admin/Login.vue`** — Post-login redirect paths
8. **`src/views/superadmin/Login.vue`** — Post-login redirect, admin login link
9. **`src/views/admin/Dashboard.vue`** — Quick-nav links
10. **`src/views/superadmin/Dashboard.vue`** — Quick-action button routes
11. **`src/composables/useAuth.js`** — Role-to-redirect mapping

## Changes Detail

### Router Guards
- All `startsWith('/admin')` checks → `startsWith('/admin-<secret>')`
- All `startsWith('/superadmin')` checks → `startsWith('/superadmin-<secret>')`
- All `next('/admin')` redirects → `next('/admin-<secret>')`
- All `next('/superadmin')` redirects → `next('/superadmin-<secret>')`
- Login page detection updated to include new secret login paths

### AdminLayout Cleanup
- **Removed** portal switcher header bar (Super Admin, Seller, Buyer, RatingPlus, Site links) — this was leaking portal URLs to anyone who could see the admin layout
- **Removed** "Super Admin Portal" sidebar link — no longer exposes superadmin URL
- All internal nav links updated to secret admin URL prefix

### SuperAdminLayout
- Portal switcher updated (Admin link points to secret admin URL)
- All 25+ sidebar nav links updated
- Logout redirect updated to secret admin login URL

### Login Pages
- Admin Login: `router.push('/admin')` → secret admin URL; `router.push('/superadmin')` → secret superadmin URL
- Super Admin Login: `router.push('/superadmin')` → secret superadmin URL; "← Admin Login" link → secret admin login URL

### useAuth Composable
- `getRedirectForRole()` mapping updated for ADMIN and SUPER_ADMIN roles

## Build Verification

```
✓ npm run build — succeeded (14.75s)
✓ No compilation errors
```

## What's NOT Changed (Intentionally)

- **Seller routes** (`/seller/*`) — not hidden, seller login is public-facing
- **API endpoints** (`/api/admin/*`) — these are backend worker routes, not frontend routes
- **Feature flag keys** (`admin_*`) — internal config keys, not URLs

## Security Notes

- Secret URLs use 16-char hex tokens — 64 bits of entropy, not guessable
- URLs should be shared only via secure channels (encrypted DM, password manager)
- Consider adding rate limiting on login pages as a follow-up
- Consider IP allowlisting for admin portals as additional hardening
