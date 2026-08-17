import { createRouter, createWebHashHistory } from 'vue-router'
import { supabase } from '@/services/supabase'
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'Home', component: () => import('@/views/Home.vue') },
      { path: 'category', name: 'Category', component: () => import('@/views/Category.vue') },
      { path: 'commodity', name: 'Commodity', component: () => import('@/views/Commodity.vue') },
      { path: 'product/:id', name: 'ProductDetail', component: () => import('@/views/ProductDetail.vue') },
      { path: 'search', name: 'Search', component: () => import('@/views/Search.vue') },
      { path: 'search-store', name: 'SearchStore', component: () => import('@/views/SearchStore.vue') },
      { path: 'cart', name: 'Cart', component: () => import('@/views/Cart.vue'), meta: { requiresAuth: true, requiresMember: true } },
      { path: 'checkout', name: 'Checkout', component: () => import('@/views/Checkout.vue'), meta: { requiresAuth: true, requiresMember: true } },
      { path: 'pay-success', name: 'PaySuccess', component: () => import('@/views/PaySuccess.vue'), meta: { requiresAuth: true, requiresMember: true } },
      { path: 'store/:id', name: 'Store', component: () => import('@/views/Store.vue') },
      { path: 'store/report/:sellerId', name: 'StoreReport', component: () => import('@/views/StoreReport.vue') },
      { path: 'discounts', name: 'Discounts', component: () => import('@/views/Discounts.vue') },
      { path: 'credit', name: 'Credit', component: () => import('@/views/Credit.vue') },
      { path: 'credit/application', name: 'CreditApplication', component: () => import('@/views/CreditApplication.vue'), meta: { requiresAuth: true } },
      { path: 'credit/my-loan', name: 'MyLoan', component: () => import('@/views/MyLoan.vue'), meta: { requiresAuth: true } },
      { path: 'chat', name: 'Chat', component: () => import('@/views/Chat.vue'), meta: { requiresAuth: true } },
      { path: 'help', name: 'Help', component: () => import('@/views/Help.vue') },
      { path: 'terms', name: 'Terms', component: () => import('@/views/Terms.vue') },
      { path: 'privacy', name: 'Privacy', component: () => import('@/views/Privacy.vue') },
      { path: 'contact', name: 'Contact', component: () => import('@/views/Contact.vue') },
      { path: 'about', name: 'About', component: () => import('@/views/About.vue') },
      { path: 'returns', name: 'Returns', component: () => import('@/views/Returns.vue') },
      { path: 'track-order', name: 'TrackOrder', component: () => import('@/views/TrackOrder.vue') },
      { path: 'comparison', name: 'Comparison', component: () => import('@/views/Comparison.vue') },
      { path: 'how-to-buy', name: 'HowToBuy', component: () => import('@/views/HowToBuy.vue') },
      { path: 'shipping-info', name: 'ShippingInfo', component: () => import('@/views/ShippingInfo.vue') },
      { path: 'payment-methods', name: 'PaymentMethods', component: () => import('@/views/PaymentMethods.vue') },
      { path: 'blog', name: 'Blog', component: () => import('@/views/Blog.vue') },
      { path: 'merchant-settled', name: 'MerchantSettled', component: () => import('@/views/MerchantSettled.vue') },
      { path: 'order-confirmation', name: 'OrderConfirmation', component: () => import('@/views/OrderConfirmation.vue'), meta: { requiresAuth: true } },
      { path: 'pending-payment', name: 'PendingPayment', component: () => import('@/views/PendingPayment.vue'), meta: { requiresAuth: true } },
      { path: 'order-logistics', name: 'OrderLogistics', component: () => import('@/views/OrderLogistics.vue'), meta: { requiresAuth: true } },
      { path: 'information', name: 'Information', component: () => import('@/views/Information.vue') },
      { path: 'all-reviews', name: 'AllReviews', component: () => import('@/views/AllReviews.vue') },
      { path: 'evaluation-sheet', name: 'EvaluationSheet', component: () => import('@/views/EvaluationSheet.vue'), meta: { requiresAuth: true } },
      { path: 'complaint', name: 'Complaint', component: () => import('@/views/Complaint.vue'), meta: { requiresAuth: true } },
      { path: 'customer-service', name: 'CustomerService', component: () => import('@/views/CustomerService.vue') },
      { path: 'language', name: 'Language', component: () => import('@/views/Language.vue') },
      { path: 'avatar-selection', name: 'AvatarSelection', component: () => import('@/views/AvatarSelection.vue'), meta: { requiresAuth: true } },
      { path: 'bind-phone', name: 'BindPhone', component: () => import('@/views/BindPhone.vue'), meta: { requiresAuth: true } },
      { path: 'bind-email', name: 'BindEmail', component: () => import('@/views/BindEmail.vue'), meta: { requiresAuth: true } },
      { path: 'bank-card', name: 'BankCard', component: () => import('@/views/BankCard.vue'), meta: { requiresAuth: true } },
      { path: 'fund-password', name: 'FundPasswordSettings', component: () => import('@/views/FundPasswordSettings.vue'), meta: { requiresAuth: true } },
      { path: 'login-password-reset', name: 'LoginPasswordReset', component: () => import('@/views/LoginPasswordReset.vue'), meta: { requiresAuth: true } },
      { path: 'successful-operation', name: 'SuccessfulOperation', component: () => import('@/views/SuccessfulOperation.vue') },
    ]
  },
  {
    path: '/user',
    component: () => import('@/layouts/UserLayout.vue'),
    meta: { requiresAuth: true, requiresMember: true },
    children: [
      { path: '', name: 'Dashboard', component: () => import('@/views/user/Dashboard.vue') },
      { path: 'orders', name: 'Orders', component: () => import('@/views/user/Orders.vue') },
      { path: 'order/:id', name: 'OrderDetail', component: () => import('@/views/user/OrderDetail.vue') },
      { path: 'order-return', name: 'OrderReturn', component: () => import('@/views/user/OrderReturn.vue') },
      { path: 'order-evaluation', name: 'OrderEvaluation', component: () => import('@/views/user/OrderEvaluation.vue') },
      { path: 'wallet', name: 'Wallet', component: () => import('@/views/user/Wallet.vue') },
      { path: 'recharge', name: 'Recharge', component: () => import('@/views/user/Recharge.vue') },
      { path: 'recharge-record', name: 'RechargeRecord', component: () => import('@/views/RechargeRecord.vue') },
      { path: 'recharge-details', name: 'RechargeRecordDetails', component: () => import('@/views/RechargeRecordDetails.vue') },
      { path: 'withdraw', name: 'Withdraw', component: () => import('@/views/user/Withdraw.vue') },
      { path: 'withdraw-record', name: 'WithdrawRecord', component: () => import('@/views/WithdrawRecord.vue') },
      { path: 'withdraw-details', name: 'WithdrawRecordDetails', component: () => import('@/views/WithdrawRecordDetails.vue') },
      { path: 'favorites', name: 'Favorites', component: () => import('@/views/user/Favorites.vue') },
      { path: 'collect-shop', name: 'CollectShop', component: () => import('@/views/user/CollectShop.vue') },
      { path: 'addresses', name: 'Addresses', component: () => import('@/views/user/Addresses.vue') },
      { path: 'address-details', name: 'AddressDetails', component: () => import('@/views/AddressDetails.vue') },
      { path: 'notifications', name: 'Notifications', component: () => import('@/views/user/Notifications.vue') },
      { path: 'download', name: 'Download', component: () => import('@/views/user/Download.vue') },
      { path: 'settings', name: 'Settings', component: () => import('@/views/user/Settings.vue') },
    ]
  },

    // Super Admin Portal (full access)
  {
    path: '/superadmin',
    component: () => import('@/layouts/SuperAdminLayout.vue'),
    meta: { requiresAuth: true, requiresSuperAdmin: true },
    children: [
      { path: '', name: 'SuperAdminDashboard', component: () => import('@/views/superadmin/Dashboard.vue') },
      { path: 'users', name: 'SuperAdminUsers', component: () => import('@/views/superadmin/Users.vue') },
      { path: 'products', name: 'SuperAdminProducts', component: () => import('@/views/admin/Products.vue') },
      { path: 'orders', name: 'SuperAdminOrders', component: () => import('@/views/admin/Orders.vue') },
      { path: 'categories', name: 'SuperAdminCategories', component: () => import('@/views/admin/Categories.vue') },
      { path: 'sellers', name: 'SuperAdminSellers', component: () => import('@/views/admin/Sellers.vue') },
      { path: 'transactions', name: 'SuperAdminTransactions', component: () => import('@/views/admin/Transactions.vue') },
      { path: 'wallets', name: 'SuperAdminWallets', component: () => import('@/views/admin/Wallets.vue') },
      { path: 'withdrawals', name: 'SuperAdminWithdrawals', component: () => import('@/views/admin/Withdrawals.vue') },
      { path: 'recharges', name: 'SuperAdminRecharges', component: () => import('@/views/admin/Recharges.vue') },
      { path: 'banners', name: 'SuperAdminBanners', component: () => import('@/views/admin/Banners.vue') },
      { path: 'coupons', name: 'SuperAdminCoupons', component: () => import('@/views/admin/Coupons.vue') },
      { path: 'notifications', name: 'SuperAdminNotifications', component: () => import('@/views/admin/Notifications.vue') },
      { path: 'chat', name: 'SuperAdminChat', component: () => import('@/views/admin/Chat.vue') },
      { path: 'messages', name: 'SuperAdminMessages', component: () => import('@/views/admin/Messages.vue') },
      { path: 'reports/sales', name: 'SuperAdminSalesReport', component: () => import('@/views/admin/SalesReport.vue') },
      { path: 'reports/products', name: 'SuperAdminProductReport', component: () => import('@/views/admin/ProductReport.vue') },
      { path: 'reports/customers', name: 'SuperAdminCustomerReport', component: () => import('@/views/admin/CustomerReport.vue') },
      { path: 'settings', name: 'SuperAdminSettings', component: () => import('@/views/superadmin/Settings.vue') },
      { path: 'audit-logs', name: 'SuperAdminAuditLogs', component: () => import('@/views/superadmin/AuditLogs.vue') },
      { path: 'security', name: 'SuperAdminSecurity', component: () => import('@/views/superadmin/Security.vue') },
      { path: 'feature-flags', name: 'SuperAdminFeatureFlags', component: () => import('@/views/superadmin/FeatureFlags.vue') },
      { path: 'ip-logs', name: 'SuperAdminIPLogs', component: () => import('@/views/superadmin/IPLogs.vue') },
      { path: 'blockchain', name: 'SuperAdminBlockchain', component: () => import('@/views/admin/Blockchain.vue') },
      { path: 'scraper', name: 'SuperAdminScraper', component: () => import('@/views/admin/Scraper.vue') },
      { path: 'logs', name: 'SuperAdminLogs', component: () => import('@/views/admin/Logs.vue') },
    ]
  },

  { path: '/seller/login', name: 'SellerLogin', component: () => import('@/views/seller/Login.vue') },
  {
    path: '/seller',
    component: () => import('@/layouts/SellerLayout.vue'),
    children: [
      { path: '', name: 'SellerDashboard', component: () => import('@/views/seller/Dashboard.vue'), meta: { requiresAuth: true, requiresSeller: true } },
      { path: 'products', name: 'SellerProducts', component: () => import('@/views/seller/ProductList.vue'), meta: { requiresAuth: true, requiresSeller: true } },
      { path: 'product/add', name: 'SellerProductAdd', component: () => import('@/views/seller/ProductAdd.vue'), meta: { requiresAuth: true, requiresSeller: true } },
      { path: 'orders', name: 'SellerOrders', component: () => import('@/views/seller/Orders.vue'), meta: { requiresAuth: true, requiresSeller: true } },
      { path: 'analytics', name: 'SellerAnalytics', component: () => import('@/views/seller/Analytics.vue'), meta: { requiresAuth: true, requiresSeller: true } },
      { path: 'finance', name: 'SellerFinance', component: () => import('@/views/seller/Finance.vue'), meta: { requiresAuth: true, requiresSeller: true } },
      { path: 'customers', name: 'SellerCustomers', component: () => import('@/views/seller/Customers.vue'), meta: { requiresAuth: true, requiresSeller: true } },
      { path: 'shipping', name: 'SellerShipping', component: () => import('@/views/seller/Shipping.vue'), meta: { requiresAuth: true, requiresSeller: true } },
      { path: 'coupons', name: 'SellerCoupons', component: () => import('@/views/seller/Coupons.vue'), meta: { requiresAuth: true, requiresSeller: true } },
      { path: 'settings', name: 'SellerSettings', component: () => import('@/views/seller/Settings.vue'), meta: { requiresAuth: true, requiresSeller: true } },
      { path: 'profile', name: 'SellerProfile', component: () => import('@/views/seller/Profile.vue'), meta: { requiresAuth: true, requiresSeller: true } },
      { path: 'reports', name: 'SellerReports', component: () => import('@/views/seller/Reports.vue'), meta: { requiresAuth: true, requiresSeller: true } },
      { path: 'messages', name: 'SellerMessages', component: () => import('@/views/seller/Messages.vue'), meta: { requiresAuth: true, requiresSeller: true } },
      { path: 'returns', name: 'SellerReturns', component: () => import('@/views/seller/Returns.vue'), meta: { requiresAuth: true, requiresSeller: true } },
      { path: 'promotions', name: 'SellerPromotions', component: () => import('@/views/seller/Promotions.vue'), meta: { requiresAuth: true, requiresSeller: true } },
      { path: 'categories', name: 'SellerCategories', component: () => import('@/views/seller/Categories.vue'), meta: { requiresAuth: true, requiresSeller: true } },
      { path: 'inventory', name: 'SellerInventory', component: () => import('@/views/seller/Inventory.vue'), meta: { requiresAuth: true, requiresSeller: true } },
    ]
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, requiresSuperAdmin: true },
    children: [
      { path: '', name: 'AdminDashboard', component: () => import('@/views/admin/Dashboard.vue') },
      { path: 'manage-admins', name: 'ManageAdmins', component: () => import('@/views/admin/ManageAdmins.vue'), meta: { requiresAuth: true, requiresSuperAdmin: true } },
      { path: 'products', name: 'AdminProducts', component: () => import('@/views/admin/Products.vue') },
      { path: 'orders', name: 'AdminOrders', component: () => import('@/views/admin/Orders.vue') },
      { path: 'categories', name: 'AdminCategories', component: () => import('@/views/admin/Categories.vue') },
      { path: 'sellers', name: 'AdminSellers', component: () => import('@/views/admin/Sellers.vue') },
      { path: 'customers', name: 'AdminCustomers', component: () => import('@/views/admin/Users.vue') },
      { path: 'transactions', name: 'AdminTransactions', component: () => import('@/views/admin/Transactions.vue') },
      { path: 'wallets', name: 'AdminWallets', component: () => import('@/views/admin/Wallets.vue') },
      { path: 'withdrawals', name: 'AdminWithdrawals', component: () => import('@/views/admin/Withdrawals.vue') },
      { path: 'recharges', name: 'AdminRecharges', component: () => import('@/views/admin/Recharges.vue') },
      { path: 'banners', name: 'AdminBanners', component: () => import('@/views/admin/Banners.vue') },
      { path: 'coupons', name: 'AdminCoupons', component: () => import('@/views/admin/Coupons.vue') },
      { path: 'notifications', name: 'AdminNotifications', component: () => import('@/views/admin/Notifications.vue') },
      { path: 'chat', name: 'AdminChat', component: () => import('@/views/admin/Chat.vue') },
      { path: 'messages', name: 'AdminMessages', component: () => import('@/views/admin/Messages.vue') },
      { path: 'reports/sales', name: 'AdminSalesReport', component: () => import('@/views/admin/SalesReport.vue') },
      { path: 'reports/products', name: 'AdminProductReport', component: () => import('@/views/admin/ProductReport.vue') },
      { path: 'reports/customers', name: 'AdminCustomerReport', component: () => import('@/views/admin/CustomerReport.vue') },
      { path: 'settings', name: 'AdminSettings', component: () => import('@/views/admin/Settings.vue') },
      { path: 'blockchain', name: 'AdminBlockchain', component: () => import('@/views/admin/Blockchain.vue') },
      { path: 'scraper', name: 'AdminScraper', component: () => import('@/views/admin/Scraper.vue') },
      { path: 'logs', name: 'AdminLogs', component: () => import('@/views/admin/Logs.vue') },
      { path: 'rating-plus/users', name: 'AdminRPlusUsers', component: () => import('@/views/admin/RatingPlusUsers.vue') },
      { path: 'rating-plus/chat', name: 'AdminRPlusChat', component: () => import('@/views/admin/RatingPlusChat.vue') },
    ]
  },
  { path: '/login', name: 'Login', component: () => import('@/views/Login.vue') },
  { path: '/login/admin', name: 'AdminLogin', component: () => import('@/views/admin/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('@/views/Register.vue') },
  { path: '/ratingplus', name: 'RatingPlus', component: () => import('@/views/RatingPlus.vue') },
  { path: '/verification', name: 'Verification', component: () => import('@/views/Verification.vue') },
  { path: '/login-password-reset', name: 'LoginPasswordResetDirect', component: () => import('@/views/LoginPasswordReset.vue') },
  { path: '/bind-phone-bound', name: 'BindPhoneBound', component: () => import('@/views/BindPhoneBound.vue') },
  { path: '/bind-email-bound', name: 'BindEmailBound', component: () => import('@/views/BindEmailBound.vue') },
  { path: '/fund-password-reset', name: 'FundPasswordReset', component: () => import('@/views/FundPasswordReset.vue') },
  { path: '/account/cancellation', name: 'AccountCancellation', component: () => import('@/views/AccountCancellation.vue') },
  { path: '/merchant-down', name: 'MerchantDown', component: () => import('@/views/MerchantDown.vue') },
  { path: '/repayment/expected', name: 'RepaymentExpected', component: () => import('@/views/RepaymentExpected.vue') },
  { path: '/customer-service-2', name: 'CustomerService2', component: () => import('@/views/CustomerService2.vue') },
  { path: '/customer-service-index', name: 'CustomerServiceIndex', component: () => import('@/views/CustomerServiceIndex.vue') },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/NotFound.vue') },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach(async (to, from, next) => {
  // Strategi: Timeout 3 detik untuk getSession (mencegah white screen jika Supabase lambat)
  let session = null
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Auth timeout')), 3000))
      ])
      session = result?.data?.session
      break
    } catch (e) {
      if (attempt === 0) { await new Promise(r => setTimeout(r, 500)); continue }
      console.warn('Auth check failed after retry, proceeding without session')
    }
  }
  const isAuthenticated = !!session?.access_token

  // ── Auth required but not logged in → redirect to correct login ──
  if (to.meta.requiresAuth && !isAuthenticated) {
    if (to.meta.requiresSeller) return next('/seller/login')
    if (to.meta.requiresAdmin) return next('/login/admin')
    if (to.meta.requiresMember) return next('/login')
    if (to.path.startsWith('/seller')) return next('/seller/login')
    if (to.path.startsWith('/admin')) return next('/login/admin')
    return next('/login')
  }

  // ── If authenticated, enforce role-based access ──
  if (isAuthenticated) {
    const store = useUserStore()
    // Ensure role is loaded (cached in store after login/init)
    if (!store.role) await store.fetchRole()
    const role = store.role

    // Seller portal: only SELLER
        // RatingPlus portal: only RATING_PLUS
    if (to.meta.requiresRatingPlus && role !== 'RATING_PLUS') {
      return next(role === 'ADMIN' ? '/admin' : role === 'SUPER_ADMIN' ? '/superadmin' : role === 'SELLER' ? '/seller' : '/user')
    }
    if (to.meta.requiresSeller && role !== 'SELLER' && role !== 'SUPER_ADMIN') {
      return next(role === 'ADMIN' ? '/admin' : '/user')
    }

    // Admin portal: only ADMIN
    if (to.meta.requiresSuperAdmin && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      return next(role === 'SELLER' ? '/seller' : '/user')
    }
    if (to.meta.requiresAdmin && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return next(role === 'SELLER' ? '/seller' : '/user')
    }

    // Member portal: only MEMBER
    if (to.meta.requiresMember && role !== 'MEMBER' && role !== 'SUPER_ADMIN') {
      return next(role === 'ADMIN' ? '/admin' : '/seller')
    }

    // ── Logged-in user visiting login/register pages → redirect to their portal ──
    const loginPages = ['/login', '/register', '/login/admin', '/seller/login']
    if (loginPages.includes(to.path) && role !== 'SUPER_ADMIN') {
      if (role === 'SUPER_ADMIN') return next('/admin')
      if (role === 'ADMIN') return next('/admin')
      if (role === 'SELLER') return next('/seller')
      return next('/user')
    }
  }

  next()
})

