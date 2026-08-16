const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

// Read from environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY env var");
  process.exit(1);
}

const CATEGORIES = [
  { name: "Electronics", url: "https://www.amazon.com/s?k=electronics&ref=nb_sb_noss", slug: "electronics" },
  { name: "Fashion", url: "https://www.amazon.com/s?k=fashion+clothing&ref=nb_sb_noss", slug: "fashion" },
  { name: "Home & Living", url: "https://www.amazon.com/s?k=home+living&ref=nb_sb_noss", slug: "home-living" },
  { name: "Beauty", url: "https://www.amazon.com/s?k=beauty+products&ref=nb_sb_noss", slug: "beauty" },
  { name: "Sports", url: "https://www.amazon.com/s?k=sports+fitness&ref=nb_sb_noss", slug: "sports" },
  { name: "Pet Supplies", url: "https://www.amazon.com/s?k=pet+supplies&ref=nb_sb_noss", slug: "pet-supplies" },
  { name: "Toys & Games", url: "https://www.amazon.com/s?k=toys+games&ref=nb_sb_noss", slug: "toys-games" },
  { name: "Books", url: "https://www.amazon.com/s?k=books+bestseller&ref=nb_sb_noss", slug: "books" },
  { name: "Automotive", url: "https://www.amazon.com/s?k=automotive+parts&ref=nb_sb_noss", slug: "automotive" },
  { name: "Garden & Outdoor", url: "https://www.amazon.com/s?k=garden+outdoor&ref=nb_sb_noss", slug: "garden-outdoor" },
];

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

async function scrapeAmazon(url) {
  try {
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(data);
    const products = [];
    $(".s-result-item[data-asin]").each((i, el) => {
      const asin = $(el).attr("data-asin");
      if (!asin || asin.length < 5) return;
      const name = $(el).find("h2 a span").text().trim();
      const priceWhole = $(el).find(".a-price-whole").text().trim();
      const price = parseFloat(priceWhole.replace(/[^0-9.]/g, ""));
      const rating = $(el).find(".a-icon-alt").text().trim();
      const img = $(el).find("img.s-image").attr("src") || "";
      if (name && price > 0) {
        products.push({ asin, name, price, rating, img, category: "" });
      }
    });
    return products;
  } catch (e) {
    console.warn("Scrape error:", e.message);
    return [];
  }
}

async function main() {
  console.log("Starting Amazon scraper...");
  for (const cat of CATEGORIES) {
    console.log(`Scraping ${cat.name}...`);
    const products = await scrapeAmazon(cat.url);
    products.forEach(p => p.category = cat.slug);
    console.log(`  Found ${products.length} products`);
  }
  console.log("Done.");
}

main().catch(console.error);
