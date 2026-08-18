// ==================== TEST SETUP ====================
// Global mocks for AllianceHub test suite

import { vi } from 'vitest'

// ─── Supabase Mock ───
const mockSupabaseChain = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  gt: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lt: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  then: vi.fn((resolve) => resolve({ data: [], error: null })),
}

const mockAuth = {
  getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
  getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
  signInWithPassword: vi.fn().mockResolvedValue({ data: { session: null, user: null }, error: null }),
  signUp: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
  onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
  resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
}

const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
}

vi.mock('@/services/supabase', () => ({
  supabase: {
    auth: mockAuth,
    from: vi.fn(() => ({ ...mockSupabaseChain })),
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn(),
  },
  signIn: vi.fn().mockResolvedValue({ data: { session: null, user: null }, error: null }),
  signUp: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
  fetchProducts: vi.fn().mockResolvedValue({ data: [], error: null }),
  fetchProductById: vi.fn().mockResolvedValue({ data: null, error: null }),
  fetchCategories: vi.fn().mockResolvedValue({ data: [], error: null }),
  fetchSellers: vi.fn().mockResolvedValue({ data: [], error: null }),
  fetchCart: vi.fn().mockResolvedValue({ data: [], error: null }),
  addToCart: vi.fn().mockResolvedValue({ data: null, error: null }),
  updateCartQuantity: vi.fn().mockResolvedValue({ error: null }),
  removeFromCart: vi.fn().mockResolvedValue({ error: null }),
  clearCart: vi.fn().mockResolvedValue({ error: null }),
  fetchReviews: vi.fn().mockResolvedValue({ data: [], error: null }),
  fetchOrders: vi.fn().mockResolvedValue({ data: [], error: null }),
  fetchNotifications: vi.fn().mockResolvedValue({ data: [], error: null }),
  fetchBanners: vi.fn().mockResolvedValue({ data: [], error: null }),
  searchProducts: vi.fn().mockResolvedValue({ data: [], error: null }),
  fetchWishlist: vi.fn().mockResolvedValue({ data: [], error: null }),
  toggleWishlist: vi.fn().mockResolvedValue({ action: 'added', error: null }),
  followSeller: vi.fn().mockResolvedValue({ action: 'followed', error: null }),
  unfollowSeller: vi.fn().mockResolvedValue({ action: 'unfollowed', error: null }),
  validateCoupon: vi.fn().mockResolvedValue({ valid: false, error: 'Invalid' }),
  fetchShippingEstimate: vi.fn().mockResolvedValue({ data: [], error: null }),
  fetchProductVariants: vi.fn().mockResolvedValue({ data: [], error: null }),
  sendMessage: vi.fn().mockResolvedValue({ data: null, error: null }),
  fetchChatMessages: vi.fn().mockResolvedValue({ data: [], error: null }),
  createOrder: vi.fn().mockResolvedValue({ data: null, error: null }),
  createOrderItems: vi.fn().mockResolvedValue({ data: null, error: null }),
  getR2ImageUrl: vi.fn((key) => `https://cdn.example.com/${key}`),
}))

// ─── Vue Router Mock ───
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    currentRoute: { value: { path: '/', params: {}, query: {} } },
  })),
  useRoute: vi.fn(() => ({
    path: '/',
    params: {},
    query: {},
    hash: '',
    meta: {},
  })),
  RouterLink: { template: '<a><slot /></a>' },
}))

// ─── Pinia: use REAL pinia (no mock) ───
// We need real pinia for store/composable tests

// ─── localStorage Mock ───
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = String(value) }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// ─── navigator.clipboard Mock ───
Object.defineProperty(globalThis.navigator, 'clipboard', {
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
  writable: true,
})

// ─── fetch Mock (for API tests) ───
globalThis.fetch = vi.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: () => Promise.resolve({}),
  text: () => Promise.resolve(''),
})

// ─── window.__toast Mock ───
globalThis.window.__toast = { show: vi.fn() }

// ─── crypto Mock ───
if (!globalThis.crypto) {
  globalThis.crypto = {}
}
if (!globalThis.crypto.getRandomValues) {
  globalThis.crypto.getRandomValues = (arr) => {
    for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256)
    return arr
  }
}

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.clear()
})
