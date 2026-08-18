# 🔍 Analisis Lengkap Bug & Masalah — AllianceHub Platform

**Tanggal:** 2026-08-18  
**Versi:** 3.0.0  
**Status Build:** ✅ Berhasil (13.38s, 252 file output)

---

## 🔴 BUG KRITIS (Harus Segera Diperbaiki)

### BUG-001: Race Condition pada Stock Decrement
**File:** `src/worker/index.js` (line ~520-535)  
**Severity:** 🔴 KRITIS  
**Dampak:** Double-spending, stok negatif, kerugian finansial

**Masalah:**  
Stock decrement dilakukan dengan cara READ → PATCH (bukan atomic). Jika 2 user checkout produk yang sama secara bersamaan:
```
User A: READ stock = 5
User B: READ stock = 5
User A: PATCH stock = 5 - 1 = 4
User B: PATCH stock = 5 - 1 = 4  ← SEHARUSNYA 3!
```

**Solusi:** Gunakan Supabase RPC/PostgreSQL function:
```sql
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_quantity INT)
RETURNS VOID AS $$
BEGIN
  UPDATE products 
  SET stock = stock - p_quantity 
  WHERE id = p_product_id AND stock >= p_quantity;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### BUG-002: Header Auth Salah di Review Endpoint
**File:** `src/worker/index.js` (line 710)  
**Severity:** 🔴 KRITIS  
**Dampak:** Potensi bypass RLS, data leak

**Masalah:**
```javascript
// SALAH: apikey pakai ANON, tapi Authorization pakai SERVICE_ROLE
const h = { 
  'apikey': env.VITE_SUPABASE_ANON_KEY,           // ← anon key
  'Authorization': 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY, // ← service role!
  ...
};
```
Ini menggunakan anon key sebagai `apikey` tapi service role sebagai `Authorization`. Pola ini tidak konsisten dan bisa menyebabkan perilaku tak terduga di Supabase.

**Solusi:** Konsisten gunakan `getServiceHeaders()` untuk operasi service role.

---

### BUG-003: Checkout Tidak Idempoten
**File:** `src/worker/index.js` (line ~460-570)  
**Severity:** 🔴 KRITIS  
**Dampak:** Double order, double charge

**Masalah:** Tidak ada idempotency key. Jika user mengklik "Place Order" dua kali (network retry, double-click), bisa menghasilkan 2 order.

**Solusi:** Tambahkan idempotency key:
```javascript
const idempotencyKey = request.headers.get('Idempotency-Key') || user.id + ':' + orderNo;
// Check if order already exists with this key
```

---

### BUG-004: Error Handling Silent di Stock Decrement
**File:** `src/worker/index.js` (line ~533)  
**Severity:** 🔴 TINGGI  
**Dampak:** Stock tidak berkurang, user dapat barang gratis

**Masalah:**
```javascript
} catch (e) { console.warn('Stock decrement error:', e.message); }
```
Jika stock decrement gagal, order tetap dibuat tapi stok tidak berkurang. Tidak ada rollback.

**Solusi:** Jika stock decrement gagal, batalkan order (atau tandai untuk review manual).

---

## 🟠 BUG SEDANG

### BUG-005: CSRF Token Tidak Diverifikasi di Beberapa Endpoint
**File:** `src/worker/index.js`  
**Severity:** 🟠 SEDANG  

**Masalah:** CSRF check hanya ada di `/api/checkout` dan `/api/upload/presign`. Endpoint sensitif lainnya seperti `/api/review`, `/api/seller/markup`, `/api/admin/change-role` tidak memiliki CSRF protection.

**Solusi:** Tambahkan CSRF verification ke semua POST endpoint yang memodifikasi data.

---

### BUG-006: Input Validation Tidak Lengkap
**File:** `src/worker/index.js`  
**Severity:** 🟠 SEDANG  

**Masalah:** 
- `item.product_id` di checkout tidak divalidasi format UUID
- `item.quantity` tidak divalidasi (bisa negatif atau 0)
- `body.address` tidak divalidasi strukturnya
- `custom_price` di seller markup tidak divalidasi tipe (bisa string)

**Solusi:** Tambahkan validation layer:
```javascript
function validateUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}
function validatePositiveInt(n) {
  return Number.isInteger(n) && n > 0 && n <= 999;
}
```

---

### BUG-007: Duplicate Fetch di Checkout
**File:** `src/worker/index.js` (line ~470-510)  
**Severity:** 🟠 SEDANG  
**Dampak:** Performa buruk, 2x API call per item

**Masalah:** Checkout melakukan 2 loop untuk items:
1. Loop pertama: validasi stok (line ~470)
2. Loop kedua: hitung total server-side (line ~490)

Kedua loop fetch data produk yang sama. Ini menggandakan API calls ke Supabase.

**Solusi:** Gabungkan kedua loop menjadi satu.

---

### BUG-008: `getServiceHeaders()` Leaked di Response
**File:** `src/worker/index.js` (line 8-9)  
**Severity:** 🟠 SEDANG  

**Masalah:** Fungsi `getServiceHeaders()` menampilkan service role key dalam format `***` + key. Meskipun tidak di-log, ini bisa ter-accidentally di-response jika ada error.

**Solusi:** Jangan pernah include key dalam format apapun di object yang bisa di-serialize.

---

### BUG-009: Dual Router Guards (Conflict)
**File:** `src/router/index.js` + `src/router/guards.js`  
**Severity:** 🟠 SEDANG  

**Masalah:** Ada DUA file router guards:
- `src/router/index.js` — sudah memiliki `beforeEach` guard inline
- `src/router/guards.js` — file terpisah dengan fungsi `setupRouterGuards()`

Kedua file ini bisa saling konflik. `guards.js` tidak di-import di `main.js` atau `index.js`.

**Solusi:** Pilih satu approach. Hapus yang tidak digunakan.

---

### BUG-010: OneSignal App ID Terexpose di Client
**File:** `src/main.js` (line 12)  
**Severity:** 🟠 SEDANG  

**Masalah:**
```javascript
window.__ONESIGNAL_APP_ID__ = import.meta.env.VITE_ONESIGNAL_APP_ID || ''
```
App ID di-inject ke global window. Ini tidak terlalu sensitif, tapi pattern ini bisa digunakan untuk fingerprinting.

---

## 🟡 BUG RINGAN / CODE QUALITY

### BUG-011: Error Handler Tidak Konsisten
**Severity:** 🟡 RINGAN  

**Masalah:** Beberapa endpoint menggunakan `try-catch` dengan `console.warn`, beberapa tanpa error handling sama sekali. Tidak ada structured error logging.

---

### BUG-012: Missing `Content-Type` Header di Beberapa Response
**Severity:** 🟡 RINGAN  

**Masalah:** Fungsi `json()` selalu set `Content-Type: application/json`, tapi file proxy (`/api/file/`) tidak set `Content-Type` yang benar untuk beberapa file type.

---

### BUG-013: Stale Cache Tidak Di-invalidate
**Severity:** 🟡 RINGAN  

**Masalah:** Edge cache untuk `/api/products` menggunakan `stale-while-revalidate` 300s, tapi tidak ada mekanisme untuk invalidate cache ketika produk di-update oleh seller/admin.

---

### BUG-014: `wrangler.toml` Expose Non-Sensitive Config
**Severity:** 🟡 RINGAN  

**Masalah:** `wrangler.toml` menyimpan beberapa config yang seharusnya di environment variables:
```toml
VITE_SUPABASE_URL = "https://cfzmdvymqqnrzrytcrie.supabase.co"
R2_ACCOUNT_ID = "f891a7b56743e4fb41751c507e3c1c3d"
```
Ini tidak sensitif tapi membuatnya sulit diubah tanpa commit.

---

### BUG-015: Missing `robots.txt` Disallow untuk Admin/Seller
**Severity:** 🟡 RINGAN  

**File:** `public/robots.txt`  
**Masalah:** Admin dan seller portal bisa di-crawl oleh search engine.

---

### BUG-016: Tidak Ada Rate Limit di Register Endpoint
**Severity:** 🟡 RINGAN  

**Masalah:** Endpoint register tidak memiliki rate limit khusus. Attacker bisa membuat ribuan akun.

---

## 📊 RINGKASAN

| Severity | Jumlah | Status |
|----------|--------|--------|
| 🔴 Kritis | 4 | Perlu fix segera |
| 🟠 Sedang | 6 | Perlu fix dalam sprint |
| 🟡 Ringan | 6 | Bisa di-backlog |
| **Total** | **16** | |

---

## 🚀 REKOMENDASI DEPLOYMENT

### 1. Fix Bug Kritis Sebelum Deploy
- BUG-001: Implement atomic stock decrement
- BUG-002: Fix auth header pattern
- BUG-003: Add idempotency key
- BUG-004: Add rollback on stock failure

### 2. Optimasi yang Bisa Dilakukan
- Gabungkan duplicate fetch di checkout
- Add input validation layer
- Implement cache invalidation strategy
- Add structured error logging

### 3. Security Hardening
- CSRF di semua POST endpoints
- Rate limit di register endpoint
- robots.txt untuk admin/seller paths
- Audit log untuk semua admin actions

---

*Dokumen ini dibuat otomatis oleh analisis kode.*
