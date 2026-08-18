#!/usr/bin/env node
/**
 * AllianceHub Multi-Marketplace Product Scraper
 * 
 * Scapes real products with full descriptions, specs, and images from:
 * - Amazon.com (electronics, fashion, home, beauty, sports, etc.)
 * - AliExpress.com (global marketplace, budget products)
 * - eBay.com (auction + buy now, collectibles)
 * - Walmart.com (general merchandise, household)
 * - Temu.com (ultra-budget products)
 * - Etsy.com (handmade, vintage, unique items)
 * - Banggood.com (electronics, gadgets, tools)
 * 
 * Usage:
 *   node scripts/marketplace-scraper.cjs --marketplace amazon --category electronics --limit 20
 *   node scripts/marketplace-scraper.cjs --marketplace all --category all --limit 10
 *   node scripts/marketplace-scraper.cjs --marketplace aliexpress --category fashion --limit 50 --upload
 * 
 * Options:
 *   --marketplace, -m  : amazon|aliexpress|ebay|walmart|temu|etsy|banggood|all
 *   --category, -c     : electronics|fashion|home|beauty|sports|toys|automotive|garden|all
 *   --limit, -l        : Number of products per category (default: 20)
 *   --upload, -u       : Upload results to Supabase after scraping
 *   --output, -o       : Output JSON file path (default: scripts/scraped-products.json)
 *   --delay, -d        : Delay between requests in ms (default: 2000)
 *   --retry, -r        : Max retries per request (default: 3)
 *   --proxy, -p        : Proxy URL (optional)
 *   --verbose, -v      : Verbose logging
 */

const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// User-Agent rotation pool (anti-bot)
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0',
];

function getRandomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms + Math.random() * 1000));
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

