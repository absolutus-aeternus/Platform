<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1>TikTok Shop</h1>
        <p>Create your account</p>
      </div>
      
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <input v-model="email" type="email" placeholder="Please enter the email" required>
        </div>
        <div class="form-group">
          <input v-model="password" type="password" placeholder="Please enter password" required>
        </div>
        <div class="form-group">
          <input v-model="confirmPassword" type="password" placeholder="Please enter the confirmation password" required>
        </div>
        
        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
        
        <div v-if="error" class="error-msg">{{ error }}</div>
      </form>
      
      <div class="auth-footer">
        <p>Already have an account? <router-link to="/login">Log in</router-link></p>
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

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  if (password.value.length < 6 || password.value.length > 20) {
    error.value = 'Password must be 6-20 characters'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const result = await userStore.register(email.value, password.value)
    if (result.code === '0') {
      router.push('/login')
    } else {
      error.value = result.msg || 'Registration failed'
    }
  } catch (e) {
    error.value = 'An error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f5f5f5; }
.auth-container { background: #fff; border-radius: 8px; padding: 40px; width: 400px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
.auth-header { text-align: center; margin-bottom: 30px; }
.auth-header h1 { font-size: 28px; color: #fe2c55; }
.auth-header p { color: #666; margin-top: 8px; }
.form-group { margin-bottom: 20px; }
.form-group input { width: 100%; padding: 12px 15px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; box-sizing: border-box; }
.form-group input:focus { outline: none; border-color: #fe2c55; }
.btn-submit { width: 100%; padding: 14px; background: #fe2c55; color: #fff; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
.btn-submit:hover { background: #e6254d; }
.btn-submit:disabled { background: #ccc; cursor: not-allowed; }
.error-msg { color: #ff4757; text-align: center; margin-top: 15px; font-size: 14px; }
.auth-footer { text-align: center; margin-top: 25px; }
.auth-footer a { color: #fe2c55; text-decoration: none; }
</style>
