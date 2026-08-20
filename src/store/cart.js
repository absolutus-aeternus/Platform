import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    isLoading: false,
    error: null,
    lastUpdated: null
  }),

  getters: {
    itemCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    hasItems: (state) => state.items.length > 0,
    subtotal: (state) => state.items.reduce((sum, item) => {
      const price = item.products?.price || item.price || 0
      return sum + (price * item.quantity)
    }, 0),
    totalDiscount: (state) => state.items.reduce((sum, item) => {
      const originalPrice = item.products?.original_price || item.original_price || 0
      const currentPrice = item.products?.price || item.price || 0
      return sum + ((originalPrice - currentPrice) * item.quantity)
    }, 0),
    totalWeight: (state) => state.items.reduce((sum, item) => {
      const weight = item.products?.weight || item.weight || 0
      return sum + (weight * item.quantity)
    }, 0),
    isEligibleForFreeShipping: (state) => state.subtotal >= 100000, // Minimum Rp 100.000 untuk free shipping
    estimatedShipping: (state) => {
      if (state.isEligibleForFreeShipping) return 0
      const baseRate = 9000
      const perKgRate = 5000
      const weightInKg = Math.ceil(state.totalWeight / 1000)
      return baseRate + (perKgRate * weightInKg)
    },
    grandTotal: (state) => state.subtotal + state.estimatedShipping - state.totalDiscount,
    allItemsAvailable: (state) => state.items.every(item => (item.products?.stock || 0) >= item.quantity)
  },

  actions: {
    setItems(items) {
      this.items = items || []
      this.lastUpdated = new Date().toISOString()
    },

    addItem(product, quantity = 1) {
      const existingIndex = this.items.findIndex(
        item => item.product_id === product.id
      )

      if (existingIndex !== -1) {
        this.items[existingIndex].quantity += quantity
      } else {
        this.items.push({
          product_id: product.id,
          products: product,
          quantity,
          added_at: new Date().toISOString()
        })
      }

      this.lastUpdated = new Date().toISOString()
      this.persistToStorage()
    },

    updateQuantity(productId, quantity) {
      const index = this.items.findIndex(item => item.product_id === productId)
      
      if (index !== -1) {
        if (quantity <= 0) {
          this.removeItem(productId)
        } else {
          this.items[index].quantity = quantity
          this.lastUpdated = new Date().toISOString()
          this.persistToStorage()
        }
      }
    },

    removeItem(productId) {
      this.items = this.items.filter(item => item.product_id !== productId)
      this.lastUpdated = new Date().toISOString()
      this.persistToStorage()
    },

    clearCart() {
      this.items = []
      this.error = null
      this.lastUpdated = null
      this.removeFromStorage()
    },

    persistToStorage() {
      try {
        localStorage.setItem('cart_items', JSON.stringify(this.items))
        localStorage.setItem('cart_last_updated', this.lastUpdated)
      } catch (e) {
        console.warn('Failed to persist cart to storage:', e)
      }
    },

    loadFromStorage() {
      try {
        const savedItems = localStorage.getItem('cart_items')
        const savedLastUpdated = localStorage.getItem('cart_last_updated')
        
        if (savedItems) {
          this.items = JSON.parse(savedItems)
          this.lastUpdated = savedLastUpdated
        }
      } catch (e) {
        console.warn('Failed to load cart from storage:', e)
      }
    },

    removeFromStorage() {
      try {
        localStorage.removeItem('cart_items')
        localStorage.removeItem('cart_last_updated')
      } catch (e) {
        console.warn('Failed to remove cart from storage:', e)
      }
    },

    async syncWithBackend(userStore) {
      if (!userStore.isLoggedIn || !userStore.supabaseUser) {
        this.loadFromStorage()
        return
      }

      try {
        await userStore.fetchCart()
        this.setItems(userStore.cart)
        this.removeFromStorage() // Clear local storage when synced
      } catch (e) {
        this.error = 'Failed to sync cart with server'
        console.error('Cart sync error:', e)
      }
    }
  }
})
