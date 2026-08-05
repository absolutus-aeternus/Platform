const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')

const app = express()
const PORT = 5000
const JWT_SECRET = 'tk-shop-secret-key-2026'

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// In-memory database
const users = new Map()
const products = new Map()
const orders = new Map()
const carts = new Map()

// Initialize sample data
const sampleProducts = [
  { id: '1', name: 'COOFANDY Mens Shawl Collar Long Cardigan', price: 34.60, sales: 26042, category: 'Men\'s Clothing', seller: 'Dw專賣' },
  { id: '2', name: 'ANBOTA Kids Lion Onesie Halloween Costume', price: 27.34, sales: 25806, category: 'Kids & Toys', seller: '陳陳專賣' },
  { id: '3', name: 'Thermajohn Mens Thermal Underwear Pants', price: 16.05, sales: 11751, category: 'Men\'s Clothing', seller: '電子秘境' },
  { id: '4', name: 'KwikSafety Safety Glasses Protective Eyewear', price: 35.87, sales: 21966, category: 'Sports & Outdoors', seller: 'Attraction•奢潮' },
  { id: '5', name: 'ZZB Tablet 10 Inch Android 11 Tablet', price: 68.97, sales: 25276, category: 'Electronics', seller: 'Dw專賣' },
  { id: '6', name: 'Portable Bluetooth Speaker Wireless Soundbar', price: 24.99, sales: 18432, category: 'Electronics', seller: '陳陳專賣' },
]
sampleProducts.forEach(p => products.set(p.id, p))

const sampleUsers = [
  { id: '4012990', username: 'Panas.dingin@gmail.com', password: 'Qilin13579@', role: 'MEMBER', kyc: 3 }
]
sampleUsers.forEach(u => users.set(u.username, u))

// Auth middleware
const auth = (req, res, next) => {
  const token = req.body.token || req.query.token
  if (!token) return res.json({ code: '403', msg: '请重新登录', data: null })
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return res.json({ code: '403', msg: '请重新登录', data: null })
  }
}

// User routes
app.post('/api/user/login', (req, res) => {
  const { username, password } = req.body
  const user = users.get(username)
  if (!user || user.password !== password) {
    return res.json({ code: '1', msg: '用户名或密码错误', data: null })
  }
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ code: '0', msg: null, data: { token, usercode: user.id, username: user.username } })
})

app.post('/api/user/register', (req, res) => {
  const { username, password } = req.body
  if (users.has(username)) {
    return res.json({ code: '1', msg: '用户名已存在', data: null })
  }
  const id = String(Date.now()).slice(-7)
  users.set(username, { id, username, password, role: 'MEMBER', kyc: 0 })
  res.json({ code: '0', msg: null, data: { success: true } })
})

app.post('/api/user/info', auth, (req, res) => {
  const user = users.get(req.user.username)
  res.json({
    code: '0', msg: null, data: {
      usercode: user.id, username: user.username, userrole: user.role,
      kyc_status: user.kyc, avatar: '1', lastloginip: '127.0.0.1'
    }
  })
})

app.post('/api/localuser/get', auth, (req, res) => {
  const user = users.get(req.user.username)
  res.json({
    code: '0', msg: null, data: {
      usercode: user.id, username: user.username, userrole: user.role,
      kyc_status: user.kyc, identityverif: false, googleverif: false
    }
  })
})

// Product routes
app.post('/api/sellerGoods/recommend_new', (req, res) => {
  const { pageSize = 20, pageNum = 1 } = req.body
  const allProducts = Array.from(products.values())
  const start = (pageNum - 1) * pageSize
  const result = allProducts.slice(start, start + parseInt(pageSize))
  res.json({
    code: '0', msg: null, data: {
      result,
      pageInfo: { totalElements: allProducts.length, pageSize: parseInt(pageSize), pageNum: parseInt(pageNum) }
    }
  })
})

app.post('/api/sellerGoods/search-keyword', (req, res) => {
  const { keyword } = req.body
  const allProducts = Array.from(products.values())
  const filtered = keyword ? allProducts.filter(p => p.name.toLowerCase().includes(keyword.toLowerCase())) : allProducts
  res.json({ code: '0', msg: null, data: { goodsList: filtered, sellerList: [] } })
})

