<template>
  <div class="seller-login">
    <div class="login-container">
      <div class="login-header">
        <h1>TikTok Shop</h1>
        <p>Login to your seller account</p>
      </div>
      
      <div class="login-tabs">
        <button :class="{ active: loginMethod === 'email' }" @click="loginMethod = 'email'">Email</button>
        <button :class="{ active: loginMethod === 'mobile' }" @click="loginMethod = 'mobile'">Mobile Number</button>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <input v-model="email" type="text" :placeholder="loginMethod === 'email' ? 'Please enter the email address' : 'Please enter mobile number'" required>
        </div>
        <div class="form-group">
          <input v-model="password" type="password" placeholder="Please enter your password" required>
        </div>
        
        <div class="captcha-box">
          <div class="captcha-slider" @mousedown="startCaptcha" @touchstart="startCaptcha">
            <div class="captcha-track">
              <div class="captcha-thumb" :style="{ left: captchaPos + 'px' }">→</div>
            </div>
            <span>Drag the slider to complete the puzzle</span>
          </div>
        </div>
        
        <button type="submit" class="btn-login" :disabled="!captchaVerified || loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        
        <div v-if="error" class="error-msg">{{ error }}</div>
      </form>
      
      <div class="login-footer">
        <p>If you do not have an account, <router-link to="/seller/register">Click to register</router-link></p>
        <a href="#" class="forgot-link">Forgot Password</a>
      </div>
      
      <div class="lang-selector">
        <select v-model="currentLang">
          <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
        </select>
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

const loginMethod = ref('email')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
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
.seller-login { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f5f5f5; }
.login-container { background: #fff; border-radius: 12px; padding: 40px; width: 400px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
.login-header { text-align: center; margin-bottom: 30px; }
.login-header h1 { font-size: 28px; color: #fe2c55; }
.login-header p { color: #666; margin-top: 8px; }
.login-tabs { display: flex; margin-bottom: 25px; border-bottom: 2px solid #eee; }
.login-tabs button { flex: 1; padding: 12px; background: none; border: none; font-size: 16px; cursor: pointer; color: #999; border-bottom: 2px solid transparent; margin-bottom: -2px; }
.login-tabs button.active { color: #fe2c55; border-bottom-color: #fe2c55; }
.form-group { margin-bottom: 20px; }
.form-group input { width: 100%; padding: 12px 15px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; box-sizing: border-box; }
.form-group input:focus { outline: none; border-color: #fe2c55; }
.captcha-box { margin-bottom: 20px; }
.captcha-slider { background: #f0f0f0; border-radius: 4px; padding: 15px; text-align: center; }
.captcha-track { height: 30px; background: #ddd; border-radius: 15px; position: relative; margin-bottom: 10px; }
.captcha-thumb { width: 30px; height: 30px; background: #fe2c55; color: #fff; border-radius: 50%; position: absolute; top: 0; display: flex; align-items: center; justify-content: center; cursor: grab; font-size: 14px; }
.captcha-slider span { font-size: 12px; color: #999; }
.btn-login { width: 100%; padding: 14px; background: #fe2c55; color: #fff; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
.btn-login:disabled { background: #ccc; cursor: not-allowed; }
.error-msg { color: #ff4757; text-align: center; margin-top: 15px; font-size: 14px; }
.login-footer { text-align: center; margin-top: 25px; }
.login-footer a { color: #fe2c55; text-decoration: none; }
.forgot-link { display: block; margin-top: 10px; color: #999 !important; font-size: 13px; }
.lang-selector { margin-top: 20px; text-align: center; }
.lang-selector select { padding: 8px 15px; border: 1px solid #ddd; border-radius: 4px; }
</style>
