import '@/assets/responsive.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import i18n from './i18n'
import './assets/css/main.css'

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

// Global image fallback on error
document.addEventListener('error', (e) => {
  if (e.target.tagName === 'IMG' && !e.target.dataset.fallbackApplied) {
    e.target.dataset.fallbackApplied = 'true'
    e.target.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%23f0f0f0" width="200" height="200"/><text fill="%23ccc" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">No Image</text></svg>')
  }
}, true)

// Install plugins and mount
app.use(createPinia())
app.use(router)
app.use(i18n)
app.mount('#app')
