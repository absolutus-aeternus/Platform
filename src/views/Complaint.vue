}</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
const loading = ref(false)
const form = ref({ orderId: '', subject: '', category: '', description: '' })
const msg = ref('')
const msgColor = ref('#059669')
const submitComplaint = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { msg.value = 'Please login first'; msgColor.value = '#dc2626'; return }
    const { error } = await supabase.from('complaints').insert({ user_id: user.id, order_id: form.value.orderId || null, subject: form.value.subject, category: form.value.category, description: form.value.description })
    if (error) { msg.value = error.message; msgColor.value = '#dc2626' } else { msg.value = 'Complaint submitted! We will review it shortly.'; msgColor.value = '#059669'; form.value = { orderId: '', subject: '', category: '', description: '' } }
  } catch (e) { console.error('Complaint error:', e); msg.value = 'Failed to submit complaint'; msgColor.value = '#dc2626' }
}
</template>

</script>

<style scoped>.form-group { margin-bottom: 20px; } .form-group label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px; } .form-input { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px; } .form-input:focus { border-color: #ff6b35; outline: none; } textarea.form-input { resize: vertical; font-family: inherit; }
input, select, textarea { background: #ffffff; color: #1a1a1a; border: 1px solid #ddd; }
</style>


<script setup>
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
const loading = ref(false)
const form = ref({ orderId: '', subject: '', category: '', description: '' })
const msg = ref('')
const msgColor = ref('#059669')
const submitComplaint = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { msg.value = 'Please login first'; msgColor.value = '#dc2626'; return }
    const { error } = await supabase.from('complaints').insert({ user_id: user.id, order_id: form.value.orderId || null, subject: form.value.subject, category: form.value.category, description: form.value.description })
    if (error) { msg.value = error.message; msgColor.value = '#dc2626' } else { msg.value = 'Complaint submitted! We will review it shortly.'; msgColor.value = '#059669'; form.value = { orderId: '', subject: '', category: '', description: '' } }
  } catch (e) { console.error('Complaint error:', e); msg.value = 'Failed to submit complaint'; msgColor.value = '#dc2626' }
}</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
const loading = ref(false)
const form = ref({ orderId: '', subject: '', category: '', description: '' })
const msg = ref('')
const msgColor = ref('#059669')
const submitComplaint = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { msg.value = 'Please login first'; msgColor.value = '#dc2626'; return }
    const { error } = await supabase.from('complaints').insert({ user_id: user.id, order_id: form.value.orderId || null, subject: form.value.subject, category: form.value.category, description: form.value.description })
    if (error) { msg.value = error.message; msgColor.value = '#dc2626' } else { msg.value = 'Complaint submitted! We will review it shortly.'; msgColor.value = '#059669'; form.value = { orderId: '', subject: '', category: '', description: '' } }
  } catch (e) { console.error('Complaint error:', e); msg.value = 'Failed to submit complaint'; msgColor.value = '#dc2626' }
}
</template>

</script>

<style scoped>.form-group { margin-bottom: 20px; } .form-group label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px; } .form-input { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px; } .form-input:focus { border-color: #ff6b35; outline: none; } textarea.form-input { resize: vertical; font-family: inherit; }
input, select, textarea { background: #ffffff; color: #1a1a1a; border: 1px solid #ddd; }
</style>