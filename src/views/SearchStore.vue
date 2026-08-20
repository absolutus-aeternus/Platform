onMounted(() => search())</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const query = ref('')
const stores = ref([])
const loading = ref(false)

const search = async () => {
  loading.value = true
  try {
    let q = supabase.from('sellers').select('*').eq('status', 'active')
    if (query.value) q = q.ilike('name', `%${query.value}%`)
    const { data } = await q.order('followers', { ascending: false }).limit(30)
    stores.value = data || []
  } catch (e) { console.error('Search stores error:', e) }
  loading.value = false
}

onMounted(() => search())
</template>

</script>

<style scoped>
body, html { overflow-x: hidden; }
.container { max-width: 1200px; margin: 0 auto; padding: 20px 15px; }
h1 { margin-bottom: 20px; font-size: 1.25rem; }
.search-bar { display: flex; gap: 10px; margin-bottom: 25px; }
.search-bar input { flex: 1; padding: 12px 15px; border: 1px solid #D5D9D9; border-radius: 4px; font-size: 0.875rem; }
.search-bar input:focus { outline: none; border-color: var(--brand-accent, #007185); box-shadow: 0 0 0 3px rgba(0,113,133,0.1); }
.search-bar button { padding: 12px 25px; background: var(--brand-primary, #FF9900); color: var(--brand-dark, #131921); border: none; border-radius: 4px; cursor: pointer; font-weight: 600; }
.loading, .empty { text-align: center; padding: 40px; color: #999; }
.store-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
.store-card { background: #fff; padding: 20px; border-radius: 8px; text-align: center; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: all 0.2s; border: 1px solid transparent; }
.store-card:hover { border-color: var(--brand-primary, #FF9900); box-shadow: 0 4px 12px rgba(255,153,0,0.15); transform: translateY(-2px); }
.store-logo-wrap { width: 72px; height: 72px; margin: 0 auto 12px; border-radius: 8px; overflow: hidden; background: #f5f5f5; }
.store-logo { width: 100%; height: 100%; object-fit: cover; }
.avatar { width: 100%; height: 100%; background: var(--brand-dark, #131921); color: var(--brand-primary, #FF9900); display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; }
.store-card h3 { font-size: 0.9375rem; margin: 0 0 6px; color: #0F1111; }
.store-meta { display: flex; justify-content: center; gap: 12px; font-size: 0.75rem; color: #565959; margin: 0 0 6px; }
.store-meta i { margin-right: 3px; }
.store-desc { font-size: 0.75rem; color: #999; margin: 0 0 10px; }
.btn-visit { padding: 6px 16px; background: #fff; border: 1px solid #D5D9D9; border-radius: 20px; font-size: 0.75rem; cursor: pointer; color: #0F1111; transition: all 0.2s; }
.btn-visit:hover { background: #f7fafa; border-color: var(--brand-accent, #007185); color: var(--brand-accent, #007185); }
@media (max-width: 768px) {
  .store-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .search-bar input { font-size: 16px; }
  .store-card { padding: 16px; }
  .store-logo-wrap { width: 56px; height: 56px; }
  .avatar { font-size: 22px; }
  .store-card h3 { font-size: 0.875rem; }
}
@media (max-width: 480px) {
  .store-grid { grid-template-columns: 1fr; }
  .search-bar { flex-direction: column; }
  .search-bar button { width: 100%; }
  .store-card { padding: 14px; }
  .store-logo-wrap { width: 48px; height: 48px; }
  .avatar { font-size: 18px; }
}

img { max-width: 100%; height: auto; }
</style>


<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const query = ref('')
const stores = ref([])
const loading = ref(false)

const search = async () => {
  loading.value = true
  try {
    let q = supabase.from('sellers').select('*').eq('status', 'active')
    if (query.value) q = q.ilike('name', `%${query.value}%`)
    const { data } = await q.order('followers', { ascending: false }).limit(30)
    stores.value = data || []
  } catch (e) { console.error('Search stores error:', e) }
  loading.value = false
}

onMounted(() => search())</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const query = ref('')
const stores = ref([])
const loading = ref(false)

const search = async () => {
  loading.value = true
  try {
    let q = supabase.from('sellers').select('*').eq('status', 'active')
    if (query.value) q = q.ilike('name', `%${query.value}%`)
    const { data } = await q.order('followers', { ascending: false }).limit(30)
    stores.value = data || []
  } catch (e) { console.error('Search stores error:', e) }
  loading.value = false
}

onMounted(() => search())
</template>

</script>

<style scoped>
body, html { overflow-x: hidden; }
.container { max-width: 1200px; margin: 0 auto; padding: 20px 15px; }
h1 { margin-bottom: 20px; font-size: 1.25rem; }
.search-bar { display: flex; gap: 10px; margin-bottom: 25px; }
.search-bar input { flex: 1; padding: 12px 15px; border: 1px solid #D5D9D9; border-radius: 4px; font-size: 0.875rem; }
.search-bar input:focus { outline: none; border-color: var(--brand-accent, #007185); box-shadow: 0 0 0 3px rgba(0,113,133,0.1); }
.search-bar button { padding: 12px 25px; background: var(--brand-primary, #FF9900); color: var(--brand-dark, #131921); border: none; border-radius: 4px; cursor: pointer; font-weight: 600; }
.loading, .empty { text-align: center; padding: 40px; color: #999; }
.store-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
.store-card { background: #fff; padding: 20px; border-radius: 8px; text-align: center; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: all 0.2s; border: 1px solid transparent; }
.store-card:hover { border-color: var(--brand-primary, #FF9900); box-shadow: 0 4px 12px rgba(255,153,0,0.15); transform: translateY(-2px); }
.store-logo-wrap { width: 72px; height: 72px; margin: 0 auto 12px; border-radius: 8px; overflow: hidden; background: #f5f5f5; }
.store-logo { width: 100%; height: 100%; object-fit: cover; }
.avatar { width: 100%; height: 100%; background: var(--brand-dark, #131921); color: var(--brand-primary, #FF9900); display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; }
.store-card h3 { font-size: 0.9375rem; margin: 0 0 6px; color: #0F1111; }
.store-meta { display: flex; justify-content: center; gap: 12px; font-size: 0.75rem; color: #565959; margin: 0 0 6px; }
.store-meta i { margin-right: 3px; }
.store-desc { font-size: 0.75rem; color: #999; margin: 0 0 10px; }
.btn-visit { padding: 6px 16px; background: #fff; border: 1px solid #D5D9D9; border-radius: 20px; font-size: 0.75rem; cursor: pointer; color: #0F1111; transition: all 0.2s; }
.btn-visit:hover { background: #f7fafa; border-color: var(--brand-accent, #007185); color: var(--brand-accent, #007185); }
@media (max-width: 768px) {
  .store-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .search-bar input { font-size: 16px; }
  .store-card { padding: 16px; }
  .store-logo-wrap { width: 56px; height: 56px; }
  .avatar { font-size: 22px; }
  .store-card h3 { font-size: 0.875rem; }
}
@media (max-width: 480px) {
  .store-grid { grid-template-columns: 1fr; }
  .search-bar { flex-direction: column; }
  .search-bar button { width: 100%; }
  .store-card { padding: 14px; }
  .store-logo-wrap { width: 48px; height: 48px; }
  .avatar { font-size: 18px; }
}

img { max-width: 100%; height: auto; }
</style>