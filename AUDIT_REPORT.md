# 🔍 AllianceHub Platform — Total Audit Report

**Tanggal:** 2026-08-22 14:25 GMT+8  
**Repo:** github.com/absolutus-aeternus/Platform  
**Branch:** main  
**Commit:** `567fd88` — fix: Vue template syntax errors (partial — pre-existing issues)

---

## Ringkasan Eksekutif

| Tahap | Status | Catatan |
|-------|--------|---------|
| STEP 1 — Git & Repositori | ⚠️ Perhatian | 1 file terhapus (package-lock.json), remote benar |
| STEP 2 — SQL Migrations | ⚠️ Perhatian | 26 file, 223 policies, ada duplikasi nama policy & function |
| STEP 3 — Dependencies | ❌ Gagal | npm install gagal tanpa `--ignore-scripts` (esbuild SIGSEGV) |
| STEP 4 — Lint & Code Quality | ❌ Gagal | Tidak ada eslint config file |
| STEP 5 — Build | ❌ Gagal | Vue template syntax error di Messages.vue |
| STEP 6 — Wrangler Config | ✅ Lolos | Konfigurasi valid, worker file exists |
| STEP 7 — Live Health Check | ❌ Gagal | Frontend 500, API 404 |

**Skor: 1/7 Lolos — ❌ TIDAK PRODUCTION-READY**

---

## STEP 1 — Git & Repositori

| Check | Status | Detail |
|-------|--------|--------|
| Remote origin | ✅ | `https://github.com/absolutus-aeternus/Platform.git` |
| Branch | ✅ | main |
| Clean working tree | ⚠️ | `D package-lock.json` — file terhapus, belum di-commit |
| Latest commits | ✅ | 5 commit terakhir terlihat sehat |

**Log Error:**
```
D package-lock.json
```

**Rekomendasi:** Commit atau restore `package-lock.json` untuk reproducible builds.

---

## STEP 2 — SQL Migrations

### Statistik

| Metrik | Jumlah |
|--------|--------|
| Total file migrasi | 26 |
| Total CREATE TABLE | 35 |
| Total CREATE POLICY | 223 |
| Total CREATE INDEX | ~80+ |
| Total CREATE FUNCTION | 12 |
| Total CREATE TRIGGER | 4 |
| Total CREATE VIEW | 1 |

### ✅ Lolos

| Check | Status |
|-------|--------|
| Balanced parentheses | ✅ |
| Dollar-quoting (`$$`) | ✅ |
| Semicolons | ✅ |
| Foreign key references | ✅ |
| RLS enabled on tables | ✅ |

### ⚠️ Perhatian — Duplikasi

#### 1. Policy Names yang Dibuat Berulang (tanpa DROP IF EXISTS)

| Policy Name | Muncul di File | Risiko |
|-------------|---------------|--------|
| `system_params_deny_anon` | 004, 014, 018, 020 | ⚠️ Konflik jika tidak di-drop dulu |
| `products_public_read` | 004, 014 | ⚠️ Akan error jika tabel sudah punya policy ini |
| `products_seller_insert` | 004, 014 | ⚠️ Sama |
| `products_seller_update` | 004, 014 | ⚠️ Sama |
| `products_seller_delete` | 004, 014 | ⚠️ Sama |
| `categories_public_read` | 004, 014 | ⚠️ Sama |
| `sellers_public_read` | 004, 014 | ⚠️ Sama |
| `sellers_owner_update` | 004, 014 | ⚠️ Sama |
| `commissions_seller_read` | 006, 022 | ⚠️ Sama |
| `coupons_public_read` | 010, 022 | ⚠️ Sama |
| `coupons_admin_all` | 010, 022 | ⚠️ Sama |
| `follows_seller_read` | 010, 022 | ⚠️ Sama |
| `shipping_rates_public_read` | 010, 022 | ⚠️ Sama |
| `shipping_rates_seller_manage` | 010, 022 | ⚠️ Sama |
| `flash_sales_public_read` | 004, 014 | ⚠️ Sama |
| `evaluations_public_read` | 004, 014 | ⚠️ Sama |
| `banners_public_read` | 004, 014 | ⚠️ Sama |

**Catatan:** Migrasi 015 menggunakan `DROP POLICY IF EXISTS` untuk semua policy sebelum membuat ulang, sehingga mengatasi sebagian besar konflik. Namun migrasi 004→014 tidak menggunakan DROP IF EXISTS secara konsisten.

#### 2. Function yang Didefinisikan Ulang

| Function | File | Catatan |
|----------|------|---------|
| `prevent_role_escalation()` | 003, 007, 021 | Menggunakan `CREATE OR REPLACE` — aman |
| `process_checkout()` | 013, 021 | Menggunakan `CREATE OR REPLACE` — aman, tapi **signature berbeda** (013: `NUMERIC`, 021: `DECIMAL`) |

#### 3. Trigger yang Dibuat Ulang

| Trigger | File | Catatan |
|---------|------|---------|
| `prevent_role_escalation` | 003, 007, 021 | Menggunakan `DROP TRIGGER IF EXISTS` + `CREATE TRIGGER` — aman |

