<template><div class="page-wrapper">
  <div class="container" style="padding:40px 20px;max-width:600px;text-align:center">
    <div style="background:white;padding:48px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
      <div style="width:80px;height:80px;background:#dbeafe;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px"><i class="fas fa-check" style="font-size:40px;color:#2563eb"></i></div>
      <h1 style="font-size:28px;font-weight:800;margin-bottom:12px">Operation Successful!</h1>
      <p style="color:#64748b;margin-bottom:32px">{{ msg }}</p>
      <router-link to="/" class="btn btn-primary"><i class="fas fa-home"></i> Back to Home</router-link>
    </div>
  </div>
  </div>
<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const msg = route.query.message || 'Your operation has been completed successfully.'</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const msg = route.query.message || 'Your operation has been completed successfully.'
</template>

</script>

<style scoped>
.page-wrapper { position: relative; z-index: 1; }
.page-wrapper { padding: 2rem; max-width: 1200px; margin: 0 auto; }
</style>
