}</template>

<script setup>
const loading = ref(true)
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
const route = useRoute()
const router = useRouter()
const rating = ref(5)
const comment = ref('')
const msg = ref('')
const msgColor = ref('#059669')
const submitReview = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { error } = await supabase.from('evaluations').insert({ user_id: user.id, product_id: route.query.product, order_id: route.query.order, rating: rating.value, comment: comment.value })
    if (error) { msg.value = error.message; msgColor.value = '#dc2626' } else { msg.value = 'Review submitted!'; msgColor.value = '#059669' }
  loading.value = false
  } catch (e) { console.error('Evaluation error:', e); msg.value = 'Failed to submit review'; msgColor.value = '#dc2626' }
}
</template>

</script>

<style scoped>.form-group { margin-bottom: 20px; } .form-group label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px; } .form-input { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px; } .form-input:focus { border-color: #ff6b35; outline: none; } textarea.form-input { resize: vertical; font-family: inherit; }
input, select, textarea { background: #ffffff; color: #1a1a1a; border: 1px solid #ddd; }
</style>


<script setup>
const loading = ref(true)
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
const route = useRoute()
const router = useRouter()
const rating = ref(5)
const comment = ref('')
const msg = ref('')
const msgColor = ref('#059669')
const submitReview = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { error } = await supabase.from('evaluations').insert({ user_id: user.id, product_id: route.query.product, order_id: route.query.order, rating: rating.value, comment: comment.value })
    if (error) { msg.value = error.message; msgColor.value = '#dc2626' } else { msg.value = 'Review submitted!'; msgColor.value = '#059669' }
  loading.value = false
  } catch (e) { console.error('Evaluation error:', e); msg.value = 'Failed to submit review'; msgColor.value = '#dc2626' }
}</template>

<script setup>
const loading = ref(true)
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
const route = useRoute()
const router = useRouter()
const rating = ref(5)
const comment = ref('')
const msg = ref('')
const msgColor = ref('#059669')
const submitReview = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { error } = await supabase.from('evaluations').insert({ user_id: user.id, product_id: route.query.product, order_id: route.query.order, rating: rating.value, comment: comment.value })
    if (error) { msg.value = error.message; msgColor.value = '#dc2626' } else { msg.value = 'Review submitted!'; msgColor.value = '#059669' }
  loading.value = false
  } catch (e) { console.error('Evaluation error:', e); msg.value = 'Failed to submit review'; msgColor.value = '#dc2626' }
}
</template>

</script>

<style scoped>.form-group { margin-bottom: 20px; } .form-group label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px; } .form-input { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px; } .form-input:focus { border-color: #ff6b35; outline: none; } textarea.form-input { resize: vertical; font-family: inherit; }
input, select, textarea { background: #ffffff; color: #1a1a1a; border: 1px solid #ddd; }
</style>