<template>
  <div class="admin-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2 class="logo"><img src="/images/logo-alliance.svg" alt="AllianceHub" class="logo-img-admin" /> <span style="font-size:12px;color:#fe2c55;font-weight:400">Super Admin</span></h2>
        <button class="toggle-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          <i class="fas fa-bars"></i>
        </button>
      </div>
      
      <div class="sidebar-user">
        <div class="user-avatar">{{ userEmail[0]?.toUpperCase() || 'A' }}</div>
        <div class="user-info" v-show="!sidebarCollapsed">
          <h4>{{ userEmail }}</h4>
          <span class="role">Administrator</span>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <div class="nav-section">
          <h5 class="nav-title" v-show="!sidebarCollapsed">Main</h5>
          <router-link to="/admin" class="nav-item">
            <i class="fas fa-tachometer-alt"></i>
            <span v-show="!sidebarCollapsed">Dashboard</span>
          </router-link>
          <router-link to="/admin/manage-admins" class="nav-item" v-if="userStore.isSuperAdmin">
            <i class="fas fa-user-shield"></i>
            <span v-show="!sidebarCollapsed">Manage Admins</span>
          </router-link>
        </div>
        
        <div class="nav-section">
          <h5 class="nav-title" v-show="!sidebarCollapsed">E-Commerce</h5>
          <router-link to="/admin/products" class="nav-item">
            <i class="fas fa-box"></i>
            <span v-show="!sidebarCollapsed">Products</span>
          </router-link>
          <router-link to="/admin/orders" class="nav-item">
            <i class="fas fa-shopping-cart"></i>
            <span v-show="!sidebarCollapsed">Orders</span>
          </router-link>
          <router-link to="/admin/categories" class="nav-item">
            <i class="fas fa-tags"></i>
            <span v-show="!sidebarCollapsed">Categories</span>
          </router-link>
          <router-link to="/admin/sellers" class="nav-item">
            <i class="fas fa-store"></i>
            <span v-show="!sidebarCollapsed">Sellers</span>
          </router-link>
          <router-link to="/admin/customers" class="nav-item">
            <i class="fas fa-users"></i>
            <span v-show="!sidebarCollapsed">Customers</span>
          </router-link>
        </div>
        
        <div class="nav-section">
          <h5 class="nav-title" v-show="!sidebarCollapsed">Finance</h5>
          <router-link to="/admin/transactions" class="nav-item">
            <i class="fas fa-exchange-alt"></i>
            <span v-show="!sidebarCollapsed">Transactions</span>
          </router-link>
          <router-link to="/admin/wallets" class="nav-item">
            <i class="fas fa-wallet"></i>
            <span v-show="!sidebarCollapsed">Wallets</span>
          </router-link>
          <router-link to="/admin/withdrawals" class="nav-item">
            <i class="fas fa-money-bill-wave"></i>
            <span v-show="!sidebarCollapsed">Withdrawals</span>
          </router-link>
          <router-link to="/admin/recharges" class="nav-item">
            <i class="fas fa-credit-card"></i>
            <span v-show="!sidebarCollapsed">Recharges</span>
          </router-link>
        </div>
        
        <div class="nav-section">
          <h5 class="nav-title" v-show="!sidebarCollapsed">Content</h5>
          <router-link to="/admin/banners" class="nav-item">
            <i class="fas fa-image"></i>
            <span v-show="!sidebarCollapsed">Banners</span>
          </router-link>
          <router-link to="/admin/coupons" class="nav-item">
            <i class="fas fa-ticket-alt"></i>
            <span v-show="!sidebarCollapsed">Coupons</span>
          </router-link>
          <router-link to="/admin/notifications" class="nav-item">
            <i class="fas fa-bell"></i>
            <span v-show="!sidebarCollapsed">Notifications</span>
          </router-link>
        </div>
        
        <div class="nav-section">
          <h5 class="nav-title" v-show="!sidebarCollapsed">Communication</h5>
          <router-link to="/admin/chat" class="nav-item">
            <i class="fas fa-comments"></i>
            <span v-show="!sidebarCollapsed">Live Chat</span>
          </router-link>
          <router-link to="/admin/messages" class="nav-item">
            <i class="fas fa-envelope"></i>
            <span v-show="!sidebarCollapsed">Messages</span>
          </router-link>
        </div>
        
        <div class="nav-section">
          <h5 class="nav-title" v-show="!sidebarCollapsed">Reports</h5>
          <router-link to="/admin/reports/sales" class="nav-item">
            <i class="fas fa-chart-line"></i>
            <span v-show="!sidebarCollapsed">Sales Report</span>
          </router-link>
          <router-link to="/admin/reports/products" class="nav-item">
            <i class="fas fa-chart-bar"></i>
            <span v-show="!sidebarCollapsed">Product Report</span>
          </router-link>
          <router-link to="/admin/reports/customers" class="nav-item">
            <i class="fas fa-chart-pie"></i>
            <span v-show="!sidebarCollapsed">Customer Report</span>
          </router-link>
        </div>
        
        <div class="nav-section">
          <h5 class="nav-title" v-show="!sidebarCollapsed">⭐ Rating Plus</h5>
          <router-link to="/admin/chat" class="nav-item">
            <i class="fas fa-headset"></i>
            <span v-show="!sidebarCollapsed">R+ Chat (tab)</span>
          </router-link>
          <router-link to="/ratingplus" class="nav-item">
            <i class="fas fa-external-link-alt"></i>
            <span v-show="!sidebarCollapsed">R+ Landing Page</span>
          </router-link>
        </div>
        
        <div class="nav-section">
          <h5 class="nav-title" v-show="!sidebarCollapsed">System</h5>
          <router-link to="/admin/settings" class="nav-item">
            <i class="fas fa-cog"></i>
            <span v-show="!sidebarCollapsed">Settings</span>
          </router-link>
          <router-link to="/admin/blockchain" class="nav-item">
            <i class="fas fa-link"></i>
            <span v-show="!sidebarCollapsed">Blockchain</span>
          </router-link>
          <router-link to="/admin/scraper" class="nav-item">
            <i class="fas fa-spider"></i>
            <span v-show="!sidebarCollapsed">Product Scraper</span>
          </router-link>
          <router-link to="/admin/logs" class="nav-item">
            <i class="fas fa-file-alt"></i>
            <span v-show="!sidebarCollapsed">Activity Logs</span>
          </router-link>
        </div>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Top Bar -->
      <header class="topbar">
        <div class="topbar-left">
          <button class="menu-toggle" @click="sidebarCollapsed = !sidebarCollapsed">
            <i class="fas fa-bars"></i>
          </button>
          <div class="breadcrumb">
            <router-link to="/admin">Home</router-link>
            <span v-if="$route.name !== 'AdminDashboard'"> / {{ $route.name }}</span>
          </div>
        </div>
        <div class="topbar-right">
          <div class="search-box">
            <input type="text" placeholder="Search...">
            <i class="fas fa-search"></i>
          </div>
          <div class="topbar-actions">
            <button class="action-btn" @click="$router.push('/admin/notifications')">
              <i class="fas fa-bell"></i>
              <span class="badge">3</span>
            </button>
            <button class="action-btn" @click="$router.push('/admin/chat')">
              <i class="fas fa-envelope"></i>
              <span class="badge">5</span>
            </button>
            <div class="user-dropdown" @click="showUserMenu = !showUserMenu">
              <div class="user-avatar-sm">{{ userEmail[0]?.toUpperCase() || 'A' }}</div>
              <span>{{ userEmail }}</span>
              <i class="fas fa-chevron-down"></i>
              <div v-if="showUserMenu" class="dropdown-menu">
                <router-link to="/admin/settings"><i class="fas fa-user"></i> Profile</router-link>
                <router-link to="/admin/settings"><i class="fas fa-cog"></i> Settings</router-link>
                <div class="dropdown-divider"></div>
                <a href="#" @click.prevent="logout"><i class="fas fa-sign-out-alt"></i> Logout</a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="page-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const sidebarCollapsed = ref(false)
