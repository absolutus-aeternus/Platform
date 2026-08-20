}</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
const loading = ref(false)
const form = ref({ current: '', newPw: '', confirm: '' })
const msg = ref('')
const msgColor = ref('#059669')
const resetPassword = async () => {
  try {
    if (form.value.newPw !== form.value.confirm) { msg.value = 'Passwords do not match'; msgColor.value = '#dc2626'; return }
    const { error } = await supabase.auth.updateUser({ password: form.value.newPw })
    if (error) { msg.value = error.message; msgColor.value = '#dc2626' } else { msg.value = 'Password updated!'; msgColor.value = '#059669' }
  } catch (e) { console.error('Login password reset error:', e); msg.value = 'Failed to reset password'; msgColor.value = '#dc2626' }
}
</template>

</script>

<style scoped>.auth-card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); } .form-group { margin-bottom: 20px; } .form-group label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px; } .form-input { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px; } .form-input:focus { border-color: var(--brand-primary, #FF9900); outline: none; }</style>


<script setup>
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
const loading = ref(false)
const form = ref({ current: '', newPw: '', confirm: '' })
const msg = ref('')
const msgColor = ref('#059669')
const resetPassword = async () => {
  try {
    if (form.value.newPw !== form.value.confirm) { msg.value = 'Passwords do not match'; msgColor.value = '#dc2626'; return }
    const { error } = await supabase.auth.updateUser({ password: form.value.newPw })
    if (error) { msg.value = error.message; msgColor.value = '#dc2626' } else { msg.value = 'Password updated!'; msgColor.value = '#059669' }
  } catch (e) { console.error('Login password reset error:', e); msg.value = 'Failed to reset password'; msgColor.value = '#dc2626' }
}</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
const loading = ref(false)
const form = ref({ current: '', newPw: '', confirm: '' })
const msg = ref('')
const msgColor = ref('#059669')
const resetPassword = async () => {
  try {
    if (form.value.newPw !== form.value.confirm) { msg.value = 'Passwords do not match'; msgColor.value = '#dc2626'; return }
    const { error } = await supabase.auth.updateUser({ password: form.value.newPw })
    if (error) { msg.value = error.message; msgColor.value = '#dc2626' } else { msg.value = 'Password updated!'; msgColor.value = '#059669' }
  } catch (e) { console.error('Login password reset error:', e); msg.value = 'Failed to reset password'; msgColor.value = '#dc2626' }
}
</template>

</script>

<style scoped>.auth-card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); } .form-group { margin-bottom: 20px; } .form-group label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px; } .form-input { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px; } .form-input:focus { border-color: var(--brand-primary, #FF9900); outline: none; }</style>
