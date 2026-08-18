// ==================== UNIT TESTS: User Store ====================
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// We need to test the store logic without the actual Supabase calls
// Since setup.js mocks @/services/supabase, the store will use those mocks

describe('User Store', () => {
  let store

  beforeEach(async () => {
    // Create fresh pinia for each test
    const pinia = createPinia()
    setActivePinia(pinia)

    // Dynamic import to get fresh store with our mocked dependencies
    const { useUserStore } = await import('@/store/user')
    store = useUserStore()
  })

  // ==================== Initial State ====================
  describe('Initial State', () => {
    it('starts logged out', () => {
      expect(store.isLoggedIn).toBe(false)
    })

    it('starts with empty cart', () => {
      expect(store.cart).toEqual([])
    })

    it('starts with null role', () => {
      expect(store.role).toBeNull()
    })

    it('starts with null token', () => {
      expect(store.token).toBeNull()
    })

    it('starts with empty userInfo', () => {
      expect(store.userInfo).toEqual({})
    })

    it('starts in buyer portal mode', () => {
      expect(store.portalMode).toBe('buyer')
    })
  })

  // ==================== Getters ====================
  describe('Getters', () => {
    it('cartCount sums quantities', () => {
      store.cart = [
        { id: '1', quantity: 2, price: 10 },
        { id: '2', quantity: 3, price: 20 },
      ]
      expect(store.cartCount).toBe(5)
    })

    it('cartCount returns 0 for empty cart', () => {
      expect(store.cartCount).toBe(0)
    })

    it('cartTotal calculates correctly with nested products', () => {
      store.cart = [
        { quantity: 2, products: { price: 10 } },
        { quantity: 1, products: { price: 25 } },
      ]
      expect(store.cartTotal).toBe(45)
    })

    it('cartTotal uses item.price as fallback', () => {
      store.cart = [
        { quantity: 2, price: 15 },
      ]
      expect(store.cartTotal).toBe(30)
    })

    it('cartTotal returns 0 for empty cart', () => {
      expect(store.cartTotal).toBe(0)
    })

    it('isSeller returns true for SELLER role', () => {
      store.role = 'SELLER'
      expect(store.isSeller).toBe(true)
    })

    it('isSeller returns false for non-SELLER', () => {
      store.role = 'MEMBER'
      expect(store.isSeller).toBe(false)
    })

    it('isAdmin returns true for ADMIN role', () => {
      store.role = 'ADMIN'
      expect(store.isAdmin).toBe(true)
    })

    it('isSuperAdmin returns true for SUPER_ADMIN role', () => {
      store.role = 'SUPER_ADMIN'
      expect(store.isSuperAdmin).toBe(true)
    })

    it('isMember returns true for MEMBER role', () => {
      store.role = 'MEMBER'
      expect(store.isMember).toBe(true)
    })

    it('isRatingPlus returns true for RATING_PLUS role', () => {
      store.role = 'RATING_PLUS'
      expect(store.isRatingPlus).toBe(true)
    })

    it('effectiveMode returns super-admin for SUPER_ADMIN', () => {
      store.role = 'SUPER_ADMIN'
      expect(store.effectiveMode).toBe('super-admin')
    })

    it('effectiveMode returns admin for ADMIN', () => {
      store.role = 'ADMIN'
      expect(store.effectiveMode).toBe('admin')
    })

    it('effectiveMode returns seller for SELLER in seller mode', () => {
      store.role = 'SELLER'
      store.portalMode = 'seller'
      expect(store.effectiveMode).toBe('seller')
    })

    it('effectiveMode returns buyer for SELLER in buyer mode', () => {
      store.role = 'SELLER'
      store.portalMode = 'buyer'
      expect(store.effectiveMode).toBe('buyer')
    })

    it('effectiveMode returns buyer for MEMBER', () => {
      store.role = 'MEMBER'
      expect(store.effectiveMode).toBe('buyer')
    })

    it('username returns from userInfo', () => {
      store.userInfo = { username: 'testuser' }
      expect(store.username).toBe('testuser')
    })

    it('username extracts from email when no username', () => {
      store.supabaseUser = { email: 'test@example.com' }
      expect(store.username).toBe('test')
    })
  })

  // ==================== Actions ====================
  describe('Actions', () => {
    it('logout clears all state', async () => {
      store.token = 'abc'
      store.supabaseUser = { id: '123' }
      store.isLoggedIn = true
      store.role = 'ADMIN'
      store.userInfo = { username: 'admin' }
      store.cart = [{ id: '1', quantity: 1 }]

      await store.logout()

      expect(store.token).toBeNull()
      expect(store.supabaseUser).toBeNull()
      expect(store.isLoggedIn).toBe(false)
      expect(store.role).toBeNull()
      expect(store.userInfo).toEqual({})
      expect(store.cart).toEqual([])
    })

    it('setPortalMode updates mode and persists', () => {
      store.setPortalMode('seller')
      expect(store.portalMode).toBe('seller')
      expect(localStorage.setItem).toHaveBeenCalledWith('portalMode', 'seller')
    })

    it('updateProfile rejects if not logged in', async () => {
      store.supabaseUser = null
      const result = await store.updateProfile({ username: 'new' })
      expect(result).toEqual({ error: 'Not logged in' })
    })

    it('clearCart clears local cart', async () => {
      store.supabaseUser = { id: 'user-1' }
      store.cart = [{ id: '1', quantity: 2 }]
      await store.clearCart()
      expect(store.cart).toEqual([])
    })

    it('clearCart does nothing when not logged in', async () => {
      store.supabaseUser = null
      store.cart = [{ id: '1' }]
      await store.clearCart()
      // Should not throw, cart stays
      expect(store.cart).toEqual([{ id: '1' }])
    })
  })
})
