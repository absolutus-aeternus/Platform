<template>
  <div class="page-wrapper">
  <div class="seller-login">
    <!-- Animated background -->
    <div class="login-bg">
      <div class="bg-particles"></div>
      <div class="bg-gradient"></div>
    </div>

    <div class="login-container animate-in">
      <!-- Logo -->
      <div class="login-logo">
        <img loading="lazy" src="/images/logo-alliance.svg" alt="AllianceHub" class="logo-img-seller" />
        <p class="logo-sub">Seller Center</p>
      </div>

      <!-- Login Card -->
      <div class="login-card">
        <div class="card-header">
          <h2>Welcome Back</h2>
          <p>Sign in to manage your store</p>
        </div>

        <!-- Tabs -->
        <div class="login-tabs">
          <button :class="{ active: loginMethod === 'email' }" @click="loginMethod = 'email'">
            <i class="fas fa-envelope"></i> Email
          </button>
          <button :class="{ active: loginMethod === 'mobile' }" @click="loginMethod = 'mobile'">
            <i class="fas fa-mobile-alt"></i> Mobile
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label>{{ loginMethod === 'email' ? 'Email Address' : 'Mobile Number' }}</label>
            <div class="input-wrapper">
              <i :class="loginMethod === 'email' ? 'fas fa-envelope' : 'fas fa-mobile-alt'"></i>
              <input v-model="email" type="text" :placeholder="loginMethod === 'email' ? 'seller@example.com' : '+1 234 567 890'" required>
            </div>
          </div>

          <div class="form-group">
            <label>Password</label>
            <div class="input-wrapper">
              <i class="fas fa-lock"></i>
              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Enter your password" required>
              <button type="button" class="toggle-pw" @click="showPassword = !showPassword">
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="rememberMe">
              <span>Remember me</span>
            </label>
            <router-link to="/help" class="forgot-link">Forgot Password?</router-link>
          </div>

          <!-- Captcha -->
          <div class="captcha-box" v-if="!captchaVerified">
            <div class="captcha-slider" @mousedown="startCaptcha" @touchstart="startCaptcha">
              <div class="captcha-track">
                <div class="captcha-fill" :style="{ width: captchaPos + 'px' }"></div>
                <div class="captcha-thumb" :style="{ left: captchaPos + 'px' }">
                  <i class="fas fa-chevron-right"></i>
                </div>
              </div>
              <span>Slide to verify</span>
            </div>
          </div>
          <div v-else class="captcha-success">
            <i class="fas fa-check-circle"></i> Verified successfully
          </div>

          <button type="submit" class="btn-login" :disabled="!captchaVerified || loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else><i class="fas fa-store"></i></span>
            {{ loading ? 'Signing in...' : 'Sign In to Seller Center' }}
          </button>

          <div v-if="error" class="error-msg">
            <i class="fas fa-exclamation-triangle"></i> {{ error }}
          </div>
        </form>

        <!-- Divider -->
        <div class="form-divider">
          <span>or continue with</span>
        </div>

        <!-- Social Login -->
        <div class="social-buttons">

        </div>

        <!-- Footer -->
        <div class="card-footer">
          <p>New to AllianceHub Seller? <router-link to="/merchant-settled">Register as Seller</router-link></p>
          <p class="back-link"><router-link to="/login"><i class="fas fa-arrow-left"></i> Back to Buyer Login</router-link></p>
        </div>
      </div>

      <!-- Language -->
      <div class="lang-selector">
        <select v-model="currentLang">
          <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
        </select>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { logLoginEvent } from '@/utils/deviceLogger'

const router = useRouter()
const userStore = useUserStore()

const loginMethod = ref('email')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const captchaPos = ref(0)
const captchaVerified = ref(false)
const currentLang = ref('English')

