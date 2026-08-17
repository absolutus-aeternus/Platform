# AllianceHub — Complete UI/UX Design System Guide
### Multi-Vendor Marketplace Platform

> **Version:** 3.0 | **Framework:** Vue 3 + Pinia | **Baseline Grid:** 8pt  
> **Production:** https://alliancehub.pages.dev / https://alliancehub.dpdns.org  
> **Niche:** B2C Multi-Vendor General Marketplace (Amazon-style)

---

## 1. STRUKTUR NAVIGASI & LAYOUT DUAL-PERSONA

### 1.1 — SISI PEMBELI (Buyer Persona)

#### 1.1.1 — Header Sticky (3-Tier Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│ TIER 1 — Top Bar (h: 32px, bg: #232f3e)                        │
│ [Today's Deals] [Customer Service] [Sell] [🌐 EN ▾]           │
├─────────────────────────────────────────────────────────────────┤
│ TIER 2 — Main Header (h: 60px, bg: #131921)                    │
│ [☰] [LOGO] [ ▾ All | Search AllianceHub    | 🔍 ] [Account]   │
│                                                   [Orders] [🛒]│
├─────────────────────────────────────────────────────────────────┤
│ TIER 3 — Nav Strip (h: 40px, bg: #232f3e)                      │
│ [Today's Deals] [Electronics] [Fashion] [Home] [More ▾]        │
└─────────────────────────────────────────────────────────────────┘
```

**Spesifikasi Teknis:**

| Elemen | Property | Value |
|--------|----------|-------|
| Top Bar | `height` | `32px` |
| Top Bar | `background` | `#232f3e` |
| Top Bar | `font-size` | `12px / 0.75rem` |
| Main Header | `height` | `60px` |
| Main Header | `background` | `#131921` |
| Main Header | `position` | `sticky; top: 0; z-index: 1000` |
| Nav Strip | `height` | `40px` |
| Nav Strip | `background` | `#232f3e` |
| Search Bar | `height` | `40px` |
| Search Bar | `border-radius` | `8px 0 0 8px` (category) / `0 8px 8px 0` (button) |
| Search Bar | `min-width` | `200px` (mobile) → `600px` (desktop) |

#### 1.1.2 — Mega Search Bar dengan Autocompletion

```
┌──────────────────────────────────────────────────────────────┐
│ [▾ All ▾] [ Search AllianceHub...                ] [ 🔍 ]   │
├──────────────────────────────────────────────────────────────┤
│ SUGGESTIONS DROPDOWN (max-height: 400px)                     │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 🔍 "wireless earbuds"                    → 12,340 results│ │
│ │ 🔍 "wireless earbuds bluetooth 5.0"      →  3,210 results│ │
│ │ 🔍 "wireless earbuds noise cancelling"   →  8,450 results│ │
│ ├──────────────────────────────────────────────────────────┤ │
│ │ CATEGORIES                                               │ │
│ │   Electronics > Headphones                               │ │
│ │   Electronics > Audio                                    │ │
│ ├──────────────────────────────────────────────────────────┤ │
│ │ POPULAR PRODUCTS                                         │ │
│ │   [img] Wireless Earbuds Pro — ₱1,299  ⭐4.8            │ │
│ │   [img] SoundCore Liberty 4 — ₱2,499  ⭐4.6             │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Behavior:**
- **Debounce:** `300ms` sebelum trigger Algolia search
- **Max suggestions:** 5 text + 3 categories + 3 products
- **Keyboard nav:** `↑↓` navigate, `Enter` select, `Esc` close
- **Mobile:** Full-width overlay search (expand dari icon 🔍)
- **Cache:** Popular queries cached di client `localStorage` TTL `10min`

#### 1.1.3 — Katalog Produk: 12-Column Grid

```
Desktop (≥1200px):
┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
│    Sidebar    │  Product  │  Product  │  Product  │  Product │
│   (3 col)     │  (3 col)  │  (3 col)  │  (3 col)  │ (3 col) │
│   280px       │           │           │           │          │
└────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘

Tablet (768px–1199px):
┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
│    Sidebar    │ Product  │ Product  │ Product  │ Product  │ Product │
│   (3 col)     │ (3 col)  │ (3 col)  │ (3 col)  │ (3 col) │ (3 col)*│
└────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
* 5th card truncated on narrow tablet

Mobile (<768px):
┌────────────────────────────┐
│  Product Card (full width) │  ← List view
│  Product Card (full width) │
│  Product Card (full width) │
└────────────────────────────┘
```

**Grid Spec:**

| Breakpoint | Container | Columns | Gutter | Card Min-Width |
|------------|-----------|---------|--------|----------------|
| `≥1440px` | `1320px` | 4 (+ sidebar) | `16px` | `280px` |
| `1200px–1439px` | `1140px` | 4 (+ sidebar) | `16px` | `260px` |
| `992px–1199px` | `960px` | 3 (+ sidebar) | `16px` | `280px` |
| `768px–991px` | `720px` | 2 (+ sidebar collapsed) | `12px` | `320px` |
| `<768px` | `100%` | 1 (list) / 2 (grid toggle) | `8px` | `160px` |

**Implementation (CSS Grid):**
```css
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  padding: 16px 0;
}

@media (max-width: 767px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
}
```

#### 1.1.4 — Halaman Detail Produk (Product Detail Page)

```
┌─────────────────────────────────────────────────────────────────┐
│ BREADCRUMB: Home > Electronics > Headphones > [Product Name]    │
├────────────────────────┬────────────────────────────────────────┤
│                        │ PRODUCT INFO                           │
│   MAIN IMAGE           │ Brand: Sony                            │
│   (1:1 ratio)          │ ★★★★☆ (2,345 ratings)                 │
│   500×500px            │ ₱12,999  (was ₱15,999) -20%           │
│                        │                                        │
│ ┌──┬──┬──┬──┬──┐      │ ✓ In Stock — Only 5 left               │
│ │  │  │  │  │  │      │ ✓ Free Shipping (orders >₱500)         │
│ └──┴──┴──┴──┴──┘      │ ✓ 30-Day Warranty                      │
│   THUMBNAILS (5 max)   │                                        │
│                        │ [BUY NOW — ₱12,999]                    │
│                        │ [ADD TO CART]                           │
│                        │ [♡ Wishlist]  [💬 Chat Seller]          │
│                        │                                        │
│                        │ ┌──────────────────────────────────┐   │
│                        │ │ 🏪 Seller: TechZone PH           │   │
│                        │ │ ✓ Verified | ⭐ 4.9 | 1,200 sold │   │
│                        │ │ [Visit Store]                    │   │
│                        │ └──────────────────────────────────┘   │
├────────────────────────┴────────────────────────────────────────┤
│ TABS: [Description] [Specifications] [Reviews (2,345)] [Q&A]    │
├─────────────────────────────────────────────────────────────────┤
│ TAB CONTENT                                                     │
└─────────────────────────────────────────────────────────────────┘
```

#### 1.1.5 — Alur Keranjang Multi-Vendor

```
STEP 1: CART                    STEP 2: CHECKOUT
┌──────────────────────┐       ┌──────────────────────────────┐
│ 🏪 Seller A          │       │ SHIPPING ADDRESS             │
│ [img] Item 1  ₱999  │       │ [Select saved address]       │
│ [img] Item 2  ₱499  │       │ [Add new address]            │
│ Subtotal: ₱1,498    │       ├──────────────────────────────┤
│ Shipping: ₱50       │       │ 🏪 Seller A — ₱1,548         │
├──────────────────────┤       │   [img] Item 1  ₱999         │
│ 🏪 Seller B          │       │   [img] Item 2  ₱499         │
│ [img] Item 3  ₱2,199│       │   Shipping: ₱50 (J&T Express)│
│ Subtotal: ₱2,199    │       │   [Select courier ▾]         │
│ Shipping: ₱80       │       ├──────────────────────────────┤
├──────────────────────┤       │ 🏪 Seller B — ₱2,279         │
│ TOTAL: ₱3,777       │       │   [img] Item 3  ₱2,199       │
│ [PROCEED TO CHECKOUT]│       │   Shipping: ₱80 (LBC)       │
└──────────────────────┘       ├──────────────────────────────┤
                               │ PAYMENT METHOD               │
                               │ ( ) GCash  ( ) Maya          │
                               │ ( ) Credit Card  ( ) COD     │
                               ├──────────────────────────────┤
                               │ ORDER TOTAL: ₱3,827          │
                               │ [PLACE ORDER]                │
                               └──────────────────────────────┘
```

**Multi-Vendor Logic:**
- Cart items **grouped by seller** otomatis
- Shipping cost **dihitung per seller** (bukan flat)
- Voucher/coupon **per seller** atau **platform-wide**
- Split payment: 1 transaksi, internal settlement per seller

---

### 1.2 — SISI PENJUAL (Seller Persona)

#### 1.2.1 — Dashboard Bento Grid Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ SELLER DASHBOARD — BENTO GRID                                   │
├───────────┬───────────┬───────────┬─────────────────────────────┤
│ REVENUE   │ ORDERS    │ PRODUCTS  │ RATING                      │
│ ₱45,230   │ 128       │ 342       │ ⭐ 4.9                      │
│ ↑ 12.5%   │ ↑ 8 today │ 5 low stk │ 2,345 reviews              │
│ [sparkline]│ [sparkline]│[⚠ alert] │ [sparkline]                │
├───────────┴───────────┼───────────┴─────────────────────────────┤
│                       │                                         │
│  SALES CHART          │  QUICK ACTIONS                          │
│  (Area Chart, 30d)    │  ┌──────────┐ ┌──────────┐             │
│  ┌──────────────────┐ │  │ + Add    │ │ Process  │             │
│  │    ╱\    ╱\      │ │  │ Product  │ │ Orders   │             │
│  │   ╱  \  ╱  \    │ │  └──────────┘ └──────────┘             │
│  │  ╱    ╲╱    ╲   │ │  ┌──────────┐ ┌──────────┐             │
│  │ ╱              ╲ │ │  │ View     │ │ Settings │             │
│  └──────────────────┘ │  │ Analytics│ │          │             │
│                       │  └──────────┘ └──────────┘             │
├───────────────────────┴─────────────────────────────────────────┤
│ NEW ORDERS TABLE (max 5 rows)                                   │
│ ┌────────┬──────────┬────────┬───────┬────────┬──────────────┐ │
│ │ Order# │ Customer │ Items  │ Total │ Status │ Action       │ │
│ ├────────┼──────────┼────────┼───────┼────────┼──────────────┤ │
│ │ #12345 │ Juan D.  │ 3      │₱2,499 │Pending │ [Ship] [Chat]│ │
│ │ #12346 │ Maria S. │ 1      │₱899   │Paid    │ [Ship] [Chat]│ │
│ └────────┴──────────┴────────┴───────┴────────┴──────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ LOW STOCK ALERTS                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [img] USB-C Cable — Stock: 2  [Restock →]                  │ │
│ │ [img] Phone Case — Stock: 5  [Restock →]                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Bento Grid CSS Implementation:**
```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto;
  gap: 16px;
}

.bento-stat { grid-column: span 1; }        /* 4 stat cards */
.bento-chart { grid-column: span 2; }       /* sales chart */
.bento-actions { grid-column: span 2; }     /* quick actions */
.bento-table { grid-column: span 4; }       /* orders table */
.bento-alerts { grid-column: span 4; }      /* stock alerts */

@media (max-width: 991px) {
  .bento-grid { grid-template-columns: repeat(2, 1fr); }
  .bento-stat { grid-column: span 1; }
  .bento-chart, .bento-actions { grid-column: span 2; }
  .bento-table, .bento-alerts { grid-column: span 2; }
}

@media (max-width: 575px) {
  .bento-grid { grid-template-columns: 1fr; }
  .bento-stat, .bento-chart, .bento-actions,
  .bento-table, .bento-alerts { grid-column: span 1; }
}
```

---

## 2. SKEMA WARNA & ELEMENT TRUST

### 2.1 — Color Palette

#### Primary Colors

| Token | Name | HEX | RGB | Contrast on White | Contrast on Dark | Usage |
|-------|------|-----|-----|-------------------|------------------|-------|
| `--brand-primary` | Amber Gold | `#FF9900` | `255,153,0` | **3.8:1** ⚠️ | 5.5:1 ✅ | CTA buttons, highlights |
| `--brand-primary-hover` | Amber Dark | `#E68A00` | `230,138,0` | 4.6:1 ✅ | 4.8:1 ✅ | Hover state |
| `--brand-primary-light` | Amber Tint | `#FFF4E6` | `255,244,230` | 1.1:1 | N/A | Backgrounds, badges |
| `--brand-dark` | Navy Black | `#131921` | `19,25,33` | 14.5:1 ✅ | N/A | Header, footer |
| `--brand-nav` | Dark Slate | `#232F3E` | `35,47,62` | 11.2:1 ✅ | N/A | Nav bar, top bar |
| `--brand-accent` | Teal | `#007185` | `0,113,133` | 4.7:1 ✅ | 4.5:1 ✅ | Links, info |

#### Neutral Scale

| Token | HEX | Usage |
|-------|-----|-------|
| `--neutral-900` | `#0F1111` | Primary text |
| `--neutral-700` | `#565959` | Secondary text |
| `--neutral-500` | `#888888` | Muted/disabled text |
| `--neutral-300` | `#D5D9D9` | Borders, dividers |
| `--neutral-200` | `#E7E7E7` | Light borders |
| `--neutral-100` | `#F5F5F5` | Card backgrounds |
| `--neutral-50` | `#FAFAFA` | Page background (alt) |
| `--white` | `#FFFFFF` | Cards, inputs |

#### Alert / Status Colors (WCAG AA Compliant)

| Status | HEX | Text on White | Background Tint | Icon |
|--------|-----|---------------|-----------------|------|
| **Success** | `#067D62` | 4.9:1 ✅ | `#E6F7F2` | ✓ checkmark |
| **Warning** | `#B45309` | 4.6:1 ✅ | `#FEF3C7` | ⚠ triangle |
| **Error** | `#CC0C39` | 5.7:1 ✅ | `#FEE2E9` | ✕ cross |
| **Info** | `#007185` | 4.7:1 ✅ | `#E0F2F5` | ℹ circle |

#### Dark Mode Tokens

```css
[data-theme="dark"] {
  --brand-primary: #FF9900;           /* unchanged */
  --brand-primary-hover: #FFAD33;     /* lighter for dark bg */
  --brand-primary-light: #2a2000;     /* dark amber tint */
  --bg: #0f0f23;
  --bg-light: #16213e;
  --bg-card: #1a1a2e;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0a0;
  --text-muted: #666666;
  --border: #333333;
  --border-light: #222222;
  --success: #34D399;
  --warning: #FBBF24;
  --error: #F87171;
}
```

### 2.2 — Element Trust: Visual Rules

#### Verified Seller Badge

```
┌──────────────────────────────────────┐
│ 🏪 TechZone PH  ✓ Verified          │  ← Badge inline dengan nama
│    ⭐ 4.9 · 1,200 sales · Joined 2022│
└──────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Badge bg | `#007185` (teal) |
| Badge text | `#FFFFFF` |
| Badge shape | `pill` (`border-radius: 9999px`) |
| Badge size | `height: 20px; font-size: 11px; padding: 0 8px` |
| Icon | `✓` or `fas fa-check-circle` |
| Placement | After seller name, always visible |

#### Rating & Review System

```
★★★★☆  4.8  (2,345 reviews)
├── 5★ ████████████████████  78%
├── 4★ ████████              15%
├── 3★ ██                     4%
├── 2★ █                      2%
└── 1★ █                      1%
```

| Element | Spec |
|---------|------|
| Star filled | `#FF9900` |
| Star empty | `#D5D9D9` |
| Star size (card) | `14px` |
| Star size (detail) | `18px` |
| Rating number | `font-weight: 700; color: #0F1111` |
| Review count | `font-size: 12px; color: #007185; cursor: pointer` |

#### Badge Garansi

```
┌─────────────────────────┐
│ 🛡️ 30-Day Warranty      │  ← di Product Detail
│ ✓ Money-back guarantee  │
│ ✓ Free returns          │
└─────────────────────────┘
```

| Property | Value |
|----------|-------|
| Container bg | `#E6F7F2` (success tint) |
| Icon | `🛡️` or `fas fa-shield-alt` |
| Text color | `#067D62` |
| Border | `1px solid #067D62; border-radius: 8px` |
| Padding | `12px 16px` |

#### Tag Diskon

```
-20%    atau    SAVE ₱3,000
```

| Variant | BG | Text | Size | Shape |
|---------|-----|------|------|-------|
| Percent off | `#CC0C39` | `#FFFFFF` | `12px bold` | `pill` |
| Amount off | `#CC0C39` | `#FFFFFF` | `12px bold` | `pill` |
| Flash sale | `#FF9900` | `#131921` | `14px 800` | `pill + pulse` |
| New arrival | `#007185` | `#FFFFFF` | `11px 600` | `pill` |

---

## 3. TIPOGRAFI, GRID & SPACING

### 3.1 — Typography System

#### Font Stack

| Role | Font | Fallback |
|------|------|----------|
| **Display / Hero** | `Inter` | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` |
| **Body** | `Inter` | same as above |
| **Mono / Code** | `JetBrains Mono` | `"Fira Code", "Courier New", monospace` |

**Google Fonts Import:**
```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");
```

#### Type Scale (rem ↔ px)

| Token | rem | px | Weight | Line Height | Letter Spacing | Usage |
|-------|-----|----|--------|-------------|----------------|-------|
| `--text-display` | `2.25rem` | `36px` | `800` | `1.1` | `-0.02em` | Hero headline |
| `--text-h1` | `1.5rem` | `24px` | `700` | `1.2` | `-0.01em` | Page title |
| `--text-h2` | `1.25rem` | `20px` | `700` | `1.3` | `0` | Section title |
| `--text-h3` | `1.125rem` | `18px` | `600` | `1.4` | `0` | Card title |
| `--text-h4` | `1rem` | `16px` | `600` | `1.5` | `0` | Subsection |
| `--text-body` | `0.875rem` | `14px` | `400` | `1.6` | `0` | Body text |
| `--text-body-lg` | `1rem` | `16px` | `400` | `1.6` | `0` | Featured body |
| `--text-small` | `0.75rem` | `12px` | `400` | `1.5` | `0.01em` | Captions, meta |
| `--text-xs` | `0.6875rem` | `11px` | `400` | `1.4` | `0.02em` | Badges, tags |
| `--text-price` | `1.25rem` | `20px` | `700` | `1.2` | `0` | Price display |
| `--text-price-old` | `0.875rem` | `14px` | `400` | `1.6` | `0` | Strikethrough price |

#### Price Hierarchy (Product Card)

```
₱12,999          ← Main price: 20px, weight 700, color #CC0C39
₱15,999 -20%     ← Original: 14px, weight 400, color #888, text-decoration: line-through
                   Discount tag: 12px, weight 700, bg #CC0C39, text #FFF, pill
```

### 3.2 — 8pt Grid System

#### Spacing Scale

| Token | px | rem | Usage |
|-------|-----|-----|-------|
| `--space-0` | `0px` | `0` | Reset |
| `--space-1` | `4px` | `0.25rem` | Tight padding (badges) |
| `--space-2` | `8px` | `0.5rem` | Inner padding, icon gaps |
| `--space-3` | `12px` | `0.75rem` | Card inner padding (mobile) |
| `--space-4` | `16px` | `1rem` | Card padding, grid gutter |
| `--space-5` | `24px` | `1.5rem` | Section gap, form spacing |
| `--space-6` | `32px` | `2rem` | Section padding |
| `--space-7` | `48px` | `3rem` | Major section dividers |
| `--space-8` | `64px` | `4rem` | Hero spacing |
| `--space-9` | `96px` | `6rem` | Page-level spacing |

#### Spacing Application Rules

| Context | Padding | Gap | Margin |
|---------|---------|-----|--------|
| Product Card | `12px` (mobile) / `16px` (desktop) | — | — |
| Grid gap (product) | — | `16px` (desktop) / `8px` (mobile) | — |
| Section padding | `32px` top/bottom | — | — |
| Card-to-card | — | — | `16px` vertical |
| Sidebar width | — | — | `280px` fixed |
| Container max-width | — | — | `1200px` |
| Container padding | `0 16px` (desktop) / `0 12px` (mobile) | — | — |

---

## 4. KOMPONEN UI & HIRARKI VISUAL

### 4.1 — Product Card Component

```
┌──────────────────────────────┐
│ ┌──────────────────────────┐ │  ← Image: aspect-ratio 1/1
│ │                          │ │     object-fit: contain
│ │      [PRODUCT IMAGE]     │ │     background: #f7f7f7
│ │       1:1 ratio          │ │
│ │                          │ │
│ └──────────────────────────┘ │
│ ┌────────┐                   │
│ │ -20%   │  ← Discount tag   │  Position: absolute; top: 8px; left: 8px
│ └────────┘                   │
│ ♡                            │  ← Wishlist: absolute; top: 8px; right: 8px
│                              │
│ Sony WH-1000XM5 Wireless... │  ← Title: 14px/500, clamp 2 lines
│ ★★★★☆ 2,345                 │  ← Rating: 12px stars + count
│ ₱12,999  ₱15,999            │  ← Price: 20px/700 + 14px/400 strikethrough
│ 🏪 TechZone PH ✓ Verified   │  ← Seller: 12px, muted
│ 📍 Metro Manila              │  ← Location: 11px, muted
│ [Add to Cart]                │  ← CTA: appears on hover (desktop), always visible (mobile)
└──────────────────────────────┘
```

**Product Card CSS:**
```css
.product-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);    /* 8px */
  overflow: hidden;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  box-shadow: var(--shadow-lg);       /* 0 8px 24px rgba(0,0,0,0.12) */
  transform: translateY(-2px);
}

