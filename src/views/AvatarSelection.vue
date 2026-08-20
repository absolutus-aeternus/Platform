}</template>

<script setup>
const loading = ref(true)
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
const router = useRouter()
const selected = ref(1)
const emojis = ['😊','😎','🤩','😇','🥳','🐶','🐱','🦊','🐼','🦁']
const colors = ['#fef3c7','#dbeafe','#d1fae5','#fce7f3','#ede9fe','#fee2e2','#e0e7ff','#ccfbf1','#f0fdf4','#fdf2f8']
const selectAvatar = (n) => { selected.value = n }
const saveAvatar = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { router.push('/login'); return }
  loading.value = false
  try { await supabase.from('users').update({ avatar: String(selected.value) }).eq('id', user.id) } catch(_e) { console.error('AvatarSelection.vue:', _e); window.__toast?.show('Operation failed', 'error') }
  router.push('/user/settings')
}
</template>

</script>

<style scoped>
.avatar-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
@media (max-width: 768px) { .avatar-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; } }
@media (max-width: 480px) { .avatar-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
</style>


<script setup>
const loading = ref(true)
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
const router = useRouter()
const selected = ref(1)
const emojis = ['😊','😎','🤩','😇','🥳','🐶','🐱','🦊','🐼','🦁']
const colors = ['#fef3c7','#dbeafe','#d1fae5','#fce7f3','#ede9fe','#fee2e2','#e0e7ff','#ccfbf1','#f0fdf4','#fdf2f8']
const selectAvatar = (n) => { selected.value = n }
const saveAvatar = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { router.push('/login'); return }
  loading.value = false
  try { await supabase.from('users').update({ avatar: String(selected.value) }).eq('id', user.id) } catch(_e) { console.error('AvatarSelection.vue:', _e); window.__toast?.show('Operation failed', 'error') }
  router.push('/user/settings')
}</template>

<script setup>
const loading = ref(true)
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
const router = useRouter()
const selected = ref(1)
const emojis = ['😊','😎','🤩','😇','🥳','🐶','🐱','🦊','🐼','🦁']
const colors = ['#fef3c7','#dbeafe','#d1fae5','#fce7f3','#ede9fe','#fee2e2','#e0e7ff','#ccfbf1','#f0fdf4','#fdf2f8']
const selectAvatar = (n) => { selected.value = n }
const saveAvatar = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { router.push('/login'); return }
  loading.value = false
  try { await supabase.from('users').update({ avatar: String(selected.value) }).eq('id', user.id) } catch(_e) { console.error('AvatarSelection.vue:', _e); window.__toast?.show('Operation failed', 'error') }
  router.push('/user/settings')
}
</template>

</script>

<style scoped>
.avatar-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
@media (max-width: 768px) { .avatar-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; } }
@media (max-width: 480px) { .avatar-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
</style>