const languages = ['English', 'Deutsch', 'Français', 'Русский', 'Español', 'Português', 'Italiano', 'Melayu', 'Afrikaans', 'Ελληνικά', '繁體中文', '简体中文', 'Türkçe', '日本語', '한국어', 'ภาษาไทย', 'Filipino', 'العربية', 'Tiếng Việt', 'हिंदी', 'Indonesia']

const startCaptcha = (e) => {
  const startX = e.touches ? e.touches[0].clientX : e.clientX
  const onMove = (ev) => {
    const currentX = ev.touches ? ev.touches[0].clientX : ev.clientX
    const diff = currentX - startX
    captchaPos.value = Math.max(0, Math.min(diff, 250))
  }
  const onEnd = () => {
    if (captchaPos.value > 200) {
      captchaVerified.value = true
    } else {
      captchaPos.value = 0
    }
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onEnd)
    document.removeEventListener('touchmove', onMove)
    document.removeEventListener('touchend', onEnd)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onEnd)
  document.addEventListener('touchmove', onMove)
  document.addEventListener('touchend', onEnd)
}

const handleLogin = async () => {
  if (!captchaVerified.value) return
  loading.value = true
  error.value = ''
  
  try {
    const result = await userStore.login(email.value, password.value)
    if (result.success) {
      const userRole = result.role || userStore.role

      if (userRole !== 'SELLER' && userRole !== 'RATING_PLUS') {
        error.value = 'This account is not a seller. Please use the buyer login page.'
        await userStore.logout()
        return
      }
      logLoginEvent({ email: email.value, role: 'SELLER', login_status: 'success', login_type: 'login' });
      router.push('/seller')
    } else {
      error.value = result.msg || 'Login failed'
    }
  } catch (e) {
    error.value = 'An error occurred. Please try again.'
  }
  loading.value = false
}
</script>

<style scoped>
body, html { overflow-x: hidden; }
.seller-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: #0a0a1a;
}

/* Background */
.login-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.bg-gradient {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse at 20% 50%, rgba(254,44,85,0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(108,92,231,0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(0,184,148,0.08) 0%, transparent 50%),
    linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%);
}
.bg-particles {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.1), transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.08), transparent),
    radial-gradient(2px 2px at 50px 160px, rgba(255,255,255,0.06), transparent),
    radial-gradient(2px 2px at 90px 40px, rgba(255,255,255,0.1), transparent),
    radial-gradient(2px 2px at 130px 80px, rgba(255,255,255,0.08), transparent),
    radial-gradient(2px 2px at 160px 120px, rgba(255,255,255,0.06), transparent);
  background-size: 200px 200px;
  animation: float 20s linear infinite;
}
@keyframes float {
  0% { transform: translateY(0); }
  100% { transform: translateY(-200px); }
}

/* Container */
.login-container {
  position: relative;
  z-index: 2;
  width: 440px;
  max-width: 92vw;
}

/* Logo */
.login-logo {
  text-align: center;
  margin-bottom: 28px;
}
.logo-img-seller { height: 2.5rem; width: auto; object-fit: contain; margin-bottom: 8px; }
.logo-icon {
  font-size: 40px;
  margin-bottom: 8px;
}
.login-logo h1 {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 3px;
  margin: 0;
}
.logo-sub {
  color: rgba(255,255,255,0.5);
  font-size: 13px;
  margin-top: 4px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* Card */
.login-card {
  background: rgba(255,255,255,0.97);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}
.card-header {
  text-align: center;
  margin-bottom: 24px;
}
.card-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 6px;
}
.card-header p {
  color: #888;
  font-size: 14px;
  margin: 0;
}

