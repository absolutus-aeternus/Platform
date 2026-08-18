// ==================== UNIT TESTS: Utility Functions ====================
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  formatPrice,
  formatDate,
  formatTime,
  formatNumber,
  formatDiscount,
  truncate,
  slugify,
  debounce,
  throttle,
  generateId,
  getImageUrl,
  getStatusColor,
  copyToClipboard,
} from '@/utils/helpers'

import {
  CURRENCIES,
  convertPrice,
  formatPrice as currencyFormatPrice,
  setCurrency,
  getCurrency,
} from '@/utils/currency'

// ==================== formatPrice (helpers.js) ====================
describe('formatPrice', () => {
  it('formats USD price with 2 decimals', () => {
    expect(formatPrice(19.99, 'USD')).toBe('$19.99')
  })

  it('formats EUR price', () => {
    expect(formatPrice(25, 'EUR')).toBe('€25.00')
  })

  it('formats GBP price', () => {
    expect(formatPrice(10.5, 'GBP')).toBe('£10.50')
  })

  it('rounds JPY (no decimals)', () => {
    const result = formatPrice(1234.56, 'JPY')
    expect(result).toBe('¥1,235')
  })

  it('rounds KRW (no decimals)', () => {
    expect(formatPrice(9999, 'KRW')).toBe('₩9,999')
  })

  it('rounds VND (no decimals)', () => {
    expect(formatPrice(50000, 'VND')).toBe('₫50,000')
  })

  it('formats IDR', () => {
    // helpers.js formatPrice doesn't use toLocaleString for IDR
    expect(formatPrice(100000, 'IDR')).toBe('Rp100000.00')
  })

  it('defaults to $ for unknown currency', () => {
    expect(formatPrice(50, 'XYZ')).toBe('$50.00')
  })

  it('handles zero', () => {
    expect(formatPrice(0, 'USD')).toBe('$0.00')
  })

  it('handles string input via parseFloat', () => {
    expect(formatPrice('15.99', 'USD')).toBe('$15.99')
  })
})

// ==================== formatDate ====================
describe('formatDate', () => {
  it('formats a valid date string', () => {
    const result = formatDate('2025-01-15')
    expect(result).toContain('Jan')
    expect(result).toContain('15')
    expect(result).toContain('2025')
  })

  it('returns empty string for null', () => {
    expect(formatDate(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(formatDate(undefined)).toBe('')
  })

  it('accepts custom options', () => {
    const result = formatDate('2025-06-01', { month: 'long' })
    expect(result).toContain('June')
  })
})

// ==================== formatTime ====================
describe('formatTime', () => {
  it('returns "just now" for very recent', () => {
    const now = new Date()
    expect(formatTime(now)).toBe('just now')
  })

  it('returns minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000)
    expect(formatTime(fiveMinAgo)).toBe('5m ago')
  })

  it('returns hours ago', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600000)
    expect(formatTime(threeHoursAgo)).toBe('3h ago')
  })

  it('returns days ago', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000)
    expect(formatTime(twoDaysAgo)).toBe('2d ago')
  })

  it('returns short date for older', () => {
    const old = new Date(Date.now() - 30 * 86400000)
    const result = formatTime(old)
    expect(result).toMatch(/\w+ \d+/) // "Jan 15" format
  })

  it('returns empty for null', () => {
    expect(formatTime(null)).toBe('')
  })
})

// ==================== formatNumber ====================
describe('formatNumber', () => {
  it('formats millions', () => {
    expect(formatNumber(1500000)).toBe('1.5M')
  })

  it('formats thousands', () => {
    expect(formatNumber(5400)).toBe('5.4K')
  })

  it('returns string for small numbers', () => {
    expect(formatNumber(99)).toBe('99')
  })

  it('returns "0" for falsy', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(null)).toBe('0')
    expect(formatNumber(undefined)).toBe('0')
  })
})

// ==================== formatDiscount ====================
describe('formatDiscount', () => {
  it('calculates discount percentage', () => {
    expect(formatDiscount(100, 75)).toBe(25)
  })

  it('returns 0 when no discount', () => {
    expect(formatDiscount(100, 100)).toBe(0)
  })

  it('returns 0 when current > original', () => {
    expect(formatDiscount(50, 100)).toBe(0)
  })

  it('rounds the result', () => {
    expect(formatDiscount(99.99, 66.66)).toBe(33)
  })

  it('returns 0 for null original', () => {
    expect(formatDiscount(null, 50)).toBe(0)
  })
})

