}</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
const router = useRouter(); const confirm = ref(false); const loading = ref(false); const msg = ref('')
const cancelAccount = async () => {
  try {
    loading.value = true
    const { data: { user } } = await supabase.auth.getUser()
    if (user) { await supabase.from('users').update({ role: 'CANCELLED' }).eq('id', user.id); await supabase.auth.signOut() }
    msg.value = 'Account has been scheduled for deletion.'
    setTimeout(() => router.push('/'), 3000)
  } catch (e) { console.error('Cancel account error:', e); msg.value = 'Failed to cancel account' }
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
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
const router = useRouter(); const confirm = ref(false); const loading = ref(false); const msg = ref('')
const cancelAccount = async () => {
  try {
    loading.value = true
    const { data: { user } } = await supabase.auth.getUser()
    if (user) { await supabase.from('users').update({ role: 'CANCELLED' }).eq('id', user.id); await supabase.auth.signOut() }
    msg.value = 'Account has been scheduled for deletion.'
    setTimeout(() => router.push('/'), 3000)
  } catch (e) { console.error('Cancel account error:', e); msg.value = 'Failed to cancel account' }
  loading.value = false
}</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
const router = useRouter(); const confirm = ref(false); const loading = ref(false); const msg = ref('')
const cancelAccount = async () => {
  try {
    loading.value = true
    const { data: { user } } = await supabase.auth.getUser()
    if (user) { await supabase.from('users').update({ role: 'CANCELLED' }).eq('id', user.id); await supabase.auth.signOut() }
    msg.value = 'Account has been scheduled for deletion.'
    setTimeout(() => router.push('/'), 3000)
  } catch (e) { console.error('Cancel account error:', e); msg.value = 'Failed to cancel account' }
  loading.value = false
}
</template>

</script>

<style scoped>
.page-wrapper { position: relative; z-index: 1; }
.page-wrapper { padding: 2rem; max-width: 1200px; margin: 0 auto; }
</style>