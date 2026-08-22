/**
 * useTawkChat() — Tawk.to helper composable
 * Provides methods to control Tawk.to widget from any Vue component.
 *
 * Usage:
 *   const { openChat, closeChat, setUserIdentity, logoutTawk, hideWidget, showWidget, isReady } = useTawkChat()
 */

import { ref, onMounted } from 'vue'

const isReady = ref(false)
const TAWK_PROPERTY_ID = 'YOUR_TAWK_PROPERTY_ID' // TODO: Replace with actual Tawk.to Property ID
const TAWK_WIDGET_ID = 'YOUR_TAWK_WIDGET_ID'     // TODO: Replace with actual Tawk.to Widget ID

/**
 * Wait for Tawk_API to be available
 */
function waitForTawk(timeout = 10000) {
  return new Promise((resolve) => {
    if (window.Tawk_API && window.Tawk_API.onLoaded) {
      resolve(true)
      return
    }
    const start = Date.now()
    const check = setInterval(() => {
      if (window.Tawk_API && window.Tawk_API.onLoaded) {
        clearInterval(check)
        resolve(true)
      } else if (Date.now() - start > timeout) {
        clearInterval(check)
        resolve(false)
      }
    }, 200)
  })
}

export function useTawkChat() {
  /**
   * Open/maximize the chat widget
   */
  function openChat() {
    if (window.Tawk_API) {
      window.Tawk_API.maximize()
    }
  }

  /**
   * Close/minimize the chat widget
   */
  function closeChat() {
    if (window.Tawk_API) {
      window.Tawk_API.minimize()
    }
  }

  /**
   * Hide the widget completely (for admin/superadmin pages)
   */
  function hideWidget() {
    if (window.Tawk_API) {
      window.Tawk_API.hideWidget()
    }
  }

  /**
   * Show the widget (when leaving admin pages)
   */
  function showWidget() {
    if (window.Tawk_API) {
      window.Tawk_API.showWidget()
    }
  }

  /**
   * Set user identity and custom attributes in Tawk.to
   * @param {Object} user - { id, email, username, role, isRatingPlus }
   */
  function setUserIdentity(user) {
    if (!window.Tawk_API || !user) return

    // Set visitor info
    window.Tawk_API.visitor = {
      name: user.username || user.email?.split('@')[0] || 'User',
      email: user.email || '',
    }

    // Set custom attributes for CS team filtering
    const attrs = {
      'Role': user.role || 'MEMBER',
      'User_ID': user.id || '',
      'Subscription': user.isRatingPlus ? 'Rating Plus Member' : 'Regular',
    }

    window.Tawk_API.setAttributes(attrs, (err) => {
      if (err) console.warn('[Tawk] setAttributes error:', err)
    })

    // Set tags for dashboard filtering
    const tags = [user.role || 'MEMBER']
    if (user.isRatingPlus) tags.push('Rating Plus')
    if (user.role === 'SELLER') tags.push('Seller')

    window.Tawk_API.addTags(tags, (err) => {
      if (err) console.warn('[Tawk] addTags error:', err)
    })
  }

  /**
   * Logout / clear user session from Tawk.to
   */
  function logoutTawk() {
    if (window.Tawk_API) {
      window.Tawk_API.visitor = {
        name: 'Guest',
        email: '',
      }
      window.Tawk_API.setAttributes({
        'Role': 'GUEST',
        'User_ID': '',
        'Subscription': 'Guest',
      }, () => {})
    }
  }

  /**
   * Initialize Tawk.to — called once on app mount
   */
  async function initTawk() {
    const loaded = await waitForTawk()
    if (loaded) {
      isReady.value = true
      console.log('[Tawk] Widget loaded successfully')
    } else {
      console.warn('[Tawk] Widget failed to load within timeout')
    }
  }

  return {
    isReady,
    openChat,
    closeChat,
    hideWidget,
    showWidget,
    setUserIdentity,
    logoutTawk,
    initTawk,
  }
}
