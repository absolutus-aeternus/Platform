// Amazon Product Scraper for AllianceHub
// Scrapes real product data from Amazon category pages

const categories = [
  { slug: 'electronics', name: 'Electronics', amazonUrl: 'https://www.amazon.com/s?k=electronics+best+sellers&ref=nb_sb_noss' },
  { slug: 'fashion', name: 'Fashion', amazonUrl: 'https://www.amazon.com/s?k=womens+fashion+best+sellers' },
  { slug: 'home-living', name: 'Home & Living', amazonUrl: 'https://www.amazon.com/s?k=home+living+essentials' },
  { slug: 'beauty', name: 'Beauty', amazonUrl: 'https://www.amazon.com/s?k=beauty+best+sellers' },
  { slug: 'sports', name: 'Sports', amazonUrl: 'https://www.amazon.com/s?k=sports+fitness+equipment' },
  { slug: 'toys-games', name: 'Toys & Games', amazonUrl: 'https://www.amazon.com/s?k=toys+games+best+sellers' },
  { slug: 'automotive', name: 'Automotive', amazonUrl: 'https://www.amazon.com/s?k=automotive+accessories' },
  { slug: 'health', name: 'Health', amazonUrl: 'https://www.amazon.com/s?k=health+supplements' },
  { slug: 'books', name: 'Books', amazonUrl: 'https://www.amazon.com/s?k=best+selling+books' },
  { slug: 'jewelry', name: 'Jewelry', amazonUrl: 'https://www.amazon.com/s?k=jewelry+best+sellers' },
  { slug: 'bags', name: 'Bags', amazonUrl: 'https://www.amazon.com/s?k=bags+best+sellers' },
  { slug: 'pet-supplies', name: 'Pet Supplies', amazonUrl: 'https://www.amazon.com/s?k=pet+supplies' },
];

const sellers = [
  { store_name: 'Equatorial Market', category: 'electronics' },
  { store_name: 'Archipelago Store', category: 'electronics' },
  { store_name: 'Apex Tropics', category: 'electronics' },
  { store_name: 'Pristine Equator', category: 'electronics' },
  { store_name: 'Horizon Niche', category: 'fashion' },
  { store_name: 'Loom & Leaf', category: 'fashion' },
  { store_name: 'Vivid Archipelago', category: 'fashion' },
  { store_name: 'Meridian Home', category: 'home-living' },
  { store_name: 'Hearth & Hull', category: 'home-living' },
  { store_name: 'Tropical Living', category: 'home-living' },
  { store_name: 'Zenith Tropics', category: 'beauty' },
  { store_name: 'Java Aroma', category: 'beauty' },
  { store_name: 'Bloom & Basin', category: 'beauty' },
  { store_name: 'Urban Tropics', category: 'sports' },
  { store_name: 'Canopy & Co', category: 'sports' },
  { store_name: 'Solstice Shop', category: 'sports' },
  { store_name: 'Oasis Supply', category: 'toys-games' },
  { store_name: 'Equinox Finds', category: 'toys-games' },
  { store_name: 'Delta Traders', category: 'automotive' },
  { store_name: 'Island Forge', category: 'automotive' },
  { store_name: 'Noble Spice', category: 'health' },
  { store_name: 'Tropical Harvest', category: 'health' },
  { store_name: 'Spice Route', category: 'books' },
  { store_name: 'Kiln & Kettle', category: 'jewelry' },
  { store_name: 'Craft & Current', category: 'jewelry' },
  { store_name: 'Emerald Bay Goods', category: 'bags' },
  { store_name: 'Coastal Studio', category: 'pet-supplies' },
];

console.log(JSON.stringify({ categories, sellers }, null, 2));
