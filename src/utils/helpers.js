// ==================== HELPERS ====================

export function formatPrice(amount, currency = 'USD') {
  const symbols = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', IDR: 'Rp', MYR: 'RM', THB: '฿', VND: '₫', PHP: '₱', SGD: 'S$', AUD: 'A$', CAD: 'C$', INR: '₹', BRL: 'R$', MXN: 'MX$', KRW: '₩', TWD: 'NT$', HKD: 'HK$' }
  const symbol = symbols[currency] || '$'
  // BUG-021 FIX: Handle NaN and undefined
  const val = parseFloat(amount)
  if (isNaN(val)) return `${symbol}0.00`
  if (['JPY', 'KRW', 'VND', 'IDR'].includes(currency)) return `${symbol}${Math.round(val).toLocaleString()}`
  return `${symbol}${val.toFixed(2)}`
}

export function formatDate(date, options = {}) {
  if (!date) return ''
  const d = new Date(date)
  const defaults = { year: 'numeric', month: 'short', day: 'numeric' }
  return d.toLocaleDateString('en-US', { ...defaults, ...options })
}

export function formatTime(date) {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatNumber(num) {
  if (!num) return '0'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return String(num)
}

export function formatDiscount(original, current) {
  if (!original || original <= current) return 0
  return Math.round(((original - current) / original) * 100)
}

export function truncate(str, length = 100) {
  if (!str || str.length <= length) return str
  return str.substring(0, length) + '...'
}

export function slugify(text) {
  // BUG-042 FIX: Handle Unicode characters (CJK, Arabic, etc.)
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\p{L}]+/gu, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 200)
}

export function debounce(fn, delay = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function throttle(fn, limit = 100) {
  let inThrottle
  return (...args) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

export function getImageUrl(images, index = 0) {
  if (!images) return ''
  // BUG-043 FIX: Parse JSON string if needed
  let parsed = images
  if (typeof images === 'string') {
    try {
      const arr = JSON.parse(images)
      if (Array.isArray(arr)) return arr[index] || arr[0] || ''
    } catch {}
    return images
  }
  if (Array.isArray(parsed)) return parsed[index] || parsed[0] || ''
  return ''
}

export function getStatusColor(status) {
  const colors = {
    active: '#28a745', completed: '#28a745', paid: '#28a745', delivered: '#28a745',
    pending: '#ffc107', processing: '#17a2b8', shipped: '#17a2b8',
    cancelled: '#dc3545', refunded: '#dc3545', failed: '#dc3545', rejected: '#dc3545',
  }
  return colors[status] || '#6c757d'
}

export function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
  } else {
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}
