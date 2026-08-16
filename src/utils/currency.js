// ==================== CURRENCY SERVICE ====================
export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 149.5 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 7.24 },
  { code: 'KRW', name: 'Korean Won', symbol: '₩', rate: 1320 },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', rate: 15750 },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', rate: 4.65 },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', rate: 35.2 },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', rate: 24300 },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', rate: 56.5 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 1.34 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.53 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.36 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83.2 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 4.97 },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', rate: 17.1 },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', rate: 31.5 },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', rate: 7.82 },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', rate: 3.75 },
]

let currentCurrency = CURRENCIES[0] // USD default

export function getCurrency() {
  try {
    const saved = localStorage.getItem('currency')
    if (saved) {
      const found = CURRENCIES.find(c => c.code === saved)
      if (found) currentCurrency = found
    }
  } catch (e) { console.warn("[Currency] Error:", e.message) }
  return currentCurrency
}

export function setCurrency(code) {
  const found = CURRENCIES.find(c => c.code === code)
  if (found) {
    currentCurrency = found
    try { localStorage.setItem('currency', code) } catch (e) { console.warn("[Currency] Error:", e.message) }
  }
}

export function convertPrice(usdPrice) {
  const currency = getCurrency()
  const converted = usdPrice * currency.rate
  // Format based on currency
  if (['JPY', 'KRW', 'VND'].includes(currency.code)) {
    return `${currency.symbol}${Math.round(converted).toLocaleString()}`
  }
  return `${currency.symbol}${converted.toFixed(2)}`
}

export function formatPrice(amount, currencyCode) {
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0]
  if (['JPY', 'KRW', 'VND'].includes(currency.code)) {
    return `${currency.symbol}${Math.round(amount).toLocaleString()}`
  }
  return `${currency.symbol}${amount.toFixed(2)}`
}
