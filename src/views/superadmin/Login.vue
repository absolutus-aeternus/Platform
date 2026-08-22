<template>
  <div class="page-wrapper">
  <div class="auth-page superadmin-auth">
    <div class="auth-bg"><div class="auth-particles"></div></div>
    <div class="auth-container animate-in">
      <div class="auth-header">
        <div class="auth-logo">
          <img loading="lazy" src="/images/logo-alliance.png" alt="AllianceHub" class="logo-img" />
          <span class="superadmin-badge">SUPER ADMIN</span>
        </div>
        <p>Super Administrator Access Only</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label><i class="fas fa-shield-alt"></i> Super Admin Email</label>
          <input v-model="email" type="text" placeholder="superadmin@alliancehub.com" required>
        </div>
        <div class="form-group">
          <label><i class="fas fa-lock"></i> Password</label>
          <input v-model="password" type="password" placeholder="••••••••" required>
        </div>
        
        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Authenticating...' : 'Super Admin Login' }}
        </button>
        
        <div v-if="error" class="error-msg"><i class="fas fa-exclamation-circle"></i> {{ error }}</div>
      </form>
      
      <div class="auth-footer">
        <router-link to="/login/999/customer-service/999" class="forgot-link">← Admin Login</router-link>
        <span class="divider">|</span>
        <router-link to="/login" class="forgot-link">Buyer Login →</router-link>
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

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = 'Please enter your email and password'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const result = await userStore.login(email.value, password.value)
    if (result.success) {
      const userRole = result.role || userStore.role

      if (userRole !== 'SUPER_ADMIN') {
        error.value = 'Access denied. Super Administrator privileges required.'
        await userStore.logout()
        return
      }
      logLoginEvent({ email: email.value, role: 'SUPER_ADMIN', login_status: 'success', login_type: 'superadmin_login' });
      router.push('/999/super-admin/999')
    } else {
      const msg = result.msg || 'Login failed'
      if (msg.includes('Invalid login credentials')) {
        logLoginEvent({ email: email.value, login_status: 'failed', login_type: 'superadmin_login' });
        error.value = 'Invalid email or password.'
      } else if (msg.includes('Email not confirmed')) {
        error.value = 'Please confirm your email first.'
      } else {
        error.value = msg
      }
    }
  } catch (e) {
    error.value = 'An error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
body, html { overflow-x: hidden; }
.auth-page { min-height: 100dvh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #2d1b69 100%); position: relative; overflow: hidden; }
.auth-bg { position: absolute; inset: 0; }
.auth-particles { position: absolute; inset: 0; background: radial-gradient(circle at 30% 40%, rgba(108,92,231,0.15), transparent 50%), radial-gradient(circle at 70% 60%, rgba(254,44,85,0.1), transparent 50%); }
.auth-container { background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); border-radius: 16px; padding: 40px; width: 420px; max-width: 90vw; box-shadow: 0 20px 60px rgba(0,0,0,0.5); position: relative; z-index: 2; border-top: 4px solid #6c5ce7; }
.auth-header { text-align: center; margin-bottom: 30px; }
.auth-logo { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px; }
.logo-img { height: 2rem; width: auto; object-fit: contain; }
.superadmin-badge { background: linear-gradient(135deg, #6c5ce7, #a29bfe); color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 1px; }
.auth-header p { color: #666; font-size: 14px; }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 500; font-size: 13px; color: #555; }
.form-group input { width: 100%; padding: 12px 14px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; box-sizing: border-box; transition: all 0.2s; }
.form-group input:focus { outline: none; border-color: #6c5ce7; box-shadow: 0 0 0 3px rgba(108,92,231,0.15); }
.btn-submit { width: 100%; padding: 14px; background: linear-gradient(135deg, #6c5ce7, #2d3436); color: #fff; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s; }
.btn-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(108,92,231,0.4); }
.btn-submit:disabled { background: #ccc; cursor: not-allowed; transform: none; box-shadow: none; }
.spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.error-msg { color: #ff4757; text-align: center; margin-top: 15px; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 6px; }
.auth-footer { text-align: center; margin-top: 20px; display: flex; align-items: center; justify-content: center; gap: 10px; }
.forgot-link { color: #999; font-size: 13px; text-decoration: none; }
.forgot-link:hover { color: #6c5ce7; }
.divider { color: #ddd; font-size: 12px; }
.animate-in { animation: slideInUp 0.5s ease; }

@media (max-width: 768px) { .form-group input { font-size: 16px; } }
</style>
