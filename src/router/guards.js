/**
 * Route Guards — Centralized Navigation Guards for AllianceHub
 * 
 * Handles:
 * - Authentication checks
 * - Role-based authorization
 * - Redirect logic for unauthorized access
 * - Toast notifications for denied access
 * - Login page redirect after auth
 */

import { useUserStore } from '@/store/user'

// Role hierarchy for access control
const ROLE_HIERARCHY = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  SELLER: 3,
  RATING_PLUS: 2,
  MEMBER: 1,
}

// Route meta → allowed roles mapping
const ROLE_GUARDS = {
  requiresSuperAdmin: ['SUPER_ADMIN'],
  requiresAdmin:      ['ADMIN', 'SUPER_ADMIN'],
  requiresSeller:     ['SELLER', 'SUPER_ADMIN'],
  requiresMember:     ['MEMBER', 'SUPER_ADMIN'],
  requiresRatingPlus: ['RATING_PLUS', 'SUPER_ADMIN'],
}

// Default dashboard for each role
const ROLE_DASHBOARDS = {
  SUPER_ADMIN: '/superadmin',
  ADMIN: '/admin',
  SELLER: '/seller',
  RATING_PLUS: '/ratingplus',
  MEMBER: '/user',
}

// Login/register pages that authenticated users shouldn't see
const AUTH_PAGES = ['/login', '/register', '/seller/login', '/admin/login']

/**
 * Show toast notification (if available)
 */
function showToast(message, type = 'error') {
  if (typeof window !== 'undefined' && window.__toast) {
    window.__toast.show(message, type)
  }
}

/**
 * Get user's default dashboard
 */
function getDefaultDashboard(role) {
  return ROLE_DASHBOARDS[role] || '/user'
}

/**
 * Main navigation guard — called on every route change
 */
export function setupRouterGuards(router) {
  router.beforeEach(async (to, from, next) => {
    const store = useUserStore()
    const role = store.role || 'MEMBER'
    const isLoggedIn = store.isLoggedIn

    // ── 1. Public routes (no auth required) ──
    if (!to.meta.requiresAuth && !to.meta.requiresSeller && !to.meta.requiresAdmin &&
        !to.meta.requiresSuperAdmin && !to.meta.requiresMember && !to.meta.requiresRatingPlus) {
      // If logged in and trying to access auth pages, redirect to dashboard
      if (isLoggedIn && AUTH_PAGES.includes(to.path)) {
        const dashboard = getDefaultDashboard(role)
        return next(dashboard)
      }
      return next()
    }

    // ── 2. Authentication check ──
    if (!isLoggedIn) {
      // Save intended destination for post-login redirect
      const redirectQuery = to.fullPath !== '/' ? { redirect: to.fullPath } : {}
      return next({ path: '/login', query: redirectQuery })
    }

    // ── 3. Role-based authorization ──
    for (const [metaKey, allowedRoles] of Object.entries(ROLE_GUARDS)) {
      if (to.meta[metaKey] && !allowedRoles.includes(role)) {
        // Unauthorized access attempt
        const dashboard = getDefaultDashboard(role)
        const requiredRole = metaKey.replace('requires', '').replace(/([A-Z])/g, ' $1').trim()

        showToast(`Access denied. This page requires ${requiredRole} role.`, 'error')

        // Log unauthorized attempt (for audit)
        console.warn(`[AUTH] Unauthorized access attempt: ${to.path} by ${role} user`)

        return next(dashboard)
      }
    }

    // ── 4. Cross-portal protection ──
    // Prevent SELLER from accessing /user/*, ADMIN from accessing /seller/*, etc.
    const pathPrefix = '/' + to.path.split('/')[1]
    const portalMap = {
      '/superadmin': 'SUPER_ADMIN',
      '/admin': 'ADMIN',
      '/seller': 'SELLER',
      '/ratingplus': 'RATING_PLUS',
      '/user': 'MEMBER',
    }

    if (portalMap[pathPrefix]) {
      const requiredRole = portalMap[pathPrefix]
      const allowedForPortal = ROLE_GUARDS[`requires${requiredRole.charAt(0)}${requiredRole.slice(1).toLowerCase() === 'admin' ? 'Admin' : requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1).toLowerCase()}`] || [requiredRole, 'SUPER_ADMIN']

      // Special: ADMIN can access /admin, SUPER_ADMIN can access everything
      const canAccessPortal =
        role === 'SUPER_ADMIN' ||
        (requiredRole === 'ADMIN' && role === 'ADMIN') ||
        (requiredRole === 'SELLER' && role === 'SELLER') ||
        (requiredRole === 'MEMBER' && role === 'MEMBER') ||
        (requiredRole === 'RATING_PLUS' && role === 'RATING_PLUS')

      if (!canAccessPortal) {
        const dashboard = getDefaultDashboard(role)
        showToast(`Access denied. You don't have permission to access this portal.`, 'error')
        return next(dashboard)
      }
    }

    // ── 5. All checks passed ──
    next()
  })

  // After navigation: scroll to top
  router.afterEach((to) => {
    // Update document title
    const title = to.meta?.title || to.name || 'AllianceHub'
    document.title = `${title} — AllianceHub`
  })
}

/**
 * Navigation guard for seller portal specifically
 * Ensures seller has approved status (not just SELLER role)
 */
export function sellerApprovalGuard(to, from, next) {
  const store = useUserStore()
  const role = store.role || 'MEMBER'

  // Only SELLER and SUPER_ADMIN can access seller portal
  if (role !== 'SELLER' && role !== 'SUPER_ADMIN') {
    showToast('Access denied. Seller account required.', 'error')
    return next(getDefaultDashboard(role))
  }

  // TODO: Check seller approval_status from API
  // For now, allow all SELLER role users
  next()
}
