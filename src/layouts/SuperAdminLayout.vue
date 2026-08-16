<template>
  <div class="sa-layout">
    <aside class="sa-sidebar">
      <div class="sidebar-header">
        <img src="/images/logo-alliance.svg" alt="AllianceHub" class="sidebar-logo">
        <span class="sidebar-title">Super Admin</span>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/superadmin" class="nav-item" exact-active-class="active">
          <i class="fas fa-tachometer-alt"></i> Dashboard
        </router-link>
        <router-link to="/superadmin/users" class="nav-item" active-class="active">
          <i class="fas fa-users-cog"></i> User Management
        </router-link>
        <router-link to="/superadmin/settings" class="nav-item" active-class="active">
          <i class="fas fa-cogs"></i> System Settings
        </router-link>
        <router-link to="/superadmin/audit-logs" class="nav-item" active-class="active">
          <i class="fas fa-history"></i> Audit Logs
        </router-link>
        <router-link to="/superadmin/security" class="nav-item" active-class="active">
          <i class="fas fa-shield-alt"></i> Security Center
        </router-link>
        <router-link to="/superadmin/feature-flags" class="nav-item" active-class="active">
          <i class="fas fa-flag"></i> Feature Flags
        </router-link>
        <div class="nav-divider"></div>
        <router-link to="/admin" class="nav-item">
          <i class="fas fa-arrow-left"></i> Admin Panel
        </router-link>
        <router-link to="/" class="nav-item">
          <i class="fas fa-home"></i> Main Site
        </router-link>
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
const handleLogout = async () => { await userStore.logout(); router.push('/login/admin') }
</script>

<style scoped>
.sa-layout { display: flex; min-height: 100vh; background: #f5f6fa; }
.sa-sidebar { width: 260px; background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%); color: #fff; display: flex; flex-direction: column; position: fixed; height: 100vh; z-index: 100; }
.sidebar-header { padding: 20px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); }
.sidebar-logo { width: 32px; height: 32px; }
.sidebar-title { font-size: 16px; font-weight: 700; color: #f39c12; }
.sidebar-nav { flex: 1; padding: 12px; overflow-y: auto; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 8px; color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px; margin-bottom: 4px; transition: all 0.2s; }
.nav-item:hover { background: rgba(255,255,255,0.1); color: #fff; }
.nav-item.active { background: #6c5ce7; color: #fff; font-weight: 600; }
.nav-item i { width: 20px; text-align: center; }
.nav-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 12px 0; }
.sidebar-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between; }
.user-info { display: flex; align-items: center; gap: 10px; }
.crown-icon { color: #f39c12; font-size: 20px; }
.user-name { font-size: 13px; font-weight: 600; }
.user-role { font-size: 11px; color: rgba(255,255,255,0.5); }
.logout-btn { background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; font-size: 16px; padding: 8px; border-radius: 6px; }
.logout-btn:hover { background: rgba(255,255,255,0.1); color: #ff7675; }
.sa-main { flex: 1; margin-left: 260px; min-height: 100vh; }
</style>