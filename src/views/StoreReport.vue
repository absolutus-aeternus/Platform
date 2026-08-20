<template><div class="page-wrapper">
  <div class="store-report">
    <div class="container">
      <h1>Store Report</h1>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="!store" class="not-found">Store not found</div>
      <div v-else class="report-grid">
        <div class="report-card">
          <h3>Store Name</h3>
          <p>{{ store.name }}</p>
        </div>
        <div class="report-card">
          <h3>Total Products</h3>
          <p>{{ store.goods_count || 0 }}</p>
        </div>
        <div class="report-card">
          <h3>Total Sales</h3>
          <p>{{ store.sales_count || 0 }}</p>
        </div>
        <div class="report-card">
          <h3>Rating</h3>
          <p>{{ store.rating || '100%' }}</p>
        </div>
      </div>
    </div>
  </div>
  </div>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/services/supabase'

const route = useRoute()
const store = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await supabase.from('sellers').select('*').eq('id', route.params.sellerId).single()
    store.value = data
  } catch (e) { console.error('Store report error:', e) }
  loading.value = false
})</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/services/supabase'

const route = useRoute()
const store = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await supabase.from('sellers').select('*').eq('id', route.params.sellerId).single()
    store.value = data
  } catch (e) { console.error('Store report error:', e) }
  loading.value = false
})
</template>

</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 20px 15px; }
h1 { margin-bottom: 25px; }
.loading, .not-found { text-align: center; padding: 40px; color: #999; }
.report-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.report-card { background: #fff; padding: 25px; border-radius: 12px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.report-card h3 { color: #666; font-size: 14px; margin-bottom: 10px; }
.report-card p { font-size: 24px; font-weight: 700; color: var(--brand-primary, #FF9900); }
@media (max-width: 1024px) { .report-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .report-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } h1 { font-size: 1.25rem; } .report-card p { font-size: 20px; } }
@media (max-width: 480px) { .report-grid { grid-template-columns: 1fr; } }
</style>
