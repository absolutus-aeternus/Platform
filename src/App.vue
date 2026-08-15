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
