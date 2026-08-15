// ==================== SEARCH SERVICE ====================
import { supabase } from '@/services/supabase'

let searchCache = new Map()
let debounceTimer = null

export async function searchProducts(query, filters = {}) {
  if (!query?.trim()) return []

  const cacheKey = `${query}-${JSON.stringify(filters)}`
  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey)

  try {
    let dbQuery = supabase
      .from('products')
      .select('*, sellers(name)')
      .eq('is_active', true)

    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    }

    if (filters.category) {
      dbQuery = dbQuery.eq('category_id', filters.category)
    }

    if (filters.minPrice) {
      dbQuery = dbQuery.gte('price', filters.minPrice)
    }

    if (filters.maxPrice) {
      dbQuery = dbQuery.lte('price', filters.maxPrice)
    }

    if (filters.brand) {
      dbQuery = dbQuery.ilike('brand', `%${filters.brand}%`)
    }

    // Sort
    switch (filters.sort) {
      case 'price_asc':
        dbQuery = dbQuery.order('price', { ascending: true })
        break
      case 'price_desc':
        dbQuery = dbQuery.order('price', { ascending: false })
        break
      case 'rating':
        dbQuery = dbQuery.order('rating', { ascending: false })
        break
      case 'newest':
        dbQuery = dbQuery.order('created_at', { ascending: false })
        break
      default:
        dbQuery = dbQuery.order('sales_count', { ascending: false })
    }

    dbQuery = dbQuery.limit(filters.limit || 40)

    const { data, error } = await dbQuery
    if (error) throw error

    const results = data || []
    searchCache.set(cacheKey, results)

    // Auto-clear cache after 5 minutes
    setTimeout(() => searchCache.delete(cacheKey), 300000)

    return results
  } catch (e) {
    console.error('Search error:', e)
    return []
  }
}

export function debounceSearch(callback, delay = 300) {
  return (...args) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => callback(...args), delay)
  }
}

export function getSearchSuggestions(query) {
  if (!query?.trim()) return []

  const suggestions = [
    'wireless earbuds', 'smart watch', 'phone case', 'laptop stand',
    'yoga mat', 'water bottle', 'headphones', 'charger',
    'backpack', 'sunglasses', 'keyboard', 'mouse',
    't-shirt', 'dress', 'sneakers', 'jacket',
    'skincare', 'makeup', 'perfume', 'hair dryer',
  ]

  return suggestions
    .filter(s => s.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8)
}

export function clearSearchCache() {
  searchCache.clear()
}