.product-card__image {
  aspect-ratio: 1 / 1;
  background: #f7f7f7;
  object-fit: contain;
  padding: 8px;
  width: 100%;
}

.product-card__body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.product-card__title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card__price {
  font-size: 20px;
  font-weight: 700;
  color: #CC0C39;
}

.product-card__price--original {
  font-size: 14px;
  font-weight: 400;
  color: var(--text-muted);
  text-decoration: line-through;
  margin-left: 8px;
}

.product-card__seller {
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.product-card__cta {
  opacity: 0;
  transition: opacity 0.2s;
  margin-top: auto;
  padding-top: 8px;
}

.product-card:hover .product-card__cta {
  opacity: 1;
}

@media (max-width: 767px) {
  .product-card__cta { opacity: 1; }  /* always visible on mobile */
}
```

### 4.2 — CTA Button Hierarchy

#### Primary CTA (Buy Now / Place Order)

```css
.btn-primary {
  background: var(--brand-primary);          /* #FF9900 */
  color: var(--brand-dark);                  /* #131921 */
  font-size: 14px;
  font-weight: 700;
  padding: 10px 24px;
  border: none;
  border-radius: var(--radius-full);         /* 9999px */
  cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s;
  min-height: 40px;
}

.btn-primary:hover {
  background: var(--brand-primary-hover);    /* #E68A00 */
  box-shadow: 0 2px 8px rgba(255,153,0,0.3);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-primary--lg {
  font-size: 16px;
  padding: 14px 32px;
  min-height: 48px;
}

.btn-primary--full {
  width: 100%;
}
```

#### Secondary CTA (Add to Cart / Chat Seller)

```css
.btn-secondary {
  background: var(--brand-primary-light);    /* #FFF4E6 */
  color: var(--brand-dark);                  /* #131921 */
  font-size: 14px;
  font-weight: 600;
  padding: 10px 24px;
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background 0.15s;
  min-height: 40px;
}

.btn-secondary:hover {
  background: var(--brand-primary);
  color: var(--brand-dark);
}
```

#### Tertiary / Ghost (Wishlist, Chat Seller)

```css
.btn-ghost {
  background: transparent;
  color: var(--brand-accent);                /* #007185 */
  font-size: 13px;
  font-weight: 500;
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  min-height: 36px;
}

.btn-ghost:hover {
  background: var(--bg-light);
  border-color: var(--brand-accent);
}
```

#### Button Hierarchy Visual Summary

```
Priority 1: [ BUY NOW — ₱12,999 ]     ← bg:#FF9900, text:#131921, bold, full-width
Priority 2: [ ADD TO CART ]            ← bg:#FFF4E6, border:#FF9900, semi-bold
Priority 3: [ ♡ Wishlist ] [ 💬 Chat ] ← bg:transparent, border:#D5D9D9, medium
```

### 4.3 — White Space Strategy

**Problem:** Marketplace katalog cenderung padat → mata cepat lelah.

**Solution Rules:**

| Rule | Implementation |
|------|----------------|
| **Card internal breathing** | `padding: 12px–16px` inside cards; `gap: 4px–8px` between text elements |
| **Grid gutter** | `16px` desktop, `8px` mobile — prevents cards from touching |
| **Section separator** | `32px–48px` vertical margin between page sections |
| **Sidebar ↔ content** | `24px` gap between filter sidebar and product grid |
| **Image ↔ text** | `8px` gap between product image and card body |
| **Price ↔ seller** | `8px` gap between price block and seller info |
| **CTA group** | `8px` gap between primary and secondary buttons |
| **Batch spacing** | Every 4th card row, add extra `8px` bottom margin (visual rest) |

**Negative Space Ratio Target:**
- Product grid area: **30–35% white space** (not occupied by cards)
- Card internal: **25–30% white space** (padding + gaps)
- Page-level: **40%+ white space** above/below main content

---

## 5. PROMPT GENERASI VISUAL (AI IMAGE GENERATION)

### Prompt 1 — Homepage Marketplace (Desktop UI)

```
A modern e-commerce marketplace homepage UI design, desktop viewport 1440px wide, 
Amazon-inspired dark navy header (#131921) with amber gold (#FF9900) accent buttons 
and search bar. Top navigation bar with "Today's Deals", "Customer Service", language 
selector. Main header with AllianceHub logo, large search bar with category dropdown 
and search button. Below: hero banner carousel with promotional deals, then a 
4-column product grid with white cards showing product images (1:1 ratio), star 
ratings in amber, prices in red (#CC0C39), seller badges with teal (#007185) 
verified checkmarks. Sidebar with category filters. Clean 8pt grid spacing, Inter 
font, light gray (#EAEDED) background. Professional UI/UX design, Dribbble quality, 
Figma mockup style, sharp details, no text artifacts --ar 16:9 --v 6
```

### Prompt 2 — Seller Dashboard Analytics (Dark & Light Mode)

```
Split-screen UI design showing a seller analytics dashboard in two modes. Left side: 
dark mode with deep navy background (#0f0f23), card components with subtle borders 
(#333), amber gold (#FF9900) chart lines and accent colors, Bento Grid layout with 
4 stat cards (Revenue, Orders, Products, Rating), area chart showing 30-day sales 
trend, quick action buttons, and order management table. Right side: light mode with 
white (#FFFFFF) cards on light gray (#EAEDED) background, same layout but with 
dark text (#0F1111) and teal (#007185) links. Both sides show the same data with 
consistent typography (Inter font), 8pt grid spacing, rounded corners (8px), 
subtle shadows. Modern SaaS dashboard design, clean data visualization, 
Dribbble/Behance quality --ar 16:9 --v 6
```

### Prompt 3 — Multi-Vendor Checkout Page

```
E-commerce multi-vendor checkout page UI design, desktop viewport, clean modern 
layout. Left column: shipping address form with input fields, then order summary 
grouped by seller — "Seller A" section with 2 product items, subtotal, and shipping 
courier dropdown (J&T Express), "Seller B" section with 1 product item and LBC 
shipping. Right column: payment method selection with radio buttons for GCash, 
Maya, Credit Card, Cash on Delivery. Bottom: order total breakdown (subtotal per 
seller, shipping per seller, platform fee, grand total), large amber "Place Order" 
button (#FF9900). Trust badges: shield icons, SSL lock, money-back guarantee. 
White cards on light gray background, Inter font, 8px grid, professional UI design, 
Figma mockup style, sharp crisp details --ar 4:3 --v 6
```

---

## APPENDIX A — CSS Variable Reference (Copy-Paste Ready)

```css
:root {
  /* === Brand === */
  --brand-primary: #FF9900;
  --brand-primary-hover: #E68A00;
  --brand-primary-light: #FFF4E6;
  --brand-dark: #131921;
  --brand-darker: #0D1117;
  --brand-nav: #232F3E;
  --brand-accent: #007185;
  --brand-accent-hover: #C75000;

  /* === Status === */
  --success: #067D62;
  --success-bg: #E6F7F2;
  --warning: #B45309;
  --warning-bg: #FEF3C7;
  --danger: #CC0C39;
  --danger-bg: #FEE2E9;
  --info: #007185;
  --info-bg: #E0F2F5;

  /* === Neutral === */
  --text-primary: #0F1111;
  --text-secondary: #565959;
  --text-muted: #888888;
  --text-link: #007185;
  --text-link-hover: #C75000;
  --bg: #EAEDED;
  --bg-white: #FFFFFF;
  --bg-card: #FFFFFF;
  --border: #D5D9D9;
  --border-light: #E7E7E7;

  /* === Shadows === */
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
  --shadow-xl: 0 16px 48px rgba(0,0,0,0.16);

  /* === Radius === */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* === Spacing (8pt grid) === */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;

  /* === Typography === */
  --text-display: 2.25rem;
  --text-h1: 1.5rem;
  --text-h2: 1.25rem;
  --text-h3: 1.125rem;
  --text-h4: 1rem;
  --text-body: 0.875rem;
  --text-body-lg: 1rem;
  --text-small: 0.75rem;
  --text-xs: 0.6875rem;

  /* === Layout === */
  --container-max: 1200px;
  --sidebar-width: 280px;
  --header-height: 60px;
  --topbar-height: 32px;
  --navstrip-height: 40px;
  --grid-gutter: 16px;
  --grid-gutter-mobile: 8px;
}
```

---

## APPENDIX B — Component Checklist

| Component | Status | File |
|-----------|--------|------|
| Product Card | ✅ Exists | `src/components/` |
| Search Bar | ✅ Exists | `src/layouts/MainLayout.vue` |
| Header (3-tier) | ✅ Exists | `src/layouts/MainLayout.vue` |
| Seller Dashboard | ✅ Exists | `src/views/seller/Dashboard.vue` |
| Cart | ✅ Exists | `src/views/Cart.vue` |
| Checkout | ✅ Exists | `src/views/Checkout.vue` |
| Dark Mode | ✅ Exists | `design-system.css` |
| Trust Badges | ⚠️ Partial | Need standardization |
| Rating Component | ⚠️ Partial | Need reusable component |
| Bento Grid | ⚠️ Partial | Dashboard needs refactor |
| Autocomplete Search | ⚠️ Partial | Algolia integration exists |

---

## APPENDIX C — WCAG AA Contrast Audit

| Combination | Ratio | Pass? |
|-------------|-------|-------|
| `#FF9900` on `#FFFFFF` | 3.8:1 | ⚠️ Fail AA normal text (needs ≥4.5:1) — **Use `#E68A00` (4.6:1) for text** |
| `#FF9900` on `#131921` | 5.5:1 | ✅ Pass |
| `#0F1111` on `#FFFFFF` | 18.5:1 | ✅ Pass |
| `#565959` on `#FFFFFF` | 5.7:1 | ✅ Pass |
| `#888888` on `#FFFFFF` | 3.5:1 | ⚠️ Fail — **Use only for decorative, non-essential text** |
| `#067D62` on `#FFFFFF` | 4.9:1 | ✅ Pass |
| `#CC0C39` on `#FFFFFF` | 5.7:1 | ✅ Pass |
| `#007185` on `#FFFFFF` | 4.7:1 | ✅ Pass |

**Action Items:**
1. **`#FF9900` on white:** Do NOT use for body text. Use for buttons (large text ≥18px bold, which passes at 3:1) or use `#E68A00` for smaller text.
2. **`#888888` on white:** Only for disabled states or decorative elements, never for essential content.

---

*Document generated for AllianceHub Platform v3.0 — Vue 3 + Cloudflare Workers stack.*
*Last updated: 2026-08-17*
