})</template>

<script setup>
const loading = ref(true)
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/services/supabase'
const route = useRoute()
const record = ref(null)
onMounted(async () => {
  try {
    const { data } = await supabase.from('withdrawals').select('*').eq('id', route.query.id).single()
    if (data) record.value = data
  loading.value = false
  } catch (e) { console.error('Withdraw details error:', e) }
})
</template>

</script>

<style scoped>.status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; } .status-badge.pending { background: #fef3c7; color: #92400e; } .status-badge.completed { background: #d1fae5; color: #065f46; }</style>


<script setup>
const loading = ref(true)
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/services/supabase'
const route = useRoute()
const record = ref(null)
onMounted(async () => {
  try {
    const { data } = await supabase.from('withdrawals').select('*').eq('id', route.query.id).single()
    if (data) record.value = data
  loading.value = false
  } catch (e) { console.error('Withdraw details error:', e) }
})</template>

<script setup>
const loading = ref(true)
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/services/supabase'
const route = useRoute()
const record = ref(null)
onMounted(async () => {
  try {
    const { data } = await supabase.from('withdrawals').select('*').eq('id', route.query.id).single()
    if (data) record.value = data
  loading.value = false
  } catch (e) { console.error('Withdraw details error:', e) }
})
</template>

</script>

<style scoped>.status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; } .status-badge.pending { background: #fef3c7; color: #92400e; } .status-badge.completed { background: #d1fae5; color: #065f46; }</style>
