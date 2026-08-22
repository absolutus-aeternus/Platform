// Scraper Service - uses fetch (no cheerio/axios needed in browser)
const CORS_PROXY = import.meta.env.VITE_CORS_PROXY || 'https://api.allorigins.win/raw?url='

// Allowed domains for scraping (SSRF protection)
const ALLOWED_DOMAINS = [
  'amazon.com', 'aliexpress.com', 'shopee.com', 'lazada.com',
  'ebay.com', 'walmart.com', 'etsy.com', 'rakuten.com',
  'coupang.com', 'jd.com', 'tmall.com', 'taobao.com',
  'flipkart.com', 'mercadolibre.com', 'allegro.pl',
  'tiktokshop.com', 'shopify.com'
]

function isAllowedUrl(urlStr) {
  try {
    const url = new URL(urlStr)
    if (!['http:', 'https:'].includes(url.protocol)) return false
    // Block private/internal IPs
    const hostname = url.hostname
    if (['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(hostname)) return false
    if (hostname.startsWith('10.') || hostname.startsWith('172.') || hostname.startsWith('192.168.')) return false
    if (hostname.includes('169.254')) return false // AWS metadata
    // Check domain whitelist
    return ALLOWED_DOMAINS.some(d => hostname.endsWith(d))
  } catch { return false }
}

export const scrapeProduct = async (url) => {
  try {
    if (!isAllowedUrl(url)) return { error: 'URL not allowed', success: false }
    const proxyUrl = CORS_PROXY + encodeURIComponent(url)
    const res = await fetch(proxyUrl)
    const html = await res.text()
    
    // Parse with DOMParser (browser native)
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    const title = doc.querySelector('title')?.textContent || ''
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || ''
    const images = Array.from(doc.querySelectorAll('img')).map(img => img.src).filter(Boolean).slice(0, 10)
    const price = doc.querySelector('[class*="price"], [data-price]')?.textContent || ''
    
    return { title, description, images, price, url, success: true }
  } catch (e) {
    return { error: e.message, success: false }
  }
}

export const scrapeCategory = async (url) => {
  try {
    if (!isAllowedUrl(url)) return { error: 'URL not allowed', success: false }
    const proxyUrl = CORS_PROXY + encodeURIComponent(url)
    const res = await fetch(proxyUrl)
    const html = await res.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    const links = Array.from(doc.querySelectorAll('a[href]'))
      .map(a => ({ text: a.textContent?.trim(), href: a.href }))
      .filter(l => l.text && l.href)
      .slice(0, 50)
    
    return { links, success: true }
  } catch (e) {
    return { error: e.message, success: false }
  }
}
