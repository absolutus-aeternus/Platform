<template>
  <div class="my-loan">
    <h1>My Loans</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="loans.length === 0" class="empty-state">
      <i class="fas fa-money-check-alt"></i>
      <p>No loans yet</p>
      <router-link to="/credit/application" class="btn-primary">Apply for Credit</router-link>
    </div>
    <div v-else class="loan-list">
      <div v-for="loan in loans" :key="loan.id" class="loan-card">
        <div class="loan-header">
          <span>Loan #{{ loan.id }}</span>
          <span class="status" :class="loan.status">{{ loan.status }}</span>
        </div>
        <div class="loan-info">
          <p>Amount: ${{ loan.amount }}</p>
          <p>Period: {{ loan.period }} months</p>
          <p>Monthly: ${{ loan.monthly }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
</template>


<script setup>
import { ref } from 'vue'

const loans = ref([])
const loading = ref(false)
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.loading { text-align: center; padding: 40px; color: #999; }
.empty-state { text-align: center; padding: 60px 0; }
.empty-state i { font-size: 48px; color: #ddd; margin-bottom: 15px; display: block; }
.btn-primary { background: var(--brand-primary, #FF9900); color: #fff; padding: 10px 25px; border-radius: 25px; text-decoration: none; display: inline-block; margin-top: 15px; }
.loan-card { background: #fff; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }
.loan-header { display: flex; justify-content: space-between; padding: 15px 20px; background: #f8f8f8; }
.status { padding: 4px 12px; border-radius: 12px; font-size: 12px; }
.status.pending { background: #fff3cd; color: #856404; }
.status.approved { background: #d4edda; color: #155724; }
.loan-info { padding: 15px 20px; }
.loan-info p { margin-bottom: 5px; }
</style>
