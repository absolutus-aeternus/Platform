/**
 * useAuth — Centralized Authorization Composable
 * 
 * Provides role-based access control, permission checks,
 * and dynamic navigation filtering for AllianceHub.
 * 
 * Usage:
 *   const { hasRole, hasPermission, canAccess, userRole } = useAuth()
 */

import { computed } from 'vue'
import { useUserStore } from '@/store/user'

// Role hierarchy: higher level inherits lower level permissions
const ROLE_HIERARCHY = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  SELLER: 3,
  RATING_PLUS: 2,
  MEMBER: 1,
  GUEST: 0,
}

// Permission matrix: which roles can access which resources
const PERMISSIONS = {
  // User management
  'users.read':        ['ADMIN', 'SUPER_ADMIN'],
  'users.write':       ['SUPER_ADMIN'],
  'users.delete':      ['SUPER_ADMIN'],
  'users.role_change': ['SUPER_ADMIN'],

  // Product management
  'products.read':     ['MEMBER', 'SELLER', 'ADMIN', 'SUPER_ADMIN'],
  'products.write':    ['SELLER', 'ADMIN', 'SUPER_ADMIN'],
  'products.delete':   ['ADMIN', 'SUPER_ADMIN'],
  'products.approve':  ['ADMIN', 'SUPER_ADMIN'],

  // Order management
  'orders.read_own':   ['MEMBER', 'SELLER', 'ADMIN', 'SUPER_ADMIN'],
  'orders.read_all':   ['ADMIN', 'SUPER_ADMIN'],
  'orders.write':      ['SELLER', 'ADMIN', 'SUPER_ADMIN'],

  // Seller management
  'sellers.read':      ['MEMBER', 'ADMIN', 'SUPER_ADMIN'],
  'sellers.approve':   ['ADMIN', 'SUPER_ADMIN'],
  'sellers.write':     ['SELLER', 'ADMIN', 'SUPER_ADMIN'],

  // Financial
  'wallet.read_own':   ['MEMBER', 'SELLER', 'ADMIN', 'SUPER_ADMIN'],
  'wallet.read_all':   ['SUPER_ADMIN'],
  'withdrawals.approve': ['SUPER_ADMIN'],

  // System
  'system.settings':   ['SUPER_ADMIN'],
  'system.audit':      ['SUPER_ADMIN'],
  'system.banners':    ['ADMIN', 'SUPER_ADMIN'],
  'system.coupons':    ['ADMIN', 'SUPER_ADMIN'],
  'system.categories': ['ADMIN', 'SUPER_ADMIN'],

  // Chat
  'chat.own':          ['MEMBER', 'SELLER', 'ADMIN', 'SUPER_ADMIN'],
  'chat.all':          ['ADMIN', 'SUPER_ADMIN'],
}

// Route access map: which meta keys require which roles
const ROUTE_ROLE_MAP = {
  requiresSuperAdmin: ['SUPER_ADMIN'],
  requiresAdmin:      ['ADMIN', 'SUPER_ADMIN'],
  requiresSeller:     ['SELLER', 'SUPER_ADMIN'],
  requiresMember:     ['MEMBER', 'SUPER_ADMIN'],
  requiresRatingPlus: ['RATING_PLUS', 'SUPER_ADMIN'],
}

export function useAuth() {
  const store = useUserStore()

  // Current user role
  const userRole = computed(() => store.role || 'MEMBER')
  const isLoggedIn = computed(() => store.isLoggedIn)
  const userId = computed(() => store.supabaseUser?.id)

  // Role level (for hierarchy comparison)
  const roleLevel = computed(() => ROLE_HIERARCHY[userRole.value] || 0)

  /**
   * Check if user has a specific role
   * @param {string|string[]} roles - Single role or array of roles
   * @returns {boolean}
   */
  function hasRole(roles) {
    if (!isLoggedIn.value) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(userRole.value)
  }

  /**
   * Check if user has at least the specified role level
   * @param {string} minRole - Minimum role required
   * @returns {boolean}
   */
  function hasRoleLevel(minRole) {
    return roleLevel.value >= (ROLE_HIERARCHY[minRole] || 0)
  }

  /**
   * Check if user has a specific permission
   * @param {string} permission - Permission key (e.g., 'products.write')
   * @returns {boolean}
   */
  function hasPermission(permission) {
    if (!isLoggedIn.value) return false
    const allowedRoles = PERMISSIONS[permission]
    if (!allowedRoles) return false
    return allowedRoles.includes(userRole.value)
  }

  /**
   * Check if user can access a route based on its meta
   * @param {object} routeMeta - Vue Router meta object
   * @returns {{ allowed: boolean, redirectTo: string|null }}
   */
  function canAccess(routeMeta) {
    // Not authenticated
    if (routeMeta.requiresAuth && !isLoggedIn.value) {
      return { allowed: false, redirectTo: '/login' }
    }

    // Check each role requirement
    for (const [metaKey, allowedRoles] of Object.entries(ROUTE_ROLE_MAP)) {
      if (routeMeta[metaKey] && !allowedRoles.includes(userRole.value)) {
        return { allowed: false, redirectTo: getRedirectForRole(userRole.value) }
      }
    }

    return { allowed: true, redirectTo: null }
  }

  /**
   * Get the default redirect path for a given role
   * @param {string} role
   * @returns {string}
   */
  function getRedirectForRole(role) {
    const map = {
      SUPER_ADMIN: '/superadmin-a801df7ba25bd032',
      ADMIN: '/admin-c96e1b19be893a18',
      SELLER: '/seller',
      RATING_PLUS: '/ratingplus',
      MEMBER: '/user',
    }
    return map[role] || '/user'
  }

  /**
   * Filter navigation items based on user role
   * @param {Array} items - Navigation items with `meta` or `roles` property
   * @returns {Array} Filtered items
   */
  function filterNav(items) {
    return items.filter(item => {
      // If item has required roles, check them
      if (item.roles) {
        return hasRole(item.roles)
      }
      // If item has required permission, check it
      if (item.permission) {
        return hasPermission(item.permission)
      }
      // If item has minRole, check hierarchy
      if (item.minRole) {
        return hasRoleLevel(item.minRole)
      }
      // Public item
      return true
    })
  }

  return {
    userRole,
    isLoggedIn,
    userId,
    roleLevel,
    hasRole,
    hasRoleLevel,
    hasPermission,
    canAccess,
    getRedirectForRole,
    filterNav,
    ROLE_HIERARCHY,
    PERMISSIONS,
  }
}
