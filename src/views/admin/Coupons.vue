<template>
  <div class="admin-page">
    <h1>Coupons</h1>
    <div class="content">
      <p>Manage Coupons</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
</script>

<style scoped>
h1 { margin-bottom: 20px; }
.content { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
</style>
