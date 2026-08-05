<template>
  <div class="pay-success">
    <div class="container">
      <div class="success-card">
        <div class="success-icon">✓</div>
        <h1>Payment Successful!</h1>
        <p>Your order has been placed successfully.</p>
        <p class="order-no">Order #{{ orderNo }}</p>
        <div class="actions">
          <router-link to="/user/orders" class="btn-primary">View Orders</router-link>
          <router-link to="/" class="btn-secondary">Continue Shopping</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const orderNo = route.query.order || 'N/A'
</script>

<style scoped>
.container { max-width: 600px; margin: 0 auto; padding: 60px 15px; }
.success-card { background: #fff; border-radius: 12px; padding: 40px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
.success-icon { width: 80px; height: 80px; background: #2ed573; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; margin: 0 auto 20px; }
h1 { margin-bottom: 10px; }
.order-no { color: #666; margin-bottom: 30px; }
.actions { display: flex; gap: 15px; justify-content: center; }
.btn-primary { background: #fe2c55; color: #fff; padding: 12px 30px; border-radius: 25px; text-decoration: none; }
.btn-secondary { background: #f0f0f0; color: #333; padding: 12px 30px; border-radius: 25px; text-decoration: none; }
</style>
