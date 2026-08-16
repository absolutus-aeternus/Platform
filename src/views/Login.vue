<template>
  <div class="login-page">
    <div class="login-bg"></div>
    <div class="login-card animate-in">
      <div class="login-header">
        <div class="logo">
          <img src="/images/logo-alliance.svg" alt="AllianceHub" class="logo-img" />
        </div>
        <h2>Login</h2>
        <p>Welcome back! Please sign in to your account.</p>
      </div>

      <div class="login-tabs">
        <button :class="{ active: method === 'email' }" @click="method = 'email'">
          <i class="fas fa-envelope"></i> Email
        </button>
        <button :class="{ active: method === 'phone' }" @click="method = 'phone'">
          <i class="fas fa-mobile-alt"></i> Phone
        </button>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>{{ method === 'email' ? 'Email Address' : 'Phone Number' }}</label>
          <div class="input-icon">
            <i :class="method === 'email' ? 'fas fa-envelope' : 'fas fa-phone'"></i>
            <input v-model="email" :type="method === 'email' ? 'email' : 'tel'"
              :placeholder="method === 'email' ? 'your@email.com' : '+62 812 3456 7890'" required>
          </div>
        </div>

        <div class="form-group">
          <label>Password</label>
          <div class="input-icon">
            <i class="fas fa-lock"></i>
            <input v-model="password" :type="showPw ? 'text' : 'password'" placeholder="Enter your password" required>
            <button type="button" class="toggle-pw" @click="showPw = !showPw">
              <i :class="showPw ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <div class="form-options">
          <label class="remember"><input type="checkbox" v-model="remember"> Remember me</label>
          <router-link to="/login-password-reset" class="forgot">Forgot Password?</router-link>
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Signing in...' : 'Login' }}
        </button>

        <div v-if="error" class="alert-error"><i class="fas fa-exclamation-circle"></i> {{ error }}</div>
      </form>

      <div class="divider"><span>or continue with</span></div>

      <div class="social-btns">
        <button class="btn-social"><i class="fab fa-google"></i> Google</button>
        <button class="btn-social"><i class="fab fa-facebook-f"></i> Facebook</button>
      </div>

      <div class="login-footer">
        <p>Don't have an account? <router-link to="/register">Register</router-link></p>
        <p><router-link to="/merchant-settled" class="seller-link"><i class="fas fa-store"></i> Register as Seller</router-link></p>
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
const method = ref('email')
const email = ref('')
const password = ref('')
const showPw = ref(false)
const remember = ref(false)
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!email.value || !password.value) { error.value = 'Please fill all fields'; return }
  loading.value = true
  error.value = ''
  try {
    const result = await userStore.login(email.value, password.value)
    if (result.success) {
      const role = result.role || userStore.role
      if (role === 'ADMIN') { error.value = 'Admin accounts must use admin login'; await userStore.logout(); return }
      if (role === 'SELLER') { error.value = 'Seller accounts must use seller login'; await userStore.logout(); return }
      if (role === 'SUPER_ADMIN') { error.value = 'Super Admin accounts must use admin login'; await userStore.logout(); return }
      router.push('/user')
    } else {
      const msg = result.msg || ''
      if (msg.includes('Invalid')) error.value = 'Invalid email or password'
      else if (msg.includes('not confirmed')) error.value = 'Please confirm your email first'
      else error.value = msg || 'Login failed'
    }
  } catch { error.value = 'An error occurred' }
  loading.value = false
}
</script>

<style scoped>
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; background: #f5f5f5; }
.login-bg { position: fixed; inset: 0; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0a0a1a 100%); z-index: 0; }
.login-card { position: relative; z-index: 2; background: #fff; border-radius: 16px; padding: 40px; width: 420px; max-width: 92vw; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.login-header { text-align: center; margin-bottom: 28px; }
.logo { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 16px; }
.logo-icon { width: 40px; height: 40px; background: var(--primary, #ee4d2d); color: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; }
.logo-img { width: 48px; height: 48px; }
.logo-text { font-size: 24px; font-weight: 800; color: #333; }
.login-header h2 { font-size: 22px; color: #222; margin-bottom: 4px; }
.login-header p { color: #888; font-size: 14px; }
.login-tabs { display: flex; margin-bottom: 24px; background: #f5f5f5; border-radius: 10px; padding: 4px; }
.login-tabs button { flex: 1; padding: 10px; background: none; border: none; border-radius: 8px; font-size: 14px; color: #888; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; }
.login-tabs button.active { background: #fff; color: var(--primary, #ee4d2d); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: #444; }
.input-icon { position: relative; display: flex; align-items: center; }
.input-icon i { position: absolute; left: 14px; color: #bbb; font-size: 14px; z-index: 1; }
.input-icon input { width: 100%; padding: 12px 14px 12px 40px; border: 2px solid #e8e8e8; border-radius: 10px; font-size: 14px; transition: all 0.2s; background: #fafafa; }
.input-icon input:focus { outline: none; border-color: var(--primary, #ee4d2d); box-shadow: 0 0 0 3px rgba(238,77,45,0.08); background: #fff; }
.toggle-pw { position: absolute; right: 12px; background: none; border: none; color: #bbb; cursor: pointer; padding: 4px; }
.form-options { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-size: 13px; }
.remember { display: flex; align-items: center; gap: 6px; color: #666; cursor: pointer; }
.remember input { accent-color: var(--primary, #ee4d2d); }
.forgot { color: var(--primary, #ee4d2d); text-decoration: none; font-weight: 500; }
.btn-login { width: 100%; padding: 14px; background: var(--primary, #ee4d2d); color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s; }
.btn-login:hover { background: var(--primary-dark, #d73211); transform: translateY(-2px); box-shadow: 0 8px 25px rgba(238,77,45,0.4); }
.btn-login:disabled { background: #ccc; cursor: not-allowed; transform: none; box-shadow: none; }
.spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.alert-error { color: #ff4757; text-align: center; margin-top: 14px; font-size: 13px; padding: 10px; background: #fff5f5; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 6px; }
.divider { display: flex; align-items: center; margin: 24px 0; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #e8e8e8; }
.divider span { padding: 0 14px; font-size: 12px; color: #aaa; }
.social-btns { display: flex; gap: 12px; margin-bottom: 24px; }
.btn-social { flex: 1; padding: 11px; border: 2px solid #e8e8e8; background: #fff; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; color: #555; }
.btn-social:hover { border-color: var(--primary, #ee4d2d); color: var(--primary, #ee4d2d); background: #fff5f5; }
.login-footer { text-align: center; padding-top: 20px; border-top: 1px solid #f0f0f0; }
.login-footer p { font-size: 13px; color: #888; margin-bottom: 12px; }
.login-footer a { color: var(--primary, #ee4d2d); font-weight: 600; text-decoration: none; }

.animate-in { animation: slideUp 0.5s ease; }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 480px) { .login-card { padding: 28px 20px; } .logo-text { font-size: 20px; } }
</style>
