/**
 * Product Scraper Service
 * Scrapes product data from e-commerce URLs
 */
import * as cheerio from 'cheerio';
import axios from 'axios';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

/**
 * Detect marketplace from URL
 */
export function detectMarketplace(url) {
  if (url.includes('amazon.')) return 'amazon';
  if (url.includes('aliexpress.')) return 'aliexpress';
  if (url.includes('ebay.')) return 'ebay';
  if (url.includes('walmart.')) return 'walmart';
  if (url.includes('target.')) return 'target';
  if (url.includes('bestbuy.')) return 'bestbuy';
  if (url.includes('shopee.')) return 'shopee';
  if (url.includes('lazada.')) return 'lazada';
  if (url.includes('tk-sasiastore.')) return 'tk-alliance';
  return 'generic';
}

/**
 * Scrape product from URL
 */
export async function scrapeProduct(url) {
  try {
    const { data: html } = await axios.get(url, { 
      headers: HEADERS, 
      timeout: 15000,
      maxRedirects: 5 
    });
    const $ = cheerio.load(html);
    const marketplace = detectMarketplace(url);
    
    // Extract common product data
    const product = {
      url,
      marketplace,
      name: extractName($, marketplace),
      price: extractPrice($, marketplace),
      originalPrice: extractOriginalPrice($, marketplace),
      currency: extractCurrency($, marketplace),
      description: extractDescription($, marketplace),
      images: extractImages($, marketplace, url),
      rating: extractRating($, marketplace),
      reviewCount: extractReviewCount($, marketplace),
      reviews: extractReviews($, marketplace),
      specs: extractSpecs($, marketplace),
      category: extractCategory($, marketplace),
      brand: extractBrand($, marketplace),
      availability: extractAvailability($, marketplace),
      seller: extractSeller($, marketplace),
      scrapedAt: new Date().toISOString(),
    };
    
    return { success: true, product };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function extractName($, mp) {
  const selectors = {
    amazon: '#productTitle, #title span',
    aliexpress: 'h1.product-title-text, .product-title',
    ebay: 'h1.x-item-title__mainTitle span',
    walmart: '[itemprop="name"] h1',
    generic: 'h1, [class*="product-name"], [class*="product-title"], [class*="ProductTitle"], meta[property="og:title"]',
  };
  const sel = selectors[mp] || selectors.generic;
  const el = $(sel).first();
  return el.attr('content') || el.text().trim() || '';
}

function extractPrice($, mp) {
  const selectors = {
    amazon: '.a-price .a-offscreen, #priceblock_ourprice, #priceblock_dealprice',
    aliexpress: '.product-price-value, .price-current',
    ebay: '.x-price-primary span',
    walmart: '[itemprop="price"]',
    generic: '[class*="price"]:not([class*="original"]), [itemprop="price"], meta[property="product:price:amount"]',
  };
  const sel = selectors[mp] || selectors.generic;
  const el = $(sel).first();
  const text = el.attr('content') || el.text().trim();
  const match = text.match(/[\d,.]+/);
  return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
}

function extractOriginalPrice($, mp) {
  const selectors = {
    amazon: '.a-text-price .a-offscreen',
    aliexpress: '.price-original',
    ebay: '.x-price-was span',
    generic: '[class*="original-price"], [class*="was-price"], [class*=" strikethrough"]',
  };
  const sel = selectors[mp] || selectors.generic;
  const text = $(sel).first().text().trim();
  const match = text.match(/[\d,.]+/);
  return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
}

function extractCurrency($, mp) {
  const meta = $('meta[property="product:price:currency"]').attr('content');
  if (meta) return meta;
  const priceText = $('[class*="price"]').first().text();
  if (priceText.includes('$')) return 'USD';
  if (priceText.includes('€')) return 'EUR';
  if (priceText.includes('£')) return 'GBP';
  if (priceText.includes('¥')) return 'CNY';
  return 'USD';
}

function extractDescription($, mp) {
  const selectors = {
    amazon: '#productDescription, #feature-bullets, [data-feature-name="productDescription"]',
    aliexpress: '.product-description',
    generic: '[class*="description"], [class*="product-detail"], [itemprop="description"], meta[property="og:description"]',
  };
  const sel = selectors[mp] || selectors.generic;
  const el = $(sel).first();
  return (el.attr('content') || el.text()).trim().substring(0, 2000);
}

function extractImages($, mp, baseUrl) {
  const images = new Set();
  
  // OG image
  $('meta[property="og:image"]').each((_, el) => {
    const src = $(el).attr('content');
    if (src) images.add(src);
  });
  
  // Product images
  const selectors = {
    amazon: '#altImages img, #main-image, #landingImage',
    aliexpress: '.images-view-item img, .product-image img',
    generic: '[class*="product-image"] img, [class*="gallery"] img, [class*="slider"] img',
  };
  const sel = selectors[mp] || selectors.generic;
  $(sel).each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');
    if (src && !src.includes('icon') && !src.includes('logo')) {
      images.add(src.startsWith('//') ? 'https:' + src : src);
    }
  });
  
  return [...images].slice(0, 10);
}