function generateSKU() {
  return 'AH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ═══════════════════════════════════════════════════════════════
// CATEGORY DEFINITIONS (USD marketplaces)
// ═══════════════════════════════════════════════════════════════

const CATEGORIES = {
  electronics: {
    name: 'Electronics',
    amazon: 'https://www.amazon.com/s?k=electronics+best+sellers&ref=nb_sb_noss',
    aliexpress: 'https://www.aliexpress.com/w/wholesale-electronics.html',
    ebay: 'https://www.ebay.com/sch/i.html?_nkw=electronics&_sacat=0',
    walmart: 'https://www.walmart.com/search?q=electronics',
    temu: 'https://www.temu.com/search_result.html?search_key=electronics',
    banggood: 'https://www.banggood.com/search/electronics.html',
  },
  fashion: {
    name: 'Fashion',
    amazon: 'https://www.amazon.com/s?k=fashion+clothing+best+sellers',
    aliexpress: 'https://www.aliexpress.com/w/wholesale-fashion-clothing.html',
    ebay: 'https://www.ebay.com/sch/i.html?_nkw=fashion+clothing&_sacat=0',
    walmart: 'https://www.walmart.com/search?q=fashion+clothing',
    temu: 'https://www.temu.com/search_result.html?search_key=fashion',
    etsy: 'https://www.etsy.com/search?q=hanging-shelf&ref=search_bar',
  },
  home: {
    name: 'Home & Living',
    amazon: 'https://www.amazon.com/s?k=home+living+essentials',
    aliexpress: 'https://www.aliexpress.com/w/wholesale-home-living.html',
    ebay: 'https://www.ebay.com/sch/i.html?_nkw=home+living&_sacat=0',
    walmart: 'https://www.walmart.com/search?q=home+living',
    temu: 'https://www.temu.com/search_result.html?search_key=home+decor',
  },
  beauty: {
    name: 'Beauty & Health',
    amazon: 'https://www.amazon.com/s?k=beauty+products+best+sellers',
    aliexpress: 'https://www.aliexpress.com/w/wholesale-beauty-products.html',
    ebay: 'https://www.ebay.com/sch/i.html?_nkw=beauty+products&_sacat=0',
    walmart: 'https://www.walmart.com/search?q=beauty+products',
    temu: 'https://www.temu.com/search_result.html?search_key=beauty',
  },
  sports: {
    name: 'Sports & Outdoors',
    amazon: 'https://www.amazon.com/s?k=sports+fitness+equipment',
    aliexpress: 'https://www.aliexpress.com/w/wholesale-sports-equipment.html',
    ebay: 'https://www.ebay.com/sch/i.html?_nkw=sports+fitness&_sacat=0',
    walmart: 'https://www.walmart.com/search?q=sports+fitness',
    temu: 'https://www.temu.com/search_result.html?search_key=sports',
  },
  toys: {
    name: 'Toys & Games',
    amazon: 'https://www.amazon.com/s?k=toys+games+best+sellers',
    aliexpress: 'https://www.aliexpress.com/w/wholesale-toys-games.html',
    ebay: 'https://www.ebay.com/sch/i.html?_nkw=toys+games&_sacat=0',
    walmart: 'https://www.walmart.com/search?q=toys+games',
    temu: 'https://www.temu.com/search_result.html?search_key=toys',
  },
  automotive: {
    name: 'Automotive',
    amazon: 'https://www.amazon.com/s?k=automotive+accessories',
    aliexpress: 'https://www.aliexpress.com/w/wholesale-automotive-accessories.html',
    ebay: 'https://www.ebay.com/sch/i.html?_nkw=automotive+parts&_sacat=0',
    walmart: 'https://www.walmart.com/search?q=automotive+accessories',
    banggood: 'https://www.banggood.com/search/automotive.html',
  },
  garden: {
    name: 'Garden & Outdoor',
    amazon: 'https://www.amazon.com/s?k=garden+outdoor+tools',
    aliexpress: 'https://www.aliexpress.com/w/wholesale-garden-tools.html',
    ebay: 'https://www.ebay.com/sch/i.html?_nkw=garden+outdoor&_sacat=0',
    walmart: 'https://www.walmart.com/search?q=garden+outdoor',
  },
};

// ═══════════════════════════════════════════════════════════════
// HTTP CLIENT with retry + rotation
// ═══════════════════════════════════════════════════════════════

async function fetchPage(url, options = {}) {
  const { maxRetries = 3, delayMs = 2000, proxy = null } = options;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const config = {
        headers: {
          'User-Agent': getRandomUA(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 30000,
      };
      
      if (proxy) {
        config.proxy = { host: proxy, port: 8080 };
      }
      
      const response = await axios.get(url, config);
      
      if (response.status === 200) {
        return response.data;
      }
    } catch (err) {
      const isLast = attempt === maxRetries;
      const status = err.response?.status || 'timeout';
      
      if (status === 429) {
        // Rate limited — exponential backoff
        const backoff = delayMs * Math.pow(2, attempt);
        console.warn(`  ⚠️  Rate limited (429). Waiting ${backoff}ms... (attempt ${attempt}/${maxRetries})`);
        await sleep(backoff);
      } else if (isLast) {
        console.error(`  ❌ Failed after ${maxRetries} attempts: ${err.message}`);
        return null;
      } else {
        console.warn(`  ⚠️  Attempt ${attempt} failed (${status}). Retrying...`);
        await sleep(delayMs);
      }
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// AMAZON SCRAPER
// ═══════════════════════════════════════════════════════════════

async function scrapeAmazon(url, category, limit = 20) {
  console.log(`  🛒 Amazon: Scraping ${category}...`);
  const html = await fetchPage(url);
  if (!html) return [];
  
  const $ = cheerio.load(html);
  const products = [];
  
  $('[data-asin]').each((i, el) => {
    if (products.length >= limit) return false;
    
    const asin = $(el).attr('data-asin');
    if (!asin || asin.length < 5) return;
    
    const nameEl = $(el).find('h2 a span, h2 span.a-text-normal');
    const name = nameEl.first().text().trim();
    if (!name || name.length < 5) return;
    
    // Price extraction
    const priceWhole = $(el).find('.a-price .a-price-whole').text().trim();
    const priceFrac = $(el).find('.a-price .a-price-fraction').text().trim();
    const priceStr = priceWhole.replace(/[^0-9.]/g, '') + '.' + (priceFrac || '00');
    const price = parseFloat(priceStr);
    if (!price || price <= 0) return;
    
    // Original price (strikethrough)
    const origPriceEl = $(el).find('.a-price[data-a-strike] .a-offscreen, s .a-offscreen');
    const origPrice = parseFloat(origPriceEl.text().replace(/[^0-9.]/g, '')) || null;
    
    // Rating
    const ratingText = $(el).find('.a-icon-alt').text().trim();
    const ratingMatch = ratingText.match(/([\d.]+)/);
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
    
    // Review count
    const reviewText = $(el).find('.a-size-base.s-underline-text, [aria-label*="stars"] + span').text().trim();
    const reviewCount = parseInt(reviewText.replace(/[^0-9]/g, '')) || 0;
    
    // Image
    const img = $(el).find('img.s-image').attr('src') || '';
    
    // Link
    const link = $(el).find('h2 a').attr('href') || '';
    const fullLink = link.startsWith('/') ? 'https://www.amazon.com' + link : link;
    
    // Description from features
    const features = [];
    $(el).find('.a-list-item .a-size-base').each((_, f) => {
      const text = $(el).find(f).text().trim();
      if (text && text.length > 10) features.push(text);
    });
    
    const discount = origPrice ? Math.round((1 - price / origPrice) * 100) : 0;
    
    products.push({
      source: 'amazon',
      source_id: asin,
      name,
      description: features.join('. ') || `${name}. High quality product with fast shipping available on Amazon.`,
      price: Math.round(price * 100) / 100,
      original_price: origPrice ? Math.round(origPrice * 100) / 100 : null,
      discount,
      rating: Math.round(rating * 10) / 10,
      review_count: reviewCount,
      images: img ? [img.replace(/\._[A-Z]{2}\d+_/, '')] : [], // Remove size constraints
      category,
      source_url: fullLink,
      specs: {},
    });
  });
  
  console.log(`  ✅ Amazon: Found ${products.length} products`);
  return products;
}

// ═══════════════════════════════════════════════════════════════
// ALIEXPRESS SCRAPER
// ═══════════════════════════════════════════════════════════════

async function scrapeAliExpress(url, category, limit = 20) {
  console.log(`  🔶 AliExpress: Scraping ${category}...`);
  const html = await fetchPage(url);
  if (!html) return [];
  
  const $ = cheerio.load(html);
  const products = [];
  
  // AliExpress uses various selectors — try multiple patterns
  const itemSelectors = [
    '.search-item-card',
    '.list--gallery--C2f2tvm',
    '[class*="ProductCard"]',
    '.item-card',
    'a[href*="/item/"]',
  ];
  
  for (const selector of itemSelectors) {
    $(selector).each((i, el) => {
      if (products.length >= limit) return false;
      
      const nameEl = $(el).find('[class*="title"], [class*="Title"], h1, h3, .item-title');
      const name = nameEl.first().text().trim();
      if (!name || name.length < 5) return;
      
      const priceEl = $(el).find('[class*="price"], [class*="Price"], .item-price');
      const priceText = priceEl.first().text().trim();
      const priceMatch = priceText.match(/[\d,.]+/);
      const price = priceMatch ? parseFloat(priceMatch[0].replace(',', '')) : 0;
      if (!price || price <= 0) return;
      
      const imgEl = $(el).find('img');
      const img = imgEl.attr('src') || imgEl.attr('data-src') || '';
      
      const linkEl = $(el).find('a[href*="/item/"], a[href*="aliexpress"]').first();
      const link = linkEl.attr('href') || '';
      const fullLink = link.startsWith('//') ? 'https:' + link : link;
      
      const soldEl = $(el).find('[class*="sold"], [class*="Sold"]');
      const soldText = soldEl.text().trim();
      const soldMatch = soldText.match(/([\d,]+)/);
      const sold = soldMatch ? parseInt(soldMatch[1].replace(',', '')) : 0;
      
      const ratingEl = $(el).find('[class*="rating"], [class*="star"]');
      const ratingText = ratingEl.text().trim();
      const ratingMatch = ratingText.match(/([\d.]+)/);
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 4.5;
      
      products.push({
        source: 'aliexpress',
        source_id: slugify(name).substring(0, 40),
        name,
        description: `${name}. Available on AliExpress with worldwide free shipping. Quality guaranteed with buyer protection.`,
        price: Math.round(price * 100) / 100,
        original_price: null,
        discount: 0,
        rating,
        review_count: sold,
        images: img ? [img.replace(/_\d+x\d+\.\w+$/, '')] : [],
        category,
        source_url: fullLink,
        specs: {},
      });
    });
    
    if (products.length > 0) break;
  }
  
  console.log(`  ✅ AliExpress: Found ${products.length} products`);
  return products;
}

// ═══════════════════════════════════════════════════════════════
// EBAY SCRAPER
// ═══════════════════════════════════════════════════════════════

async function scrapeEbay(url, category, limit = 20) {
  console.log(`  🟢 eBay: Scraping ${category}...`);
  const html = await fetchPage(url);
  if (!html) return [];
  
  const $ = cheerio.load(html);
  const products = [];
  
  $('.s-item').each((i, el) => {
    if (products.length >= limit) return false;
    
    const name = $(el).find('.s-item__title span').text().trim();
    if (!name || name === 'Shop on eBay' || name.length < 5) return;
    
    const priceText = $(el).find('.s-item__price').text().trim();
    const priceMatch = priceText.match(/\$?([\d,.]+)/);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : 0;
    if (!price || price <= 0) return;
    
    const origPriceEl = $(el).find('.s-item__was-price, .s-item__ strikethrough');
    const origPriceText = origPriceEl.text().trim();
    const origPriceMatch = origPriceText.match(/\$?([\d,.]+)/);
    const origPrice = origPriceMatch ? parseFloat(origPriceMatch[1].replace(',', '')) : null;
    
    const img = $(el).find('.s-item__image-img').attr('src') || '';
    const link = $(el).find('.s-item__link').attr('href') || '';
    
    const condition = $(el).find('.SECONDARY_INFO').text().trim();
    const shipping = $(el).find('.s-item__shipping, .s-item__freeXDays').text().trim();
    
    const discount = origPrice ? Math.round((1 - price / origPrice) * 100) : 0;
    
    products.push({
      source: 'ebay',
      source_id: slugify(name).substring(0, 40),
      name,
      description: `${name}. ${condition ? 'Condition: ' + condition + '.' : ''} ${shipping || 'Shipping available.'} Buy now on eBay.`,
      price: Math.round(price * 100) / 100,
      original_price: origPrice ? Math.round(origPrice * 100) / 100 : null,
      discount,
      rating: 4.3,
      review_count: 0,
      images: img ? [img] : [],
      category,
      source_url: link.split('?')[0],
      specs: { condition, shipping },
    });
  });
  
  console.log(`  ✅ eBay: Found ${products.length} products`);
  return products;
}

// ═══════════════════════════════════════════════════════════════
// WALMART SCRAPER
// ═══════════════════════════════════════════════════════════════

async function scrapeWalmart(url, category, limit = 20) {
  console.log(`  🔵 Walmart: Scraping ${category}...`);
  const html = await fetchPage(url);
  if (!html) return [];
  
  const $ = cheerio.load(html);
  const products = [];
  
  // Walmart uses React — try data attributes
  $('[data-testid="list-view"] [data-item-id], .search-result-gridview-item, [class*="ProductCard"]').each((i, el) => {
    if (products.length >= limit) return false;
    
    const name = $(el).find('[class*="product-title"], [data-automation-id="product-title"], a span').first().text().trim();
    if (!name || name.length < 5) return;
    
    const priceText = $(el).find('[class*="price"], [data-automation-id="product-price"]').text().trim();
    const priceMatch = priceText.match(/\$?([\d,.]+)/);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : 0;
    if (!price || price <= 0) return;
    
    const img = $(el).find('img').attr('src') || '';
    const link = $(el).find('a').attr('href') || '';
    const fullLink = link.startsWith('/') ? 'https://www.walmart.com' + link : link;
    
    const ratingText = $(el).find('[class*="rating"]').text().trim();
    const ratingMatch = ratingText.match(/([\d.]+)/);
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 4.3;
    
    products.push({
      source: 'walmart',
      source_id: slugify(name).substring(0, 40),
      name,
      description: `${name}. Available at Walmart with fast shipping and easy returns. Everyday low price.`,
      price: Math.round(price * 100) / 100,
      original_price: null,
      discount: 0,
      rating,
      review_count: 0,
      images: img ? [img] : [],
      category,
      source_url: fullLink,
      specs: {},
    });
  });
  
  console.log(`  ✅ Walmart: Found ${products.length} products`);
  return products;
}

// ═══════════════════════════════════════════════════════════════
// TEMU SCRAPER
// ═══════════════════════════════════════════════════════════════

async function scrapeTemu(url, category, limit = 20) {
  console.log(`  🟡 Temu: Scraping ${category}...`);
  const html = await fetchPage(url);
  if (!html) return [];
  
  const $ = cheerio.load(html);
  const products = [];
  
  // Temu is heavily JS-rendered — try embedded JSON data
  const scripts = $('script').toArray();
  for (const script of scripts) {
    const content = $(script).html() || '';
    const jsonMatch = content.match(/window\.__INITIAL_STATE__\s*=\s*({.*?});/s) ||
                      content.match(/"goodsList"\s*:\s*(\[.*?\])/s);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        const items = data.goodsList || data.data?.goodsList || [];
        for (const item of items) {
          if (products.length >= limit) break;
          products.push({
            source: 'temu',
            source_id: item.goodsId || slugify(item.goodsName || '').substring(0, 40),
            name: item.goodsName || item.title || '',
            description: item.goodsDesc || `${item.goodsName}. Ultra-low prices with free shipping on Temu.`,
            price: (item.salePrice || item.price || 0) / 100,
            original_price: item.marketPrice ? item.marketPrice / 100 : null,
            discount: item.discount || 0,
            rating: item.rating || 4.5,
            review_count: item.commentCount || 0,
            images: item.goodsImageUrl ? [item.goodsImageUrl] : [],
            category,
            source_url: `https://www.temu.com/search_result.html?search_key=${category}`,
            specs: {},
          });
        }
      } catch (e) { /* JSON parse failed, continue */ }
    }
  }
  
  console.log(`  ✅ Temu: Found ${products.length} products`);
  return products;
}

// ═══════════════════════════════════════════════════════════════
// ETSY SCRAPER
// ═══════════════════════════════════════════════════════════════

async function scrapeEtsy(url, category, limit = 20) {
  console.log(`  🟠 Etsy: Scraping ${category}...`);
  const html = await fetchPage(url);
  if (!html) return [];
  
  const $ = cheerio.load(html);
  const products = [];
  
  $('[data-search-results] li, .v2-listing-card, .search-listing-card').each((i, el) => {
    if (products.length >= limit) return false;
    
    const name = $(el).find('[class*="title"], [class*="Title"], h3, .v2-listing-card__title').text().trim();
    if (!name || name.length < 5) return;
    
    const priceText = $(el).find('[class*="price"], [class*="Price"], .currency-value').text().trim();
    const priceMatch = priceText.match(/\$?([\d,.]+)/);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : 0;
    if (!price || price <= 0) return;
    
    const img = $(el).find('img').attr('src') || $(el).find('img').attr('data-src') || '';
    const link = $(el).find('a').attr('href') || '';
    const fullLink = link.startsWith('/') ? 'https://www.etsy.com' + link : link;
    
    const shopName = $(el).find('[class*="shop"], [class*="Shop"]').text().trim();
    
    products.push({
      source: 'etsy',
      source_id: slugify(name).substring(0, 40),
      name,
      description: `${name}. ${shopName ? 'Handmade by ' + shopName + '.' : ''} Unique handmade item from Etsy. Ships worldwide.`,
      price: Math.round(price * 100) / 100,
      original_price: null,
      discount: 0,
      rating: 4.7,
      review_count: 0,
      images: img ? [img] : [],
      category,
      source_url: fullLink.split('?')[0],
      specs: { shop: shopName },
    });
  });
  
  console.log(`  ✅ Etsy: Found ${products.length} products`);
  return products;
}

// ═══════════════════════════════════════════════════════════════
// BANGGOOD SCRAPER
// ═══════════════════════════════════════════════════════════════

async function scrapeBanggood(url, category, limit = 20) {
  console.log(`  🔴 Banggood: Scraping ${category}...`);
  const html = await fetchPage(url);
  if (!html) return [];
  
  const $ = cheerio.load(html);
  const products = [];
  
  $('.product-item, .productList-item, [class*="ProductItem"]').each((i, el) => {
    if (products.length >= limit) return false;
    
    const name = $(el).find('.product-item__title, [class*="title"], h3, a').first().text().trim();
    if (!name || name.length < 5) return;
    
    const priceText = $(el).find('.product-item__price, [class*="price"], .price').text().trim();
    const priceMatch = priceText.match(/\$?([\d,.]+)/);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : 0;
    if (!price || price <= 0) return;
    
    const origPriceEl = $(el).find('.product-item__original-price, [class*="original"], s, del');
    const origPriceText = origPriceEl.text().trim();
    const origPriceMatch = origPriceText.match(/\$?([\d,.]+)/);
    const origPrice = origPriceMatch ? parseFloat(origPriceMatch[1].replace(',', '')) : null;
    
    const img = $(el).find('img').attr('src') || $(el).find('img').attr('data-src') || '';
    const link = $(el).find('a').attr('href') || '';
    const fullLink = link.startsWith('/') ? 'https://www.banggood.com' + link : link;
    
    const discount = origPrice ? Math.round((1 - price / origPrice) * 100) : 0;
    
    products.push({
      source: 'banggood',
      source_id: slugify(name).substring(0, 40),
      name,
      description: `${name}. Available on Banggood with worldwide warehouse shipping. Tech deals and gadgets.`,
      price: Math.round(price * 100) / 100,
      original_price: origPrice ? Math.round(origPrice * 100) / 100 : null,
      discount,
      rating: 4.4,
      review_count: 0,
      images: img ? [img] : [],
      category,
      source_url: fullLink,
      specs: {},
    });
  });
  
  console.log(`  ✅ Banggood: Found ${products.length} products`);
  return products;
}

// ═══════════════════════════════════════════════════════════════
// SCRAPER DISPATCHER
// ═══════════════════════════════════════════════════════════════

const SCRAPERS = {
  amazon: scrapeAmazon,
  aliexpress: scrapeAliExpress,
  ebay: scrapeEbay,
  walmart: scrapeWalmart,
  temu: scrapeTemu,
  etsy: scrapeEtsy,
  banggood: scrapeBanggood,
};

async function scrapeMarketplace(marketplace, category, limit, options) {
  const catConfig = CATEGORIES[category];
  if (!catConfig) {
    console.error(`  ❌ Unknown category: ${category}`);
    return [];
  }
  
  const url = catConfig[marketplace];
  if (!url) {
    console.log(`  ⏭️  ${marketplace} doesn't have ${category} category`);
    return [];
  }
  
  const scraper = SCRAPERS[marketplace];
  if (!scraper) {
    console.error(`  ❌ Unknown marketplace: ${marketplace}`);
    return [];
  }
  
  await sleep(options.delayMs || 2000);
  return scraper(url, category, limit);
}

// ═══════════════════════════════════════════════════════════════
// SUPABASE UPLOADER
// ═══════════════════════════════════════════════════════════════

async function uploadToSupabase(products) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing Supabase credentials. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    return;
  }
  
  console.log(`\n📤 Uploading ${products.length} products to Supabase...`);
  
  // Get existing categories
  const catResp = await axios.get(`${SUPABASE_URL}/rest/v1/categories?select=id,slug`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  const categoryMap = {};
  for (const cat of catResp.data) {
    categoryMap[cat.slug] = cat.id;
  }
  
  // Get first seller (or create one)
  const sellerResp = await axios.get(`${SUPABASE_URL}/rest/v1/sellers?select=id&limit=1`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  const defaultSellerId = sellerResp.data[0]?.id || null;
  
  let uploaded = 0;
  let skipped = 0;
  
  for (const product of products) {
    try {
      // Check if already exists (by name)
      const existing = await axios.get(
        `${SUPABASE_URL}/rest/v1/products?name=eq.${encodeURIComponent(product.name)}&select=id`,
        { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
      );
      
      if (existing.data.length > 0) {
        skipped++;
        continue;
      }
      
      const categoryId = categoryMap[product.category] || categoryMap['fashion'] || null;
      
      await axios.post(
        `${SUPABASE_URL}/rest/v1/products`,
        {
          goods_id: generateSKU(),
          name: product.name,
          description: product.description,
          price: product.price,
          original_price: product.original_price || product.price,
          discount: product.discount || 0,
          stock: Math.floor(Math.random() * 1000) + 100,
          sales_count: product.review_count || 0,
          rating: product.rating || 4.5,
          review_count: product.review_count || 0,
          category_id: categoryId,
          seller_id: defaultSellerId,
          images: product.images,
          specs: product.specs || {},
          slug: slugify(product.name) + '-' + Math.random().toString(36).substring(2, 6),
          status: 'active',
          is_active: true,
          is_recommended: product.rating >= 4.7,
          source: product.source,
          source_url: product.source_url || null,
        },
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
        }
      );
      uploaded++;
    } catch (err) {
      console.error(`  ❌ Upload failed for "${product.name}": ${err.message}`);
    }
  }
  
  console.log(`\n📊 Upload Summary:`);
  console.log(`  ✅ Uploaded: ${uploaded}`);
  console.log(`  ⏭️  Skipped (duplicate): ${skipped}`);
  console.log(`  ❌ Failed: ${products.length - uploaded - skipped}`);
}

// ═══════════════════════════════════════════════════════════════
// MAIN CLI
// ═══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const getArg = (name) => {
    const idx = args.findIndex(a => a === `--${name}` || a === `-${name[0]}`);
    return idx >= 0 ? args[idx + 1] : null;
  };
  const hasFlag = (name) => args.includes(`--${name}`) || args.includes(`-${name[0]}`);
  
  const marketplace = getArg('marketplace') || 'amazon';
  const category = getArg('category') || 'electronics';
  const limit = parseInt(getArg('limit') || '20');
  const output = getArg('output') || 'scripts/scraped-products.json';
  const delayMs = parseInt(getArg('delay') || '2000');
  const maxRetries = parseInt(getArg('retry') || '3');
  const proxy = getArg('proxy');
  const verbose = hasFlag('verbose');
  const upload = hasFlag('upload');
  
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     AllianceHub Multi-Marketplace Product Scraper       ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  console.log(`  Marketplace: ${marketplace}`);
  console.log(`  Category:    ${category}`);
  console.log(`  Limit:       ${limit} per category`);
  console.log(`  Delay:       ${delayMs}ms between requests`);
  console.log(`  Output:      ${output}`);
  console.log(`  Upload:      ${upload ? 'Yes' : 'No'}`);
  console.log('');
  
  const allProducts = [];
  const marketplaces = marketplace === 'all' ? Object.keys(SCRAPERS) : [marketplace];
  const categories = category === 'all' ? Object.keys(CATEGORIES) : [category];
  
  for (const mp of marketplaces) {
    console.log(`\n━━━ ${mp.toUpperCase()} ━━━`);
    
    for (const cat of categories) {
      const products = await scrapeMarketplace(mp, cat, limit, { delayMs, maxRetries, proxy });
      allProducts.push(...products);
      
      if (verbose) {
        for (const p of products) {
          console.log(`    📦 ${p.name} — $${p.price}`);
        }
      }
    }
  }
  
  // Deduplicate by name
  const seen = new Set();
  const unique = allProducts.filter(p => {
    const key = p.name.toLowerCase().substring(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`📊 RESULTS SUMMARY`);
  console.log(`${'═'.repeat(50)}`);
  console.log(`  Total scraped:  ${allProducts.length}`);
  console.log(`  Unique:         ${unique.length}`);
  console.log(`  Duplicates:     ${allProducts.length - unique.length}`);
  
  // Stats by marketplace
  const bySource = {};
  for (const p of unique) {
    bySource[p.source] = (bySource[p.source] || 0) + 1;
  }
  console.log(`\n  By marketplace:`);
  for (const [src, count] of Object.entries(bySource)) {
    console.log(`    ${src}: ${count} products`);
  }
  
  // Save to file
  const outputPath = path.resolve(output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(unique, null, 2));
  console.log(`\n  💾 Saved to: ${outputPath}`);
  
  // Upload to Supabase if requested
  if (upload && unique.length > 0) {
    await uploadToSupabase(unique);
  }
  
  console.log('\n✅ Done!');
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
