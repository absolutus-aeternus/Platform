// ==================== SEARCH SERVICE (Supabase FTS) ====================
import { supabase } from '@/services/supabase'

let searchCache = new Map()
let debounceTimer = null
const MAX_CACHE_SIZE = 100

/**
 * Full-text search via Supabase RPC (search_products).
 * Falls back to trigram fuzzy search (search_products_simple) if FTS returns 0 results.
 *
 * Response shape matches old Algolia hits for backward compat:
 *   [{ id, name, slug, price, images, ... , _rank }]
 */
export async function searchProducts(query, filters = {}) {
  if (!query?.trim()) return []

  const cacheKey = `${query}-${JSON.stringify(filters)}`
  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey)

  const limit = filters.limit || 40
  const offset = ((filters.page || 1) - 1) * limit
  const categoryId = filters.category || null

  try {
    // 1) Try weighted full-text search first
    const { data: ftsResults, error: ftsError } = await supabase
      .rpc('search_products', {
        search_term: query.trim(),
        p_limit: limit,
        p_offset: offset,
        p_category: categoryId
      })

    if (ftsError) throw ftsError

    let results = ftsResults || []

    // 2) If FTS returns nothing, fall back to trigram fuzzy search
    if (results.length === 0) {
      const { data: fuzzyResults, error: fuzzyError } = await supabase
        .rpc('search_products_simple', {
          search_term: query.trim(),
          p_limit: limit,
          p_offset: offset,
          p_category: categoryId
        })

      if (!fuzzyError && fuzzyResults?.length) {
        results = fuzzyResults
      }
    }

    // Normalize response: map RPC columns to match old UI expectations
    const normalized = results.map(r => ({
      objectID: r.id,          // Algolia compat
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
      },
      _rank: r.rank ?? r.similarity ?? 0,
      _total: r.total_count ?? 0
    }))

    // Evict oldest entries if cache is full
    if (searchCache.size >= MAX_CACHE_SIZE) {
      const firstKey = searchCache.keys().next().value
      searchCache.delete(firstKey)
    }
    searchCache.set(cacheKey, normalized)
    setTimeout(() => searchCache.delete(cacheKey), 300000)

    return normalized
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
