import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as any[],
    loading: false,
  }),

  getters: {
    cartCount: (state) => state.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    selectedItems: (state) => state.items.filter((item: any) => item.selected !== false),
    totalPrice: (state) => {
      return state.items
        .filter((item: any) => item.selected !== false)
        .reduce((sum: number, item: any) => {
          const price = item.products?.price || item.price || 0
          return sum + price * item.quantity
        }, 0)
    },
  },

  actions: {
    async fetchCart(userId: string) {
      if (!userId) return
      this.loading = true
      try {
        const { data } = await supabase
          .from('cart_items')
          .select('*, products(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        this.items = data || []
      } catch (e) {
        console.error('Failed to fetch cart:', e)
      }
      this.loading = false
    },

    async addItem(userId: string, productId: string, quantity = 1) {
      if (!userId) return { error: 'Not logged in' }
      try {
        const { data: existing } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', userId)
          .eq('product_id', productId)
          .maybeSingle()

        if (existing) {
          await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + quantity })
            .eq('id', existing.id)
        } else {
          await supabase
            .from('cart_items')
            .insert({ user_id: userId, product_id: productId, quantity })
        }

        await this.fetchCart(userId)
        return { success: true }
      } catch (e: any) {
        return { error: e.message }
      }
    },

    async updateQuantity(userId: string, cartItemId: string, quantity: number) {
      if (quantity <= 0) {
        return this.removeItem(userId, cartItemId)
      }
      await supabase.from('cart_items').update({ quantity }).eq('id', cartItemId)
      await this.fetchCart(userId)
    },

    async removeItem(userId: string, cartItemId: string) {
      await supabase.from('cart_items').delete().eq('id', cartItemId)
      await this.fetchCart(userId)
    },

    async clearCart(userId: string) {
      await supabase.from('cart_items').delete().eq('user_id', userId)
      this.items = []
    },

    toggleSelect(itemId: string) {
      const item = this.items.find((i: any) => i.id === itemId)
      if (item) item.selected = !item.selected
    },

    selectAll(selected: boolean) {
      this.items.forEach((item: any) => { item.selected = selected })
    },
  },
})
