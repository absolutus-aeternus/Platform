<template>
  <div class="page-wrapper">
  <div class="dashboard">
    <h1>My Dashboard</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else>
      <div class="stats-grid">
        <div class="stat-card" @click="$router.push('/user/orders')">
          <i class="fas fa-box"></i>
          <div>
            <h3>{{ stats.orders }}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div class="stat-card" @click="$router.push('/user/wallet')">
          <i class="fas fa-wallet"></i>
          <div>
            <h3>${{ stats.balance }}</h3>
            <p>Wallet Balance</p>
          </div>
        </div>
        <div class="stat-card" @click="$router.push('/user/favorites')">
          <i class="fas fa-heart"></i>
          <div>
            <h3>{{ stats.favorites }}</h3>
            <p>Favorites</p>
          </div>
        </div>
        <div class="stat-card" @click="$router.push('/user/notifications')">
          <i class="fas fa-bell"></i>
          <div>
            <h3>{{ stats.notifications }}</h3>
            <p>Notifications</p>
          </div>
        </div>
      </div>
      <div class="user-info">
        <h2>Profile</h2>
        <div class="info-row">
          <span>Email</span>
          <span>{{ userStore.supabaseUser?.email || 'N/A' }}</span>
        </div>
        <div class="info-row">
          <span>Role</span>
          <span>Member</span>
        </div>
        <div class="info-row">
          <span>KYC Status</span>
          <span class="kyc-badge">Verified</span>
        </div>
      </div>
      <div class="quick-links">
        <router-link to="/merchant-settled" style="display:flex;align-items:center;gap:10px;padding:16px;background:linear-gradient(135deg,var(--brand-primary, #FF9900),var(--brand-primary, #FF9900));color:#fff;border-radius:12px;text-decoration:none;font-weight:600">
          <i class="fas fa-store" style="font-size:20px"></i>
          <div><div>Become a Seller</div><small style="opacity:0.8;font-weight:400">Start your dropshipping business</small></div>
        </router-link>
        <router-link to="/ratingplus" style="display:flex;align-items:center;gap:10px;padding:16px;background:linear-gradient(135deg,var(--brand-primary-hover, #E68A00),var(--brand-primary, #FF9900));color:#fff;border-radius:12px;text-decoration:none;font-weight:600">
          <i class="fas fa-star" style="font-size:20px"></i>
          <div><div>Join Rating Plus</div><small style="opacity:0.8;font-weight:400">Earn money daily</small></div>
        </router-link>
      </div>
      </div>
        </div>
</div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const userStore = useUserStore()
const stats = ref({ orders: 0, balance: '0.00', favorites: 0, notifications: 0 })
const loading = ref(true)

onMounted(async () => {
  if (!userStore.supabaseUser) { loading.value = false; return }
  const uid = userStore.supabaseUser.id
  try {
    const [ordersRes, walletRes, favRes, notifRes] = await Promise.all([
      supabase.from('orders').select('id').eq('user_id', uid),
      supabase.from('wallets').select('balance').eq('user_id', uid).maybeSingle(),
      supabase.from('favorites').select('id').eq('user_id', uid),
      supabase.from('notifications').select('id').eq('user_id', uid).eq('is_read', false)
    ])
    stats.value.orders = ordersRes.data?.length || 0
    stats.value.balance = walletRes.data?.balance || '0.00'
    stats.value.favorites = favRes.data?.length || 0
    stats.value.notifications = notifRes.data?.length || 0
  } catch (e) {
    console.error('Failed to load dashboard:', e)
  }
  loading.value = false
})
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.loading { text-align: center; padding: 40px; color: #999; }
.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
.stat-card { background: #fff; padding: 25px; border-radius: 12px; display: flex; align-items: center; gap: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); cursor: pointer; transition: all 0.3s; }
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.12); }
.stat-card i { font-size: 32px; color: var(--brand-primary, #FF9900); }
.stat-card h3 { font-size: 24px; margin-bottom: 5px; }
.stat-card p { color: #666; }
.user-info { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.user-info h2 { margin-bottom: 20px; }
.info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
.info-row:last-child { border-bottom: none; }
.kyc-badge { background: #d4edda; color: #155724; padding: 2px 10px; border-radius: 10px; font-size: 13px; }

.quick-links { margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.quick-link { display: flex; align-items: center; gap: 10px; padding: 16px; color: #fff; border-radius: 12px; text-decoration: none; font-weight: 600; transition: all 0.2s; }
.quick-link:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); color: #fff; }
.quick-link i { font-size: 20px; }
.quick-link small { opacity: 0.8; font-weight: 400; }
.seller-link { background: linear-gradient(135deg, var(--brand-primary, #FF9900), var(--brand-primary-hover, #E68A00)); }
.rating-link { background: linear-gradient(135deg, var(--brand-primary-hover, #E68A00), var(--brand-primary, #FF9900)); }

@media (max-width: 768px) {
  h1 { font-size: 1.25rem; margin-bottom: 16px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .stat-card { padding: 16px; gap: 12px; }
  .stat-card i { font-size: 24px; }
  .stat-card h3 { font-size: 18px; }
  .stat-card p { font-size: 12px; }
  .user-info { padding: 16px; }
  .info-row { font-size: 13px; }
}
@media (max-width: 480px) {
  h1 { font-size: 1.1rem; }
  .stats-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
  .stat-card { padding: 12px; flex-direction: column; text-align: center; gap: 8px; }
  .stat-card i { font-size: 20px; }
  .stat-card h3 { font-size: 16px; }
}
</style>
