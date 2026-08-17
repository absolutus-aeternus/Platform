<template>
  <div class="sa-layout">
    <!-- Mobile toggle -->
    <button class="mobile-toggle" @click="showSidebar = !showSidebar" aria-label="Toggle menu"><i class="fas fa-bars"></i></button>
    <div v-if="showSidebar" class="mobile-overlay" @click="showSidebar = false"></div>
    <aside class="sa-sidebar" :class="{ open: showSidebar }">
      <div class="sidebar-header">
        <img src="/images/logo-alliance.svg" alt="AllianceHub" class="sidebar-logo">
        <span class="sidebar-title">Super Admin</span>
      </div><!-- Portal Switcher -->
<div class="portal-switcher">
  <div class="switcher-label">Switch Portal</div>
  <div class="switcher-grid">
    <router-link to="/user" class="switcher-btn"><i class="fas fa-shopping-cart"></i><span>Buyer</span></router-link>
    <router-link to="/seller" class="switcher-btn"><i class="fas fa-store"></i><span>Seller</span></router-link>
    <router-link to="/admin" class="switcher-btn"><i class="fas fa-shield-alt"></i><span>Admin</span></router-link>
    <router-link to="/superadmin" class="switcher-btn active"><i class="fas fa-crown"></i><span>Super</span></router-link>
    <router-link to="/ratingplus" class="switcher-btn"><i class="fas fa-star"></i><span>R+</span></router-link>
    <router-link to="/" class="switcher-btn"><i class="fas fa-home"></i><span>Site</span></router-link>
  </div>
</div>

      <nav class="sidebar-nav">
        <!-- Main -->
        <div class="nav-section">
          <div class="nav-label">Main</div>
          <router-link to="/superadmin" class="nav-item" exact-active-class="active">
            <i class="fas fa-tachometer-alt"></i> Dashboard
          </router-link>
        </div>

        <!-- Management -->
        <div class="nav-section">
          <div class="nav-label">Management</div>
          <router-link to="/superadmin/users" class="nav-item" active-class="active">
            <i class="fas fa-users-cog"></i> Users
          </router-link>
          <router-link to="/superadmin/products" class="nav-item" active-class="active">
            <i class="fas fa-box"></i> Products
          </router-link>
          <router-link to="/superadmin/orders" class="nav-item" active-class="active">
            <i class="fas fa-shopping-bag"></i> Orders
          </router-link>
          <router-link to="/superadmin/categories" class="nav-item" active-class="active">
            <i class="fas fa-tags"></i> Categories
          </router-link>
          <router-link to="/superadmin/sellers" class="nav-item" active-class="active">
            <i class="fas fa-store"></i> Sellers
          </router-link>
        </div>

        <!-- Finance -->
        <div class="nav-section">
          <div class="nav-label">Finance</div>
          <router-link to="/superadmin/transactions" class="nav-item" active-class="active">
            <i class="fas fa-exchange-alt"></i> Transactions
          </router-link>
          <router-link to="/superadmin/wallets" class="nav-item" active-class="active">
            <i class="fas fa-wallet"></i> Wallets
          </router-link>
          <router-link to="/superadmin/withdrawals" class="nav-item" active-class="active">
            <i class="fas fa-money-bill-wave"></i> Withdrawals
          </router-link>
          <router-link to="/superadmin/recharges" class="nav-item" active-class="active">
            <i class="fas fa-credit-card"></i> Recharges
          </router-link>
        </div>

        <!-- Content -->
        <div class="nav-section">
          <div class="nav-label">Content</div>
          <router-link to="/superadmin/banners" class="nav-item" active-class="active">
            <i class="fas fa-image"></i> Banners
          </router-link>
          <router-link to="/superadmin/coupons" class="nav-item" active-class="active">
            <i class="fas fa-ticket-alt"></i> Coupons
          </router-link>
          <router-link to="/superadmin/notifications" class="nav-item" active-class="active">
            <i class="fas fa-bell"></i> Notifications
          </router-link>
        </div>

        <!-- Communication -->
        <div class="nav-section">
          <div class="nav-label">Communication</div>
          <router-link to="/superadmin/chat" class="nav-item" active-class="active">
            <i class="fas fa-comments"></i> Chat
          </router-link>
          <router-link to="/superadmin/messages" class="nav-item" active-class="active">
            <i class="fas fa-envelope"></i> Messages
          </router-link>
        </div>

        <!-- Reports -->
        <div class="nav-section">
          <div class="nav-label">Reports</div>
          <router-link to="/superadmin/reports/sales" class="nav-item" active-class="active">
            <i class="fas fa-chart-line"></i> Sales Report
          </router-link>
          <router-link to="/superadmin/reports/products" class="nav-item" active-class="active">
            <i class="fas fa-chart-bar"></i> Product Report
          </router-link>
          <router-link to="/superadmin/reports/customers" class="nav-item" active-class="active">
            <i class="fas fa-chart-pie"></i> Customer Report
          </router-link>
        </div>

        <!-- System -->
        <div class="nav-section">
          <div class="nav-label">System</div>
          <router-link to="/superadmin/settings" class="nav-item" active-class="active">
            <i class="fas fa-cogs"></i> Settings
          </router-link>
          <router-link to="/superadmin/audit-logs" class="nav-item" active-class="active">
            <i class="fas fa-history"></i> Audit Logs
          </router-link>
          <router-link to="/superadmin/security" class="nav-item" active-class="active">
            <i class="fas fa-shield-alt"></i> Security
          </router-link>
          <router-link to="/superadmin/feature-flags" class="nav-item" active-class="active">
            <i class="fas fa-flag"></i> Feature Flags
          </router-link>
          <router-link to="/superadmin/ip-logs" class="nav-item" active-class="active">
            <i class="fas fa-network-wired"></i> IP Logs
          </router-link>
        </div>

        <!-- Tools -->
        <div class="nav-section">
          <div class="nav-label">Tools</div>
          <router-link to="/superadmin/blockchain" class="nav-item" active-class="active">
            <i class="fas fa-link"></i> Blockchain
          </router-link>
          <router-link to="/superadmin/scraper" class="nav-item" active-class="active">
            <i class="fas fa-spider"></i> Scraper
          </router-link>
          <router-link to="/superadmin/logs" class="nav-item" active-class="active">
            <i class="fas fa-file-alt"></i> System Logs
          </router-link>
        </div>

        <!-- Navigation -->
        <div class="nav-section">
          <div class="nav-label">Navigation</div>
          <router-link to="/admin" class="nav-item">
            <i class="fas fa-arrow-left"></i> Admin Panel
          </router-link>
          <router-link to="/" class="nav-item">
            <i class="fas fa-home"></i> Main Site
          </router-link>
        </div>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <i class="fas fa-crown crown-icon"></i>
          <div>
            <div class="user-name">{{ userStore.username }}</div>
            <div class="user-role">Super Admin</div>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout"><i class="fas fa-sign-out-alt"></i></button>
      </div>
    </aside>
    <main class="sa-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
