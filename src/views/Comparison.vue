})</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const products = ref([])

const formatNumber = (n) => { if (!n) return '0'; if (n >= 10000) return (n/10000).toFixed(1)+'w'; if (n >= 1000) return (n/1000).toFixed(1)+'k'; return String(n) }
const truncate = (s, l) => { if (!s || s.length <= l) return s; return s.substring(0, l) + '...' }

const removeProduct = (id) => { products.value = products.value.filter(p => p.id !== id); saveToStorage() }

const saveToStorage = () => {
  try { localStorage.setItem('comparison', JSON.stringify(products.value.map(p => p.id))) } catch (e) { console.warn("[Comparison] Error:", e.message) }
}

onMounted(async () => {
  try {
    const ids = JSON.parse(localStorage.getItem('comparison') || '[]')
    if (ids.length > 0) {
      const { data } = await supabase.from('products').select('*').in('id', ids).eq('is_active', true)
      products.value = data || []
    }
  } catch (e) { console.warn("[Comparison] Error:", e.message) }
})
</template>

</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; }
h1 { font-size: 1.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
h1 i { color: var(--brand-primary); }
.comparison-table-wrapper { overflow-x: auto; }
.comparison-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-sm); }
.comparison-table th, .comparison-table td { padding: 0.875rem 1rem; text-align: left; border-bottom: 1px solid var(--border-light); font-size: 0.8125rem; vertical-align: top; }
.comparison-table th { background: #f8f9fa; font-weight: 600; color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; }
.comparison-table th:first-child { min-width: 120px; }
.comp-product { position: relative; }
.comp-product img { width: 80px; height: 80px; object-fit: cover; border-radius: var(--radius-sm); }
.img-placeholder { width: 80px; height: 80px; background: #f0f0f0; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 2rem; color: #ccc; }
.remove-btn { position: absolute; top: -4px; right: -4px; width: 20px; height: 20px; background: var(--danger); color: #fff; border: none; border-radius: 50%; cursor: pointer; font-size: 0.625rem; display: flex; align-items: center; justify-content: center; }
.price { font-weight: 700; color: var(--brand-primary); font-size: 1rem; }
.original { text-decoration: line-through; color: var(--text-muted); }
.discount { background: var(--danger); color: #fff; padding: 1px 4px; border-radius: 2px; font-size: 0.6875rem; font-weight: 600; }
.stars { color: var(--brand-primary, #FF9900); font-size: 0.625rem; margin-right: 4px; }
.in-stock { color: var(--success); }
.out-stock { color: var(--danger); }
.desc-cell { max-width: 200px; font-size: 0.75rem; color: var(--text-secondary); line-height: 1.5; }
.empty-state { text-align: center; padding: 4rem 1rem; color: var(--text-muted); }
.empty-state i { font-size: 3rem; color: #ddd; margin-bottom: 1rem; display: block; }

/* Responsive */
@media (max-width: 768px) {
  h1 { font-size: 1.25rem; }
  .comparison-table-wrapper { margin: 0 -1rem; padding: 0 1rem; }
  .comparison-table th, .comparison-table td { padding: 8px; font-size: 12px; }
  .comp-product img, .img-placeholder { width: 56px; height: 56px; }
  .desc-cell { max-width: 120px; }
  .btn-primary { padding: 6px 12px; font-size: 11px; }
}
@media (max-width: 480px) {
  .container { padding: 1rem 0.5rem; }
  h1 { font-size: 1.1rem; }
  .comparison-table th:first-child { min-width: 80px; }
  .comp-product img, .img-placeholder { width: 48px; height: 48px; }
}

img { max-width: 100%; height: auto; }
</style>


<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const products = ref([])

const formatNumber = (n) => { if (!n) return '0'; if (n >= 10000) return (n/10000).toFixed(1)+'w'; if (n >= 1000) return (n/1000).toFixed(1)+'k'; return String(n) }
const truncate = (s, l) => { if (!s || s.length <= l) return s; return s.substring(0, l) + '...' }

const removeProduct = (id) => { products.value = products.value.filter(p => p.id !== id); saveToStorage() }

const saveToStorage = () => {
  try { localStorage.setItem('comparison', JSON.stringify(products.value.map(p => p.id))) } catch (e) { console.warn("[Comparison] Error:", e.message) }
}

onMounted(async () => {
  try {
    const ids = JSON.parse(localStorage.getItem('comparison') || '[]')
    if (ids.length > 0) {
      const { data } = await supabase.from('products').select('*').in('id', ids).eq('is_active', true)
      products.value = data || []
    }
  } catch (e) { console.warn("[Comparison] Error:", e.message) }
})</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const products = ref([])

const formatNumber = (n) => { if (!n) return '0'; if (n >= 10000) return (n/10000).toFixed(1)+'w'; if (n >= 1000) return (n/1000).toFixed(1)+'k'; return String(n) }
const truncate = (s, l) => { if (!s || s.length <= l) return s; return s.substring(0, l) + '...' }

const removeProduct = (id) => { products.value = products.value.filter(p => p.id !== id); saveToStorage() }

const saveToStorage = () => {
  try { localStorage.setItem('comparison', JSON.stringify(products.value.map(p => p.id))) } catch (e) { console.warn("[Comparison] Error:", e.message) }
}

onMounted(async () => {
  try {
    const ids = JSON.parse(localStorage.getItem('comparison') || '[]')
    if (ids.length > 0) {
      const { data } = await supabase.from('products').select('*').in('id', ids).eq('is_active', true)
      products.value = data || []
    }
  } catch (e) { console.warn("[Comparison] Error:", e.message) }
})
</template>

</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; }
h1 { font-size: 1.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
h1 i { color: var(--brand-primary); }
.comparison-table-wrapper { overflow-x: auto; }
.comparison-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-sm); }
.comparison-table th, .comparison-table td { padding: 0.875rem 1rem; text-align: left; border-bottom: 1px solid var(--border-light); font-size: 0.8125rem; vertical-align: top; }
.comparison-table th { background: #f8f9fa; font-weight: 600; color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; }
.comparison-table th:first-child { min-width: 120px; }
.comp-product { position: relative; }
.comp-product img { width: 80px; height: 80px; object-fit: cover; border-radius: var(--radius-sm); }
.img-placeholder { width: 80px; height: 80px; background: #f0f0f0; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 2rem; color: #ccc; }
.remove-btn { position: absolute; top: -4px; right: -4px; width: 20px; height: 20px; background: var(--danger); color: #fff; border: none; border-radius: 50%; cursor: pointer; font-size: 0.625rem; display: flex; align-items: center; justify-content: center; }
.price { font-weight: 700; color: var(--brand-primary); font-size: 1rem; }
.original { text-decoration: line-through; color: var(--text-muted); }
.discount { background: var(--danger); color: #fff; padding: 1px 4px; border-radius: 2px; font-size: 0.6875rem; font-weight: 600; }
.stars { color: var(--brand-primary, #FF9900); font-size: 0.625rem; margin-right: 4px; }
.in-stock { color: var(--success); }
.out-stock { color: var(--danger); }
.desc-cell { max-width: 200px; font-size: 0.75rem; color: var(--text-secondary); line-height: 1.5; }
.empty-state { text-align: center; padding: 4rem 1rem; color: var(--text-muted); }
.empty-state i { font-size: 3rem; color: #ddd; margin-bottom: 1rem; display: block; }

/* Responsive */
@media (max-width: 768px) {
  h1 { font-size: 1.25rem; }
  .comparison-table-wrapper { margin: 0 -1rem; padding: 0 1rem; }
  .comparison-table th, .comparison-table td { padding: 8px; font-size: 12px; }
  .comp-product img, .img-placeholder { width: 56px; height: 56px; }
  .desc-cell { max-width: 120px; }
  .btn-primary { padding: 6px 12px; font-size: 11px; }
}
@media (max-width: 480px) {
  .container { padding: 1rem 0.5rem; }
  h1 { font-size: 1.1rem; }
  .comparison-table th:first-child { min-width: 80px; }
  .comp-product img, .img-placeholder { width: 48px; height: 48px; }
}

img { max-width: 100%; height: auto; }
</style>