/* Tabs */
.login-tabs {
  display: flex;
  margin-bottom: 24px;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 4px;
}
.login-tabs button {
  flex: 1;
  padding: 10px;
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #888;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.login-tabs button.active {
  background: #fff;
  color: var(--brand-primary, #FF9900);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

/* Form */
.form-group {
  margin-bottom: 18px;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 13px;
  color: #444;
}
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.input-wrapper i {
  position: absolute;
  left: 14px;
  color: #bbb;
  font-size: 14px;
  z-index: 1;
}
.input-wrapper input {
  width: 100%;
  padding: 12px 14px 12px 40px;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  font-size: 14px;
  box-sizing: border-box;
  transition: all 0.2s;
  background: #fafafa;
}
.input-wrapper input:focus {
  outline: none;
  border-color: var(--brand-primary, #FF9900);
  box-shadow: 0 0 0 3px rgba(254,44,85,0.08);
  background: #fff;
}
.toggle-pw {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: #bbb;
  padding: 4px;
}
.toggle-pw:hover { color: #666; }

/* Options */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 13px;
}
.remember-me {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  cursor: pointer;
}
.remember-me input { accent-color: var(--brand-primary, #FF9900); }
.forgot-link {
  color: var(--brand-primary, #FF9900);
  text-decoration: none;
  font-weight: 500;
}
.forgot-link:hover { text-decoration: underline; }

/* Captcha */
.captcha-box {
  margin-bottom: 20px;
}
.captcha-slider {
  background: #f0f0f0;
  border-radius: 10px;
  padding: 14px;
  text-align: center;
}
.captcha-track {
  height: 34px;
  background: #e0e0e0;
  border-radius: 17px;
  position: relative;
  margin-bottom: 8px;
  overflow: hidden;
}
.captcha-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, var(--brand-primary, #FF9900), #ff6b81);
  border-radius: 17px;
  transition: width 0.1s;
}
.captcha-thumb {
  width: 34px;
  height: 34px;
  background: #fff;
  color: var(--brand-primary, #FF9900);
  border-radius: 50%;
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 2;
}
.captcha-slider span {
  font-size: 12px;
  color: #999;
}
.captcha-success {
  text-align: center;
  padding: 12px;
  color: var(--success, #067D62);
  font-size: 14px;
  margin-bottom: 20px;
  background: #f0fff4;
  border-radius: 10px;
  font-weight: 500;
}

/* Login Button */
.btn-login {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--brand-primary, #FF9900), #ff6b81);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(254,44,85,0.3);
}
.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(254,44,85,0.4);
}
.btn-login:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Error */
.error-msg {
  color: #ff4757;
  text-align: center;
  margin-top: 14px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: #fff8f0;
  border-radius: 8px;
}

/* Divider */
.form-divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
}
.form-divider::before,
.form-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e8e8e8;
}
.form-divider span {
  padding: 0 14px;
  font-size: 12px;
  color: #aaa;
}

/* Social */
.social-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}
.btn-social {
  flex: 1;
  padding: 11px;
  border: 2px solid #e8e8e8;
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  color: #555;
}
.btn-social:hover {
  border-color: var(--brand-primary, #FF9900);
  color: var(--brand-primary, #FF9900);
  background: #fff8f0;
}

/* Footer */
.card-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}
.card-footer p {
  margin: 0 0 8px;
  font-size: 13px;
  color: #888;
}
.card-footer a {
  color: var(--brand-primary, #FF9900);
  text-decoration: none;
  font-weight: 600;
}
.card-footer a:hover { text-decoration: underline; }
.back-link a {
  color: #aaa;
  font-weight: 400;
}
.back-link i { margin-right: 4px; }

/* Language */
.lang-selector {
  margin-top: 20px;
  text-align: center;
}
.lang-selector select {
  padding: 8px 16px;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px;
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.6);
  font-size: 12px;
  cursor: pointer;
}
.lang-selector select option { color: #333; }

/* Animation */
.animate-in { animation: slideUp 0.5s ease; }
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 480px) {
  .login-card { padding: 24px 20px; }
  .login-logo h1 { font-size: 22px; }
  .card-header h2 { font-size: 18px; }
  .social-buttons { flex-direction: column; }
}

img { max-width: 100%; height: auto; }
</style>
