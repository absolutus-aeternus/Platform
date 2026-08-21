}</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const showAuth = ref(false)
const authTab = ref('register')
const authEmail = ref('')
const authPassword = ref('')
const authName = ref('')
const authReferral = ref('')
const authError = ref('')
const authSuccess = ref('')
const authLoading = ref(false)
const openFaq = ref(-1)

const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }

const howSteps = [
  { icon: 'fas fa-user-plus', title: 'Daftar Akun', desc: 'Buat akun gratis dalam 1 menit. Tanpa biaya pendaftaran.', color: 'rgba(255,77,0,0.15)' },
  { icon: 'fas fa-tasks', title: 'Pilih Tugas', desc: 'Pilih tugas yang tersedia sesuai kemampuan dan waktu kamu.', color: 'rgba(0,230,138,0.15)' },
  { icon: 'fas fa-check-circle', title: 'Selesaikan Tugas', desc: 'Ikuti instruksi, selesaikan tugas, dan kirim bukti.', color: 'rgba(124,92,255,0.15)' },
  { icon: 'fas fa-wallet', title: 'Terima Komisi', desc: 'Komisi langsung masuk ke dompet digital You.', color: 'rgba(0,180,216,0.15)' },
]

const programs = [
  { icon: 'fas fa-star', title: 'Rating Produk', amount: '$5 - $50', desc: 'Beri rating dan review produk di marketplace.', bg: 'rgba(255,77,0,0.15)', color: 'var(--brand-primary-hover, #E68A00)' },
  { icon: 'fas fa-shopping-cart', title: 'Mystery Shopper', amount: '$10 - $100', desc: 'Beli produk dan berikan feedback detail.', bg: 'rgba(0,230,138,0.15)', color: '#00e68a' },
  { icon: 'fas fa-share-alt', title: 'Social Meina', amount: '$3 - $30', desc: 'Bagikan konten dan dapatkan komisi per interaksi.', bg: 'rgba(124,92,255,0.15)', color: '#7c5cff' },
]

const testimonials = [
  { name: 'Sari Dewi', role: 'Partner sejak 2024', text: 'Dalam 2 month, saya already earning lebih from $500. Sangat flexible dan can dilakukan dari rumah.', color: 'var(--brand-primary-hover, #E68A00)' },
  { name: 'Buin Santoso', role: 'Partner sejak 2023', text: 'At first I was stoptical, but it really pays. Sekarang ini penghasilan utama saya.', color: '#00e68a' },
  { name: 'Maya Putri', role: 'Partner sejak 2024', text: 'Tugasnya mudah dan jelas. Dukungan team also very responsive. Sangat direkomendasikan!', color: '#7c5cff' },
]

const faqs = [
  { q: 'Apakah true-true gratis?', a: 'Ya, pendaftaran 100% gratis. Tidak ada biaya tersembunyi.' },
  { q: 'Bagaimana cara mencairkan komisi?', a: 'Commission can ditarik ke rekening bank or dompet digital kapan saja.' },
  { q: 'Berapa old proses pencairan?', a: 'Proses pencairan instan untuk dompet digital, 1-2 hari untuk bank.' },
  { q: 'Apakah ada batasan waktu?', a: 'Tidak ada. Kamu bisa mengerjakan tugas kapan saja sesuai waktu luang.' },
]

const handleLogin = async () => {
  authError.value = ''
  authLoading.value = true
  try {
    const result = await userStore.login(authEmail.value, authPassword.value)
    if (result.success) {
      showAuth.value = false
      router.push('/user')
    } else {
      authError.value = result.msg || 'Login gagal'
    }
  } catch (e) { authError.value = 'Terjadi kesalahan' }
  authLoading.value = false
}

const handleDaftar = async () => {
  authError.value = ''
  authLoading.value = true
  try {
    const result = await userStore.register(authEmail.value, authPassword.value)
    if (result.success) {
      authSuccess.value = 'Akun berhasil dibuat! Silakan login.'
      authTab.value = 'login'
    } else {
      authError.value = result.msg || 'Registrasi gagal'
    }
  } catch (e) { authError.value = 'Terjadi kesalahan' }
  authLoading.value = false
}
</template>

</script>

