import { defineStore } from 'pinia'
import { supabase, signIn, signUp, signOut, fetchCart, addToCart as supaAddToCart, updateCartQuantity, removeFromCart as supaRemoveFromCart, clearCart as supaClearCart } from '@/services/supabase'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: null,
    userInfo: {},
    cart: [],
    isLoggedIn: false,
    supabaseUser: null,
    role: null,
    portalMode: 'buyer',
    _authListener: null,
    _initialized: false, // Tracks if initFromStorage has completed
  }),

  getters: {
    cartCount: (state) => state.cart.reduce((sum, item) => sum + item.quantity, 0),
    username: (state) => state.userInfo.username || state.supabaseUser?.email?.split('@')[0] || '',
    cartTotal: (state) => state.cart.reduce((sum, item) => {
      const price = item.products?.price || item.price || 0
      return sum + price * item.quantity
    }, 0),
    isSeller: (state) => state.role === 'SELLER',
    isAdmin: (state) => state.role === 'ADMIN',
    isSuperAdmin: (state) => state.role === 'SUPER_ADMIN',
    isMember: (state) => state.role === 'MEMBER',
    isRatingPlus: (state) => state.role === 'RATING_PLUS',
    effectiveMode: (state) => {
      if (state.role === 'SUPER_ADMIN') return 'super-admin'
      if (state.role === 'ADMIN') return 'admin'
      if (state.role === 'SELLER') return state.portalMode === 'seller' ? 'seller' : 'buyer'
      return 'buyer'
    },
  },

  actions: {
    // Bug #3: Fetch role from database (always fresh, not from JWT)
    async fetchRole() {
      if (!this.supabaseUser) { this.role = null; return }
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', this.supabaseUser.id)
          .maybeSingle()
        
        if (error) throw error
        this.role = data?.role || 'MEMBER'
      } catch (e) {
        console.warn('fetchRole error:', e)
        this.role = 'MEMBER'
      }
    },

    // Bug #5: Load portal mode from localStorage
    _loadPortalMode() {
      try {
        const saved = localStorage.getItem('portalMode')
        if (saved && ['buyer', 'seller'].includes(saved)) {
          this.portalMode = saved
        }
      } catch (e) { /* localStorage unavailable */ }
    },

    // Bug #5: Save portal mode to localStorage
    setPortalMode(mode) {
      this.portalMode = mode
      try {
        localStorage.setItem('portalMode', mode)
      } catch (e) { /* localStorage unavailable */ }
    },

    async initFromStorage() {
      // Bug #5: Load portal mode
      this._loadPortalMode()

      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          this.token = session.access_token
          this.supabaseUser = session.user
          this.isLoggedIn = true
          this.userInfo = { username: session.user.email?.split('@')[0] }
          // Bug #3: Always fetch fresh role from DB
          try { await this.fetchRole() } catch (e) { console.warn('fetchRole error:', e.message) }
          try { await this.fetchCart() } catch (e) { console.warn('fetchCart error:', e.message) }
        }
      } catch (e) {
        console.warn('initFromStorage: getSession failed:', e.message)
      } finally {
        this._initialized = true
      }

      // Remove old listener
      if (this._authListener) {
        this._authListener.subscription?.unsubscribe()
      }

      // Bug #3: Listen for auth changes and re-fetch role
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          if (event === 'SIGNED_IN' && session) {
            this.token = session.access_token
            this.supabaseUser = session.user
            this.isLoggedIn = true
            this.userInfo = { username: session.user.email?.split('@')[0] }
            // Bug #3: Re-fetch role on every sign-in (catches role changes)
            try { await this.fetchRole() } catch (e) { console.warn('Auth: fetchRole failed:', e.message) }
          } else if (event === 'SIGNED_OUT') {
            this.token = null
            this.supabaseUser = null
            this.isLoggedIn = false
            this.role = null
            this.userInfo = {}
            this.cart = []
          } else if (event === 'TOKEN_REFRESHED') {
            // Bug #3: Re-fetch role on token refresh
            try { await this.fetchRole() } catch (e) { console.warn('Auth: fetchRole failed:', e.message) }
          }
        } catch (e) {
          console.warn('Auth state change error:', e.message)
        }
      })
      this._authListener = { subscription }
    },

    async login(email, password) {
      const { data, error } = await signIn(email, password)
      if (!error && data?.session) {
        this.token = data.session.access_token
        this.supabaseUser = data.user
        this.isLoggedIn = true
        this.userInfo = { username: data.user.email?.split('@')[0] }
        await this.fetchRole()
        await this.fetchCart()
        return { success: true, role: this.role }
      }
      return { success: false, msg: error?.message || 'Login failed. Please check your credentials.' }
    },

    async register(email, password) {
      const { data, error } = await signUp(email, password)
      if (error) return { success: false, msg: error.message }
      return { success: true, data }
    },

    async logout() {
      await signOut()
      this.token = null
      this.supabaseUser = null
      this.isLoggedIn = false
      this.role = null
      this.userInfo = {}
      this.cart = []
      // Emit logout event for ChatWidget and other listeners
      window.__syncBus?.emit('user:logout')
    },

    // Bug #4: Update profile and sync store state
    async updateProfile(updates) {
      if (!this.supabaseUser) return { error: 'Not logged in' }
      try {
        // SECURITY: Never allow client-side role changes or critical status modifications
        // Delete these fields BEFORE sending the update payload to Supabase
        const safeUpdates = { ...updates }
        delete safeUpdates.role
        delete safeUpdates.kyc_status
        delete safeUpdates.status

        const { error } = await supabase
          .from('users')
          .update(safeUpdates)
          .eq('id', this.supabaseUser.id)
        
        if (error) throw error

        // Bug #4: Sync store state immediately
        if (safeUpdates.username) this.userInfo.username = safeUpdates.username

        return { success: true }
      } catch (e) {
        return { error: e.message }
      }
    },

    async fetchCart() {
      if (!this.supabaseUser) return
      try {
        const { data } = await fetchCart(this.supabaseUser.id)
        this.cart = data || []
      } catch (e) {
        console.warn('fetchCart error:', e)
      }
    },

    async addToCart(product) {
      if (!this.supabaseUser) return { error: 'Not logged in' }
      const { data, error } = await supaAddToCart(this.supabaseUser.id, product.id, product.quantity || 1)
      if (!error) await this.fetchCart()
      return { data, error }
    },

    async updateItemQuantity(cartItemId, quantity) {
      const { error } = await updateCartQuantity(cartItemId, quantity)
      if (!error) await this.fetchCart()
      return { error }
    },

    async removeFromCart(cartItemId) {
      const { error } = await supaRemoveFromCart(cartItemId)
      if (!error) await this.fetchCart()
      return { error }
    },

    async clearCart() {
      if (!this.supabaseUser) return
      await supaClearCart(this.supabaseUser.id)
      this.cart = []
    },
  },
})
