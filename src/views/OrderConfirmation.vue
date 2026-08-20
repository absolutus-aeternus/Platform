})</template>

<script setup>
const loading = ref(true)
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/services/supabase'
const route = useRoute()
const order = ref(null)
onMounted(async () => { try {
  const { data } = await supabase.from('orders').select('*, order_items(*)').eq('id', route.query.order).single()
  loading.value = false
  if (data) order.value = data } catch (e) { console.error("Order load error:", e) }
})
</template>

</script>

<style scoped>
@media (max-width: 768px) {
  div[style*="grid-template-columns:1fr 1fr"] { grid-template-columns: 1fr !important; gap: 16px !important; }
}
</style>


<script setup>
const loading = ref(true)
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/services/supabase'
const route = useRoute()
const order = ref(null)
onMounted(async () => { try {
  const { data } = await supabase.from('orders').select('*, order_items(*)').eq('id', route.query.order).single()
  loading.value = false
  if (data) order.value = data } catch (e) { console.error("Order load error:", e) }
})</template>

<script setup>
const loading = ref(true)
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/services/supabase'
const route = useRoute()
const order = ref(null)
onMounted(async () => { try {
  const { data } = await supabase.from('orders').select('*, order_items(*)').eq('id', route.query.order).single()
  loading.value = false
  if (data) order.value = data } catch (e) { console.error("Order load error:", e) }
})
</template>

</script>

<style scoped>
@media (max-width: 768px) {
  div[style*="grid-template-columns:1fr 1fr"] { grid-template-columns: 1fr !important; gap: 16px !important; }
}
</style>