<style scoped>
/* ===== GLOBAL ===== */
.rplus-page { font-family: 'Inter', sans-serif; background: #0a0a12; color: #f0ece6; overflow-x: hidden; }
.bg-mesh { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(ellipse 80% 60% at 20% 10%, rgba(255,77,0,.08) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 90%, rgba(124,92,255,.06) 0%, transparent 50%); }
.accent { color: var(--brand-primary-hover, #E68A00); } .inm { color: rgba(240,236,230,.5); } .green { color: #00e68a; }
.section-header { text-align: center; margin-bottom: 2.5rem; }
.section-tag { display: inline-block; padding: 4px 14px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
.section-tag.orange { background: rgba(255,77,0,0.1); color: var(--brand-primary-hover, #E68A00); border: 1px solid rgba(255,77,0,0.2); }
.section-tag.purple { background: rgba(124,92,255,0.1); color: #7c5cff; border: 1px solid rgba(124,92,255,0.2); }
.section-title { font-size: 1.75rem; font-weight: 800; margin-bottom: 8px; }
.section-desc { color: rgba(240,236,230,0.5); font-size: 0.875rem; }

/* ===== HERO ===== */
.hero { min-height: 100dvh; display: flex; align-items: center; justify-content: center; padding: 100px 20px 60px; position: relative; }
.hero::before { content: ''; position: absolute; top: -30%; right: -20%; width: 700px; height: 700px; border-radius: 50%; background: radial-gradient(circle, rgba(255,77,0,.15), transparent 60%); pointer-events: none; filter: blur(60px); }
.hero-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; max-width: 1100px; align-items: center; position: relative; z-index: 2; }
.hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 100px; background: rgba(255,77,0,0.1); border: 1px solid rgba(255,77,0,0.2); font-size: 0.72rem; font-weight: 700; color: var(--brand-primary-hover, #E68A00); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px; }
.hero-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--brand-primary-hover, #E68A00); animation: blink 2s infinite; }
@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
.hero h1 { font-size: 2.5rem; font-weight: 800; line-height: 1.2; margin-bottom: 16px; }
.hero-sub { color: rgba(240,236,230,0.7); font-size: 0.9375rem; line-height: 1.6; margin-bottom: 24px; max-width: 480px; }
.hero-cta-row { display: flex; gap: 12px; margin-bottom: 32px; }
.hero-cta { padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 0.9375rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.3s; border: none; font-family: inherit; }
.hero-cta.pulse-btn { background: linear-gradient(135deg, var(--brand-primary-hover, #E68A00), #ff6b3d); color: #fff; box-shadow: 0 4px 16px rgba(255,77,0,0.25); }
.hero-cta.pulse-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,77,0,0.35); }
.hero-cta.secondary { background: rgba(255,255,255,0.06); color: #f0ece6; border: 1px solid rgba(255,255,255,0.1); }
.hero-cta.secondary:hover { border-color: var(--brand-primary-hover, #E68A00); color: var(--brand-primary-hover, #E68A00); }
.hero-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.hero-stat { text-align: center; }
.hero-stat .num { font-size: 1.5rem; font-weight: 800; color: var(--brand-primary-hover, #E68A00); }
.hero-stat .label { font-size: 0.75rem; color: rgba(240,236,230,0.5); }

/* Mockup */
.hero-mockup { position: relative; }
.hero-mockup-main { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; backdrop-filter: blur(20px); }
.mockup-screen { background: #0f0f1a; border-radius: 12px; overflow: hidden; }
.mockup-header { display: flex; gap: 6px; padding: 12px 16px; background: rgba(255,255,255,0.03); }
.mockup-dot { width: 8px; height: 8px; border-radius: 50%; }
.mockup-dot.green { background: #00e68a; } .mockup-dot.yellow { background: #f5a623; } .mockup-dot.red { background: #ff3b5c; }
.mockup-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.mockup-task { display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 10px; }
.task-check { width: 28px; height: 28px; border-radius: 8px; background: rgba(0,230,138,0.15); display: flex; align-items: center; justify-content: center; color: #00e68a; font-size: 0.75rem; }
.task-info { flex: 1; }
.task-title { height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-bottom: 6px; width: 70%; }
.task-amount { height: 8px; background: rgba(255,77,0,0.2); border-radius: 4px; width: 40%; }
.hero-mockup-float { position: absolute; background: rgba(15,15,26,0.9); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 10px; backdrop-filter: blur(20px); }
.hero-mockup-float.f1 { right: -10px; top: 20px; }
.hero-mockup-float.f2 { left: -10px; bottom: 30px; }
.float-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(0,230,138,0.15); display: flex; align-items: center; justify-content: center; color: #00e68a; }
.float-text h4 { font-size: 0.75rem; font-weight: 700; margin-bottom: 2px; }
.float-text p { font-size: 0.625rem; color: rgba(240,236,230,0.5); }

/* ===== ABOUT ===== */
.about { padding: 80px 20px; background: #0a0a12; }
.about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; max-width: 1100px; margin: 0 auto; align-items: center; }
.about-img-wrap { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 40px; text-align: center; }
.big-r { font-size: 6rem; font-weight: 900; background: linear-gradient(135deg, var(--brand-primary-hover, #E68A00), #7c5cff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.about-img-badge { display: flex; align-items: center; gap: 12px; margin-top: 16px; padding: 12px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; }
.about-img-badge .icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(0,230,138,0.15); display: flex; align-items: center; justify-content: center; color: #00e68a; }
.about-img-badge h4 { font-size: 0.8125rem; margin-bottom: 2px; }
.about-img-badge p { font-size: 0.6875rem; color: rgba(240,236,230,0.5); margin: 0; }
.about-content h2 { font-size: 1.75rem; font-weight: 800; margin-bottom: 12px; }
.about-content > p { color: rgba(240,236,230,0.7); line-height: 1.7; margin-bottom: 24px; }
.about-features { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.about-feat { display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 10px; }
.about-feat .ico { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--brand-primary-hover, #E68A00); background: rgba(255,77,0,0.1); }
.about-feat span { font-size: 0.8125rem; font-weight: 600; }

/* ===== HOW ===== */
.how { padding: 80px 20px; background: #0f0f1a; }
.how-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; max-width: 1000px; margin: 0 auto; }
.how-step { text-align: center; padding: 24px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; position: relative; }
.step-num { position: absolute; top: -8px; left: -8px; width: 28px; height: 28px; background: var(--brand-primary-hover, #E68A00); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.75rem; }
.step-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-size: 1.25rem; color: #fff; }
.how-step h3 { font-size: 0.9375rem; font-weight: 700; margin-bottom: 6px; }
.how-step p { font-size: 0.75rem; color: rgba(240,236,230,0.5); line-height: 1.5; }

/* ===== PROGRAM ===== */
.program { padding: 80px 20px; background: #0a0a12; }
.program-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 1000px; margin: 0 auto; }
.program-card { padding: 24px 16px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); text-align: center; transition: all 0.4s; backdrop-filter: blur(20px); }
.program-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(0,0,0,0.3); }
.program-card .card-icon { width: 48px; height: 48px; border-radius: 12px; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; color: #fff; }
.program-card h3 { font-size: 0.85rem; font-weight: 800; margin-bottom: 3px; }
.program-card .highlight { font-size: 1.2rem; font-weight: 900; margin: 6px 0; }
.program-card p { font-size: 0.7rem; color: rgba(240,236,230,0.5); line-height: 1.5; }

/* ===== TESTIMONIALS ===== */
.testimoni { padding: 80px 20px; background: #0f0f1a; }
.testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 1100px; margin: 0 auto; }
.testi-card { padding: 24px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; }
.testi-stars { color: #f5a623; font-size: 0.75rem; margin-bottom: 12px; }
.testi-text { font-size: 0.8125rem; color: rgba(240,236,230,0.7); line-height: 1.6; margin-bottom: 16px; font-style: italic; }
.testi-author { display: flex; align-items: center; gap: 10px; }
.testi-author .avatar { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.75rem; }
.testi-author h4 { font-size: 0.8125rem; margin-bottom: 2px; }
.testi-author p { font-size: 0.6875rem; color: rgba(240,236,230,0.5); margin: 0; }

/* ===== FAQ ===== */
.faq { padding: 80px 20px; background: #0a0a12; }
.faq-list { max-width: 700px; margin: 0 auto; display: flex; flex-direction: column; gap: 8px; }
.faq-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; cursor: pointer; overflow: hidden; }
.faq-q { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; font-weight: 600; font-size: 0.875rem; }
.faq-q i { color: rgba(240,236,230,0.3); font-size: 0.75rem; }
.faq-a { padding: 0 20px 16px; font-size: 0.8125rem; color: rgba(240,236,230,0.6); line-height: 1.6; }

/* ===== CTA ===== */
.cta-section { padding: 80px 20px; text-align: center; background: linear-gradient(180deg, #0a0a12, #0f0f1a); }
.cta-section h2 { font-size: 2rem; font-weight: 800; margin-bottom: 12px; }
.cta-section p { color: rgba(240,236,230,0.5); margin-bottom: 24px; }

/* ===== AUTH MODAL ===== */
.auth-overlay { position: fixed; inset: 0; z-index: 950; background: rgba(10,10,18,0.95); display: flex; align-items: center; justify-content: center; padding: 20px; }
.auth-card { width: 100%; max-width: 420px; background: rgba(15,15,26,0.92); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5); backdrop-filter: blur(40px); position: relative; }
.auth-close { position: absolute; top: 16px; right: 16px; background: none; border: none; color: rgba(240,236,230,0.5); cursor: pointer; font-size: 1.25rem; z-index: 2; }
.auth-header { padding: 28px 28px 0; text-align: center; }
.auth-brand { width: 56px; height: 56px; border-radius: 16px; margin: 0 auto 16px; background: linear-gradient(135deg, var(--brand-primary-hover, #E68A00), #7c5cff); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 900; color: #fff; box-shadow: 0 8px 24px rgba(255,77,0,0.25); }
.auth-header h2 { font-size: 1.25rem; font-weight: 800; margin-bottom: 6px; }
.auth-header p { font-size: 0.8125rem; color: rgba(240,236,230,0.5); }
.auth-tabs { display: flex; gap: 3px; background: rgba(255,255,255,0.04); border-radius: 12px; padding: 4px; margin: 20px 28px 0; }
.auth-tabs button { flex: 1; padding: 10px; border-radius: 10px; border: none; background: transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; color: rgba(240,236,230,0.5); transition: all 0.25s; }
.auth-tabs button.active { background: rgba(255,255,255,0.08); color: #f0ece6; }
.auth-body { padding: 16px 28px 28px; }
.field { margin-bottom: 14px; }
.field label { display: block; font-size: 0.75rem; font-weight: 600; margin-bottom: 6px; color: rgba(240,236,230,0.5); text-transform: uppercase; letter-spacing: 0.04em; }
.field input { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); font-family: inherit; font-size: 0.875rem; outline: none; transition: all 0.3s; color: #f0ece6; box-sizing: border-box; }
.field input:focus { border-color: var(--brand-primary-hover, #E68A00); box-shadow: 0 0 0 3px rgba(255,77,0,0.1); }
.field input::placeholder { color: rgba(240,236,230,0.3); }
.btn-submit { width: 100%; padding: 13px; border-radius: 12px; border: none; background: linear-gradient(135deg, var(--brand-primary-hover, #E68A00), #ff6b3d); color: #fff; font-weight: 700; font-size: 0.875rem; cursor: pointer; font-family: inherit; transition: all 0.3s; box-shadow: 0 4px 16px rgba(255,77,0,0.25); margin-top: 4px; }
.btn-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255,77,0,0.35); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.form-footer { text-align: center; margin-top: 14px; font-size: 0.8125rem; color: rgba(240,236,230,0.5); }
.form-footer a { color: var(--brand-primary-hover, #E68A00); cursor: pointer; font-weight: 600; }
.auth-error { color: #ff3b5c; font-size: 0.8125rem; margin-bottom: 12px; padding: 10px 14px; border-radius: 10px; background: rgba(255,59,92,0.08); border: 1px solid rgba(255,59,92,0.15); }
.auth-success { color: #00e68a; font-size: 0.8125rem; margin-bottom: 12px; padding: 10px 14px; border-radius: 10px; background: rgba(0,230,138,0.08); border: 1px solid rgba(0,230,138,0.15); }

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .hero-inner, .about-grid { grid-template-columns: 1fr; }
  .hero-right { order: -1; max-width: 400px; margin: 0 auto; }
  .hero h1 { font-size: 2rem; }
  .hero-stats { grid-template-columns: repeat(4, 1fr); }
  .how-steps { grid-template-columns: repeat(2, 1fr); }
  .program-grid { grid-template-columns: repeat(2, 1fr); }
  .testi-grid { grid-template-columns: 1fr; max-width: 500px; margin: 0 auto; }
}
@media (max-width: 768px) {
  .hero { padding: 80px 16px 40px; }
  .hero h1 { font-size: 1.75rem; }
  .hero-cta-row { flex-direction: column; }
  .hero-stats { grid-template-columns: repeat(2, 1fr); }
  .about-features { grid-template-columns: 1fr; }
  .how-steps { grid-template-columns: 1fr; }
  .program-grid { grid-template-columns: 1fr; }
}
@media (max-width: 768px) { .hero { padding: 60px 16px 40px; } .hero-inner { flex-direction: column; } .hero-left, .hero-right { width: 100%; } .hero-right { display: none; } .hero-stats { grid-template-columns: repeat(2, 1fr); } .about-grid { grid-template-columns: 1fr; } .how-steps { grid-template-columns: 1fr; } .testi-grid { grid-template-columns: 1fr; } .faq-list { padding: 0 16px; } .auth-card { width: 95%; padding: 24px; } .section-title { font-size: 1.4rem; } .hero-badge { font-size: 0.7rem; } .hero-cta { padding: 12px 24px; font-size: 0.9rem; } }
@media (max-width: 480px) { .hero { padding: 40px 12px 30px; } .hero-stats { grid-template-columns: repeat(2, 1fr); gap: 8px; } .hero-stat .num { font-size: 1.2rem; } .section-title { font-size: 1.2rem; } .faq-item { padding: 12px; } .hero-cta { width: 100%; justify-content: center; } .auth-card { padding: 20px; } .field input { font-size: 16px; } }
</style>


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const showAuth = ref(false)
const authTab = ref('register')
const authEmail = ref('')
const authPassword = ref('')
const authName = ref('')
const authReferral = ref('')
const authError = ref('')
const authSuccess = ref('')
const authLoading = ref(false)
const openFaq = ref(-1)

const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }

const howSteps = [
  { icon: 'fas fa-user-plus', title: 'Daftar Akun', desc: 'Buat akun gratis dalam 1 menit. Tanpa biaya pendaftaran.', color: 'rgba(255,77,0,0.15)' },
  { icon: 'fas fa-tasks', title: 'Pilih Tugas', desc: 'Pilih tugas yang tersedia sesuai kemampuan dan waktu kamu.', color: 'rgba(0,230,138,0.15)' },
  { icon: 'fas fa-check-circle', title: 'Selesaikan Tugas', desc: 'Ikuti instruksi, selesaikan tugas, dan kirim bukti.', color: 'rgba(124,92,255,0.15)' },
  { icon: 'fas fa-wallet', title: 'Terima Komisi', desc: 'Komisi langsung masuk ke dompet digital You.', color: 'rgba(0,180,216,0.15)' },
]

const programs = [
  { icon: 'fas fa-star', title: 'Rating Produk', amount: '$5 - $50', desc: 'Beri rating dan review produk di marketplace.', bg: 'rgba(255,77,0,0.15)', color: 'var(--brand-primary-hover, #E68A00)' },
  { icon: 'fas fa-shopping-cart', title: 'Mystery Shopper', amount: '$10 - $100', desc: 'Beli produk dan berikan feedback detail.', bg: 'rgba(0,230,138,0.15)', color: '#00e68a' },
  { icon: 'fas fa-share-alt', title: 'Social Meina', amount: '$3 - $30', desc: 'Bagikan konten dan dapatkan komisi per interaksi.', bg: 'rgba(124,92,255,0.15)', color: '#7c5cff' },
]

const testimonials = [
  { name: 'Sari Dewi', role: 'Partner sejak 2024', text: 'Dalam 2 month, saya already earning lebih from $500. Sangat flexible dan can dilakukan dari rumah.', color: 'var(--brand-primary-hover, #E68A00)' },
  { name: 'Buin Santoso', role: 'Partner sejak 2023', text: 'At first I was stoptical, but it really pays. Sekarang ini penghasilan utama saya.', color: '#00e68a' },
  { name: 'Maya Putri', role: 'Partner sejak 2024', text: 'Tugasnya mudah dan jelas. Dukungan team also very responsive. Sangat direkomendasikan!', color: '#7c5cff' },
]

const faqs = [
  { q: 'Apakah true-true gratis?', a: 'Ya, pendaftaran 100% gratis. Tidak ada biaya tersembunyi.' },
  { q: 'Bagaimana cara mencairkan komisi?', a: 'Commission can ditarik ke rekening bank or dompet digital kapan saja.' },
  { q: 'Berapa old proses pencairan?', a: 'Proses pencairan instan untuk dompet digital, 1-2 hari untuk bank.' },
  { q: 'Apakah ada batasan waktu?', a: 'Tidak ada. Kamu bisa mengerjakan tugas kapan saja sesuai waktu luang.' },
]

const handleLogin = async () => {
  authError.value = ''
  authLoading.value = true
  try {
    const result = await userStore.login(authEmail.value, authPassword.value)
    if (result.success) {
      showAuth.value = false
      router.push('/user')
    } else {
      authError.value = result.msg || 'Login gagal'
    }
  } catch (e) { authError.value = 'Terjadi kesalahan' }
  authLoading.value = false
}

const handleDaftar = async () => {
  authError.value = ''
  authLoading.value = true
  try {
    const result = await userStore.register(authEmail.value, authPassword.value)
    if (result.success) {
      authSuccess.value = 'Akun berhasil dibuat! Silakan login.'
      authTab.value = 'login'
    } else {
      authError.value = result.msg || 'Registrasi gagal'
    }
  } catch (e) { authError.value = 'Terjadi kesalahan' }
  authLoading.value = false
}</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const showAuth = ref(false)
const authTab = ref('register')
const authEmail = ref('')
const authPassword = ref('')
const authName = ref('')
const authReferral = ref('')
const authError = ref('')
const authSuccess = ref('')
const authLoading = ref(false)
const openFaq = ref(-1)

const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }

const howSteps = [
  { icon: 'fas fa-user-plus', title: 'Daftar Akun', desc: 'Buat akun gratis dalam 1 menit. Tanpa biaya pendaftaran.', color: 'rgba(255,77,0,0.15)' },
  { icon: 'fas fa-tasks', title: 'Pilih Tugas', desc: 'Pilih tugas yang tersedia sesuai kemampuan dan waktu kamu.', color: 'rgba(0,230,138,0.15)' },
  { icon: 'fas fa-check-circle', title: 'Selesaikan Tugas', desc: 'Ikuti instruksi, selesaikan tugas, dan kirim bukti.', color: 'rgba(124,92,255,0.15)' },
  { icon: 'fas fa-wallet', title: 'Terima Komisi', desc: 'Komisi langsung masuk ke dompet digital You.', color: 'rgba(0,180,216,0.15)' },
]

const programs = [
  { icon: 'fas fa-star', title: 'Rating Produk', amount: '$5 - $50', desc: 'Beri rating dan review produk di marketplace.', bg: 'rgba(255,77,0,0.15)', color: 'var(--brand-primary-hover, #E68A00)' },
  { icon: 'fas fa-shopping-cart', title: 'Mystery Shopper', amount: '$10 - $100', desc: 'Beli produk dan berikan feedback detail.', bg: 'rgba(0,230,138,0.15)', color: '#00e68a' },
  { icon: 'fas fa-share-alt', title: 'Social Meina', amount: '$3 - $30', desc: 'Bagikan konten dan dapatkan komisi per interaksi.', bg: 'rgba(124,92,255,0.15)', color: '#7c5cff' },
]

const testimonials = [
  { name: 'Sari Dewi', role: 'Partner sejak 2024', text: 'Dalam 2 month, saya already earning lebih from $500. Sangat flexible dan can dilakukan dari rumah.', color: 'var(--brand-primary-hover, #E68A00)' },
  { name: 'Buin Santoso', role: 'Partner sejak 2023', text: 'At first I was stoptical, but it really pays. Sekarang ini penghasilan utama saya.', color: '#00e68a' },
  { name: 'Maya Putri', role: 'Partner sejak 2024', text: 'Tugasnya mudah dan jelas. Dukungan team also very responsive. Sangat direkomendasikan!', color: '#7c5cff' },
]

const faqs = [
  { q: 'Apakah true-true gratis?', a: 'Ya, pendaftaran 100% gratis. Tidak ada biaya tersembunyi.' },
  { q: 'Bagaimana cara mencairkan komisi?', a: 'Commission can ditarik ke rekening bank or dompet digital kapan saja.' },
  { q: 'Berapa old proses pencairan?', a: 'Proses pencairan instan untuk dompet digital, 1-2 hari untuk bank.' },
  { q: 'Apakah ada batasan waktu?', a: 'Tidak ada. Kamu bisa mengerjakan tugas kapan saja sesuai waktu luang.' },
]

const handleLogin = async () => {
  authError.value = ''
  authLoading.value = true
  try {
    const result = await userStore.login(authEmail.value, authPassword.value)
    if (result.success) {
      showAuth.value = false
      router.push('/user')
    } else {
      authError.value = result.msg || 'Login gagal'
    }
  } catch (e) { authError.value = 'Terjadi kesalahan' }
  authLoading.value = false
}

const handleDaftar = async () => {
  authError.value = ''
  authLoading.value = true
  try {
    const result = await userStore.register(authEmail.value, authPassword.value)
    if (result.success) {
      authSuccess.value = 'Akun berhasil dibuat! Silakan login.'
      authTab.value = 'login'
    } else {
      authError.value = result.msg || 'Registrasi gagal'
    }
  } catch (e) { authError.value = 'Terjadi kesalahan' }
  authLoading.value = false
}
</template>

</script>

<style scoped>
/* ===== GLOBAL ===== */
.rplus-page { font-family: 'Inter', sans-serif; background: #0a0a12; color: #f0ece6; overflow-x: hidden; }
.bg-mesh { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(ellipse 80% 60% at 20% 10%, rgba(255,77,0,.08) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 90%, rgba(124,92,255,.06) 0%, transparent 50%); }
.accent { color: var(--brand-primary-hover, #E68A00); } .inm { color: rgba(240,236,230,.5); } .green { color: #00e68a; }
.section-header { text-align: center; margin-bottom: 2.5rem; }
.section-tag { display: inline-block; padding: 4px 14px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
.section-tag.orange { background: rgba(255,77,0,0.1); color: var(--brand-primary-hover, #E68A00); border: 1px solid rgba(255,77,0,0.2); }
.section-tag.purple { background: rgba(124,92,255,0.1); color: #7c5cff; border: 1px solid rgba(124,92,255,0.2); }
.section-title { font-size: 1.75rem; font-weight: 800; margin-bottom: 8px; }
.section-desc { color: rgba(240,236,230,0.5); font-size: 0.875rem; }

/* ===== HERO ===== */
.hero { min-height: 100dvh; display: flex; align-items: center; justify-content: center; padding: 100px 20px 60px; position: relative; }
.hero::before { content: ''; position: absolute; top: -30%; right: -20%; width: 700px; height: 700px; border-radius: 50%; background: radial-gradient(circle, rgba(255,77,0,.15), transparent 60%); pointer-events: none; filter: blur(60px); }
.hero-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; max-width: 1100px; align-items: center; position: relative; z-index: 2; }
.hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 100px; background: rgba(255,77,0,0.1); border: 1px solid rgba(255,77,0,0.2); font-size: 0.72rem; font-weight: 700; color: var(--brand-primary-hover, #E68A00); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px; }
.hero-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--brand-primary-hover, #E68A00); animation: blink 2s infinite; }
@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
.hero h1 { font-size: 2.5rem; font-weight: 800; line-height: 1.2; margin-bottom: 16px; }
.hero-sub { color: rgba(240,236,230,0.7); font-size: 0.9375rem; line-height: 1.6; margin-bottom: 24px; max-width: 480px; }
.hero-cta-row { display: flex; gap: 12px; margin-bottom: 32px; }
.hero-cta { padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 0.9375rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.3s; border: none; font-family: inherit; }
.hero-cta.pulse-btn { background: linear-gradient(135deg, var(--brand-primary-hover, #E68A00), #ff6b3d); color: #fff; box-shadow: 0 4px 16px rgba(255,77,0,0.25); }
.hero-cta.pulse-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,77,0,0.35); }
.hero-cta.secondary { background: rgba(255,255,255,0.06); color: #f0ece6; border: 1px solid rgba(255,255,255,0.1); }
.hero-cta.secondary:hover { border-color: var(--brand-primary-hover, #E68A00); color: var(--brand-primary-hover, #E68A00); }
.hero-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.hero-stat { text-align: center; }
.hero-stat .num { font-size: 1.5rem; font-weight: 800; color: var(--brand-primary-hover, #E68A00); }
.hero-stat .label { font-size: 0.75rem; color: rgba(240,236,230,0.5); }

/* Mockup */
.hero-mockup { position: relative; }
.hero-mockup-main { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; backdrop-filter: blur(20px); }
.mockup-screen { background: #0f0f1a; border-radius: 12px; overflow: hidden; }
.mockup-header { display: flex; gap: 6px; padding: 12px 16px; background: rgba(255,255,255,0.03); }
.mockup-dot { width: 8px; height: 8px; border-radius: 50%; }
.mockup-dot.green { background: #00e68a; } .mockup-dot.yellow { background: #f5a623; } .mockup-dot.red { background: #ff3b5c; }
.mockup-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.mockup-task { display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 10px; }
.task-check { width: 28px; height: 28px; border-radius: 8px; background: rgba(0,230,138,0.15); display: flex; align-items: center; justify-content: center; color: #00e68a; font-size: 0.75rem; }
.task-info { flex: 1; }
.task-title { height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-bottom: 6px; width: 70%; }
.task-amount { height: 8px; background: rgba(255,77,0,0.2); border-radius: 4px; width: 40%; }
.hero-mockup-float { position: absolute; background: rgba(15,15,26,0.9); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 10px; backdrop-filter: blur(20px); }
.hero-mockup-float.f1 { right: -10px; top: 20px; }
.hero-mockup-float.f2 { left: -10px; bottom: 30px; }
.float-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(0,230,138,0.15); display: flex; align-items: center; justify-content: center; color: #00e68a; }
.float-text h4 { font-size: 0.75rem; font-weight: 700; margin-bottom: 2px; }
.float-text p { font-size: 0.625rem; color: rgba(240,236,230,0.5); }

/* ===== ABOUT ===== */
.about { padding: 80px 20px; background: #0a0a12; }
.about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; max-width: 1100px; margin: 0 auto; align-items: center; }
.about-img-wrap { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 40px; text-align: center; }
.big-r { font-size: 6rem; font-weight: 900; background: linear-gradient(135deg, var(--brand-primary-hover, #E68A00), #7c5cff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.about-img-badge { display: flex; align-items: center; gap: 12px; margin-top: 16px; padding: 12px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; }
.about-img-badge .icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(0,230,138,0.15); display: flex; align-items: center; justify-content: center; color: #00e68a; }
.about-img-badge h4 { font-size: 0.8125rem; margin-bottom: 2px; }
.about-img-badge p { font-size: 0.6875rem; color: rgba(240,236,230,0.5); margin: 0; }
.about-content h2 { font-size: 1.75rem; font-weight: 800; margin-bottom: 12px; }
.about-content > p { color: rgba(240,236,230,0.7); line-height: 1.7; margin-bottom: 24px; }
.about-features { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.about-feat { display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 10px; }
.about-feat .ico { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--brand-primary-hover, #E68A00); background: rgba(255,77,0,0.1); }
.about-feat span { font-size: 0.8125rem; font-weight: 600; }

/* ===== HOW ===== */
.how { padding: 80px 20px; background: #0f0f1a; }
.how-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; max-width: 1000px; margin: 0 auto; }
.how-step { text-align: center; padding: 24px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; position: relative; }
.step-num { position: absolute; top: -8px; left: -8px; width: 28px; height: 28px; background: var(--brand-primary-hover, #E68A00); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.75rem; }
.step-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-size: 1.25rem; color: #fff; }
.how-step h3 { font-size: 0.9375rem; font-weight: 700; margin-bottom: 6px; }
.how-step p { font-size: 0.75rem; color: rgba(240,236,230,0.5); line-height: 1.5; }

/* ===== PROGRAM ===== */
.program { padding: 80px 20px; background: #0a0a12; }
.program-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 1000px; margin: 0 auto; }
.program-card { padding: 24px 16px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); text-align: center; transition: all 0.4s; backdrop-filter: blur(20px); }
.program-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(0,0,0,0.3); }
.program-card .card-icon { width: 48px; height: 48px; border-radius: 12px; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; color: #fff; }
.program-card h3 { font-size: 0.85rem; font-weight: 800; margin-bottom: 3px; }
.program-card .highlight { font-size: 1.2rem; font-weight: 900; margin: 6px 0; }
.program-card p { font-size: 0.7rem; color: rgba(240,236,230,0.5); line-height: 1.5; }

/* ===== TESTIMONIALS ===== */
.testimoni { padding: 80px 20px; background: #0f0f1a; }
.testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 1100px; margin: 0 auto; }
.testi-card { padding: 24px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; }
.testi-stars { color: #f5a623; font-size: 0.75rem; margin-bottom: 12px; }
.testi-text { font-size: 0.8125rem; color: rgba(240,236,230,0.7); line-height: 1.6; margin-bottom: 16px; font-style: italic; }
.testi-author { display: flex; align-items: center; gap: 10px; }
.testi-author .avatar { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.75rem; }
.testi-author h4 { font-size: 0.8125rem; margin-bottom: 2px; }
.testi-author p { font-size: 0.6875rem; color: rgba(240,236,230,0.5); margin: 0; }

/* ===== FAQ ===== */
.faq { padding: 80px 20px; background: #0a0a12; }
.faq-list { max-width: 700px; margin: 0 auto; display: flex; flex-direction: column; gap: 8px; }
.faq-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; cursor: pointer; overflow: hidden; }
.faq-q { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; font-weight: 600; font-size: 0.875rem; }
.faq-q i { color: rgba(240,236,230,0.3); font-size: 0.75rem; }
.faq-a { padding: 0 20px 16px; font-size: 0.8125rem; color: rgba(240,236,230,0.6); line-height: 1.6; }

/* ===== CTA ===== */
.cta-section { padding: 80px 20px; text-align: center; background: linear-gradient(180deg, #0a0a12, #0f0f1a); }
.cta-section h2 { font-size: 2rem; font-weight: 800; margin-bottom: 12px; }
.cta-section p { color: rgba(240,236,230,0.5); margin-bottom: 24px; }

/* ===== AUTH MODAL ===== */
.auth-overlay { position: fixed; inset: 0; z-index: 950; background: rgba(10,10,18,0.95); display: flex; align-items: center; justify-content: center; padding: 20px; }
.auth-card { width: 100%; max-width: 420px; background: rgba(15,15,26,0.92); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5); backdrop-filter: blur(40px); position: relative; }
.auth-close { position: absolute; top: 16px; right: 16px; background: none; border: none; color: rgba(240,236,230,0.5); cursor: pointer; font-size: 1.25rem; z-index: 2; }
.auth-header { padding: 28px 28px 0; text-align: center; }
.auth-brand { width: 56px; height: 56px; border-radius: 16px; margin: 0 auto 16px; background: linear-gradient(135deg, var(--brand-primary-hover, #E68A00), #7c5cff); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 900; color: #fff; box-shadow: 0 8px 24px rgba(255,77,0,0.25); }
.auth-header h2 { font-size: 1.25rem; font-weight: 800; margin-bottom: 6px; }
.auth-header p { font-size: 0.8125rem; color: rgba(240,236,230,0.5); }
.auth-tabs { display: flex; gap: 3px; background: rgba(255,255,255,0.04); border-radius: 12px; padding: 4px; margin: 20px 28px 0; }
.auth-tabs button { flex: 1; padding: 10px; border-radius: 10px; border: none; background: transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; color: rgba(240,236,230,0.5); transition: all 0.25s; }
.auth-tabs button.active { background: rgba(255,255,255,0.08); color: #f0ece6; }
.auth-body { padding: 16px 28px 28px; }
.field { margin-bottom: 14px; }
.field label { display: block; font-size: 0.75rem; font-weight: 600; margin-bottom: 6px; color: rgba(240,236,230,0.5); text-transform: uppercase; letter-spacing: 0.04em; }
.field input { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); font-family: inherit; font-size: 0.875rem; outline: none; transition: all 0.3s; color: #f0ece6; box-sizing: border-box; }
.field input:focus { border-color: var(--brand-primary-hover, #E68A00); box-shadow: 0 0 0 3px rgba(255,77,0,0.1); }
.field input::placeholder { color: rgba(240,236,230,0.3); }
.btn-submit { width: 100%; padding: 13px; border-radius: 12px; border: none; background: linear-gradient(135deg, var(--brand-primary-hover, #E68A00), #ff6b3d); color: #fff; font-weight: 700; font-size: 0.875rem; cursor: pointer; font-family: inherit; transition: all 0.3s; box-shadow: 0 4px 16px rgba(255,77,0,0.25); margin-top: 4px; }
.btn-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255,77,0,0.35); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.form-footer { text-align: center; margin-top: 14px; font-size: 0.8125rem; color: rgba(240,236,230,0.5); }
.form-footer a { color: var(--brand-primary-hover, #E68A00); cursor: pointer; font-weight: 600; }
.auth-error { color: #ff3b5c; font-size: 0.8125rem; margin-bottom: 12px; padding: 10px 14px; border-radius: 10px; background: rgba(255,59,92,0.08); border: 1px solid rgba(255,59,92,0.15); }
.auth-success { color: #00e68a; font-size: 0.8125rem; margin-bottom: 12px; padding: 10px 14px; border-radius: 10px; background: rgba(0,230,138,0.08); border: 1px solid rgba(0,230,138,0.15); }

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .hero-inner, .about-grid { grid-template-columns: 1fr; }
  .hero-right { order: -1; max-width: 400px; margin: 0 auto; }
  .hero h1 { font-size: 2rem; }
  .hero-stats { grid-template-columns: repeat(4, 1fr); }
  .how-steps { grid-template-columns: repeat(2, 1fr); }
  .program-grid { grid-template-columns: repeat(2, 1fr); }
  .testi-grid { grid-template-columns: 1fr; max-width: 500px; margin: 0 auto; }
}
@media (max-width: 768px) {
  .hero { padding: 80px 16px 40px; }
  .hero h1 { font-size: 1.75rem; }
  .hero-cta-row { flex-direction: column; }
  .hero-stats { grid-template-columns: repeat(2, 1fr); }
  .about-features { grid-template-columns: 1fr; }
  .how-steps { grid-template-columns: 1fr; }
  .program-grid { grid-template-columns: 1fr; }
}
@media (max-width: 768px) { .hero { padding: 60px 16px 40px; } .hero-inner { flex-direction: column; } .hero-left, .hero-right { width: 100%; } .hero-right { display: none; } .hero-stats { grid-template-columns: repeat(2, 1fr); } .about-grid { grid-template-columns: 1fr; } .how-steps { grid-template-columns: 1fr; } .testi-grid { grid-template-columns: 1fr; } .faq-list { padding: 0 16px; } .auth-card { width: 95%; padding: 24px; } .section-title { font-size: 1.4rem; } .hero-badge { font-size: 0.7rem; } .hero-cta { padding: 12px 24px; font-size: 0.9rem; } }
@media (max-width: 480px) { .hero { padding: 40px 12px 30px; } .hero-stats { grid-template-columns: repeat(2, 1fr); gap: 8px; } .hero-stat .num { font-size: 1.2rem; } .section-title { font-size: 1.2rem; } .faq-item { padding: 12px; } .hero-cta { width: 100%; justify-content: center; } .auth-card { padding: 20px; } .field input { font-size: 16px; } }
</style>