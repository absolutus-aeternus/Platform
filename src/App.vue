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

onMounted(async () => {
  // Initialize auth FIRST (router guard waits for this)
  try {
    await userStore.initFromStorage()
  } catch (e) {
    console.warn('App: initFromStorage failed:', e.message)
    // Mark as initialized even on error to prevent infinite wait
    userStore._initialized = true
  }

  // Make toast globally available
  window.__toast = toast.value

  // Initialize realtime sync only if user is logged in
  setTimeout(() => {
    try {
      if (userStore.isLoggedIn && userStore.supabaseUser?.id) {
        initSync(userStore.supabaseUser.id)
      }

      onSync('*', (event, payload) => {
        pageVisits.value++
      })
    } catch (e) {
      console.warn('App: initSync failed:', e.message)
    }
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

<style>
#app { max-width: 100vw; overflow-x: hidden; }
.page-fade-enter-active, .page-fade-leave-active { transition: opacity 0.15s ease; }
.page-fade-enter-from, .page-fade-leave-to { opacity: 0; }

/* === GLOBAL RESPONSIVE === */
@media (max-width: 1200px) {
  .container { padding: 0 1rem; }
}

@media (max-width: 768px) {
  .flash-products { gap: 0.375rem !important; }
  .product-grid { gap: 0.5rem !important; }
  .category-bar { overflow-x: auto; flex-wrap: nowrap !important; }
  .cat-item { min-width: 60px; }
  .page-header { flex-direction: column; gap: 0.75rem; }
  .page-header h1 { font-size: 1.25rem; }
  .filters { flex-direction: column; }
  .modal { width: 95vw !important; margin: 1rem; }
  .form-group input, .form-group select { font-size: 16px; /* prevent zoom on iOS */ }
}

@media (max-width: 480px) {
  .banner-arrow { display: none !important; }
}
</style>