// ==================== truncate ====================
describe('truncate', () => {
  it('truncates long string', () => {
    const result = truncate('Hello World this is a long string', 10)
    expect(result).toBe('Hello Worl...')
  })

  it('returns original if short enough', () => {
    expect(truncate('Hi', 100)).toBe('Hi')
  })

  it('returns falsy value for null/undefined input', () => {
    // truncate returns null for null input (falsy return)
    expect(truncate(null)).toBeFalsy()
    expect(truncate(undefined)).toBeFalsy()
  })

  it('uses default length 100', () => {
    const long = 'x'.repeat(150)
    expect(truncate(long)).toContain('...')
    expect(truncate(long).length).toBe(103) // 100 + '...'
  })
})

// ==================== slugify ====================
describe('slugify', () => {
  it('converts to lowercase slug', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('removes special characters', () => {
    expect(slugify('Product #1 (Best)!')).toBe('product-1-best')
  })

  it('handles multiple spaces', () => {
    expect(slugify('  lots   of   spaces  ')).toBe('lots-of-spaces')
  })

  it('trims leading/trailing dashes', () => {
    expect(slugify('--test--')).toBe('test')
  })
})

// ==================== debounce ====================
describe('debounce', () => {
  it('delays execution', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    debounced()
    debounced()

    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })
})

// ==================== throttle ====================
describe('throttle', () => {
  it('executes immediately then throttles', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    throttled()
    throttled()

    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    throttled()
    expect(fn).toHaveBeenCalledTimes(2)

    vi.useRealTimers()
  })
})

// ==================== generateId ====================
describe('generateId', () => {
  it('returns a string', () => {
    expect(typeof generateId()).toBe('string')
  })

  it('returns unique values', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBe(100)
  })
})

// ==================== getImageUrl ====================
describe('getImageUrl', () => {
  it('returns string directly', () => {
    expect(getImageUrl('https://img.com/a.jpg')).toBe('https://img.com/a.jpg')
  })

  it('returns first item from array', () => {
    expect(getImageUrl(['a.jpg', 'b.jpg'])).toBe('a.jpg')
  })

  it('returns specific index', () => {
    expect(getImageUrl(['a.jpg', 'b.jpg', 'c.jpg'], 2)).toBe('c.jpg')
  })

  it('returns empty for null', () => {
    expect(getImageUrl(null)).toBe('')
  })

  it('returns empty for empty array', () => {
    expect(getImageUrl([])).toBe('')
  })
})

// ==================== getStatusColor ====================
describe('getStatusColor', () => {
  it('returns green for active', () => {
    expect(getStatusColor('active')).toBe('#28a745')
  })

  it('returns yellow for pending', () => {
    expect(getStatusColor('pending')).toBe('#ffc107')
  })

  it('returns red for cancelled', () => {
    expect(getStatusColor('cancelled')).toBe('#dc3545')
  })

  it('returns gray for unknown', () => {
    expect(getStatusColor('unknown_status')).toBe('#6c757d')
  })
})

// ==================== copyToClipboard ====================
describe('copyToClipboard', () => {
  it('uses navigator.clipboard when available', () => {
    copyToClipboard('test text')
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text')
  })
})

// ==================== Currency Module ====================
describe('Currency Module', () => {
  it('has USD as first currency', () => {
    expect(CURRENCIES[0].code).toBe('USD')
  })

  it('contains 20 currencies', () => {
    expect(CURRENCIES.length).toBe(20)
  })

  it('each currency has required fields', () => {
    CURRENCIES.forEach(c => {
      expect(c).toHaveProperty('code')
      expect(c).toHaveProperty('name')
      expect(c).toHaveProperty('symbol')
      expect(c).toHaveProperty('rate')
      expect(typeof c.rate).toBe('number')
    })
  })

  it('USD has rate 1', () => {
    const usd = CURRENCIES.find(c => c.code === 'USD')
    expect(usd.rate).toBe(1)
  })

  it('setCurrency changes active currency', () => {
    setCurrency('EUR')
    const curr = getCurrency()
    expect(curr.code).toBe('EUR')
  })

  it('setCurrency ignores invalid code', () => {
    setCurrency('USD')
    setCurrency('INVALID')
    expect(getCurrency().code).toBe('USD')
  })

  it('convertPrice uses current currency rate', () => {
    setCurrency('EUR')
    const result = convertPrice(100)
    expect(result).toContain('€')
    expect(result).toContain('92.00')
  })

  it('convertPrice rounds for JPY', () => {
    setCurrency('JPY')
    const result = convertPrice(10)
    expect(result).toContain('¥')
    expect(result).not.toContain('.')
  })
})
