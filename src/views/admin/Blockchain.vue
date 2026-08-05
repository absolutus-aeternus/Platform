<template>
  <div class="admin-blockchain">
    <h1>Blockchain Channels</h1>
    <div class="channel-grid">
      <div v-for="ch in channels" :key="ch.id" class="channel-card">
        <div class="channel-icon">{{ ch.coin[0] }}</div>
        <h3>{{ ch.coin }}</h3>
        <p>{{ ch.blockchain_name }}</p>
        <p>Fee: {{ ch.fee }}%</p>
        <p>Min: ${{ ch.recharge_limit_min || 1 }}</p>
        <p>Max: ${{ ch.recharge_limit_max || 9999999 }}</p>
        <span class="status" :class="ch.is_active ? 'active' : 'inactive'">{{ ch.is_active ? 'Active' : 'Inactive' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchBlockchainChannels } from '@/services/supabase'
const channels = ref([])
onMounted(async () => {
  const { data } = await fetchBlockchainChannels()
  channels.value = data || []
})
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.channel-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
.channel-card { background: #fff; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.channel-icon { width: 50px; height: 50px; background: #fe2c55; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; margin: 0 auto 10px; }
.channel-card h3 { margin-bottom: 5px; }
.channel-card p { color: #666; font-size: 13px; margin-bottom: 3px; }
.status { display: inline-block; padding: 2px 10px; border-radius: 10px; font-size: 11px; margin-top: 10px; }
.status.active { background: #d4edda; color: #155724; }
.status.inactive { background: #f8d7da; color: #721c24; }
</style>
