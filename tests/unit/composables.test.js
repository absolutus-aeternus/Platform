// ==================== UNIT TESTS: useAuth Composable ====================
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

describe('useAuth Composable', () => {
  let useAuth
  let store

  beforeEach(async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const { useUserStore } = await import('@/store/user')
    store = useUserStore()

    // Import composable after pinia is set
    const mod = await import('@/composables/useAuth')
    useAuth = mod.useAuth
  })

  // ==================== Role Hierarchy ====================
  describe('Role Hierarchy', () => {
    it('SUPER_ADMIN has highest level (5)', () => {
      const { ROLE_HIERARCHY } = useAuth()
      expect(ROLE_HIERARCHY.SUPER_ADMIN).toBe(5)
    })

    it('ADMIN has level 4', () => {
      const { ROLE_HIERARCHY } = useAuth()
      expect(ROLE_HIERARCHY.ADMIN).toBe(4)
    })

    it('SELLER has level 3', () => {
      const { ROLE_HIERARCHY } = useAuth()
      expect(ROLE_HIERARCHY.SELLER).toBe(3)
    })

    it('RATING_PLUS has level 2', () => {
      const { ROLE_HIERARCHY } = useAuth()
      expect(ROLE_HIERARCHY.RATING_PLUS).toBe(2)
    })

    it('MEMBER has level 1', () => {
      const { ROLE_HIERARCHY } = useAuth()
      expect(ROLE_HIERARCHY.MEMBER).toBe(1)
    })

    it('GUEST has level 0', () => {
      const { ROLE_HIERARCHY } = useAuth()
      expect(ROLE_HIERARCHY.GUEST).toBe(0)
    })

    it('hierarchy is strictly ordered', () => {
      const { ROLE_HIERARCHY } = useAuth()
      expect(ROLE_HIERARCHY.SUPER_ADMIN).toBeGreaterThan(ROLE_HIERARCHY.ADMIN)
      expect(ROLE_HIERARCHY.ADMIN).toBeGreaterThan(ROLE_HIERARCHY.SELLER)
      expect(ROLE_HIERARCHY.SELLER).toBeGreaterThan(ROLE_HIERARCHY.RATING_PLUS)
      expect(ROLE_HIERARCHY.RATING_PLUS).toBeGreaterThan(ROLE_HIERARCHY.MEMBER)
      expect(ROLE_HIERARCHY.MEMBER).toBeGreaterThan(ROLE_HIERARCHY.GUEST)
    })
  })

  // ==================== hasRole ====================
  describe('hasRole', () => {
    it('returns false when not logged in', () => {
      store.isLoggedIn = false
      const { hasRole } = useAuth()
      expect(hasRole('MEMBER')).toBe(false)
    })

    it('returns true for matching role', () => {
      store.isLoggedIn = true
      store.role = 'ADMIN'
      const { hasRole } = useAuth()
      expect(hasRole('ADMIN')).toBe(true)
    })

    it('returns false for non-matching role', () => {
      store.isLoggedIn = true
      store.role = 'MEMBER'
      const { hasRole } = useAuth()
      expect(hasRole('ADMIN')).toBe(false)
    })

    it('accepts array of roles', () => {
      store.isLoggedIn = true
      store.role = 'SELLER'
      const { hasRole } = useAuth()
      expect(hasRole(['ADMIN', 'SELLER'])).toBe(true)
    })

    it('returns false when role not in array', () => {
      store.isLoggedIn = true
      store.role = 'MEMBER'
      const { hasRole } = useAuth()
      expect(hasRole(['ADMIN', 'SUPER_ADMIN'])).toBe(false)
    })
  })

  // ==================== hasRoleLevel ====================
  describe('hasRoleLevel', () => {
    it('SUPER_ADMIN meets all levels', () => {
      store.isLoggedIn = true
      store.role = 'SUPER_ADMIN'
      const { hasRoleLevel } = useAuth()
      expect(hasRoleLevel('MEMBER')).toBe(true)
      expect(hasRoleLevel('ADMIN')).toBe(true)
      expect(hasRoleLevel('SUPER_ADMIN')).toBe(true)
    })

    it('MEMBER only meets MEMBER and below', () => {
      store.isLoggedIn = true
      store.role = 'MEMBER'
      const { hasRoleLevel } = useAuth()
      expect(hasRoleLevel('MEMBER')).toBe(true)
      expect(hasRoleLevel('GUEST')).toBe(true)
      expect(hasRoleLevel('SELLER')).toBe(false)
    })
  })

  // ==================== hasPermission ====================
  describe('hasPermission', () => {
    it('returns false when not logged in', () => {
      store.isLoggedIn = false
      const { hasPermission } = useAuth()
      expect(hasPermission('products.read')).toBe(false)
    })

    it('MEMBER can read products', () => {
      store.isLoggedIn = true
      store.role = 'MEMBER'
      const { hasPermission } = useAuth()
      expect(hasPermission('products.read')).toBe(true)
    })

    it('MEMBER cannot write products', () => {
      store.isLoggedIn = true
      store.role = 'MEMBER'
      const { hasPermission } = useAuth()
      expect(hasPermission('products.write')).toBe(false)
    })

    it('SELLER can write products', () => {
      store.isLoggedIn = true
      store.role = 'SELLER'
      const { hasPermission } = useAuth()
      expect(hasPermission('products.write')).toBe(true)
    })

    it('ADMIN can read all orders', () => {
      store.isLoggedIn = true
      store.role = 'ADMIN'
      const { hasPermission } = useAuth()
      expect(hasPermission('orders.read_all')).toBe(true)
    })

    it('MEMBER cannot read all orders', () => {
      store.isLoggedIn = true
      store.role = 'MEMBER'
      const { hasPermission } = useAuth()
      expect(hasPermission('orders.read_all')).toBe(false)
    })

    it('only SUPER_ADMIN can access system.settings', () => {
      store.isLoggedIn = true
      store.role = 'ADMIN'
      const { hasPermission } = useAuth()
      expect(hasPermission('system.settings')).toBe(false)

      store.role = 'SUPER_ADMIN'
      expect(hasPermission('system.settings')).toBe(true)
    })

    it('returns false for unknown permission', () => {
      store.isLoggedIn = true
      store.role = 'ADMIN'
      const { hasPermission } = useAuth()
      expect(hasPermission('nonexistent.permission')).toBe(false)
    })
  })

  // ==================== canAccess ====================
  describe('canAccess', () => {
    it('blocks unauthenticated when auth required', () => {
      store.isLoggedIn = false
      const { canAccess } = useAuth()
      const result = canAccess({ requiresAuth: true })
      expect(result.allowed).toBe(false)
      expect(result.redirectTo).toBe('/login')
    })

    it('allows authenticated user for auth-only route', () => {
      store.isLoggedIn = true
      store.role = 'MEMBER'
      const { canAccess } = useAuth()
      const result = canAccess({ requiresAuth: true })
      expect(result.allowed).toBe(true)
    })

    it('blocks MEMBER from admin route', () => {
      store.isLoggedIn = true
      store.role = 'MEMBER'
      const { canAccess } = useAuth()
      const result = canAccess({ requiresAdmin: true })
      expect(result.allowed).toBe(false)
    })

    it('allows ADMIN for admin route', () => {
      store.isLoggedIn = true
      store.role = 'ADMIN'
      const { canAccess } = useAuth()
      const result = canAccess({ requiresAdmin: true })
      expect(result.allowed).toBe(true)
    })

    it('allows SUPER_ADMIN for admin route', () => {
      store.isLoggedIn = true
      store.role = 'SUPER_ADMIN'
      const { canAccess } = useAuth()
      const result = canAccess({ requiresAdmin: true })
      expect(result.allowed).toBe(true)
    })

    it('blocks MEMBER from superadmin route', () => {
      store.isLoggedIn = true
      store.role = 'ADMIN'
      const { canAccess } = useAuth()
      const result = canAccess({ requiresSuperAdmin: true })
      expect(result.allowed).toBe(false)
    })

    it('allows SELLER for seller route', () => {
      store.isLoggedIn = true
      store.role = 'SELLER'
      const { canAccess } = useAuth()
      const result = canAccess({ requiresSeller: true })
      expect(result.allowed).toBe(true)
    })

    it('returns correct redirect for role', () => {
      store.isLoggedIn = true
      store.role = 'MEMBER'
      const { canAccess } = useAuth()
      const result = canAccess({ requiresAdmin: true })
      expect(result.redirectTo).toBe('/user')
    })
  })

  // ==================== filterNav ====================
  describe('filterNav', () => {
    it('includes public items', () => {
      store.isLoggedIn = false
      const { filterNav } = useAuth()
      const items = [{ label: 'Home', path: '/' }]
      expect(filterNav(items)).toHaveLength(1)
    })

    it('excludes items requiring roles user lacks', () => {
      store.isLoggedIn = true
      store.role = 'MEMBER'
      const { filterNav } = useAuth()
      const items = [
        { label: 'Home', path: '/' },
        { label: 'Admin', path: '/admin', roles: ['ADMIN'] },
      ]
      expect(filterNav(items)).toHaveLength(1)
    })

    it('includes items matching user role', () => {
      store.isLoggedIn = true
      store.role = 'ADMIN'
      const { filterNav } = useAuth()
      const items = [
        { label: 'Home', path: '/' },
        { label: 'Admin', path: '/admin', roles: ['ADMIN'] },
      ]
      expect(filterNav(items)).toHaveLength(2)
    })

    it('filters by permission', () => {
      store.isLoggedIn = true
      store.role = 'MEMBER'
      const { filterNav } = useAuth()
      const items = [
        { label: 'Products', path: '/products', permission: 'products.read' },
        { label: 'Settings', path: '/settings', permission: 'system.settings' },
      ]
      expect(filterNav(items)).toHaveLength(1)
    })

    it('filters by minRole level', () => {
      store.isLoggedIn = true
      store.role = 'SELLER'
      const { filterNav } = useAuth()
      const items = [
        { label: 'Seller', path: '/seller', minRole: 'SELLER' },
        { label: 'Admin', path: '/admin', minRole: 'ADMIN' },
      ]
      expect(filterNav(items)).toHaveLength(1)
    })
  })

  // ==================== getRedirectForRole ====================
  describe('getRedirectForRole', () => {
    it('returns /superadmin for SUPER_ADMIN', () => {
      const { getRedirectForRole } = useAuth()
      expect(getRedirectForRole('SUPER_ADMIN')).toBe('/superadmin')
    })

    it('returns /admin for ADMIN', () => {
      const { getRedirectForRole } = useAuth()
      expect(getRedirectForRole('ADMIN')).toBe('/admin')
    })

    it('returns /seller for SELLER', () => {
      const { getRedirectForRole } = useAuth()
      expect(getRedirectForRole('SELLER')).toBe('/seller')
    })

    it('returns /user for MEMBER', () => {
      const { getRedirectForRole } = useAuth()
      expect(getRedirectForRole('MEMBER')).toBe('/user')
    })

    it('returns /user for unknown role', () => {
      const { getRedirectForRole } = useAuth()
      expect(getRedirectForRole('UNKNOWN')).toBe('/user')
    })
  })
})
