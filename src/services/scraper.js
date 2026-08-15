// Scraper Service - uses fetch (no cheerio/axios needed in browser)
const CORS_PROXY = 'https://api.allorigins.win/raw?url='

export const scrapeProduct = async (url) => {
  try {
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
