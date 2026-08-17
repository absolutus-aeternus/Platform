<template>
  <div v-if="loading" class="loading-state" style="text-align:center;padding:60px"><i class="fas fa-spinner fa-spin" style="font-size:32px;color:#FF9900"></i><p style="margin-top:12px;color:#999">Loading...</p></div>
<div v-else class="container" style="padding:40px 20px">
    <h2 style="margin-bottom:24px"><i class="fas fa-star"></i> All Reviews</h2>
    <div v-if="reviews.length" style="display:flex;flex-direction:column;gap:16px">
      <div v-for="r in reviews" :key="r.id" style="background:white;padding:20px;border-radius:12px;border:1px solid #e2e8f0">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <div style="display:flex;align-items:center;gap:8px"><div style="width:36px;height:36px;background:#FF9900;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700">{{ (r.users?.email || 'A')[0].toUpperCase() }}</div><span style="font-weight:600">{{ r.users?.email?.split('@')[0] || 'Anonymous' }}</span></div>
          <div><i v-for="n in 5" :key="n" class="fas fa-star" :style="{ color: n <= r.rating ? '#f59e0b' : '#e2e8f0' }"></i></div>
        </div>
        <p style="color:#334155">{{ r.comment }}</p>
        <span style="font-size:12px;color:#94a3b8">{{ new Date(r.created_at).toLocaleDateString() }}</span>
      </div>
    </div>
    <div v-else style="text-align:center;padding:60px"><i class="fas fa-star" style="font-size:48px;color:#94a3b8"></i><p style="color:#64748b;margin-top:16px">No reviews yet</p></div>
  </div>
</template>
<script setup>
const loading = ref(true)
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/services/supabase'
const route = useRoute()
const reviews = ref([])
onMounted(async () => {
  try {
    const { data } = await supabase.from('evaluations').select('*, users(email)').order('created_at', { ascending: false }).limit(50)
    if (data) reviews.value = data
  loading.value = false
  } catch (e) { console.error('All reviews error:', e) }
})
</script>
