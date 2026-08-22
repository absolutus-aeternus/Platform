# UI Rename Report: "Admin" → "Customer Service"

**Date:** 2026-08-22  
**Scope:** UI-visible text only (labels, badges, headings, placeholders, button text)  
**Preserved:** Variable names, function names, CSS classes, route paths, role values (`ADMIN`, `SUPER_ADMIN`), code logic

---

## Changes Summary

### 1. `src/views/admin/Login.vue`
| Before | After |
|--------|-------|
| `<span class="admin-badge">Admin</span>` | `<span class="admin-badge">Customer Service</span>` |
| `Administrator Access Only` | `Customer Service Access Only` |
| `Admin Email` (label) | `Customer Service Email` |
| `Admin Login` (button text) | `Customer Service Login` |
| `Administrator privileges required.` (error msg) | `Customer Service privileges required.` |

### 2. `src/layouts/AdminLayout.vue`
| Before | After |
|--------|-------|
| `Manage Admins` (sidebar nav) | `Manage Customer Service` |
| `'Administrator'` (role display for non-super-admin) | `'Customer Service'` |

### 3. `src/layouts/SellerLayout.vue`
| Before | After |
|--------|-------|
| `> Admin <` (portal switcher link) | `> Customer Service <` |

### 4. `src/layouts/UserLayout.vue`
| Before | After |
|--------|-------|
| `> Admin <` (portal switcher link) | `> Customer Service <` |

### 5. `src/views/admin/ManageAdmins.vue`
| Before | After |
|--------|-------|
| `Manage Admin Accounts` (page title) | `Manage Customer Service Accounts` |
| `Add Admin` (button) | `Add Customer Service` |
| `Add New Admin` (modal title) | `Add New Customer Service` |
| `placeholder="admin@example.com"` | `placeholder="cs@example.com"` |
| `<option value="ADMIN">Admin</option>` (×2, add modal + table) | `<option value="ADMIN">Customer Service</option>` |
| `Loading admins...` | `Loading customer service accounts...` |
| `No admin accounts found` | `No customer service accounts found` |

### 6. `src/views/admin/Wallets.vue`
| Before | After |
|--------|-------|
| `Admin adjustment reason` (placeholder) | `Customer Service adjustment reason` |

### 7. `src/views/admin/Dashboard.vue`
- **No changes needed** — no user-visible "Admin" text found in UI.

### 8. `src/layouts/MainLayout.vue`
| Before | After |
|--------|-------|
| `> Admin <` (portal switcher link) | `> Customer Service <` |

---

## What Was NOT Changed (by design)
- CSS class names: `.admin-badge`, `.admin-auth`, `.admin-layout`, `.admin-wallets`, `.admin-dashboard`
- Variable/function names: `newAdmin`, `createAdmin`, `loadAdmins`, `admins`, etc.
- Route paths: `/999/customer-service/999/*`
- Role values in code: `ADMIN`, `SUPER_ADMIN`
- Code comments referencing "Admin"
- `console.log`/`console.warn` messages
- HTML comments (`<!-- Add Admin Modal -->`)