const router = useRouter()
const userStore = useUserStore()
import { ref } from 'vue'
const showSidebar = ref(false)
const handleLogout = async () => { await userStore.logout(); router.push('/login/admin') }
</script>

<style scoped>
.sa-layout { display: flex; min-height: 100vh; background: #EAEDED; }
.sa-sidebar { width: 260px; background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%); color: #fff; display: flex; flex-direction: column; position: fixed; height: 100vh; z-index: 100; overflow-y: auto; }
.sidebar-header { padding: 20px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); }
.sidebar-logo { width: 32px; height: 32px; }
.sidebar-title { font-size: 16px; font-weight: 700; color: #f39c12; }
.sidebar-nav { flex: 1; padding: 12px; }
.nav-section { margin-bottom: 8px; }
.nav-label { font-size: 10px; text-transform: uppercase; color: rgba(255,255,255,0.3); padding: 8px 16px 4px; letter-spacing: 1px; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-radius: 8px; color: rgba(255,255,255,0.7); text-decoration: none; font-size: 13px; margin-bottom: 2px; transition: all 0.2s; }
.nav-item:hover { background: rgba(255,255,255,0.1); color: #fff; }
.nav-item.active { background: #131921; color: #fff; font-weight: 600; }
.nav-item i { width: 20px; text-align: center; font-size: 14px; }
.sidebar-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between; }
.user-info { display: flex; align-items: center; gap: 10px; }
.crown-icon { color: #f39c12; font-size: 20px; }
.user-name { font-size: 13px; font-weight: 600; }
.user-role { font-size: 11px; color: rgba(255,255,255,0.5); }
.logout-btn { background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; font-size: 16px; padding: 8px; border-radius: 6px; }
.logout-btn:hover { background: rgba(255,255,255,0.1); color: #ff7675; }
.sa-main { flex: 1; margin-left: 260px; min-height: 100vh; }
@media (max-width: 1023px) { .sa-sidebar { width: 60px; } .sidebar-title, .nav-label, .nav-item span, .user-info div { display: none; } .nav-item { justify-content: center; padding: 10px; } .nav-item i { width: auto; } .sa-main { margin-left: 60px; } }
@media (max-width: 768px) {
  .mobile-toggle { display: block; position: fixed; top: 12px; left: 12px; z-index: 300; background: #1a1a2e; color: #fff; border: none; width: 40px; height: 40px; border-radius: 8px; font-size: 18px; cursor: pointer; }
  .mobile-overlay { display: block; }
  .sa-sidebar { transform: translateX(-100%); width: 260px; transition: transform 0.3s; }
  .sa-sidebar.open { transform: translateX(0); }
  .sa-main { margin-left: 0; padding-top: 60px; }
}
.mobile-toggle { display: none; }
.mobile-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; }

.portal-switcher { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); }
.switcher-label { font-size: 10px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 8px; letter-spacing: 1px; }
.switcher-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.switcher-btn { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 4px; border-radius: 8px; background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); text-decoration: none; font-size: 10px; transition: all 0.2s; }
.switcher-btn:hover { background: rgba(255,255,255,0.1); color: white; }
.switcher-btn.active { background: #131921; color: white; }
.switcher-btn i { font-size: 14px; }
</style>