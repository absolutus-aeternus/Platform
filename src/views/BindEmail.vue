}</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
const router = useRouter()
const email = ref('')
const code = ref('')
const countdown = ref(0)
const msg = ref('')
const msgColor = ref('#059669')
const loading = ref(false)

const sendCode = () => {
  countdown.value = 60
  const t = setInterval(() => { countdown.value--; if (countdown.value <= 0) clearInterval(t) }, 1000)
}

const bindEmail = async () => {
  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { error } = await supabase.from('users').update({ email: email.value }).eq('id', user.id)
    if (error) { msg.value = error.message; msgColor.value = '#dc2626' } else { msg.value = 'Email bound successfully!'; msgColor.value = '#059669' }
  } catch (e) { console.error('Bind email error:', e); msg.value = 'Failed to bind email'; msgColor.value = '#dc2626' }
  finally { loading.value = false }
}
</template>

</script>

<style scoped>.auth-card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); } .form-group { margin-bottom: 20px; } .form-group label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px; } .form-input { width: 100%; padding: 12px 16px; border: 2px solid #e28f0; border-radius: 8px; font-size: 15px; } .form-input:focus { border-color: var(--brand-primary, #FF9900); outline: none; }</style>


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
const router = useRouter()
const email = ref('')
const code = ref('')
const countdown = ref(0)
const msg = ref('')
const msgColor = ref('#059669')
const loading = ref(false)

const sendCode = () => {
  countdown.value = 60
  const t = setInterval(() => { countdown.value--; if (countdown.value <= 0) clearInterval(t) }, 1000)
}

const bindEmail = async () => {
  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { error } = await supabase.from('users').update({ email: email.value }).eq('id', user.id)
    if (error) { msg.value = error.message; msgColor.value = '#dc2626' } else { msg.value = 'Email bound successfully!'; msgColor.value = '#059669' }
  } catch (e) { console.error('Bind email error:', e); msg.value = 'Failed to bind email'; msgColor.value = '#dc2626' }
  finally { loading.value = false }
}</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
const router = useRouter()
const email = ref('')
const code = ref('')
const countdown = ref(0)
const msg = ref('')
const msgColor = ref('#059669')
const loading = ref(false)

const sendCode = () => {
  countdown.value = 60
  const t = setInterval(() => { countdown.value--; if (countdown.value <= 0) clearInterval(t) }, 1000)
}

const bindEmail = async () => {
  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { error } = await supabase.from('users').update({ email: email.value }).eq('id', user.id)
    if (error) { msg.value = error.message; msgColor.value = '#dc2626' } else { msg.value = 'Email bound successfully!'; msgColor.value = '#059669' }
  } catch (e) { console.error('Bind email error:', e); msg.value = 'Failed to bind email'; msgColor.value = '#dc2626' }
  finally { loading.value = false }
}
</template>

</script>

<style scoped>.auth-card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); } .form-group { margin-bottom: 20px; } .form-group label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px; } .form-input { width: 100%; padding: 12px 16px; border: 2px solid #e28f0; border-radius: 8px; font-size: 15px; } .form-input:focus { border-color: var(--brand-primary, #FF9900); outline: none; }</style>
