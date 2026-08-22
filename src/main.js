import '@/assets/design-tokens.css'
import '@/assets/responsive.css'
import '@/assets/animations-3d.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import i18n from './i18n'
import './assets/css/main.css'
import { imgFallback } from './directives/imgFallback'
import './utils/auto-fix-system.js'

// Inject analytics IDs from env into global
window.__ONESIGNAL_APP_ID__ = import.meta.env.VITE_ONESIGNAL_APP_ID || ''
window.__CLARITY_PROJECT_ID__ = import.meta.env.VITE_CLARITY_PROJECT_ID || ''

// Global event bus for cross-component communication
window.__syncBus = {
  _events: {},
  on(event, fn) {
    if (!this._events[event]) this._events[event] = []
    this._events[event].push(fn)
  },
  off(event, fn) {
    if (this._events[event]) {
      this._events[event] = this._events[event].filter(f => f !== fn)
    }
  },
  emit(event, data) {
    (this._events[event] || []).forEach(fn => {
      try { fn(data) } catch (e) { console.error('SyncBus error:', e) }
    })
  }
}

// Create Vue app
const app = createApp(App)

// Global image error handler
app.config.globalProperties.$imgError = (e, fallback) => {
  if (e?.target && fallback) e.target.src = fallback
}

// Global image fallback on error (catches ALL broken images)
const PLACEHOLDER_SVG = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%23f5f5f5" width="200" height="200" rx="8"/><circle cx="80" cy="80" r="20" fill="%23ddd"/><path d="M20 140l40-40 30 30 40-50 50 60H20z" fill="%23ddd"/><text fill="%23aaa" font-family="sans-serif" font-size="12" x="50%" y="85%" text-anchor="middle">No Image</text></svg>')
document.addEventListener('error', (e) => {
  if (e.target.tagName === 'IMG' && !e.target.dataset.fallbackApplied) {
    e.target.dataset.fallbackApplied = 'true'
    e.target.src = PLACEHOLDER_SVG
    e.target.classList.add('img-fallback')
  }
}, true)

// Offline detection
window.__isOffline = !navigator.onLine
window.addEventListener('offline', () => {
  window.__isOffline = true
  if (window.__toast) window.__toast.show('You are offline. Some features may be unavailable.', 'warning')
})
window.addEventListener('online', () => {
  window.__isOffline = false
  if (window.__toast) window.__toast.show('Back online!', 'success')
})

// Install plugins and mount
app.use(createPinia())
app.use(router)
app.use(i18n)

// BUG #17: Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error:', err, info)
  // Don't show toast for minor errors
  if (err?.message?.includes('ResizeObserver') || err?.message?.includes('Script error')) return
  const msg = err?.message || 'Something went wrong'
  if (window.__toast) window.__toast.show(msg, 'error')
}
// Register global directives
app.directive('img-fallback', imgFallback)

app.mount('#app')
