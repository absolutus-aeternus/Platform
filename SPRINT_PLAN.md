# AllianceHub Sprint Plan

**Tanggal Mulai:** 2026-08-18  
**Metodologi:** Agile (3 Sprint × 1 minggu)  
**Goal:** Production-ready launch

---

## 🏃 SPRINT 1: Critical Fixes & Security (Hari ini — 25 Agustus)

**Theme:** "Fix the Foundation"  
**Goal:** Semua BLOCKER resolved, platform aman untuk dipakai

### Deliverables

#### Backend (Priority: CRITICAL)
| # | Task | Estimasi | Assignee | Status |
|---|------|----------|----------|--------|
| 1.1 | Fix CSRF: Frontend kirim `X-CSRF-Token` di semua POST requests | 4 jam | Frontend | ⬜ |
| 1.2 | Tambah CSRF verification ke semua POST endpoints (review, seller, admin) | 3 jam | Backend | ⬜ |
| 1.3 | Pastikan checkout gunakan `decrement_stock()` RPC (bukan loop manual) | 2 jam | Backend | ⬜ |
| 1.4 | Frontend kirim `Idempotency-Key` header di checkout | 2 jam | Frontend | ⬜ |
| 1.5 | Checkout transaction rollback jika stock decrement gagal | 3 jam | Backend | ⬜ |
| 1.6 | Rate limit register endpoint (3 req/min per IP) | 1 jam | Backend | ⬜ |
| 1.7 | Fix konsistensi nama tabel `profiles` vs `users` | 2 jam | DBA | ⬜ |
| 1.8 | Buat `product_comments` table + RLS policy | 1 jam | DBA | ⬜ |
| 1.9 | Tambah RLS policy untuk `seller_products` | 30 menit | DBA | ⬜ |

#### Frontend (Priority: CRITICAL)
| # | Task | Estimasi | Assignee | Status |
|---|------|----------|----------|--------|
| 1.10 | Fix Cart item selection bug (reactive selected state) | 2 jam | Frontend | ⬜ |
| 1.11 | Add Vue error boundary component | 2 jam | Frontend | ⬜ |
| 1.12 | Fix ProductDetail comment replies loading | 2 jam | Frontend | ⬜ |
| 1.13 | Tambah `Disallow` admin/seller di robots.txt | 15 menit | DevOps | ⬜ |

#### Testing
| # | Task | Estimasi | Assignee | Status |
|---|------|----------|----------|--------|
| 1.14 | Manual testing: Register → Login → Browse → Cart → Checkout flow | 2 jam | QA | ⬜ |
| 1.15 | Security testing: CSRF, rate limit, role escalation | 2 jam | QA | ⬜ |

### Sprint 1 Definition of Done
- [ ] Semua BLOCKER di PRODUCTION_CHECKLIST.md sudah ✅
- [ ] Checkout flow berfungsi end-to-end tanpa error
- [ ] Tidak ada security vulnerability kritis
- [ ] Build berhasil tanpa error

### Sprint 1 Risiko
| Risk | Impact | Mitigation |
|------|--------|------------|
| Payment gateway belum ada | Tinggi | Sprint 2 handle; untuk sekarang order status = "pending" manual |
| Tabel `profiles` vs `users` conflict | Tinggi | Audit DB, buat view mapping jika perlu |

---

## 🏃 SPRINT 2: Feature Completion (26 Agustus — 1 September)

**Theme:** "Complete the Experience"  
**Goal:** Semua IMPORTANT features berfungsi, platform siap untuk beta testing

### Deliverables

#### Payment & Orders (Priority: HIGH)
| # | Task | Estimasi | Assignee | Status |
|---|------|----------|----------|--------|
| 2.1 | Integrasi payment gateway (Xendit/Stripe) — minimal 1 provider | 8 jam | Full-stack | ⬜ |
| 2.2 | Implementasi order status flow: `pending → paid → shipped → delivered` | 4 jam | Full-stack | ⬜ |
| 2.3 | Payment webhook endpoint `/api/webhook/payment` | 3 jam | Backend | ⬜ |
| 2.4 | Order cancellation (buyer & seller) | 3 jam | Full-stack | ⬜ |
| 2.5 | Refund processing flow | 4 jam | Backend | ⬜ |

#### Seller Experience (Priority: HIGH)
| # | Task | Estimasi | Assignee | Status |
|---|------|----------|----------|--------|
| 2.6 | Image upload component (B2 presign flow) | 4 jam | Frontend | ⬜ |
| 2.7 | Seller product CRUD lengkap (add, edit, delete, batch) | 6 jam | Full-stack | ⬜ |
| 2.8 | Seller order management (accept, ship, complete) | 4 jam | Full-stack | ⬜ |
| 2.9 | Seller shipping management (set shipping methods) | 3 jam | Full-stack | ⬜ |