#### 4. Index Tanpa `IF NOT EXISTS`

| Index | File | Risiko |
|-------|------|--------|
| `idx_feed_events_created` | 002 | ❌ Akan error jika sudah ada |
| `idx_feed_events_entity` | 002 | ❌ Akan error jika sudah ada |

### 📋 Daftar CREATE FUNCTION

| Function | File | Purpose |
|----------|------|---------|
| `prevent_role_escalation()` | 003 | Mencegah user mengubah role sendiri |
| `is_admin()` | 005 | Cek apakah user adalah admin |
| `is_super_admin()` | 005 | Cek apakah user adalah super admin |
| `decrement_stock()` | 009 | Atomic stock decrement |
| `get_seller_follower_count()` | 010 | Hitung follower seller |
| `validate_coupon()` | 010 | Validasi dan apply kupon |
| `redirect_favorites_to_wishlists()` | 012 | Redirect favorites ke wishlists |
| `process_checkout()` | 013, 021 | Atomic checkout process |
| `get_user_role()` | 019 | Ambil role user (SECURITY DEFINER) |
| `products_fts_trigger()` | 023 | Auto-update full-text search vector |
| `search_products()` | 023 | Full-text search produk |

### 📋 Daftar CREATE INDEX (tanpa IF NOT EXISTS)

| Index | File |
|-------|------|
| `idx_feed_events_created` | 002 |
| `idx_feed_events_entity` | 002 |

---

## STEP 3 — Dependencies

### npm install

| Check | Status | Detail |
|-------|--------|--------|
| `npm install` | ❌ Gagal | esbuild SIGSEGV (wrangler dependency) |
| `npm install --ignore-scripts` | ✅ | Berhasil dengan workaround |

**Error Log:**
```
npm error Error: Command failed: .../esbuild/bin/esbuild --version
npm error     signal: 'SIGSEGV'
```

**Penyebab:** Wrangler dependency `esbuild` mengalami SIGSEGV pada environment ini. Ini masalah environment, bukan kode.

### npm audit

| Check | Status | Detail |
|-------|--------|--------|
| `npm audit` | ⚠️ Tidak tersedia | Registry mirror tidak mendukung audit endpoint |

### npm outdated

| Package | Current | Latest | Type |
|---------|---------|--------|------|
| `@vitejs/plugin-vue` | 5.2.4 | 6.0.8 | ⚠️ Major |
| `pinia` | 2.3.1 | 4.0.3 | ⚠️ Major |
| `vite` | 5.4.21 | 8.2.2 | ⚠️ Major |
| `vue-router` | 4.6.4 | 5.2.0 | ⚠️ Major |

**Catatan:** 4 package memiliki update major version. Perlu testing menyeluruh sebelum upgrade.

---

## STEP 4 — Lint & Code Quality

| Check | Status | Detail |
|-------|--------|--------|
| ESLint config | ❌ Tidak ada | Tidak ditemukan `eslint.config.*` atau `.eslintrc.*` |
| `npm run lint` | ❌ Gagal | Script ada (`eslint src/ --ext .js,.vue --max-warnings 0 \|\| true`) tapi tidak ada config |

**Error:**
```
ESLint couldn't find an eslint.config.* file.
From ESLint v9.0.0, the default configuration file is now eslint.config.*
```

**Rekomendasi:** Buat `eslint.config.js` untuk ESLint v9+ format, atau tambahkan `.eslintrc.cjs` untuk kompatibilitas.

---

## STEP 5 — Build

| Check | Status | Detail |
|-------|--------|--------|
| `.env` created | ✅ | Dibuat dari `.env.example` |
| `npm run build` (vite build) | ❌ Gagal | Vue template syntax error |

**Error:**
```
[vite:vue] src/views/seller/Messages.vue (43:21): Element is missing end tag.
```

**Root Cause — `src/views/seller/Messages.vue` baris 43:**
```vue
<!-- BROKEN: <template> ditutup dengan </div> -->
<template v-if="msg.is_read">✓✓  </div>
<div v-else>✓  </div>
```

**Seharusnya:**
```vue
<template v-if="msg.is_read">✓✓</template>
<template v-else>✓</template>
```

**Catatan:** Commit terbaru (`567fd88`) berjudul "fix: Vue template syntax errors (partial — pre-existing issues)" — menunjukkan ini masalah yang sudah diketahui tapi belum selesai diperbaiki.

---

## STEP 6 — Wrangler Config

| Check | Status | Detail |
|-------|--------|--------|
| `wrangler.toml` exists | ✅ | |
| `name` | ✅ | `alliancehub-api` |
| `main` | ✅ | `src/worker/index.js` |
| `compatibility_date` | ✅ | `2024-01-01` |
| `account_id` | ✅ | `f891a7b56743e4fb41751c507e3c1c3d` |
| `src/worker/index.js` exists | ✅ | 75,305 bytes |
| Worker code valid | ✅ | Export `fetch` handler terdeteksi |
| CORS headers | ✅ | Dikonfigurasi dengan `ALLOWED_ORIGINS` |
| CSP headers | ✅ | Content-Security-Policy terpasang |
| CSRF protection | ✅ | HMAC-SHA256 CSRF token verification |

