<template><div v-if="userStore.isSuperAdmin" style="padding:8px;background:#1a1a2e;display:flex;gap:8px;justify-content:center">
  <router-link to="/superadmin" style="color:#f39c12;font-size:12px;text-decoration:none"><i class="fas fa-crown"></i> Super Admin</router-link>
  <router-link to="/admin" style="color:#fff;font-size:12px;text-decoration:none"><i class="fas fa-shield-alt"></i> Admin</router-link>
  <router-link to="/user" style="color:#fff;font-size:12px;text-decoration:none"><i class="fas fa-shopping-cart"></i> Buyer</router-link>
  <router-link to="/ratingplus" style="color:#fff;font-size:12px;text-decoration:none"><i class="fas fa-star"></i> R+</router-link>
  <router-link to="/" style="color:#fff;font-size:12px;text-decoration:none"><i class="fas fa-home"></i> Site</router-link>
</div>

  <div class="seller-layout">
    <header class="seller-header">
      <div class="container header-inner">
        <button class="mobile-toggle" @click="showSidebar = !showSidebar"><i class="fas fa-bars"></i></button>
        <router-link to="/" class="logo"><img src="/images/logo-alliance.svg" alt="AllianceHub" class="logo-img-nav" /><span class="logo-sub">Seller</span></router-link>
        <nav class="header-nav"><router-link to="/seller">Dashboard</router-link><router-link to="/seller/products">Products</router-link><router-link to="/seller/orders">Orders</router-link></nav>
        <div class="header-right"><router-link to="/" class="btn-outline-sm"><i class="fas fa-store"></i> View Store</router-link></div>
      </div>
    </header>
    <div class="container main-layout">
      <aside class="sidebar" :class="{ open: showSidebar }">
        <div class="sidebar-overlay" @click="showSidebar = false"></div>
        <div class="sidebar-content">
          <router-link to="/seller" class="menu-item" @click="showSidebar = false"><i class="fas fa-tachometer-alt"></i> Dashboard</router-link>
          <router-link to="/seller/products" class="menu-item" @click="showSidebar = false"><i class="fas fa-box"></i> Products</router-link>
          <router-link to="/seller/product/add" class="menu-item" @click="showSidebar = false"><i class="fas fa-plus"></i> Add Product</router-link>
          <router-link to="/seller/orders" class="menu-item" @click="showSidebar = false"><i class="fas fa-clipboard-list"></i> Orders</router-link>
          <router-link to="/seller/analytics" class="menu-item" @click="showSidebar = false"><i class="fas fa-chart-bar"></i> Analytics</router-link>
          <router-link to="/seller/finance" class="menu-item" @click="showSidebar = false"><i class="fas fa-dollar-sign"></i> Finance</router-link>
          <router-link to="/seller/customers" class="menu-item" @click="showSidebar = false"><i class="fas fa-users"></i> Customers</router-link>
          <router-link to="/seller/shipping" class="menu-item" @click="showSidebar = false"><i class="fas fa-shipping-fast"></i> Shipping</router-link>
          <router-link to="/seller/coupons" class="menu-item" @click="showSidebar = false"><i class="fas fa-ticket-alt"></i> Coupons</router-link>
          <router-link to="/seller/promotions" class="menu-item" @click="showSidebar = false"><i class="fas fa-bullhorn"></i> Promotions</router-link>
          <router-link to="/seller/inventory" class="menu-item" @click="showSidebar = false"><i class="fas fa-warehouse"></i> Inventory</router-link>
          <router-link to="/seller/categories" class="menu-item" @click="showSidebar = false"><i class="fas fa-tags"></i> Categories</router-link>
          <router-link to="/seller/returns" class="menu-item" @click="showSidebar = false"><i class="fas fa-undo"></i> Returns</router-link>
          <router-link to="/seller/messages" class="menu-item" @click="showSidebar = false"><i class="fas fa-envelope"></i> Messages</router-link>
          <router-link to="/seller/reports" class="menu-item" @click="showSidebar = false"><i class="fas fa-chart-line"></i> Reports</router-link>
          <router-link to="/seller/profile" class="menu-item" @click="showSidebar = false"><i class="fas fa-user"></i> Profile</router-link>
          <router-link to="/seller/settings" class="menu-item" @click="showSidebar = false"><i class="fas fa-cog"></i> Settings</router-link>
        </div>
      </aside>
      <main class="main-content"><router-view /></main>
    </div>
  </div>
</template>
<script setup>
import { useUserStore } from "@/store/user"
const userStore = useUserStore()
import { ref } from 'vue'
const showSidebar = ref(false)
</script>
<style scoped>
.seller-header { background: #1a1a2e; color: #fff; padding: 0 15px; position: sticky; top: 0; z-index: 100; }
.header-inner { display: flex; align-items: center; gap: 20px; height: 56px; }
.mobile-toggle { display: none; background: none; border: none; color: #fff; font-size: 20px; cursor: pointer; }
.logo { display: flex; align-items: center; gap: 8px; text-decoration: none; flex-shrink: 0; }
.logo-icon { width: 32px; height: 32px; background: #fe2c55; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; color: #fff; }
.logo-text { font-size: 18px; font-weight: 800; color: #fff; }
.logo-img-nav { height: 2rem; width: auto; object-fit: contain; }
.logo-sub { font-size: 11px; color: #fe2c55; background: rgba(254,44,85,0.15); padding: 2px 8px; border-radius: 4px; }
.header-nav { display: flex; gap: 20px; margin-left: 30px; }
.header-nav a { color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px; transition: color 0.2s; }
.header-nav a:hover, .header-nav a.router-link-active { color: #fff; }
.header-right { margin-left: auto; }
.btn-outline-sm { padding: 6px 14px; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; color: #fff; font-size: 13px; text-decoration: none; transition: all 0.2s; }
.btn-outline-sm:hover { background: rgba(255,255,255,0.1); border-color: #fff; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 15px; }
.main-layout { display: grid; grid-template-columns: 220px 1fr; gap: 24px; padding: 24px 0; min-height: calc(100vh - 56px); }
.sidebar { position: sticky; top: 80px; height: fit-content; }
.sidebar-overlay { display: none; }
.sidebar-content { display: flex; flex-direction: column; gap: 4px; background: #fff; border-radius: 12px; padding: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
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

/* Seller Responsive */
@media (max-width: 768px) {
  .seller-layout { flex-direction: column; }
  .seller-sidebar { width: 100%; position: fixed; bottom: 0; left: 0; right: 0; height: auto; flex-direction: row; z-index: 100; }
  .sidebar-header { display: none; }
  .nav-item { flex-direction: column; padding: 0.5rem; font-size: 0.625rem; min-width: 48px; text-align: center; }
  .nav-item i { margin: 0; }
  .seller-main { margin-left: 0; padding-bottom: 60px; }
}

</style>
