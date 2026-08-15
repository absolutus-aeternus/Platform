<template>
  <div id="app">
    <GlobalToast ref="toast" />
    <router-view v-slot="{ Component, route }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<style>
#app { max-width: 100vw; overflow-x: hidden; }
.page-fade-enter-active, .page-fade-leave-active { transition: opacity 0.15s ease; }
.page-fade-enter-from, .page-fade-leave-to { opacity: 0; }

/* === GLOBAL RESPONSIVE === */
@media (max-width: 1200px) {
  .container { padding: 0 1rem; }
  .flash-products { grid-template-columns: repeat(6, 1fr) !important; }
}

@media (max-width: 992px) {
  .hero-layout { grid-template-columns: 1fr !important; min-height: auto !important; }
  .sidebar-cats { display: none !important; }
  .hero-side-cards { display: none !important; }
  .flash-products { grid-template-columns: repeat(4, 1fr) !important; }
  .product-grid { grid-template-columns: repeat(3, 1fr) !important; }
  .header-bottom { display: none !important; }
  .sub-header { display: none !important; }
}

@media (max-width: 768px) {
  .flash-products { grid-template-columns: repeat(3, 1fr) !important; gap: 0.375rem !important; }
  .product-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.5rem !important; }
  .hero-banner { min-height: 10rem !important; }
  .banner-content { padding: 1rem !important; }
  .banner-text h2 { font-size: 1rem !important; }
  .banner-visual { font-size: 2rem !important; }
  .category-bar { overflow-x: auto; flex-wrap: nowrap !important; }
  .cat-item { min-width: 60px; }
  .page-header { flex-direction: column; gap: 0.75rem; }
  .page-header h1 { font-size: 1.25rem; }
  table { font-size: 12px; }
  th, td { padding: 8px 10px !important; }
  .filters { flex-direction: column; }
  .modal { width: 95vw !important; margin: 1rem; }
  .form-group input, .form-group select { font-size: 16px; /* prevent zoom on iOS */ }
}

@media (max-width: 480px) {
  .flash-products { grid-template-columns: repeat(2, 1fr) !important; }
  .product-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .fc-img { height: 100px !important; }
  .skel-img { height: 100px !important; }
  .fc-body { padding: 0.375rem 0.5rem !important; }
  .fc-name { font-size: 0.6875rem !important; }
  .fc-price { font-size: 0.8125rem !important; }
  .banner-arrow { display: none !important; }
  .banner-text h2 { font-size: 0.875rem !important; }
  .banner-text p { font-size: 0.6875rem !important; }
  .btn-banner { padding: 0.3rem 0.75rem !important; font-size: 0.625rem !important; }
  .hero-banner { min-height: 8rem !important; }
  .flash-title { font-size: 0.8125rem !important; }
  .cd-num { font-size: 0.625rem !important; padding: 0.0625rem 0.25rem !important; }
}

</style>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import GlobalToast from '@/components/GlobalToast.vue'
import { useUserStore } from '@/store/user'
import { useGlobalSync } from '@/composables/useGlobalSync'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const toast = ref(null)

const { initSync, disconnect, on: onSync } = useGlobalSync()

// Track page visits for analytics
const pageVisits = ref(0)

onMounted(() => {
  // Initialize auth
  userStore.initFromStorage()

  // Make toast globally available
  window.__toast = toast.value

  // Initialize realtime sync only if user is logged in
  setTimeout(() => {
    if (userStore.isLoggedIn && userStore.supabaseUser?.id) {
      initSync(userStore.supabaseUser.id)
    }

    onSync('*', (event, payload) => {
      pageVisits.value++
    })
  }, 2000)
})

// Watch for route changes — trigger data refresh
watch(() => route.path, (newPath, oldPath) => {
  if (newPath !== oldPath) {
    pageVisits.value++
    // Scroll to top on navigation
    window.scrollTo(0, 0)
  }
})

// Watch for auth state changes — reconnect sync
watch(() => userStore.isLoggedIn, (loggedIn) => {
  disconnect()
  if (loggedIn) {
    setTimeout(() => initSync(userStore.supabaseUser?.id), 500)
  }
})

onUnmounted(() => {
  disconnect()
})
</script>