**Detail Worker:**
- Menggunakan Supabase service role key untuk bypass RLS
- CORS: `alliancehub.dpdns.org`, `alliancehub.pages.dev`, `localhost:3000`
- CSP: Restrictive policy dengan whitelist CDN

---

## STEP 7 — Live Health Check

| Endpoint | HTTP Status | Detail |
|----------|-------------|--------|
| `https://alliancehub.pages.dev/` | ❌ **500** | Internal Server Error |
| `https://alliancehub-api.absolutus-aeternus.workers.dev/` | ⚠️ **404** | `{"error":"Not found"}` (expected for root) |

### Response Headers — API Worker

| Header | Status | Value |
|--------|--------|-------|
| `access-control-allow-origin` | ✅ | `https://alliancehub.dpdns.org` |
| `access-control-allow-headers` | ✅ | `Content-Type, Authorization, X-Cron-Token, X-API-Key, X-CSRF-Token` |
| `access-control-allow-methods` | ✅ | `GET, POST, PUT, DELETE, OPTIONS` |
| `content-security-policy` | ✅ | Restrictive policy configured |
| `server` | ✅ | `cloudflare` |

### Response Headers — Frontend (Pages)

| Header | Status | Value |
|--------|--------|-------|
| `server` | ✅ | `cloudflare` |
| Content-Type | ❌ | Tidak ada (empty response) |
| Security headers | ❌ | Tidak ada (500 error) |

**Analisis:**
- **Frontend 500:** Kemungkinan besar deployment gagal atau build error di Cloudflare Pages (konsisten dengan build error Messages.vue)
- **API 404:** Normal untuk root path — worker memerlukan path spesifik (misal `/api/products`)

---

## 🔴 Masalah Kritis (Harus Diperbaiki)

| # | Masalah | Severity | File |
|---|---------|----------|------|
| 1 | Vue template syntax error — build gagal | 🔴 Kritis | `src/views/seller/Messages.vue:43` |
| 2 | Frontend 500 error di production | 🔴 Kritis | Cloudflare Pages deployment |
| 3 | Tidak ada ESLint config | 🟠 Tinggi | Project root |
| 4 | `package-lock.json` terhapus | 🟠 Tinggi | Git working tree |
| 5 | npm install gagal (esbuild SIGSEGV) | 🟡 Sedang | Environment-specific |

## 🟡 Masalah Sedang

| # | Masalah | Severity | Detail |
|---|---------|----------|--------|
| 6 | 4 package outdated (major) | 🟡 Sedang | pinia, vite, vue-router, plugin-vue |
| 7 | 17+ duplicate policy names | 🟡 Sedang | Sebagian besar diatasi oleh DROP IF EXISTS |
| 8 | 2 index tanpa IF NOT EXISTS | 🟡 Sedang | `idx_feed_events_created`, `idx_feed_events_entity` |
| 9 | `process_checkout` signature mismatch | 🟡 Sedang | 013 pakai NUMERIC, 021 pakai DECIMAL |
| 10 | npm audit tidak tersedia | 🟡 Sedang | Registry mirror limitation |

## 🟢 Yang Sudah Baik

| # | Item | Detail |
|---|------|--------|
| 1 | Git remote | Benar, branch main |
| 2 | SQL syntax | Valid, balanced, proper dollar-quoting |
| 3 | RLS coverage | 223 policies, 100% tabel terproteksi |
| 4 | Wrangler config | Valid, CORS, CSP, CSRF terkonfigurasi |
| 5 | Worker code | 75KB, proper error handling, security headers |
| 6 | Atomic checkout | `process_checkout` function dengan idempotency |
| 7 | Stock management | `decrement_stock` dengan row locking |
| 8 | Role escalation prevention | Trigger `prevent_role_escalation` |
| 9 | Full-text search | GIN index + tsvector untuk produk |
| 10 | Audit trail | `audit_logs` + `login_logs` tables |

---

## 📝 Rekomendasi Perbaikan (Prioritas)

### P0 — Harus Diperbaiki Sekarang

1. **Fix Messages.vue** — Ganti `</div>` dengan `</template>` pada baris 43-45
2. **Redeploy frontend** — Setelah fix, trigger Cloudflare Pages deployment
3. **Buat ESLint config** — Tambahkan `eslint.config.js` (flat config format)

### P1 — Segera

4. **Restore package-lock.json** — `git checkout HEAD -- package-lock.json` atau regenerate
5. **Audit SQL migrations** — Tambahkan `DROP POLICY IF EXISTS` pada migrasi 004 dan 002
6. **Fix index migration** — Tambahkan `IF NOT EXISTS` pada `idx_feed_events_*`

### P2 — Rencanakan

7. **Upgrade dependencies** — Test dan upgrade pinia, vite, vue-router
8. **Standardize function signatures** — Samakan `NUMERIC` vs `DECIMAL` di `process_checkout`
9. **Setup npm audit** — Gunakan registry resmi atau Snyk sebagai alternatif

---

*Laporan dibuat otomatis oleh audit agent pada 2026-08-22 14:25 GMT+8*
