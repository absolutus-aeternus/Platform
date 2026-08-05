import { createRouter, createWebHashHistory } from 'vue-router'

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
      { path: 'cart', name: 'Cart', component: () => import('@/views/Cart.vue'), meta: { requiresAuth: true } },
      { path: 'checkout', name: 'Checkout', component: () => import('@/views/Checkout.vue'), meta: { requiresAuth: true } },
      { path: 'pay-success', name: 'PaySuccess', component: () => import('@/views/PaySuccess.vue'), meta: { requiresAuth: true } },
      { path: 'store/:id', name: 'Store', component: () => import('@/views/Store.vue') },
      { path: 'store/report/:sellerId', name: 'StoreReport', component: () => import('@/views/StoreReport.vue') },
      { path: 'discounts', name: 'Discounts', component: () => import('@/views/Discounts.vue') },
      { path: 'credit', name: 'Credit', component: () => import('@/views/Credit.vue') },
      { path: 'credit/application', name: 'CreditApplication', component: () => import('@/views/CreditApplication.vue'), meta: { requiresAuth: true } },
      { path: 'credit/my-loan', name: 'MyLoan', component: () => import('@/views/MyLoan.vue'), meta: { requiresAuth: true } },
      { path: 'chat', name: 'Chat', component: () => import('@/views/Chat.vue'), meta: { requiresAuth: true } },
    ]
  },
  {
    path: '/user',
    component: () => import('@/layouts/UserLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: () => import('@/views/user/Dashboard.vue') },
      { path: 'orders', name: 'Orders', component: () => import('@/views/user/Orders.vue') },
      { path: 'order/:id', name: 'OrderDetail', component: () => import('@/views/user/OrderDetail.vue') },
      { path: 'order-return', name: 'OrderReturn', component: () => import('@/views/user/OrderReturn.vue') },
      { path: 'order-evaluation', name: 'OrderEvaluation', component: () => import('@/views/user/OrderEvaluation.vue') },
      { path: 'wallet', name: 'Wallet', component: () => import('@/views/user/Wallet.vue') },
      { path: 'recharge', name: 'Recharge', component: () => import('@/views/user/Recharge.vue') },
      { path: 'withdraw', name: 'Withdraw', component: () => import('@/views/user/Withdraw.vue') },
      { path: 'favorites', name: 'Favorites', component: () => import('@/views/user/Favorites.vue') },
      { path: 'collect-shop', name: 'CollectShop', component: () => import('@/views/user/CollectShop.vue') },
      { path: 'addresses', name: 'Addresses', component: () => import('@/views/user/Addresses.vue') },
      { path: 'notifications', name: 'Notifications', component: () => import('@/views/user/Notifications.vue') },
      { path: 'download', name: 'Download', component: () => import('@/views/user/Download.vue') },
      { path: 'settings', name: 'Settings', component: () => import('@/views/user/Settings.vue') },
    ]
  },
  {
    path: '/seller',
    component: () => import('@/layouts/SellerLayout.vue'),
    children: [
      { path: '', name: 'SellerDashboard', component: () => import('@/views/seller/Dashboard.vue'), meta: { requiresAuth: true } },
      { path: 'login', name: 'SellerLogin', component: () => import('@/views/seller/Login.vue') },
      { path: 'products', name: 'SellerProducts', component: () => import('@/views/seller/ProductList.vue'), meta: { requiresAuth: true } },
      { path: 'product/add', name: 'SellerProductAdd', component: () => import('@/views/seller/ProductAdd.vue'), meta: { requiresAuth: true } },
      { path: 'orders', name: 'SellerOrders', component: () => import('@/views/seller/Orders.vue'), meta: { requiresAuth: true } },
      { path: 'analytics', name: 'SellerAnalytics', component: () => import('@/views/seller/Analytics.vue'), meta: { requiresAuth: true } },
      { path: 'finance', name: 'SellerFinance', component: () => import('@/views/seller/Finance.vue'), meta: { requiresAuth: true } },
      { path: 'customers', name: 'SellerCustomers', component: () => import('@/views/seller/Customers.vue'), meta: { requiresAuth: true } },
      { path: 'shipping', name: 'SellerShipping', component: () => import('@/views/seller/Shipping.vue'), meta: { requiresAuth: true } },
      { path: 'coupons', name: 'SellerCoupons', component: () => import('@/views/seller/Coupons.vue'), meta: { requiresAuth: true } },
      { path: 'settings', name: 'SellerSettings', component: () => import('@/views/seller/Settings.vue'), meta: { requiresAuth: true } },
      { path: 'profile', name: 'SellerProfile', component: () => import('@/views/seller/Profile.vue'), meta: { requiresAuth: true } },
      { path: 'reports', name: 'SellerReports', component: () => import('@/views/seller/Reports.vue'), meta: { requiresAuth: true } },
      { path: 'messages', name: 'SellerMessages', component: () => import('@/views/seller/Messages.vue'), meta: { requiresAuth: true } },
      { path: 'returns', name: 'SellerReturns', component: () => import('@/views/seller/Returns.vue'), meta: { requiresAuth: true } },
      { path: 'promotions', name: 'SellerPromotions', component: () => import('@/views/seller/Promotions.vue'), meta: { requiresAuth: true } },
      { path: 'categories', name: 'SellerCategories', component: () => import('@/views/seller/Categories.vue'), meta: { requiresAuth: true } },
      { path: 'inventory', name: 'SellerInventory', component: () => import('@/views/seller/Inventory.vue'), meta: { requiresAuth: true } },
    ]
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', name: 'AdminDashboard', component: () => import('@/views/admin/Dashboard.vue') },
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
      { path: 'logs', name: 'AdminLogs', component: () => import('@/views/admin/Logs.vue') },
    ]
  },
  { path: '/login', name: 'Login', component: () => import('@/views/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('@/views/Register.vue') },
  { path: '/verification', name: 'Verification', component: () => import('@/views/Verification.vue') },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token') || localStorage.getItem('sb-*-auth-token')
  if (to.meta.requiresAuth && !token) {
    if (to.path.startsWith('/seller')) {
      next('/seller/login')
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router
