<template>
  <div class="reports">
    <h1>Reports</h1>
    <div class="report-grid">
      <div class="report-card">
        <h3>Sales Report</h3>
        <div class="report-value">${{ stats.revenue }}</div>
        <p>Total Revenue</p>
      </div>
      <div class="report-card">
        <h3>Order Report</h3>
        <div class="report-value">{{ stats.orders }}</div>
        <p>Total Orders</p>
      </div>
      <div class="report-card">
        <h3>Product Report</h3>
        <div class="report-value">{{ stats.products }}</div>
        <p>Active Products</p>
      </div>
      <div class="report-card">
        <h3>Customer Report</h3>
        <div class="report-value">{{ stats.customers }}</div>
        <p>Total Customers</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const userStore = useUserStore()
const stats = ref({ revenue: '0.00', orders: 0, products: 0, customers: 0 })

onMounted(async () => {
  if (!userStore.supabaseUser) return
  const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', userStore.supabaseUser.id).single()
  if (seller) {
    const [orders, products, customers] = await Promise.all([
      supabase.from('orders').select('total_amount').eq('seller_id', seller.id),
      supabase.from('products').select('id').eq('seller_id', seller.id),
      supabase.from('orders').select('user_id').eq('seller_id', seller.id)
    ])
    stats.value.revenue = (orders.data || []).reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0).toFixed(2)
    stats.value.orders = orders.data?.length || 0
    stats.value.products = products.data?.length || 0
    stats.value.customers = new Set((customers.data || []).map(c => c.user_id)).size
  }
})
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.report-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.report-card { background: #fff; padding: 25px; border-radius: 12px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.report-card h3 { color: #666; font-size: 14px; margin-bottom: 10px; }
.report-value { font-size: 28px; font-weight: 700; color: #fe2c55; }
.report-card p { color: #999; font-size: 13px; margin-top: 5px; }
</style>
