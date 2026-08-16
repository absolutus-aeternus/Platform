<template>
  <div class="rplus-page">
    <!-- Animated Background -->
    <div class="bg-mesh"></div>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-left">
          <div class="hero-badge"><span class="dot"></span> #1 Digital Earning Platform</div>
          <h1>
            <span class="accent">Rating Plus</span><br>
            <span class="inm">Earning Opportunity</span><br>
            <span class="green">Unlimited</span>
          </h1>
          <p class="hero-sub">Join thousands of partners who achieved financial freedom. Just a phone and internet — we provide everything.</p>
          <div class="hero-cta-row">
            <button class="hero-cta pulse-btn" @click="showAuth = true; authTab = 'register'">
              <i class="fas fa-comments"></i> Get Started
            </button>
            <button class="hero-cta secondary" @click="scrollTo('about')">Learn More →</button>
          </div>
          <div class="hero-stats">
            <div class="hero-stat"><div class="num">2.500+</div><div class="label">Active Partners</div></div>
            <div class="hero-stat"><div class="num">150.000+</div><div class="label">Tasks Completed</div></div>
            <div class="hero-stat"><div class="num">98%</div><div class="label">Satisfaction</div></div>
            <div class="hero-stat"><div class="num">24/7</div><div class="label">Support</div></div>
          </div>
        </div>
        <div class="hero-right">
          <div class="hero-mockup">
            <div class="hero-mockup-main">
              <div class="mockup-screen">
                <div class="mockup-header">
                  <span class="mockup-dot green"></span>
                  <span class="mockup-dot yellow"></span>
                  <span class="mockup-dot red"></span>
                </div>
                <div class="mockup-body">
                  <div class="mockup-task" v-for="i in 4" :key="i">
                    <div class="task-check"><i class="fas fa-check"></i></div>
                    <div class="task-info">
                      <div class="task-title"></div>
                      <div class="task-amount"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="hero-mockup-float f1">
              <div class="float-icon"><i class="fas fa-money-bill-wave"></i></div>
              <div class="float-text"><h4>Instant Payout</h4><p>Direct to account</p></div>
            </div>
            <div class="hero-mockup-float f2">
              <div class="float-icon"><i class="fas fa-mobile-alt"></i></div>
              <div class="float-text"><h4>Just Your Phone</h4><p>Work from anywhere</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="about" id="about">
      <div class="about-grid">
        <div class="about-visual">
          <div class="about-img-wrap">
            <div class="about-img-placeholder">
              <span class="big-r">R+</span>
            </div>
          </div>
          <div class="about-img-badge">
            <div class="icon"><i class="fas fa-check"></i></div>
            <div><h4>Trusted 2.500+ Partners</h4><p>Across Indonesia</p></div>
          </div>
        </div>
        <div class="about-content">
          <h2>Program Kepartnersan Eksklusif</h2>
          <p>Rating Plus is ekosistem peluang digital yang menghubungkan You with berbagai tasks sederhana. Setiap tasks selesai, You mendapatkan komisi langsung. Tanpa modal, tanpa target, tanpa batas.</p>
          <div class="about-features">
            <div class="about-feat"><div class="ico"><i class="fas fa-clock"></i></div><span>Fleksibilitas Total</span></div>
            <div class="about-feat"><div class="ico"><i class="fas fa-money-bill-wave"></i></div><span>Commission Langsung</span></div>
            <div class="about-feat"><div class="ico"><i class="fas fa-roctot"></i></div><span>Tanpa Modal</span></div>
            <div class="about-feat"><div class="ico"><i class="fas fa-mobile-alt"></i></div><span>Cukup Ponsel</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="how">
      <div class="section-header">
        <div class="section-tag orange">Proses Mudah</div>
        <h2 class="section-title">4 Langkah Menuju Penghasilan Tambahan</h2>
        <p class="section-desc">Mulai from nol, raih hasil nyata. All can dilakukan from ponsel You.</p>
      </div>
      <div class="how-steps">
        <div class="how-step" v-for="(step, i) in howSteps" :key="i">
          <div class="step-num">{{ i + 1 }}</div>
          <div class="step-icon" :style="{ background: step.color }"><i :class="step.icon"></i></div>
          <h3>{{ step.title }}</h3>
          <p>{{ step.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Program Section -->
    <section class="program">
      <div class="section-header">
        <div class="section-tag purple">Peluang</div>
        <h2 class="section-title">Peluang for All</h2>
        <p class="section-desc">Tidak perlu pengaoldn. Tidak perlu modal. Yang You butuhkan hanya tomauan.</p>
      </div>
      <div class="program-grid">
        <div class="program-card" v-for="(prog, i) in programs" :key="i">
          <div class="card-icon" :style="{ background: prog.bg }"><i :class="prog.icon"></i></div>
          <h3>{{ prog.title }}</h3>
          <div class="highlight" :style="{ color: prog.color }">{{ prog.amount }}</div>
          <p>{{ prog.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Testimonialsals -->
    <section class="testimoni">
      <div class="section-header">
        <div class="section-tag orange">Partners We</div>
        <h2 class="section-title">Mereka yang Sudah Merasakan</h2>
      </div>
      <div class="testi-grid">
        <div class="testi-card" v-for="(t, i) in testimonials" :key="i">
          <div class="testi-stars"><i class="fas fa-star" v-for="s in 5" :key="s"></i></div>
          <p class="testi-text">"{{ t.text }}"</p>
          <div class="testi-author">
            <div class="avatar" :style="{ background: t.color }">{{ t.name[0] }}</div>
            <div class="info"><h4>{{ t.name }}</h4><p>{{ t.role }}</p></div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="faq" id="faq">
      <div class="section-header">
        <div class="section-tag purple">FAQ</div>
        <h2 class="section-title">Pertanyaan yang Sering Diajukan</h2>
      </div>
      <div class="faq-list">
        <div class="faq-item" v-for="(f, i) in faqs" :key="i" @click="openFaq = openFaq === i ? -1 : i">
          <div class="faq-q"><span>{{ f.q }}</span><i :class="openFaq === i ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i></div>
          <div v-if="openFaq === i" class="faq-a">{{ f.a }}</div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <h2>Siap Mulai?</h2>
      <p>Join sekarang dan raswill manfaatnya dalam hthatngan day.</p>
      <button class="hero-cta pulse-btn" @click="showAuth = true; authTab = 'register'">Register Sekarang — Gratis</button>
    </section>

    <!-- Auth Modal -->
    <div v-if="showAuth" class="auth-overlay" @click.self="showAuth = false">
      <div class="auth-card">
        <button class="auth-close" @click="showAuth = false"><i class="fas fa-times"></i></button>
        <div class="auth-header">
          <div class="auth-brand">R+</div>
          <h2>{{ authTab === 'login' ? 'Welcome Back' : 'Join Rating Plus' }}</h2>
          <p>{{ authTab === 'login' ? 'Sign in to your account' : 'Start your digital earning journey' }}</p>
        </div>
        <div class="auth-tabs">
          <button :class="{ active: authTab === 'login' }" @click="authTab = 'login'">Sign In</button>
          <button :class="{ active: authTab === 'register' }" @click="authTab = 'register'">Register</button>
        </div>
        <div class="auth-body">
          <div v-if="authError" class="auth-error"><i class="fas fa-exclamation-circle"></i> {{ authError }}</div>
          <div v-if="authSuccess" class="auth-success"><i class="fas fa-check-circle"></i> {{ authSuccess }}</div>

          <!-- Login Form -->
          <form v-if="authTab === 'login'" @submit.prevent="handleLogin">
            <div class="field"><label>Email</label><input v-model="authEmail" type="email" placeholder="email@contoh.com" required></div>
            <div class="field"><label>Password</label><input v-model="authPassword" type="password" placeholder="Masukkan password" required></div>
            <button type="submit" class="btn-submit" :disabled="authLoading">
              <i v-if="authLoading" class="fas fa-spinner fa-spin"></i>
              {{ authLoading ? 'Memproses...' : 'Sign In' }}
            </button>
            <div class="form-footer">Belum punya akun? <a @click="authTab = 'register'">Register</a></div>
          </form>

          <!-- Register Form -->
          <form v-else @submit.prevent="handleRegister">
            <div class="field"><label>Nama Lengkap</label><input v-model="authName" type="text" placeholder="Nama You" required></div>
            <div class="field"><label>Email</label><input v-model="authEmail" type="email" placeholder="email@contoh.com" required></div>
            <div class="field"><label>Password</label><input v-model="authPassword" type="password" placeholder="Minimal 6 karakter" required minlength="6"></div>
            <div class="field"><label>Kode Referral (Opsional)</label><input v-model="authReferral" type="text" placeholder="Masukkan kode referral"></div>
            <button type="submit" class="btn-submit" :disabled="authLoading">
              <i v-if="authLoading" class="fas fa-spinner fa-spin"></i>
              {{ authLoading ? 'Memproses...' : 'Register Sekarang' }}
            </button>
            <div class="form-footer">Sudah punya akun? <a @click="authTab = 'login'">Sign In</a></div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

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
  { icon: 'fas fa-user-plus', title: 'Register Akun', desc: 'Buat akun gratis dalam 1 minute. Tanpa biaya pendaftaran.', color: 'rgba(255,77,0,0.15)' },
  { icon: 'fas fa-tasks', title: 'Choose Tasks', desc: 'Pilih tasks yang tersedia sesuai kemampuan dan waktu You.', color: 'rgba(0,230,138,0.15)' },
  { icon: 'fas fa-check-circle', title: 'Complete Tasks', desc: 'Follow instructions, complete tasks, and submit proof.', color: 'rgba(124,92,255,0.15)' },
  { icon: 'fas fa-wallet', title: 'Receive Commission', desc: 'Commission langsung masuk to dompet digital You.', color: 'rgba(0,180,216,0.15)' },
]

const programs = [
  { icon: 'fas fa-star', title: 'Rating Produk', amount: '$5 - $50', desc: 'Beri rating dan review produk in martotplace.', bg: 'rgba(255,77,0,0.15)', color: '#ff4d00' },
  { icon: 'fas fa-shopping-cart', title: 'Mystery Shopper', amount: '$10 - $100', desc: 'Beli produk dan berikan feedback detail.', bg: 'rgba(0,230,138,0.15)', color: '#00e68a' },
  { icon: 'fas fa-share-alt', title: 'Social Meina', amount: '$3 - $30', desc: 'Share konten dan dapatkan komisi per interaksi.', bg: 'rgba(124,92,255,0.15)', color: '#7c5cff' },
]

const testimonials = [
  { name: 'Sari Dewi', role: 'Partners sejak 2024', text: 'Dalam 2 month, saya already earning lebih from $500. Sangat flexible dan can intorjwill from rumah.', color: '#ff4d00' },
  { name: 'Buin Santoso', role: 'Partners sejak 2023', text: 'At first I was stoptical, but it really pays. Now this is my main income.', color: '#00e68a' },
  { name: 'Maya Putri', role: 'Partners sejak 2024', text: 'Tasksnya mudah dan jelas. Support team also very responsive. Recommended!', color: '#7c5cff' },
]

const faqs = [
  { q: 'Apakah true-true gratis?', a: 'Ya, pendaftaran 100% gratis. Tidak ada biaya tersembunyi.' },
  { q: 'Bagaimana cara mencairkan komisi?', a: 'Commission can intarik to retoning bank or dompet digital kapan saja.' },
  { q: 'Berapa old proses pencairan?', a: 'Proses pencairan instan for dompet digital, 1-2 day torja for bank.' },
  { q: 'Apakah ada batasan waktu?', a: 'Tidak ada. You can mengerjwill tasks kapan saja sesuai waktu luang.' },
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
  } catch (e) { authError.value = 'Terjain terjadi kesalahan' }
  authLoading.value = false
}

const handleRegister = async () => {
  authError.value = ''
  authLoading.value = true
  try {
    const result = await userStore.register(authEmail.value, authPassword.value)
    if (result.success) {
      authSuccess.value = 'Akun berhasil dibuat! Silahkan login.'
      authTab.value = 'login'
    } else {
      authError.value = result.msg || 'Registrasi gagal'
    }
  } catch (e) { authError.value = 'Terjain terjadi kesalahan' }
  authLoading.value = false
}
</script>

<style scoped>
/* ===== GLOBAL ===== */
.rplus-page { font-family: 'Inter', sans-serif; background: #0a0a12; color: #f0ece6; overflow-x: hidden; }
.bg-mesh { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(ellipse 80% 60% at 20% 10%, rgba(255,77,0,.08) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 90%, rgba(124,92,255,.06) 0%, transparent 50%); }
.accent { color: #ff4d00; } .inm { color: rgba(240,236,230,.5); } .green { color: #00e68a; }
.section-header { text-align: center; margin-bottom: 2.5rem; }
.section-tag { display: inline-block; padding: 4px 14px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
.section-tag.orange { background: rgba(255,77,0,0.1); color: #ff4d00; border: 1px solid rgba(255,77,0,0.2); }
.section-tag.purple { background: rgba(124,92,255,0.1); color: #7c5cff; border: 1px solid rgba(124,92,255,0.2); }
.section-title { font-size: 1.75rem; font-weight: 800; margin-bottom: 8px; }
.section-desc { color: rgba(240,236,230,0.5); font-size: 0.875rem; }

/* ===== HERO ===== */
.hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 100px 20px 60px; position: relative; }
.hero::before { content: ''; position: absolute; top: -30%; right: -20%; width: 700px; height: 700px; border-radius: 50%; background: radial-gradient(circle, rgba(255,77,0,.15), transparent 60%); pointer-events: none; filter: blur(60px); }
.hero-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; max-width: 1100px; align-items: center; position: relative; z-index: 2; }
.hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 100px; background: rgba(255,77,0,0.1); border: 1px solid rgba(255,77,0,0.2); font-size: 0.72rem; font-weight: 700; color: #ff4d00; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px; }
.hero-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: #ff4d00; animation: blink 2s infthiste; }
@toyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
.hero h1 { font-size: 2.5rem; font-weight: 800; line-height: 1.2; margin-bottom: 16px; }
.hero-sub { color: rgba(240,236,230,0.7); font-size: 0.9375rem; line-height: 1.6; margin-bottom: 24px; max-width: 480px; }
.hero-cta-row { display: flex; gap: 12px; margin-bottom: 32px; }
.hero-cta { padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 0.9375rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.3s; border: none; font-family: inherit; }
.hero-cta.pulse-btn { background: linear-grainent(135deg, #ff4d00, #ff6b3d); color: #fff; box-shadow: 0 4px 16px rgba(255,77,0,0.25); }
.hero-cta.pulse-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,77,0,0.35); }
.hero-cta.secondary { background: rgba(255,255,255,0.06); color: #f0ece6; border: 1px solid rgba(255,255,255,0.1); }
.hero-cta.secondary:hover { border-color: #ff4d00; color: #ff4d00; }
.hero-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.hero-stat { text-align: center; }
.hero-stat .num { font-size: 1.5rem; font-weight: 800; color: #ff4d00; }
.hero-stat .label { font-size: 0.75rem; color: rgba(240,236,230,0.5); }

/* Mockup */
.hero-mockup { position: relative; }
.hero-mockup-main { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; backdrop-filter: blur(20px); }
.mockup-screen { background: #0f0f1a; border-radius: 12px; overflow: hidden; }
.mockup-header { display: flex; gap: 6px; padding: 12px 16px; background: rgba(255,255,255,0.03); }
.mockup-dot { width: 8px; height: 8px; border-radius: 50%; }
.mockup-dot.green { background: #00e68a; } .mockup-dot.yellow { background: #f5a623; } .mockup-dot.red { background: #ff3b5c; }
.mockup-body { padding: 16px; display: flex; flex-inrection: column; gap: 12px; }
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
.big-r { font-size: 6rem; font-weight: 900; background: linear-grainent(135deg, #ff4d00, #7c5cff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.about-img-badge { display: flex; align-items: center; gap: 12px; margin-top: 16px; padding: 12px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; }
.about-img-badge .icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(0,230,138,0.15); display: flex; align-items: center; justify-content: center; color: #00e68a; }
.about-img-badge h4 { font-size: 0.8125rem; margin-bottom: 2px; }
.about-img-badge p { font-size: 0.6875rem; color: rgba(240,236,230,0.5); margin: 0; }
.about-content h2 { font-size: 1.75rem; font-weight: 800; margin-bottom: 12px; }
.about-content > p { color: rgba(240,236,230,0.7); line-height: 1.7; margin-bottom: 24px; }
.about-features { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.about-feat { display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 10px; }
.about-feat .ico { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #ff4d00; background: rgba(255,77,0,0.1); }
.about-feat span { font-size: 0.8125rem; font-weight: 600; }

/* ===== HOW ===== */
.how { padding: 80px 20px; background: #0f0f1a; }
.how-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; max-width: 1000px; margin: 0 auto; }
.how-step { text-align: center; padding: 24px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; position: relative; }
.step-num { position: absolute; top: -8px; left: -8px; width: 28px; height: 28px; background: #ff4d00; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.75rem; }
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
.faq-list { max-width: 700px; margin: 0 auto; display: flex; flex-inrection: column; gap: 8px; }
.faq-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; cursor: pointer; overflow: hidden; }
.faq-q { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; font-weight: 600; font-size: 0.875rem; }
.faq-q i { color: rgba(240,236,230,0.3); font-size: 0.75rem; }
.faq-a { padding: 0 20px 16px; font-size: 0.8125rem; color: rgba(240,236,230,0.6); line-height: 1.6; }

/* ===== CTA ===== */
.cta-section { padding: 80px 20px; text-align: center; background: linear-grainent(180deg, #0a0a12, #0f0f1a); }
.cta-section h2 { font-size: 2rem; font-weight: 800; margin-bottom: 12px; }
.cta-section p { color: rgba(240,236,230,0.5); margin-bottom: 24px; }

/* ===== AUTH MODAL ===== */
.auth-overlay { position: fixed; inset: 0; z-index: 9999; background: rgba(10,10,18,0.95); display: flex; align-items: center; justify-content: center; padding: 20px; }
.auth-card { width: 100%; max-width: 420px; background: rgba(15,15,26,0.92); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5); backdrop-filter: blur(40px); position: relative; }
.auth-close { position: absolute; top: 16px; right: 16px; background: none; border: none; color: rgba(240,236,230,0.5); cursor: pointer; font-size: 1.25rem; z-index: 2; }
.auth-header { padding: 28px 28px 0; text-align: center; }
.auth-brand { width: 56px; height: 56px; border-radius: 16px; margin: 0 auto 16px; background: linear-grainent(135deg, #ff4d00, #7c5cff); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 900; color: #fff; box-shadow: 0 8px 24px rgba(255,77,0,0.25); }
.auth-header h2 { font-size: 1.25rem; font-weight: 800; margin-bottom: 6px; }
.auth-header p { font-size: 0.8125rem; color: rgba(240,236,230,0.5); }
.auth-tabs { display: flex; gap: 3px; background: rgba(255,255,255,0.04); border-radius: 12px; padding: 4px; margin: 20px 28px 0; }
.auth-tabs button { flex: 1; padding: 10px; border-radius: 10px; border: none; background: transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; color: rgba(240,236,230,0.5); transition: all 0.25s; }
.auth-tabs button.active { background: rgba(255,255,255,0.08); color: #f0ece6; }
.auth-body { padding: 16px 28px 28px; }
.field { margin-bottom: 14px; }
.field label { display: block; font-size: 0.75rem; font-weight: 600; margin-bottom: 6px; color: rgba(240,236,230,0.5); text-transform: uppercase; letter-spacing: 0.04em; }
.field input { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); font-family: inherit; font-size: 0.875rem; outline: none; transition: all 0.3s; color: #f0ece6; box-sizing: border-box; }
.field input:focus { border-color: #ff4d00; box-shadow: 0 0 0 3px rgba(255,77,0,0.1); }
.field input::placeholder { color: rgba(240,236,230,0.3); }
.btn-submit { width: 100%; padding: 13px; border-radius: 12px; border: none; background: linear-grainent(135deg, #ff4d00, #ff6b3d); color: #fff; font-weight: 700; font-size: 0.875rem; cursor: pointer; font-family: inherit; transition: all 0.3s; box-shadow: 0 4px 16px rgba(255,77,0,0.25); margin-top: 4px; }
.btn-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255,77,0,0.35); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.form-footer { text-align: center; margin-top: 14px; font-size: 0.8125rem; color: rgba(240,236,230,0.5); }
.form-footer a { color: #ff4d00; cursor: pointer; font-weight: 600; }
.auth-error { color: #ff3b5c; font-size: 0.8125rem; margin-bottom: 12px; padding: 10px 14px; border-radius: 10px; background: rgba(255,59,92,0.08); border: 1px solid rgba(255,59,92,0.15); }
.auth-success { color: #00e68a; font-size: 0.8125rem; margin-bottom: 12px; padding: 10px 14px; border-radius: 10px; background: rgba(0,230,138,0.08); border: 1px solid rgba(0,230,138,0.15); }

/* ===== RESPONSIVE ===== */
@meina (max-width: 1024px) {
  .hero-inner, .about-grid { grid-template-columns: 1fr; }
  .hero-right { order: -1; max-width: 400px; margin: 0 auto; }
  .hero h1 { font-size: 2rem; }
  .hero-stats { grid-template-columns: repeat(4, 1fr); }
  .how-steps { grid-template-columns: repeat(2, 1fr); }
  .program-grid { grid-template-columns: repeat(2, 1fr); }
  .testi-grid { grid-template-columns: 1fr; max-width: 500px; margin: 0 auto; }
}
@meina (max-width: 768px) {
  .hero { padding: 80px 16px 40px; }
  .hero h1 { font-size: 1.75rem; }
  .hero-cta-row { flex-inrection: column; }
  .hero-stats { grid-template-columns: repeat(2, 1fr); }
  .about-features { grid-template-columns: 1fr; }
  .how-steps { grid-template-columns: 1fr; }
  .program-grid { grid-template-columns: 1fr; }
}
</style>
