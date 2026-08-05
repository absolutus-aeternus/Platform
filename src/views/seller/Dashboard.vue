<template>
  <div class="seller-dashboard">
    <h1>Seller Dashboard</h1>
    <div class="stats-grid">
      <div class="stat-card">
        <i class="fas fa-box"></i>
        <div>
          <h3>{{ stats.products }}</h3>
          <p>Products</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-shopping-cart"></i>
        <div>
          <h3>{{ stats.orders }}</h3>
          <p>Orders</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-dollar-sign"></i>
        <div>
          <h3>${{ stats.revenue }}</h3>
          <p>Revenue</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-chart-line"></i>
        <div>
          <h3>{{ stats.sales }}</h3>
          <p>Total Sales</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const stats = ref({ products: 0, orders: 0, revenue: '0.00', sales: 0 })
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.stat-card { background: #fff; padding: 25px; border-radius: 12px; display: flex; align-items: center; gap: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.stat-card i { font-size: 32px; color: #fe2c55; }
.stat-card h3 { font-size: 24px; margin-bottom: 5px; }
.stat-card p { color: #666; }
</style>
