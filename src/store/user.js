import { defineStore } from 'pinia'
import { supabase, signIn, signUp, signOut, getCurrentUser, fetchCart, addToCart as supaAddToCart, removeFromCart as supaRemoveFromCart } from '@/services/supabase'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: null,
    userInfo: {},
    cart: [],
    isLoggedIn: false,
    supabaseUser: null,
  }),
  
  getters: {
    cartCount: (state) => state.cart.length,
    username: (state) => state.userInfo.username || state.supabaseUser?.email || '',
  },
  
  actions: {
    async initFromStorage() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        this.token = session.access_token
        this.supabaseUser = session.user
        this.isLoggedIn = true
        await this.fetchCart()
      }
      
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          this.token = session.access_token
          this.supabaseUser = session.user
          this.isLoggedIn = true
        } else if (event === 'SIGNED_OUT') {
          this.token = null
          this.supabaseUser = null
          this.isLoggedIn = false
          this.cart = []
        }
      })
    },
    
    async login(email, password) {
      const { data, error } = await signIn(email, password)
      if (error) return { success: false, msg: error.message }
      this.token = data.session.access_token
      this.supabaseUser = data.user
      this.isLoggedIn = true
      await this.fetchCart()
      return { success: true }
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
      this.cart = []
    },
    
    async fetchCart() {
      if (!this.supabaseUser) return
      const { data } = await fetchCart(this.supabaseUser.id)
      this.cart = data || []
    },
    
    async addToCart(product) {
      if (!this.supabaseUser) return
      const existing = this.cart.find(item => item.product_id === product.id)
      if (existing) {
        await supaAddToCart(this.supabaseUser.id, product.id, existing.quantity + 1)
      } else {
        await supaAddToCart(this.supabaseUser.id, product.id, 1)
      }
      await this.fetchCart()
    },
    
    async removeFromCart(productId) {
      if (!this.supabaseUser) return
      await supaRemoveFromCart(this.supabaseUser.id, productId)
      await this.fetchCart()
    },
    
    clearCart() {
      this.cart = []
    }
  }
})
