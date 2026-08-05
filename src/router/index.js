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
    meta: { requiresAuth: true, requiresSeller: true },
    children: [
      { path: '', name: 'SellerDashboard', component: () => import('@/views/seller/Dashboard.vue') },
      { path: 'products', name: 'SellerProducts', component: () => import('@/views/seller/Products.vue') },
      { path: 'orders', name: 'SellerOrders', component: () => import('@/views/seller/Orders.vue') },
      { path: 'analytics', name: 'SellerAnalytics', component: () => import('@/views/seller/Analytics.vue') },
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
    next('/login')
  } else {
    next()
  }
})

export default router
