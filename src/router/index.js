import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'Home', component: () => import('@/views/Home.vue') },
      { path: 'category', name: 'Category', component: () => import('@/views/Category.vue') },
      { path: 'product/:id', name: 'ProductDetail', component: () => import('@/views/ProductDetail.vue') },
      { path: 'search', name: 'Search', component: () => import('@/views/Search.vue') },
      { path: 'cart', name: 'Cart', component: () => import('@/views/Cart.vue'), meta: { requiresAuth: true } },
      { path: 'checkout', name: 'Checkout', component: () => import('@/views/Checkout.vue'), meta: { requiresAuth: true } },
      { path: 'store/:id', name: 'Store', component: () => import('@/views/Store.vue') },
      { path: 'discounts', name: 'Discounts', component: () => import('@/views/Discounts.vue') },
      { path: 'credit', name: 'Credit', component: () => import('@/views/Credit.vue') },
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
      { path: 'wallet', name: 'Wallet', component: () => import('@/views/user/Wallet.vue') },
      { path: 'favorites', name: 'Favorites', component: () => import('@/views/user/Favorites.vue') },
      { path: 'addresses', name: 'Addresses', component: () => import('@/views/user/Addresses.vue') },
      { path: 'notifications', name: 'Notifications', component: () => import('@/views/user/Notifications.vue') },
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
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
