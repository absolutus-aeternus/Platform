<template>
  <div class="orders">
    <h1>My Orders</h1>
    <div class="order-tabs">
      <button :class="{ active: tab === 'all' }" @click="tab = 'all'">All</button>
      <button :class="{ active: tab === 'pending' }" @click="tab = 'pending'">Pending</button>
      <button :class="{ active: tab === 'shipped' }" @click="tab = 'shipped'">Shipped</button>
      <button :class="{ active: tab === 'completed' }" @click="tab = 'completed'">Completed</button>
    </div>
    <div class="empty-state">
      <i class="fas fa-box-open"></i>
      <p>No orders found</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const tab = ref('all')
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.order-tabs { display: flex; gap: 10px; margin-bottom: 25px; }
.order-tabs button { padding: 10px 25px; border: 1px solid #ddd; background: #fff; border-radius: 20px; cursor: pointer; }
.order-tabs button.active { background: #fe2c55; color: #fff; border-color: #fe2c55; }
.empty-state { text-align: center; padding: 60px 0; }
.empty-state i { font-size: 48px; color: #ddd; margin-bottom: 15px; display: block; }
</style>
