}</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
const email = ref(''); const newPw = ref(''); const confirm = ref(''); const loading = ref(false); const msg = ref(''); const msgColor = ref('#059669')
const resetPassword = async () => {
  try {
    if (newPw.value !== confirm.value) { msg.value = 'Passwords do not match'; msgColor.value = '#dc2626'; return }
    loading.value = true
    const { error } = await supabase.auth.updateUser({ password: newPw.value })
    if (error) { msg.value = error.message; msgColor.value = '#dc2626' } else { msg.value = 'Fund password reset successfully!'; msgColor.value = '#059669' }
  } catch (e) { console.error('Fund password reset error:', e); msg.value = 'Failed to reset password'; msgColor.value = '#dc2626' }
  loading.value = false
}
</template>

</script>

<style scoped>
.page-wrapper { position: relative; z-index: 1; }
.page-wrapper { padding: 2rem; max-width: 1200px; margin: 0 auto; }
</style>


<script setup>
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
const email = ref(''); const newPw = ref(''); const confirm = ref(''); const loading = ref(false); const msg = ref(''); const msgColor = ref('#059669')
const resetPassword = async () => {
  try {
    if (newPw.value !== confirm.value) { msg.value = 'Passwords do not match'; msgColor.value = '#dc2626'; return }
    loading.value = true
    const { error } = await supabase.auth.updateUser({ password: newPw.value })
    if (error) { msg.value = error.message; msgColor.value = '#dc2626' } else { msg.value = 'Fund password reset successfully!'; msgColor.value = '#059669' }
  } catch (e) { console.error('Fund password reset error:', e); msg.value = 'Failed to reset password'; msgColor.value = '#dc2626' }
  loading.value = false
}</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
const email = ref(''); const newPw = ref(''); const confirm = ref(''); const loading = ref(false); const msg = ref(''); const msgColor = ref('#059669')
const resetPassword = async () => {
  try {
    if (newPw.value !== confirm.value) { msg.value = 'Passwords do not match'; msgColor.value = '#dc2626'; return }
    loading.value = true
    const { error } = await supabase.auth.updateUser({ password: newPw.value })
    if (error) { msg.value = error.message; msgColor.value = '#dc2626' } else { msg.value = 'Fund password reset successfully!'; msgColor.value = '#059669' }
  } catch (e) { console.error('Fund password reset error:', e); msg.value = 'Failed to reset password'; msgColor.value = '#dc2626' }
  loading.value = false
}
</template>

</script>

<style scoped>
.page-wrapper { position: relative; z-index: 1; }
.page-wrapper { padding: 2rem; max-width: 1200px; margin: 0 auto; }
</style>