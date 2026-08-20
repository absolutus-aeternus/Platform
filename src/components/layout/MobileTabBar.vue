<template>
  <nav class="mobile-tab-bar" aria-label="Mobile navigation">
    <router-link
      v-for="tab in tabs"
      :key="tab.path"
      :to="tab.path"
      class="mobile-tab-bar__item"
      :class="{ 'mobile-tab-bar__item--active': isActive(tab.path) }"
    >
      <span class="mobile-tab-bar__icon-wrap">
        <i :class="tab.icon"></i>
        <span v-if="tab.badge" class="mobile-tab-bar__badge">{{ tab.badge > 99 ? '99+' : tab.badge }}</span>
      </span>
      <span class="mobile-tab-bar__label">{{ tab.label }}</span>
    </router-link>
  </nav>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'

const route = useRoute()
const userStore = useUserStore()

const tabs = computed(() => [
  { path: '/', icon: 'fas fa-home', label: 'Home' },
  { path: '/commodity', icon: 'fas fa-th', label: 'Products' },
  { path: '/discounts', icon: 'fas fa-bolt', label: 'Deals' },
  { path: '/chat', icon: 'fas fa-comment-dots', label: 'Chat' },
  { path: '/cart', icon: 'fas fa-shopping-cart', label: 'Cart', badge: userStore.cartCount || 0 },
])

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</template>

</script>

<style scoped>
.mobile-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--tab-bar-height, 56px);
  background: var(--white, #fff);
  border-top: 1px solid var(--neutral-200, #E7E7E7);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 300;
  padding-bottom: env(safe-area-inset-bottom, 0);
  box-shadow: 0 -2px 8px rgba(0,0,0,0.06);
}

.mobile-tab-bar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 6px 12px;
  text-decoration: none;
  color: var(--neutral-500, #888);
  transition: color var(--ease-fast, 0.15s ease);
  -webkit-tap-highlight-color: transparent;
  min-width: 56px;
}
.mobile-tab-bar__item--active {
  color: var(--brand-primary, #FF9900);
}

.mobile-tab-bar__icon-wrap {
  position: relative;
  font-size: 20px;
  line-height: 1;
}
.mobile-tab-bar__badge {
  position: absolute;
  top: -6px; right: -10px;
  background: var(--error, #CC0C39);
  color: var(--white, #fff);
  font-size: 10px;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.mobile-tab-bar__label {
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
}

/* Hide on desktop */
@media (min-width: 768px) {
  .mobile-tab-bar { display: none; }
}
</style>
