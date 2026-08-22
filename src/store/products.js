import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [],
    categories: [],
    featuredProducts: [],
    searchResults: [],
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      hasMore: true
    },
    filters: {
      category: null,
      priceRange: [0, 10000],
      rating: 0,
      inStock: false,
      sortBy: 'relevance'
    }
  }),

  getters: {
    productCount: (state) => state.products.length,
    hasProducts: (state) => state.products.length > 0,
    filteredProducts: (state) => {
      let filtered = [...state.products]
      
      if (state.filters.category) {
        filtered = filtered.filter(p => p.category_id === state.filters.category)
      }
      
      if (state.filters.inStock) {
        filtered = filtered.filter(p => p.stock > 0)
      }
      
      if (state.filters.rating > 0) {
        filtered = filtered.filter(p => (p.rating || 0) >= state.filters.rating)
      }
      
      const [minPrice, maxPrice] = state.filters.priceRange
      filtered = filtered.filter(p => {
        const price = p.price || 0
        return price >= minPrice && price <= maxPrice
      })
      
      switch (state.filters.sortBy) {
        case 'price_asc':
          filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
          break
        case 'price_desc':
          filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
          break
        case 'rating':
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
          break
        case 'newest':
          filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          break
      }
      
      return filtered
    }
  },

  actions: {
    async fetchProducts(options = {}) {
      this.isLoading = true
      this.error = null
      
      try {
        let query = supabase
          .from('products')
          .select('*, sellers(name, store_name, logo)', { count: 'exact' })
        
        // BUG-013 FIX: Always filter by active status
        query = query.eq('status', 'active')
        
        if (this.filters.category) {
          query = query.eq('category_id', this.filters.category)
        }
        
        if (this.filters.inStock) {
          query = query.gt('stock', 0)
        }
        
        const from = ((options.page || 1) - 1) * (options.limit || 20)
        const to = from + (options.limit || 20) - 1
        
        query = query.range(from, to)
        
        const { data, error, count } = await query
        
        if (error) throw error
        
        this.products = data || []
        this.pagination.total = count || 0
        this.pagination.hasMore = from + (data?.length || 0) < count
        this.pagination.page = options.page || 1
        
      } catch (e) {
        this.error = e.message
        console.error('fetchProducts error:', e)
      } finally {
        this.isLoading = false
      }
    },

    async fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order')
        
        if (error) throw error
        this.categories = data || []
      } catch (e) {
        console.error('fetchCategories error:', e)
      }
    },

    async fetchFeaturedProducts(limit = 8) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, sellers(name, store_name, logo)')
          .eq('status', 'active')
          .order('sales_count', { ascending: false })
          .limit(limit)
        
        if (error) throw error
        this.featuredProducts = data || []
      } catch (e) {
        console.error('fetchFeaturedProducts error:', e)
      }
    },

    async searchProducts(query, options = {}) {
      if (!query || query.trim() === '') {
        this.searchResults = []
        return
      }
      
      this.isLoading = true
      
      try {
        const limit = options.limit || 20
        const offset = ((options.page || 1) - 1) * limit

        // 1) Try full-text search first
        const { data: ftsResults, error: ftsError } = await supabase
          .rpc('search_products', {
            search_term: query.trim(),
            p_limit: limit,
            p_offset: offset,
            p_category: options.category || null
          })

        if (ftsError) throw ftsError

        let results = ftsResults || []

        // 2) Fallback to trigram fuzzy search if FTS returned nothing
        if (results.length === 0) {
          const { data: fuzzyResults, error: fuzzyError } = await supabase
            .rpc('search_products_simple', {
              search_term: query.trim(),
              p_limit: limit,
              p_offset: offset,
              p_category: options.category || null
            })
          if (!fuzzyError && fuzzyResults?.length) {
            results = fuzzyResults
          }
        }

        // Normalize RPC response to match existing UI expectations
        this.searchResults = results.map(r => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          description: r.description,
          price: r.price,
          original_price: r.original_price,
          images: r.images,
          status: r.status,
          sales_count: r.sales_count,
          rating: r.rating,
          stock: r.stock,
          category_id: r.category_id,
          seller_id: r.seller_id,
          sellers: {
            name: r.seller_name,
            store_name: r.store_name,
            logo: r.seller_logo
          }
        }))
      } catch (e) {
        console.error('searchProducts error:', e)
        this.searchResults = []
      } finally {
        this.isLoading = false
      }
    },

    async fetchProductById(id) {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
        const { data, error } = await supabase
          .from('products')
          .select('*, sellers(id, name, store_name, user_id, description, logo, rating)')
          .eq(isUUID ? 'id' : 'slug', id)
          .maybeSingle()
        
        if (error) throw error
        return data
      } catch (e) {
        console.error('fetchProductById error:', e)
        return null
      }
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },

    resetFilters() {
      this.filters = {
        category: null,
        priceRange: [0, 10000],
        rating: 0,
        inStock: false,
        sortBy: 'relevance'
      }
    },

    clearProducts() {
      this.products = []
      this.searchResults = []
    }
  }
})
