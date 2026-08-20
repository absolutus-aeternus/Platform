}</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
const cards = ref([])
const loading = ref(false)
const form = ref({ bank: '', number: '', holder: '' })
onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase.from('bank_cards').select('*').eq('user_id', user.id)
      if (!error && data) cards.value = data
    }
  } catch (e) { console.warn('bank_cards table not available:', e.message) }
})
const addCard = async () => {
  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('bank_cards').insert({ user_id: user.id, bank_name: form.value.bank, last_four: form.value.number.slice(-4), holder_name: form.value.holder })
    if (error) throw error
    form.value = { bank: '', number: '', holder: '' }
    const { data } = await supabase.from('bank_cards').select('*').eq('user_id', user.id)
    if (data) cards.value = data
    window.__toast?.show('Card added!', 'success')
  } catch (e) { window.__toast?.show('Failed: ' + e.message, 'error') }
  loading.value = false
}
</template>

</script>

<style scoped>.auth-card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); } .form-group { margin-bottom: 20px; } .form-group label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px; } .form-input { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px; } .form-input:focus { border-color: var(--brand-primary, #FF9900); outline: none; }</style>


<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
const cards = ref([])
const loading = ref(false)
const form = ref({ bank: '', number: '', holder: '' })
onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase.from('bank_cards').select('*').eq('user_id', user.id)
      if (!error && data) cards.value = data
    }
  } catch (e) { console.warn('bank_cards table not available:', e.message) }
})
const addCard = async () => {
  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('bank_cards').insert({ user_id: user.id, bank_name: form.value.bank, last_four: form.value.number.slice(-4), holder_name: form.value.holder })
    if (error) throw error
    form.value = { bank: '', number: '', holder: '' }
    const { data } = await supabase.from('bank_cards').select('*').eq('user_id', user.id)
    if (data) cards.value = data
    window.__toast?.show('Card added!', 'success')
  } catch (e) { window.__toast?.show('Failed: ' + e.message, 'error') }
  loading.value = false
}</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
const cards = ref([])
const loading = ref(false)
const form = ref({ bank: '', number: '', holder: '' })
onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase.from('bank_cards').select('*').eq('user_id', user.id)
      if (!error && data) cards.value = data
    }
  } catch (e) { console.warn('bank_cards table not available:', e.message) }
})
const addCard = async () => {
  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('bank_cards').insert({ user_id: user.id, bank_name: form.value.bank, last_four: form.value.number.slice(-4), holder_name: form.value.holder })
    if (error) throw error
    form.value = { bank: '', number: '', holder: '' }
    const { data } = await supabase.from('bank_cards').select('*').eq('user_id', user.id)
    if (data) cards.value = data
    window.__toast?.show('Card added!', 'success')
  } catch (e) { window.__toast?.show('Failed: ' + e.message, 'error') }
  loading.value = false
}
</template>

</script>

<style scoped>.auth-card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); } .form-group { margin-bottom: 20px; } .form-group label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px; } .form-input { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px; } .form-input:focus { border-color: var(--brand-primary, #FF9900); outline: none; }</style>