// After each navigation — sync data, update title & meta
router.afterEach((to) => {
  // Page title mapping for better SEO
  const titleMap = {
    'Home': 'AllianceHub — Partner Global Dropshippers',
    'Category': 'Shop by Category — AllianceHub',
    'Search': 'Search Products — AllianceHub',
    'ProductDetail': 'Product Details — AllianceHub',
    'Cart': 'Shopping Cart — AllianceHub',
    'Checkout': 'Checkout — AllianceHub',
    'About': 'About Us — AllianceHub',
    'Contact': 'Contact Us — AllianceHub',
    'Help': 'Help Center — AllianceHub',
    'Terms': 'Terms of Service — AllianceHub',
    'Privacy': 'Privacy Policy — AllianceHub',
    'Login': 'Sign In — AllianceHub',
    'Register': 'Create Account — AllianceHub',
    'Discounts': 'Today\'s Deals — AllianceHub',
    'Blog': 'Blog — AllianceHub',
    'HowToBuy': 'How to Buy — AllianceHub',
    'ShippingInfo': 'Shipping Information — AllianceHub',
    'PaymentMethods': 'Payment Methods — AllianceHub',
    'Returns': 'Returns & Refunds — AllianceHub',
    'TrackOrder': 'Track Your Order — AllianceHub',
    'Comparison': 'Compare Products — AllianceHub',
    'MerchantSettled': 'Sell on AllianceHub — AllianceHub',
    'Store': 'Store — AllianceHub',
    'AllReviews': 'Customer Reviews — AllianceHub',
    'Information': 'Information — AllianceHub',
    'CustomerService': 'Customer Service — AllianceHub',
  }

  const pageName = to.name || to.path.split('/').pop()
  document.title = titleMap[pageName] || `${pageName} — AllianceHub`

  // Update canonical URL dynamically
  let canonical = document.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }
  canonical.href = `https://alliancehub.dpdns.org${to.fullPath}`

  // Update og:url dynamically
  let ogUrl = document.querySelector('meta[property="og:url"]')
  if (ogUrl) ogUrl.content = `https://alliancehub.dpdns.org${to.fullPath}`

  // Emit navigation event for global sync
  if (window.__syncBus) {
    window.__syncBus.emit('route:change', { path: to.path, name: to.name, params: to.params })
  }
})

export default router
