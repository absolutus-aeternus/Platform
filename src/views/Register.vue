<template>
  <div class="login-page">
    <div class="login-bg"></div>
    <div class="login-card animate-in">
      <div class="login-header">
        <div class="logo">
          <img loading="lazy" src="/images/logo-alliance.svg" alt="AllianceHub" class="logo-img" />
        </div>
        <h2>Create Account</h2>
        <p>Join millions of buyers and sellers worldwide</p>
      </div>

      <form @submit.prevent="handleRegister">
        <BaseInput
          v-model="email"
          type="email"
          label="Email Address"
          placeholder="your@email.com"
          prefix-icon="fas fa-envelope"
          :required="true"
          autocomplete="email"
        />

        <div class="form-row">
          <BaseInput
            v-model="password"
            type="password"
            label="Password"
            placeholder="Min 6 characters"
            prefix-icon="fas fa-lock"
            :required="true"
            autocomplete="new-password"
          />
          <BaseInput
            v-model="confirm"
            type="password"
            label="Confirm Password"
            placeholder="Re-enter"
            prefix-icon="fas fa-lock"
            :required="true"
            autocomplete="new-password"
          />
        </div>

        <div class="form-check">
          <input type="checkbox" v-model="agree" id="terms" required>
          <label for="terms">I agree to the <router-link to="/terms">Terms</router-link> and <router-link to="/privacy">Privacy Policy</router-link></label>
        </div>

        <button type="submit" class="btn-login" :disabled="loading || !agree">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Creating Account...' : 'Register' }}
        </button>

        <div v-if="error" class="alert-error"><i class="fas fa-exclamation-circle"></i> {{ error }}</div>
        <div v-if="success" class="alert-success"><i class="fas fa-check-circle"></i> {{ success }}</div>
      </form>

      <div class="divider"><span>or sign up with</span></div>

      <div class="social-btns">
        <button class="btn-social" @click="window.__toast?.show('Google signup coming soon', 'info')"><i class="fab fa-google"></i> Google</button>
        <button class="btn-social" @click="window.__toast?.show('Facebook signup coming soon', 'info')"><i class="fab fa-facebook-f"></i> Facebook</button>
      </div>

      <div class="login-footer">
        <p>Already have an account? <router-link to="/login">Login</router-link></p>
        <p><router-link to="/merchant-settled" class="seller-link"><i class="fas fa-store"></i> Register as Seller</router-link></p>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import BaseInput from '@/components/base/BaseInput.vue'

const router = useRouter()
const userStore = useUserStore()
const email = ref('')
const password = ref('')
const confirm = ref('')
const agree = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')

const handleRegister = async () => {
  if (!email.value || !email.value.includes('@')) { error.value = 'Please enter a valid email'; return }
  if (password.value !== confirm.value) { error.value = 'Passwords do not match'; return }
  if (password.value.length < 6) { error.value = 'Password must be at least 6 characters'; return }
  loading.value = true; error.value = ''; success.value = ''
  try {
    const result = await userStore.register(email.value, password.value)
    if (result.success) {
      success.value = 'Account created! You can now login.'
      setTimeout(() => router.push('/login'), 2000)
    } else { error.value = result.msg || 'Registration failed' }
  } catch { error.value = 'An error occurred' }
  loading.value = false
}
</script>

<style scoped>
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; background: #f5f5f5; }
.login-bg { position: fixed; inset: 0; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0a0a1a 100%); z-index: 0; }
.login-card { position: relative; z-index: 2; background: #fff; border-radius: 16px; padding: 40px; width: 440px; max-width: 92vw; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.login-header { text-align: center; margin-bottom: 28px; }
.logo { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 16px; }
.logo-icon { width: 40px; height: 40px; background: var(--brand-primary, #FF9900); color: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; }
.logo-img { width: 48px; height: 48px; }
.logo-text { font-size: 24px; font-weight: 800; color: #333; }
.login-header h2 { font-size: 22px; color: #222; margin-bottom: 4px; }
.login-header p { color: #888; font-size: 14px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: #444; }
.input-icon { position: relative; display: flex; align-items: center; }
.input-icon i { position: absolute; left: 14px; color: #bbb; font-size: 14px; z-index: 1; }
.input-icon input { width: 100%; padding: 12px 14px 12px 40px; border: 2px solid #e8e8e8; border-radius: 10px; font-size: 14px; transition: all 0.2s; background: #fafafa; }
.input-icon input:focus { outline: none; border-color: var(--brand-primary, #FF9900); box-shadow: 0 0 0 3px rgba(238,77,45,0.08); background: #fff; }
.form-check { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 20px; font-size: 13px; color: #666; }
.form-check input { margin-top: 3px; accent-color: var(--brand-primary, #FF9900); }
.form-check a { color: var(--brand-primary, #FF9900); font-weight: 600; }
.btn-login { width: 100%; padding: 14px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s; }
.btn-login:hover { background: var(--brand-primary-hover, #E68A00); transform: translateY(-2px); box-shadow: 0 8px 25px rgba(238,77,45,0.4); }
.btn-login:disabled { background: #ccc; cursor: not-allowed; transform: none; box-shadow: none; }
.spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.alert-error { color: #ff4757; text-align: center; margin-top: 14px; font-size: 13px; padding: 10px; background: #fff8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 6px; }
.alert-success { color: var(--success, #067D62); text-align: center; margin-top: 14px; font-size: 13px; padding: 10px; background: #f0fff4; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 6px; }
.divider { display: flex; align-items: center; margin: 24px 0; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #e8e8e8; }
.divider span { padding: 0 14px; font-size: 12px; color: #aaa; }
.social-btns { display: flex; gap: 12px; margin-bottom: 24px; }
.btn-social { flex: 1; padding: 11px; border: 2px solid #e8e8e8; background: #fff; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; color: #555; }
.btn-social:hover { border-color: var(--brand-primary, #FF9900); color: var(--brand-primary, #FF9900); }
.login-footer { text-align: center; padding-top: 20px; border-top: 1px solid #f0f0f0; }
.login-footer p { font-size: 13px; color: #888; margin-bottom: 8px; }
.login-footer a { color: var(--brand-primary, #FF9900); font-weight: 600; text-decoration: none; }
.seller-link { color: #888 !important; font-weight: 400 !important; font-size: 12px; }
.seller-link:hover { color: var(--brand-primary, #FF9900) !important; }
.animate-in { animation: slideUp 0.5s ease; }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 480px) { .login-card { padding: 28px 20px; } .form-row { grid-template-columns: 1fr; } }
</style>
