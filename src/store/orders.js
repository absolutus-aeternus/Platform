import { defineStore } from 'pinia'

export const useOrderStore = defineStore('orders', {
  state: () => ({
    orders: [],
    currentOrder: null,
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      hasMore: true
    },
    filters: {
      status: 'all', // all, pending, paid, shipped, delivered, cancelled
      dateRange: null,
      sortBy: 'created_at_desc'
    }
  }),

  getters: {
    orderCount: (state) => state.orders.length,
    hasOrders: (state) => state.orders.length > 0,
    pendingOrders: (state) => state.orders.filter(o => o.status === 'pending'),
    completedOrders: (state) => state.orders.filter(o => o.status === 'delivered'),
    cancelledOrders: (state) => state.orders.filter(o => o.status === 'cancelled'),
    totalSpent: (state) => state.orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total_amount || 0), 0)
  },

  actions: {
    async fetchOrders(userId, options = {}) {
      this.isLoading = true
      this.error = null

      try {
        const { supabase } = await import('@/services/supabase')
        
        let query = supabase
          .from('orders')
          .select(`
            *,
            order_items(product_id, quantity, price, products(name, image_url)),
            addresses(full_name, address_line1, city, province, postal_code)
          `, { count: 'exact' })
          .eq('user_id', userId)

        // Apply status filter
        if (this.filters.status !== 'all') {
          query = query.eq('status', this.filters.status)
        }

        // Pagination
        const from = (options.page - 1) * options.limit
        const to = from + options.limit - 1
        query = query.range(from, to)

        // Sorting
        switch (this.filters.sortBy) {
          case 'created_at_asc':
            query = query.order('created_at', { ascending: true })
            break
          case 'total_amount_asc':
            query = query.order('total_amount', { ascending: true })
            break
          case 'total_amount_desc':
            query = query.order('total_amount', { ascending: false })
            break
          default:
            query = query.order('created_at', { ascending: false })
        }

        const { data, error, count } = await query

        if (error) throw error

        this.orders = data || []
        this.pagination.total = count || 0
        this.pagination.hasMore = from + (data?.length || 0) < count
        this.pagination.page = options.page

      } catch (e) {
        this.error = e.message
        console.error('fetchOrders error:', e)
      } finally {
        this.isLoading = false
      }
    },

    async fetchOrderById(orderId) {
      this.isLoading = true
      this.error = null

      try {
        const { supabase } = await import('@/services/supabase')
        
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items(*, products(name, image_url, price)),
            addresses(*),
            users(email, username)
          `)
          .eq('id', orderId)
          .single()

        if (error) throw error

        this.currentOrder = data
        return data

      } catch (e) {
        this.error = e.message
        console.error('fetchOrderById error:', e)
        return null
      } finally {
        this.isLoading = false
      }
    },

    async createOrder(orderData) {
      this.isLoading = true
      this.error = null

      try {
        const { supabase } = await import('@/services/supabase')
        
        const { data, error } = await supabase
          .from('orders')
          .insert([{
            user_id: orderData.userId,
            address_id: orderData.addressId,
            total_amount: orderData.totalAmount,
            shipping_cost: orderData.shippingCost || 0,
            discount_amount: orderData.discountAmount || 0,
            payment_method: orderData.paymentMethod,
            payment_gateway: orderData.paymentGateway,
            status: 'pending',
            notes: orderData.notes || null
          }])
          .select()
          .single()

        if (error) throw error

        // Create order items
        if (orderData.items && orderData.items.length > 0) {
          const orderItems = orderData.items.map(item => ({
            order_id: data.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price
          }))

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)

          if (itemsError) throw itemsError
        }

        return { success: true, order: data }

      } catch (e) {
        this.error = e.message
        console.error('createOrder error:', e)
        return { success: false, error: e.message }
      } finally {
        this.isLoading = false
      }
    },

    async updateOrderStatus(orderId, status) {
      try {
        const { supabase } = await import('@/services/supabase')
        
        const { error } = await supabase
          .from('orders')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', orderId)

        if (error) throw error

        // Update local state
        const orderIndex = this.orders.findIndex(o => o.id === orderId)
        if (orderIndex !== -1) {
          this.orders[orderIndex].status = status
        }

        if (this.currentOrder?.id === orderId) {
          this.currentOrder.status = status
        }

        return { success: true }

      } catch (e) {
        console.error('updateOrderStatus error:', e)
        return { success: false, error: e.message }
      }
    },

    async cancelOrder(orderId, reason) {
      return await this.updateOrderStatus(orderId, 'cancelled')
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },

    resetFilters() {
      this.filters = {
        status: 'all',
        dateRange: null,
        sortBy: 'created_at_desc'
      }
    },

    clearOrders() {
      this.orders = []
      this.currentOrder = null
    }
  }
})