#### Buyer Experience (Priority: HIGH)
| # | Task | Estimasi | Assignee | Status |
|---|------|----------|----------|--------|
| 2.10 | Search autocomplete dropdown (pakai Algolia) | 4 jam | Frontend | ⬜ |
| 2.11 | Wishlist/Favorites sync ke Supabase | 3 jam | Frontend | ⬜ |
| 2.12 | Multi-vendor cart grouping (group by seller) | 4 jam | Frontend | ⬜ |
| 2.13 | Coupon/voucher apply di checkout | 6 jam | Full-stack | ⬜ |
| 2.14 | Add address di checkout flow | 2 jam | Frontend | ⬜ |

#### Communication (Priority: MEDIUM)
| # | Task | Estimasi | Assignee | Status |
|---|------|----------|----------|--------|
| 2.15 | Email notifications (order confirmation, status update) | 4 jam | Backend | ⬜ |
| 2.16 | Buyer-seller chat real-time fix | 4 jam | Full-stack | ⬜ |
| 2.17 | Push notification flow (OneSignal) | 3 jam | Full-stack | ⬜ |

#### Bug Fixes from ANALISIS_BUGS.md
| # | Task | Estimasi | Assignee | Status |
|---|------|----------|----------|--------|
| 2.18 | BUG-005: CSRF di semua POST endpoints | 2 jam | Backend | ⬜ |
| 2.19 | BUG-006: Input validation lengkap | 2 jam | Backend | ⬜ |
| 2.20 | BUG-007: Gabungkan duplicate fetch di checkout | 1 jam | Backend | ⬜ |
| 2.21 | BUG-009: Hapus dual router guards | 30 menit | Frontend | ⬜ |
| 2.22 | BUG-013: Cache invalidation strategy | 2 jam | Backend | ⬜ |

### Sprint 2 Definition of Done
- [ ] User bisa checkout dengan payment gateway nyata
- [ ] Seller bisa manage produk (CRUD + upload gambar)
- [ ] Order lifecycle lengkap (pending → delivered)
- [ ] Search autocomplete berfungsi
- [ ] Wishlist tersimpan di database
- [ ] Email notifikasi terkirim

### Sprint 2 Risiko
| Risk | Impact | Mitigation |
|------|--------|------------|
| Payment gateway integration delay | Tinggi | Mulai research & setup merchant account di Sprint 1 |
| Email service setup | Sedang | Gunakan Resend/SendGrid free tier |
| Chat real-time complexity | Sedang | Supabase Realtime sudah tersedia |

---

## 🏃 SPRINT 3: Polish & Launch Prep (2 — 8 September)

**Theme:** "Ship It"  
**Goal:** Platform production-ready, tested, dan optimized

### Deliverables

#### Testing & QA (Priority: CRITICAL)
| # | Task | Estimasi | Assignee | Status |
|---|------|----------|----------|--------|
| 3.1 | Unit tests untuk store actions (user.js) | 4 jam | QA | ⬜ |
| 3.2 | Unit tests untuk worker endpoints | 6 jam | QA | ⬜ |
| 3.3 | E2E tests: Register → Browse → Cart → Checkout → Order | 6 jam | QA | ⬜ |
| 3.4 | Load testing: 50 concurrent checkout | 3 jam | QA | ⬜ |
| 3.5 | Security audit: penetration testing | 4 jam | QA | ⬜ |
| 3.6 | Cross-browser testing (Chrome, Firefox, Safari, Edge) | 3 jam | QA | ⬜ |
| 3.7 | Mobile device testing (iOS Safari, Android Chrome) | 3 jam | QA | ⬜ |

#### Performance & Optimization (Priority: HIGH)
| # | Task | Estimasi | Assignee | Status |
|---|------|----------|----------|--------|
| 3.8 | Bundle size audit & optimization | 3 jam | Frontend | ⬜ |
| 3.9 | Image optimization (Cloudflare Image Resizing) | 2 jam | DevOps | ⬜ |
| 3.10 | Database query optimization (EXPLAIN ANALYZE) | 3 jam | DBA | ⬜ |
| 3.11 | Lighthouse audit → fix issues | 3 jam | Frontend | ⬜ |

#### SEO & Marketing (Priority: MEDIUM)
| # | Task | Estimasi | Assignee | Status |
|---|------|----------|----------|--------|
| 3.12 | Meta tags per halaman (og:image, og:description) | 3 jam | Frontend | ⬜ |
| 3.13 | Sitemap.xml generation | 1 jam | DevOps | ⬜ |
| 3.14 | JSON-LD structured data (Product, Organization) | 3 jam | Frontend | ⬜ |
| 3.15 | robots.txt finalisasi | 15 menit | DevOps | ⬜ |