const showUserMenu = ref(false)

const userEmail = computed(() => userStore.supabaseUser?.email || 'Admin')

const logout = async () => {
  await userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-layout { display: flex; min-height: 100vh; }

/* Sidebar */
.sidebar { width: 250px; background: #2a3f54; color: #fff; transition: width 0.3s; position: fixed; height: 100vh; overflow-y: auto; z-index: 100; }
.sidebar-collapsed .sidebar { width: 70px; }
.sidebar-header { display: flex; align-items: center; justify-content: space-between; padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }
.logo { font-size: 18px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
.logo-img-admin { height: 1.5rem; width: auto; object-fit: contain; }
.toggle-btn { background: none; border: none; color: #fff; cursor: pointer; font-size: 18px; }
.sidebar-user { display: flex; align-items: center; gap: 12px; padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }
.user-avatar { width: 40px; height: 40px; background: #fe2c55; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
.user-info h4 { font-size: 13px; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.role { font-size: 11px; color: rgba(255,255,255,0.6); }
.sidebar-nav { padding: 10px 0; }
.nav-section { margin-bottom: 5px; }
.nav-title { font-size: 11px; text-transform: uppercase; color: rgba(255,255,255,0.4); padding: 10px 20px 5px; letter-spacing: 1px; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 20px; color: rgba(255,255,255,0.7); text-decoration: none; transition: all 0.2s; }
.nav-item:hover, .nav-item.router-link-active { background: rgba(255,255,255,0.1); color: #fff; }
.nav-item i { width: 20px; text-align: center; font-size: 14px; }

/* Main Content */
.main-content { flex: 1; margin-left: 250px; transition: margin-left 0.3s; background: #f7f7f7; }
.sidebar-collapsed .main-content { margin-left: 70px; }

/* Top Bar */
.topbar { background: #fff; padding: 0 20px; height: 60px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 4px rgba(0,0,0,0.08); position: sticky; top: 0; z-index: 50; }
.topbar-left { display: flex; align-items: center; gap: 15px; }
.menu-toggle { background: none; border: none; font-size: 18px; cursor: pointer; color: #666; display: none; }
.breadcrumb { font-size: 14px; color: #666; }
.breadcrumb a { color: #fe2c55; text-decoration: none; }
.topbar-right { display: flex; align-items: center; gap: 20px; }
.search-box { position: relative; }
.search-box input { padding: 8px 15px 8px 35px; border: 1px solid #ddd; border-radius: 20px; font-size: 13px; width: 200px; }
.search-box i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #999; font-size: 13px; }
.topbar-actions { display: flex; align-items: center; gap: 15px; }
.action-btn { position: relative; background: none; border: none; font-size: 18px; cursor: pointer; color: #666; }
.badge { position: absolute; top: -5px; right: -5px; background: #fe2c55; color: #fff; font-size: 10px; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.user-dropdown { display: flex; align-items: center; gap: 8px; cursor: pointer; position: relative; }
.user-avatar-sm { width: 30px; height: 30px; background: #fe2c55; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
.user-dropdown span { font-size: 13px; color: #666; }
.dropdown-menu { position: absolute; top: 100%; right: 0; background: #fff; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); min-width: 180px; z-index: 100; }
.dropdown-menu a { display: flex; align-items: center; gap: 10px; padding: 10px 15px; color: #333; text-decoration: none; font-size: 13px; }
.dropdown-menu a:hover { background: #f5f5f5; }
.dropdown-divider { height: 1px; background: #eee; margin: 5px 0; }

/* Page Content */
.page-content { padding: 20px; min-height: calc(100vh - 60px); }

@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); }
  .sidebar-collapsed .sidebar { transform: translateX(0); width: 250px; }
  .main-content { margin-left: 0; }
  .menu-toggle { display: block; }
}

/* Admin Responsive */
@media (max-width: 768px) {
  .admin-layout { flex-direction: column; }
  .admin-sidebar { width: 100%; position: fixed; bottom: 0; left: 0; right: 0; height: auto; flex-direction: row; z-index: 100; }
  .sidebar-header { display: none; }
  .nav-section { flex-direction: row; overflow-x: auto; }
  .nav-title { display: none; }
  .nav-item { flex-direction: column; padding: 0.5rem; font-size: 0.625rem; min-width: 48px; text-align: center; }
  .nav-item i { margin: 0; }
  .admin-main { margin-left: 0; padding-bottom: 60px; }
  .sidebar-collapsed-btn { display: none; }
}

</style>
