<template><div class="page-wrapper">
  <div class="container" style="padding:40px 20px;max-width:800px">
    <h2 style="margin-bottom:24px"><i class="fas fa-calendar-check" style="color:var(--brand-primary, #FF9900)"></i> Repayment Schedule</h2>
    <div style="background:#fff;padding:32px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
      <div v-if="loans.length === 0" style="text-align:center;padding:40px;color:#999">
        <i class="fas fa-calendar" style="font-size:48px;color:#ddd;margin-bottom:16px"></i>
        <p>No active loans</p>
        <router-link to="/credit" class="btn-primary" style="padding:10px 20px;border-radius:8px;text-decoration:none;margin-top:12px">Apply for Credit</router-link>
      </div>
      <div v-else>
        <div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse">
          <thead><tr style="background:#f8f9fa"><th style="padding:12px;text-align:left;font-size:13px">Due Date</th><th style="padding:12px;text-align:left;font-size:13px">Amount</th><th style="padding:12px;text-align:left;font-size:13px">Status</th></tr></thead>
          <tbody><tr v-for="loan in loans" :key="loan.id" style="border-bottom:1px solid #f0f0f0"><td style="padding:12px">{{ loan.dueDate }}</td><td style="padding:12px;font-weight:700">${{ loan.amount }}</td><td style="padding:12px"><span class="status pending">{{ loan.status }}</span></td></tr></tbody>
        </table></div>
      </div>
    </div>
  </div>
  </div>
<script setup>
import { ref } from 'vue'
const loans = ref([])</template>

<script setup>
import { ref } from 'vue'
const loans = ref([])
</template>

</script>

<style scoped>
.page-wrapper { position: relative; z-index: 1; }
.page-wrapper { padding: 2rem; max-width: 1200px; margin: 0 auto; }
</style>