// Category route
app.post('/api/category/recommend', (req, res) => {
  const categories = [
    'Food & Beverage', 'Men\'s Clothing', 'Women\'s Clothing', 'Electronics',
    'Home Appliances', 'Sports & Outdoors', 'Beauty & Health', 'Kids & Toys',
    'Jewelry & Watches', 'Bags & Luggage', 'Virtual Card', 'Luxury'
  ]
  res.json({
    code: '0', msg: null, data: {
      pageList: categories.map(name => ({ name, des: '' })),
      pageInfo: { totalElements: categories.length }
    }
  })
})

// Seller routes
app.post('/api/seller/list', (req, res) => {
  const sellers = [
    { id: '1', name: 'Dw專賣', goodsCount: 195, salesCount: 98034 },
    { id: '2', name: '陳陳專賣', goodsCount: 120, salesCount: 45023 },
    { id: '3', name: '電子秘境', goodsCount: 88, salesCount: 32109 },
    { id: '4', name: 'Attraction•奢潮', goodsCount: 65, salesCount: 21456 },
  ]
  res.json({
    code: '0', msg: null, data: {
      pageList: sellers,
      pageInfo: { totalElements: sellers.length }
    }
  })
})

// Cart routes
app.post('/api/cart/list', auth, (req, res) => {
  const cart = carts.get(req.user.username) || []
  res.json({
    code: '0', msg: null, data: {
      pageList: cart,
      pageInfo: { totalElements: cart.length }
    }
  })
})

app.post('/api/cart/add', auth, (req, res) => {
  const { productId, quantity = 1 } = req.body
  const cart = carts.get(req.user.username) || []
  const existing = cart.find(item => item.productId === productId)
  if (existing) {
    existing.quantity += parseInt(quantity)
  } else {
    cart.push({ productId, quantity: parseInt(quantity) })
  }
  carts.set(req.user.username, cart)
  res.json({ code: '0', msg: null, data: { success: true } })
})

// Address routes
app.post('/api/address/list', auth, (req, res) => {
  res.json({
    code: '0', msg: null, data: {
      pageList: [{
        id: '1', contacts: 'Ibu kartini', phone: '62|81234567890',
        address: 'Jalan konoha 99', city: 'Kota Makassar',
        province: 'Sulawesi Selatan', country: 'Indonesia', postcode: '88909'
      }]
    }
  })
})

// Wallet routes
app.post('/api/wallet/getUsdt', auth, (req, res) => {
  res.json({ code: '0', msg: null, data: { money: 0, rebate: 0, frozenMoney: 0 } })
})

// Chat routes
app.post('/api/newOnlinechat/unread', (req, res) => {
  res.json({ code: '0', msg: null, data: 0 })
})

app.post('/api/newOnlinechat/list', (req, res) => {
  res.json({ code: '0', msg: null, data: [] })
})

// System routes
app.post('/api/syspara/getSyspara', (req, res) => {
  const { code } = req.query
  const params = {
    customer_service_url: '',
    mall_max_goods_number_in_order: '999',
    seller_apply_url: ''
  }
  res.json({ code: '0', msg: null, data: { [code]: params[code] || '' } })
})

app.get('/api/syspara/getSyspara', (req, res) => {
  const { code } = req.query
  const params = {
    customer_service_url: '',
    mall_max_goods_number_in_order: '999',
    seller_apply_url: ''
  }
  res.json({ code: '0', msg: null, data: { [code]: params[code] || '' } })
})

// Banner route
app.post('/api/banner/bannerList', (req, res) => {
  res.json({ code: '0', msg: null, data: { result: [] } })
})

// Lottery route
app.get('/api/activity/lottery/getCurrentActivity', (req, res) => {
  res.json({ code: '0', msg: null, data: {} })
})

// Download URL
app.post('/api/index/download-url', (req, res) => {
  res.json({ code: '0', msg: null, data: '' })
})

// Blockchain channels
app.post('/api/channelBlockchain/list', auth, (req, res) => {
  res.json({
    code: '0', msg: null, data: [{
      id: '1', coin: 'USDC', blockchain_name: 'ERC20',
      fee: 1, address: 'Please contact customer service to recharge'
    }]
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
