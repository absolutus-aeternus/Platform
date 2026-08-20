<template>
  <div class="page-wrapper">
  <div class="seller-orders">
    <h1>Orders</h1>
    <div class="order-tabs">
      <button v-for="t in tabs" :key="t.key" :class="{ active: tab === t.key }" @click="tab = t.key">
        {{ t.label }} <span v-if="t.count" class="order-tabs__count">{{ t.count }}</span>
      </button>
    </div>

    <div v-if="loading" class="loading"><div class="spinner"></div>Loading orders...</div>
    <div v-else-if="orders.length === 0" class="empty-state">
      <i class="fas fa-clipboard-list"></i>
      <p>No orders yet</p>
    </div>
    <div v-else class="order-list">
      <div v-for="order in filteredOrders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-no">#{{ order.order_no || order.id }}</span>
          <span :class="['status', order.status]">{{ order.status }}</span>
        </div>
        <div class="order-body">
          <p><strong>Customer:</strong> {{ order.users?.email || 'N/A' }}</p>
          <p><strong>Total:</strong> ${{ order.total_amount }}</p>
          <p><strong>Date:</strong> {{ new Date(order.created_at).toLocaleDateString() }}</p>
        </div>
        <div class="order-actions">
          <BaseButton v-if="order.status === 'pending'" size="sm" icon="fas fa-truck" @click="updateStatus(order.id, 'shipped')">
            Mark Shipped
          </BaseButton>
          <BaseButton v-if="order.status === 'shipped'" size="sm" variant="secondary" icon="fas fa-check" @click="updateStatus(order.id, 'completed')">
            Mark Completed
          </BaseButton>
          <BaseButton size="sm" variant="ghost" icon="fas fa-eye" @click="$router.push(`/seller/orders`)">
            View
          </BaseButton>
        </div>
      </div>
      <BasePagination v-if="orders.length > perPage" v-model="page" :total="orders.length" :per-page="perPage" />
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'
import BaseButton from '@/components/base/BaseButton.vue'
import BasePagination from '@/components/base/BasePagination.vue'

const userStore = useUserStore()
const tab = ref('all')
const orders = ref([])
const loading = ref(true)
const page = ref(1)
const perPage = 20

const tabs = computed(() => [
  { key: 'all', label: 'All', count: orders.value.length },
  { key: 'pending', label: 'Pending', count: orders.value.filter(o => o.status === 'pending').length },
  { key: 'shipped', label: 'Shipped', count: orders.value.filter(o => o.status === 'shipped').length },
  { key: 'completed', label: 'Completed', count: orders.value.filter(o => o.status === 'completed').length },
])

const filteredOrders = computed(() => {
  const filtered = tab.value === 'all' ? orders.value : orders.value.filter(o => o.status === tab.value)
  const start = (page.value - 1) * perPage
  return filtered.slice(start, start + perPage)
})

const loadOrders = async () => {
  if (!userStore.supabaseUser) { loading.value = false; return }
  try {
    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', userStore.supabaseUser.id)
      .single()

    if (seller) {
      const { data } = await supabase
        .from('orders')
        .select('*, users(email)')
        .eq('seller_id', seller.id)
        .order('created_at', { ascending: false })
      orders.value = data || []
    }
  } catch (e) {
    console.error('Failed to load orders:', e)
  }
  loading.value = false
}

const updateStatus = async (orderId, status) => {
  try {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    const order = orders.value.find(o => o.id === orderId)
    if (order) order.status = status
    window.__toast?.show('Order updated', 'success')
  } catch (e) {
    window.__toast?.show('Failed to update', 'error')
  }
}

onMounted(loadOrders)
</script>

<style scoped>
body, html { overflow-x: hidden; }
header { z-index: 2; }
.seller-orders { max-width: 1000px; }
h1 { margin-bottom: 20px; }
.loading { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 40px; color: var(--neutral-500, #888); }
.spinner { width: 20px; height: 20px; border: 2px solid var(--neutral-200, #E7E7E7); border-top-color: var(--brand-primary, #FF9900); border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { text-align: center; padding: 60px 0; }
.empty-state i { font-size: 48px; color: var(--neutral-300, #D5D9D9); margin-bottom: 15px; display: block; }

.order-tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
.order-tabs button {
  padding: 8px 20px; border: 1px solid var(--neutral-300, #D5D9D9);
  background: var(--white, #fff); border-radius: var(--radius-full, 9999px);
  cursor: pointer; font-size: var(--text-sm, 13px); font-weight: 500;
  display: flex; align-items: center; gap: 6px;
  transition: all var(--ease-fast, 0.15s ease);
  font-family: var(--font-sans, 'Inter', sans-serif);
}
.order-tabs button:hover { border-color: var(--brand-accent, #007185); }
.order-tabs button.active {
  background: var(--brand-accent, #007185);
  color: var(--white, #fff);
  border-color: var(--brand-accent, #007185);
}
.order-tabs__count {
  background: rgba(255,255,255,0.2);
  padding: 1px 6px; border-radius: 10px;
  font-size: 11px;
}
.order-tabs button.active .order-tabs__count { background: rgba(255,255,255,0.3); }

.order-card {
  background: var(--white, #fff);
  border-radius: var(--radius-lg, 12px);
  margin-bottom: 12px;
  border: 1px solid var(--neutral-200, #E7E7E7);
  overflow: hidden;
}
.order-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px;
  background: var(--neutral-50, #FAFAFA);
  border-bottom: 1px solid var(--neutral-200, #E7E7E7);
}
.order-no { font-weight: 600; font-size: var(--text-base, 14px); }
.status {
  display: inline-block; padding: 2px 10px;
  border-radius: var(--radius-full, 9999px);
  font-size: 11px; font-weight: 600;
}
.status.pending { background: var(--warning-bg, #FEF3C7); color: var(--warning, #B45309); }
.status.shipped { background: var(--info-bg, #E0F2F5); color: var(--info, var(--brand-accent, #007185)); }
.status.completed { background: var(--success-bg, #E6F7F2); color: var(--success, #067D62); }
.status.cancelled { background: var(--error-bg, #FEE2E9); color: var(--error, #CC0C39); }

.order-body { padding: 12px 16px; }
.order-body p { margin-bottom: 4px; font-size: var(--text-sm, 13px); color: var(--neutral-700, #565959); }
.order-body strong { color: var(--neutral-900, #0F1111); }

.order-actions {
  padding: 12px 16px;
  border-top: 1px solid var(--neutral-200, #E7E7E7);
  display: flex; gap: 8px; flex-wrap: wrap;
}

@media (max-width: 639px) {
  .order-tabs button { padding: 6px 14px; font-size: 12px; }
  .order-body { padding: 10px 14px; }
  .order-actions { padding: 10px 14px; }
}
</style>
