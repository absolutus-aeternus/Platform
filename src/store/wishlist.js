import { defineStore } from 'pinia'

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    items: [],
    isLoading: false,
    error: null
  }),

  getters: {
    itemCount: (state) => state.items.length,
    hasItems: (state) => state.items.length > 0,
    availableItems: (state) => state.items.filter(item => (item.products?.stock || 0) > 0),
    outOfStockItems: (state) => state.items.filter(item => (item.products?.stock || 0) === 0),
    priceRange: (state) => {
      if (state.items.length === 0) return { min: 0, max: 0 }
      const prices = state.items.map(i => i.products?.price || 0)
      return {
        min: Math.min(...prices),
        max: Math.max(...prices)
      }
    }
  },

  actions: {
    async fetchWishlist(userId) {
      if (!userId) return
      
      this.isLoading = true
      this.error = null

      try {
        const { supabase } = await import('@/services/supabase')
        
        const { data, error } = await supabase
          .from('wishlists')
          .select(`
            *,
            products(
              id,
              name,
              price,
              original_price,
              image_url,
              stock,
              average_rating,
              categories(name)
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        this.items = data || []

      } catch (e) {
        this.error = e.message
        console.error('fetchWishlist error:', e)
      } finally {
        this.isLoading = false
      }
    },

    async addToWishlist(userId, productId) {
      if (!userId) {
        // Store in localStorage for guest users
        this.addGuestItem(productId)
        return { success: true }
      }

      try {
        const { supabase } = await import('@/services/supabase')
        
        // Check if already in wishlist
        const exists = this.items.find(item => item.product_id === productId)
        if (exists) {
          return { success: false, message: 'Already in wishlist' }
        }

        const { data, error } = await supabase
          .from('wishlists')
          .insert([{ user_id: userId, product_id: productId }])
          .select(`
            *,
            products(
              id,
              name,
              price,
              original_price,
              image_url,
              stock,
              average_rating
            )
          `)
          .single()

        if (error) throw error

        this.items.unshift(data)
        return { success: true }

      } catch (e) {
        console.error('addToWishlist error:', e)
        return { success: false, message: e.message }
      }
    },

    async removeFromWishlist(itemId) {
      try {
        const { supabase } = await import('@/services/supabase')
        
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('id', itemId)

        if (error) throw error

        this.items = this.items.filter(item => item.id !== itemId)
        return { success: true }

      } catch (e) {
        console.error('removeFromWishlist error:', e)
        return { success: false, message: e.message }
      }
    },

    async removeProductFromWishlist(userId, productId) {
      if (!userId) {
        this.removeGuestItem(productId)
        return { success: true }
      }

      try {
        const { supabase } = await import('@/services/supabase')
        
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId)

        if (error) throw error

        this.items = this.items.filter(item => item.product_id !== productId)
        return { success: true }

      } catch (e) {
        console.error('removeProductFromWishlist error:', e)
        return { success: false, message: e.message }
      }
    },

    isInWishlist(productId) {
      return this.items.some(item => item.product_id === productId)
    },

    addGuestItem(productId) {
      try {
        const saved = localStorage.getItem('guest_wishlist')
        const guestItems = saved ? JSON.parse(saved) : []
        
        if (!guestItems.includes(productId)) {
          guestItems.push(productId)
          localStorage.setItem('guest_wishlist', JSON.stringify(guestItems))
          // Note: We can't show product details without fetching them
        }
      } catch (e) {
        console.warn('Failed to save guest wishlist:', e)
      }
    },

    removeGuestItem(productId) {
      try {
        const saved = localStorage.getItem('guest_wishlist')
        if (saved) {
          const guestItems = JSON.parse(saved)
          const filtered = guestItems.filter(id => id !== productId)
          localStorage.setItem('guest_wishlist', JSON.stringify(filtered))
        }
      } catch (e) {
        console.warn('Failed to remove from guest wishlist:', e)
      }
    },

    async syncGuestWishlist(userId) {
      if (!userId) return

      try {
        const saved = localStorage.getItem('guest_wishlist')
        if (!saved) return

        const guestItems = JSON.parse(saved)
        
        for (const productId of guestItems) {
          await this.addToWishlist(userId, productId)
        }

        localStorage.removeItem('guest_wishlist')
        await this.fetchWishlist(userId)
      } catch (e) {
        console.error('syncGuestWishlist error:', e)
      }
    },

    clearWishlist() {
      this.items = []
      this.error = null
    }
  }
})