#### Documentation (Priority: MEDIUM)
| # | Task | Estimasi | Assignee | Status |
|---|------|----------|----------|--------|
| 3.16 | API documentation update (lengkapi semua endpoints) | 3 jam | Backend | ⬜ |
| 3.17 | Deployment guide | 2 jam | DevOps | ⬜ |
| 3.18 | User guide (buyer & seller) | 4 jam | Content | ⬜ |
| 3.19 | Admin guide | 3 jam | Content | ⬜ |

#### Infrastructure (Priority: HIGH)
| # | Task | Estimasi | Assignee | Status |
|---|------|----------|----------|--------|
| 3.20 | Setup monitoring (Sentry untuk error tracking) | 2 jam | DevOps | ⬜ |
| 3.21 | Setup uptime monitoring (UptimeRobot/Healthchecks) | 1 jam | DevOps | ⬜ |
| 3.22 | Database backup cron job | 2 jam | DevOps | ⬜ |
| 3.23 | SSL certificate verification | 30 menit | DevOps | ⬜ |
| 3.24 | Environment variables audit (production) | 1 jam | DevOps | ⬜ |
| 3.25 | DNS & domain finalisasi | 1 jam | DevOps | ⬜ |

#### Final Polish (Priority: MEDIUM)
| # | Task | Estimasi | Assignee | Status |
|---|------|----------|----------|--------|
| 3.26 | Fix semua console errors/warnings | 2 jam | Frontend | ⬜ |
| 3.27 | Accessibility fixes (contrast, aria labels) | 3 jam | Frontend | ⬜ |
| 3.28 | Loading states konsisten | 2 jam | Frontend | ⬜ |
| 3.29 | Error messages user-friendly | 2 jam | Frontend | ⬜ |
| 3.30 | Final visual QA (semua halaman) | 4 jam | QA | ⬜ |

### Sprint 3 Definition of Done
- [ ] Semua critical paths punya test coverage
- [ ] Lighthouse score > 80 semua kategori
- [ ] Tidak ada console errors di production
- [ ] Monitoring & alerting aktif
- [ ] Documentation lengkap
- [ ] Backup strategy verified
- [ ] SSL valid dan auto-renew

### Sprint 3 Risiko
| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance issues ditemukan late | Sedang | Mulai audit di Sprint 2 |
| Test coverage rendah | Sedang | Focus pada critical paths dulu |
| Launch day issues | Tinggi | Rollback plan, feature flags |

---

## 📊 SPRINT VELOCITY & CAPACITY

### Estimated Total Effort
| Sprint | Tasks | Total Jam | Hari Kerja |
|--------|-------|-----------|------------|
| Sprint 1 | 15 | ~30 jam | 5 hari |
| Sprint 2 | 22 | ~75 jam | 5 hari (2 dev) |
| Sprint 3 | 30 | ~70 jam | 5 hari (2 dev) |
| **Total** | **67** | **~175 jam** | **15 hari** |

### Team Requirements
| Role | Jumlah | Sprint 1 | Sprint 2 | Sprint 3 |
|------|--------|----------|----------|----------|
| Frontend Dev | 1-2 | ✅ | ✅ | ✅ |
| Backend Dev | 1 | ✅ | ✅ | ✅ |
| Full-stack Dev | 1 | — | ✅ | ✅ |
| QA/Tester | 1 | ✅ | ✅ | ✅ |
| DevOps | 0.5 | ✅ | ✅ | ✅ |
| DBA | 0.5 | ✅ | — | ✅ |
| Content Writer | 0.5 | — | — | ✅ |

---

## 🎯 MILESTONE

| Milestone | Tanggal | Criteria |
|-----------|---------|----------|
| **M1: Foundation Fixed** | 25 Agustus | Semua blockers resolved, checkout berfungsi |
| **M2: Feature Complete** | 1 September | Payment gateway live, seller CRUD lengkap |
| **M3: Beta Ready** | 5 September | Testing selesai, monitoring aktif |
| **M4: Production Launch** | 8 September | Documentation lengkap, go/no-go decision |

---

## 📋 DAILY STANDUP SCHEDULE

- **Waktu:** Setiap hari 09:00 GMT+8
- **Format:** Apa yang sudah dikerjakan, apa yang akan dikerjakan, blockers
- **Tool:** Update di `DAILY_STANDUP.md`

---

*Last updated: 2026-08-18 21:49 GMT+8*
