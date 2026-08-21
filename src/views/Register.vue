}</template>

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
</template>

</script>

<style scoped>
.login-page { min-height: 100dvh; display: flex; align-items: center; justify-content: center; position: relative; background: #f5f5f5; }
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

img { max-width: 100%; height: auto; }
</style>


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
}</template>

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
</template>

</script>

<style scoped>
.login-page { min-height: 100dvh; display: flex; align-items: center; justify-content: center; position: relative; background: #f5f5f5; }
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

img { max-width: 100%; height: auto; }
</style>