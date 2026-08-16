<template><div v-if="userStore.isSuperAdmin" style="padding:8px;background:#1a1a2e;display:flex;gap:8px;justify-content:center">
  <router-link to="/superadmin" style="color:#f39c12;font-size:12px;text-decoration:none"><i class="fas fa-crown"></i> Super Admin</router-link>
  <router-link to="/admin" style="color:#fff;font-size:12px;text-decoration:none"><i class="fas fa-shield-alt"></i> Admin</router-link>
  <router-link to="/seller" style="color:#fff;font-size:12px;text-decoration:none"><i class="fas fa-store"></i> Seller</router-link>
  <router-link to="/ratingplus" style="color:#fff;font-size:12px;text-decoration:none"><i class="fas fa-star"></i> R+</router-link>
  <router-link to="/" style="color:#fff;font-size:12px;text-decoration:none"><i class="fas fa-home"></i> Site</router-link>
</div>

  <div class="user-layout">
    <header class="user-header">
      <div class="container header-inner">
        <button class="mobile-toggle" @click="showSidebar = !showSidebar"><i class="fas fa-bars"></i></button>
        <router-link to="/" class="logo"><img src="/images/logo-alliance.svg" alt="AllianceHub" class="logo-img-nav" /></router-link>
        <nav class="header-nav">
          <router-link to="/user">Dashboard</router-link>
          <router-link to="/user/orders">Orders</router-link>
          <router-link to="/user/wallet">Wallet</router-link>
          <router-link to="/user/settings">Settings</router-link>
        </nav>
        <div class="header-right"><router-link to="/" class="btn-outline-sm"><i class="fas fa-shopping-bag"></i> Shop</router-link></div>
      </div>
    </header>
    <div class="container main-layout">
      <aside class="sidebar" :class="{ open: showSidebar }">
        <div class="sidebar-overlay" @click="showSidebar = false"></div>
        <div class="sidebar-content">
          <div class="sidebar-user"><div class="user-avatar">{{ userEmail[0]?.toUpperCase() || 'U' }}</div><div class="user-name">{{ userEmail }}</div></div>
          <router-link to="/user" class="menu-item" @click="showSidebar = false"><i class="fas fa-tachometer-alt"></i> Dashboard</router-link>
          <router-link to="/user/orders" class="menu-item" @click="showSidebar = false"><i class="fas fa-box"></i> My Orders</router-link>
          <router-link to="/user/wallet" class="menu-item" @click="showSidebar = false"><i class="fas fa-wallet"></i> Wallet</router-link>
          <router-link to="/user/recharge" class="menu-item" @click="showSidebar = false"><i class="fas fa-credit-card"></i> Recharge</router-link>
          <router-link to="/user/withdraw" class="menu-item" @click="showSidebar = false"><i class="fas fa-money-bill-wave"></i> Withdraw</router-link>
          <router-link to="/user/favorites" class="menu-item" @click="showSidebar = false"><i class="fas fa-heart"></i> Favorites</router-link>
          <router-link to="/user/collect-shop" class="menu-item" @click="showSidebar = false"><i class="fas fa-store"></i> Followed Shops</router-link>
          <router-link to="/user/addresses" class="menu-item" @click="showSidebar = false"><i class="fas fa-map-marker-alt"></i> Addresses</router-link>
          <router-link to="/user/notifications" class="menu-item" @click="showSidebar = false"><i class="fas fa-bell"></i> Notifications</router-link>
          <router-link to="/user/download" class="menu-item" @click="showSidebar = false"><i class="fas fa-download"></i> Downloads</router-link>
          <router-link to="/user/settings" class="menu-item" @click="showSidebar = false"><i class="fas fa-cog"></i> Settings</router-link>
        </div>
      </aside>
      <main class="main-content"><router-view /></main>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
const showSidebar = ref(false)
const userEmail = computed(() => userStore.supabaseUser?.email || 'User')
</script>
<style scoped>
.user-header { background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.06); padding: 0 15px; position: sticky; top: 0; z-index: 100; }
.header-inner { display: flex; align-items: center; gap: 20px; height: 56px; }
.mobile-toggle { display: none; background: none; border: none; font-size: 20px; cursor: pointer; color: #333; }
.logo { display: flex; align-items: center; gap: 8px; text-decoration: none; flex-shrink: 0; }
.logo-icon { width: 32px; height: 32px; background: #fe2c55; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; color: #fff; }
.logo-text { font-size: 18px; font-weight: 800; color: #333; }
.logo-img-nav { height: 2rem; width: auto; object-fit: contain; }
.header-nav { display: flex; gap: 20px; margin-left: 30px; }
.header-nav a { color: #666; text-decoration: none; font-size: 14px; transition: color 0.2s; }
.header-nav a:hover, .header-nav a.router-link-active { color: #fe2c55; }
.header-right { margin-left: auto; }
.btn-outline-sm { padding: 6px 14px; border: 1px solid #ddd; border-radius: 6px; color: #666; font-size: 13px; text-decoration: none; transition: all 0.2s; }
.btn-outline-sm:hover { border-color: #fe2c55; color: #fe2c55; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 15px; }
.main-layout { display: grid; grid-template-columns: 220px 1fr; gap: 24px; padding: 24px 0; min-height: calc(100vh - 56px); }
.sidebar { position: sticky; top: 80px; height: fit-content; }
.sidebar-overlay { display: none; }
.sidebar-content { display: flex; flex-direction: column; gap: 4px; background: #fff; border-radius: 12px; padding: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.sidebar-user { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-bottom: 1px solid #f0f0f0; margin-bottom: 8px; }
.user-avatar { width: 36px; height: 36px; background: #fe2c55; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
.user-name { font-size: 13px; font-weight: 600; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.menu-item { padding: 10px 14px; color: #555; text-decoration: none; border-radius: 8px; font-size: 14px; display: flex; align-items: center; gap: 10px; transition: all 0.2s; }
.menu-item i { width: 18px; text-align: center; font-size: 14px; }
.menu-item:hover { background: #fff8f0; color: #fe2c55; }
.menu-item.router-link-active { background: #fe2c55; color: #fff; }
.main-content { min-height: 60vh; }
@media (max-width: 768px) {
  .mobile-toggle { display: block; }
  .header-nav { display: none; }
  .main-layout { grid-template-columns: 1fr; }
  .sidebar { position: fixed; top: 0; left: -280px; width: 280px; height: 100vh; z-index: 200; transition: left 0.3s; }
  .sidebar.open { left: 0; }
  .sidebar.open .sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: -1; }
  .sidebar-content { border-radius: 0; height: 100vh; overflow-y: auto; padding-top: 60px; }
}

/* User Responsive */
@media (max-width: 768px) {
  .user-layout { flex-direction: column; }
  .user-sidebar { width: 100%; position: fixed; bottom: 0; left: 0; right: 0; height: auto; flex-direction: row; z-index: 100; background: #fff; box-shadow: 0 -2px 8px rgba(0,0,0,0.1); }
  .user-main { margin-left: 0; padding-bottom: 60px; }
  .sidebar-menu { flex-direction: row; overflow-x: auto; }
  .menu-item { min-width: 60px; text-align: center; flex-direction: column; padding: 0.5rem; font-size: 0.625rem; }
  .menu-item i { margin-right: 0; margin-bottom: 0.25rem; }
}

</style>
