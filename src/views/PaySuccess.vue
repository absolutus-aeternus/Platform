<template>
  <div class="page-wrapper">
  <div class="container" style="padding:40px 20px;max-width:600px;text-align:center">
    <div style="background:white;padding:48px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
      <div style="width:80px;height:80px;background:#d1fae5;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px">
        <i class="fas fa-check-circle" style="font-size:40px;color:#059669"></i>
      </div>
      <h1 style="font-size:28px;font-weight:800;margin-bottom:12px">Payment Successful!</h1>
      <p style="color:#64748b;margin-bottom:8px">Order Number: <strong>{{ orderId }}</strong></p>
      <p style="color:#64748b;margin-bottom:32px">Thank you for your purchase. Your order is being processed.</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <router-link to="/user/orders" class="btn btn-primary"><i class="fas fa-clipboard-list"></i> View Orders</router-link>
        <router-link to="/" class="btn btn-secondary"><i class="fas fa-home"></i> Continue Shopping</router-link>
      </div>
    </div>
  </div>
  </div>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const orderId = ref(route.query.order || 'N/A')
</template>

</script>


<style scoped>
.page-wrapper { position: relative; z-index: 1; }
.page-wrapper { padding: 2rem; max-width: 1200px; margin: 0 auto; }
</style>


@media (max-width: 768px) {
  .page-wrapper, .about-container, .help-container, .terms-container, .policy-container {
    padding: 1rem !important;
    max-width: 100% !important;
  }
}