function extractRating($, mp) {
  const selectors = {
    amazon: '#acrPopover .a-icon-alt, [data-asin] .a-icon-alt',
    aliexpress: '.rating-value',
    generic: '[class*="rating"], [itemprop="ratingValue"], meta[property="og:rating"]',
  };
  const sel = selectors[mp] || selectors.generic;
  const text = $(sel).first().attr('content') || $(sel).first().text();
  const match = text.match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

function extractReviewCount($, mp) {
  const selectors = {
    amazon: '#acrCustomerReviewCount, #ratingsCount',
    aliexpress: '.review-count',
    generic: '[class*="review-count"], [class*="reviews-count"]',
  };
  const sel = selectors[mp] || selectors.generic;
  const text = $(sel).first().text();
  const match = text.match(/([\d,]+)/);
  return match ? parseInt(match[1].replace(/,/g, '')) : 0;
}

function extractReviews($, mp) {
  const reviews = [];
  const selectors = {
    amazon: '[data-hook="review"]',
    aliexpress: '.review-item',
    generic: '[class*="review-item"], [class*="comment-item"]',
  };
  const sel = selectors[mp] || selectors.generic;
  $(sel).slice(0, 10).each((_, el) => {
    const $el = $(el);
    reviews.push({
      author: $el.find('[class*="author"], [class*="user-name"], .a-profile-name').first().text().trim(),
      rating: (() => {
        const r = $el.find('[class*="rating"], .a-icon-alt').first().text();
        const m = r.match(/([\d.]+)/);
        return m ? parseFloat(m[1]) : 5;
      })(),
      text: $el.find('[class*="text"], [class*="content"], .review-text, [data-hook="review-body"]').first().text().trim().substring(0, 500),
      date: $el.find('[class*="date"], .review-date').first().text().trim(),
    });
  });
  return reviews;
}

function extractSpecs($, mp) {
  const specs = {};
  const selectors = {
    amazon: '#productDetails_techSpec_section_1 tr, #detailBullets_feature_div li',
    aliexpress: '.product-prop-item',
    generic: '[class*="spec"] tr, [class*="attribute"] li, [class*="feature"] li',
  };
  const sel = selectors[mp] || selectors.generic;
  $(sel).each((_, el) => {
    const $el = $(el);
    const key = $el.find('th, [class*="label"], [class*="name"]').first().text().trim();
    const val = $el.find('td, [class*="value"]').first().text().trim();
    if (key && val) specs[key] = val;
  });
  return specs;
}

function extractCategory($, mp) {
  const selectors = {
    amazon: '#wayfinding-breadcrumbs_feature_div a',
    aliexpress: '.breadcrumb a',
    generic: '[class*="breadcrumb"] a, [class*="category"] a',
  };
  const sel = selectors[mp] || selectors.generic;
  const cats = [];
  $(sel).each((_, el) => {
    const text = $(el).text().trim();
    if (text && text !== 'Home') cats.push(text);
  });
  return cats.join(' > ');
}

function extractBrand($, mp) {
  const selectors = {
    amazon: '#bylineInfo, .po-brand .po-break-word',
    aliexpress: '.brand-name',
    generic: '[class*="brand"], [itemprop="brand"]',
  };
  const sel = selectors[mp] || selectors.generic;
  return $(sel).first().text().trim() || '';
}

function extractAvailability($, mp) {
  const selectors = {
    amazon: '#availability span',
    generic: '[class*="availability"], [class*="stock"], [itemprop="availability"]',
  };
  const sel = selectors[mp] || selectors.generic;
  return $(sel).first().text().trim() || 'In Stock';
}

function extractSeller($, mp) {
  const selectors = {
    amazon: '#sellerProfileTriggerId, #merchant-info a',
    aliexpress: '.store-name',
    generic: '[class*="seller"], [class*="store-name"], [class*="vendor"]',
  };
  const sel = selectors[mp] || selectors.generic;
  return $(sel).first().text().trim() || '';
}
