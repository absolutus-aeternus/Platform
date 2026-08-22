<template>
  <button
    v-if="showLauncher"
    class="chat-launcher"
    :class="{ 'chat-launcher--open': isOpen, 'chat-launcher--hidden': isAdmin }"
    @click="toggleChat"
    :aria-label="isOpen ? 'Close chat' : 'Open customer support chat'"
  >
    <i :class="isOpen ? 'fas fa-times' : 'fas fa-comment-dots'"></i>
    <span v-if="unreadCount && !isOpen" class="chat-launcher__badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
  </button>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/store/user'
import { useRoute } from 'vue-router'

const userStore = useUserStore()
const route = useRoute()
const isOpen = ref(false)
const unreadCount = ref(0)
const isLoaded = ref(false)

const userRole = computed(() => userStore.role || 'GUEST')
const isAdmin = computed(() => ['ADMIN', 'SUPER_ADMIN'].includes(userRole.value))
const isSeller = computed(() => userRole.value === 'SELLER')
const isLoggedIn = computed(() => userStore.isLoggedIn)
const showLauncher = computed(() => !isAdmin.value)

function getTawk() { return window.Tawk_API || null }

function toggleChat() {
  const tawk = getTawk()
  if (!tawk) return
  if (isOpen.value) { tawk.minimize?.(); isOpen.value = false }
  else { tawk.maximize?.(); isOpen.value = true; unreadCount.value = 0 }
}

function syncUserAttributes() {
  const tawk = getTawk()
  if (!tawk || !isLoggedIn.value) return
  const attrs = { name: userStore.username || userStore.email || 'User', email: userStore.email || '', userId: userStore.userId || '', role: userRole.value }
  if (isSeller.value && userStore.sellerId) { attrs.storeId = userStore.sellerId; attrs.storeName = userStore.storeName || '' }
  try {
    tawk.setAttributes(attrs, (err) => { if (err) console.warn('[ChatWidget] setAttributes:', err) })
    const tags = [userRole.value.toLowerCase()]
    if (isSeller.value) tags.push('seller')
    tawk.addTags?.(tags, () => {})
  } catch (e) { console.warn('[ChatWidget] sync error:', e) }
}

function endChatSession() {
  const tawk = getTawk()
  if (!tawk) return
  try { tawk.endChat?.(); tawk.hideWidget?.(); isOpen.value = false; unreadCount.value = 0 } catch (e) {}
}

function setupTawkEvents() {
  const tawk = getTawk()
  if (!tawk) return
  tawk.onLoad = () => {
    isLoaded.value = true
    tawk.hideWidget?.()
    if (isAdmin.value) return
    if (isLoggedIn.value) syncUserAttributes()
  }
  tawk.onChatMinimized = () => { isOpen.value = false }
  tawk.onChatHidden = () => { isOpen.value = false }
  tawk.onUnreadCountChanged = (count) => { unreadCount.value = count }
}

watch(isLoggedIn, (v) => { if (v) setTimeout(syncUserAttributes, 1500); else endChatSession() })
watch(userRole, () => { if (isLoggedIn.value) syncUserAttributes() })
watch(() => route.path, (p) => { if (p.startsWith('/999/') || p.startsWith('/seller')) { getTawk()?.hideWidget?.(); isOpen.value = false } })

onMounted(() => {
  const check = setInterval(() => {
    if (window.Tawk_API) { clearInterval(check); setupTawkEvents(); window.Tawk_API.onLoad?.() }
  }, 500)
  setTimeout(() => clearInterval(check), 15000)
  window.__syncBus?.on('user:logout', endChatSession)
})
onUnmounted(() => { window.__syncBus?.off('user:logout', endChatSession) })
</script>

<style scoped>
.chat-launcher {
  position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; border-radius: 50%;
  background: var(--brand-primary, #FF9900); color: var(--white, #fff); border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-size: 24px;
  box-shadow: 0 4px 16px rgba(255,153,0,0.4); z-index: var(--z-chat-widget, 900);
  transition: all var(--ease-normal, 0.2s ease); -webkit-tap-highlight-color: transparent;
}
.chat-launcher:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(255,153,0,0.5); }
.chat-launcher:active { transform: scale(0.95); }
.chat-launcher--open { background: var(--neutral-700, #565959); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
.chat-launcher--hidden { display: none; }
.chat-launcher__badge {
  position: absolute; top: -4px; right: -4px; background: var(--error, #CC0C39); color: var(--white, #fff);
  font-size: 11px; font-weight: 700; min-width: 20px; height: 20px; padding: 0 5px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; animation: badge-pop 0.3s ease;
}
@keyframes badge-pop { 0% { transform: scale(0); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
@media (max-width: 767px) {
  .chat-launcher { bottom: calc(var(--tab-bar-height, 56px) + 16px + env(safe-area-inset-bottom, 0px)); right: 16px; width: 48px; height: 48px; font-size: 20px; }
}
</style>
