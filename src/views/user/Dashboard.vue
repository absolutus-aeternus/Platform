<template>
  <div class="dashboard">
    <h1>My Dashboard</h1>
    <div class="stats-grid">
      <div class="stat-card">
        <i class="fas fa-box"></i>
        <div>
          <h3>{{ stats.orders }}</h3>
          <p>Total Orders</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-wallet"></i>
        <div>
          <h3>${{ stats.balance }}</h3>
          <p>Wallet Balance</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-heart"></i>
        <div>
          <h3>{{ stats.favorites }}</h3>
          <p>Favorites</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-bell"></i>
        <div>
          <h3>{{ stats.notifications }}</h3>
          <p>Notifications</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const stats = ref({ orders: 0, balance: '0.00', favorites: 0, notifications: 0 })
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.stat-card { background: #fff; padding: 25px; border-radius: 12px; display: flex; align-items: center; gap: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.stat-card i { font-size: 32px; color: #fe2c55; }
.stat-card h3 { font-size: 24px; margin-bottom: 5px; }
.stat-card p { color: #666; }
</style>
