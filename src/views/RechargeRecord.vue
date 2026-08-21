})</template>

<script setup>
const loading = ref(true)
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
const records = ref([])
onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) { const { data } = await supabase.from('recharges').select('*').eq('user_id', user.id).order('created_at', { ascending: false }); if (data) records.value = data }
  loading.value = false
  } catch (e) { console.error('Recharge record error:', e) }
})
</template>

</script>

<style scoped>
body, html { overflow-x: hidden; }.data-table { width: 100%; border-collapse: collapse; } .data-table th { background: #1a1a2e; color: white; padding: 14px 16px; text-align: left; font-size: 13px; } .data-table td { padding: 14px 16px; border-bottom: 1px solid #e2e8f0; } .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; } .status-badge.pending { background: #fef3c7; color: #92400e; } .status-badge.completed { background: #d1fae5; color: #065f46; }</style>


<script setup>
const loading = ref(true)
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
const records = ref([])
onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) { const { data } = await supabase.from('recharges').select('*').eq('user_id', user.id).order('created_at', { ascending: false }); if (data) records.value = data }
  loading.value = false
  } catch (e) { console.error('Recharge record error:', e) }
})</template>

<script setup>
const loading = ref(true)
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
const records = ref([])
onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) { const { data } = await supabase.from('recharges').select('*').eq('user_id', user.id).order('created_at', { ascending: false }); if (data) records.value = data }
  loading.value = false
  } catch (e) { console.error('Recharge record error:', e) }
})
</template>

</script>

<style scoped>
body, html { overflow-x: hidden; }.data-table { width: 100%; border-collapse: collapse; } .data-table th { background: #1a1a2e; color: white; padding: 14px 16px; text-align: left; font-size: 13px; } .data-table td { padding: 14px 16px; border-bottom: 1px solid #e2e8f0; } .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; } .status-badge.pending { background: #fef3c7; color: #92400e; } .status-badge.completed { background: #d1fae5; color: #065f46; }</style>