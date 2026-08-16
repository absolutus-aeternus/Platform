const fs = require('fs');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const PRODUCTS = [
  { name: "Wireless Bluetooth Earbuds Pro", cat: "Electronics", price: 29.99, orig: 59.99, disc: 50, stock: 1250, rating: 4.6, reviews: 2847, specs: {"Connectivity":"Bluetooth 5.3","Driver":"8mm","Battery":"8h+22h","Waterproof":"IPX5","Weight":"5.2g","Charging":"USB-C","ANC":"Yes"}, desc: "Premium wireless earbuds with Active Noise Cancellation, 40dB noise reduction. Bluetooth 5.3 with ultra-low latency. 8mm dynamic drivers deliver Hi-Fi stereo sound. IPX5 waterproof. 30-hour total battery life with charging case." },
  { name: "Smart Watch Ultra 49mm", cat: "Electronics", price: 89.99, orig: 199.99, disc: 55, stock: 380, rating: 4.8, reviews: 5621, specs: {"Display":"1.9 OLED","Material":"Titanium","Water":"100m","Battery":"36h","Sensors":"SpO2 ECG HR","GPS":"Yes","Storage":"64GB"}, desc: "Advanced smartwatch with 1.9-inch always-on Retina LTPO OLED display. GPS positioning. Blood oxygen, heart rate, and ECG monitoring. 100m water resistance." },
  { name: "Portable Power Bank 20000mAh", cat: "Electronics", price: 34.99, orig: 54.99, disc: 36, stock: 890, rating: 4.5, reviews: 1893, specs: {"Capacity":"20000mAh","Output":"65W PD","Ports":"3","Display":"LED","Weight":"350g","Safety":"Multi-protection"}, desc: "High-capacity 20000mAh portable charger with 65W USB-C PD fast charging. Charge MacBook, iPhone, Samsung simultaneously. LED digital display." },
  { name: "4K Webcam with Ring Light", cat: "Electronics", price: 42.99, orig: 79.99, disc: 46, stock: 560, rating: 4.4, reviews: 923, specs: {"Resolution":"4K 30fps","FOV":"90 degrees","Light":"3 levels","Mic":"Dual","Focus":"Auto","Connection":"USB-C"}, desc: "Ultra HD 4K webcam with built-in adjustable ring light. Auto-focus with face tracking. Dual noise-canceling microphones." },
  { name: "Mechanical Keyboard RGB 75%", cat: "Electronics", price: 59.99, orig: 99.99, disc: 40, stock: 420, rating: 4.7, reviews: 1567, specs: {"Layout":"75% 84keys","Switches":"Hot-swap","Connection":"Tri-mode","Keycaps":"PBT","Battery":"4000mAh","RGB":"16.8M colors"}, desc: "Premium 75% mechanical keyboard with hot-swappable switches. Gasket-mounted structure. PBT double-shot keycaps. Triple mode connectivity." },
  { name: "USB-C Hub 7-in-1", cat: "Electronics", price: 24.99, orig: 44.99, disc: 44, stock: 1200, rating: 4.3, reviews: 892, specs: {"Ports":"7","HDMI":"4K 60Hz","USB":"3.0 x2","SD":"Yes","PD":"100W","Material":"Aluminum"}, desc: "7-in-1 USB-C hub with 4K HDMI, USB 3.0, SD card reader, and 100W Power Delivery. Compatible with MacBook, iPad, and all USB-C devices." },
  { name: "Noise Cancelling Headphones", cat: "Electronics", price: 49.99, orig: 89.99, disc: 44, stock: 670, rating: 4.5, reviews: 3421, specs: {"ANC":"40dB","Battery":"60h","Driver":"40mm","Bluetooth":"5.3","Weight":"250g","Codec":"AAC SBC"}, desc: "Over-ear headphones with advanced Active Noise Cancellation. 60-hour battery life. 40mm drivers for immersive sound. Comfortable memory foam earcups." },
  { name: "Wireless Charging Pad 15W", cat: "Electronics", price: 12.99, orig: 24.99, disc: 48, stock: 2500, rating: 4.4, reviews: 1567, specs: {"Output":"15W","Input":"USB-C","Compat":"Qi","LED":"Yes","Size":"100mm","Weight":"80g"}, desc: "Fast wireless charging pad with 15W output. Compatible with all Qi-enabled devices. LED indicator. Anti-slip surface. Includes USB-C cable." },
  { name: "Smart LED Light Bulb RGB", cat: "Electronics", price: 8.99, orig: 16.99, disc: 47, stock: 5000, rating: 4.3, reviews: 2345, specs: {"Wattage":"9W","Lumens":"800","Color":"RGB+White","Control":"App+Voice","WiFi":"2.4GHz","Life":"25000h"}, desc: "Smart LED bulb with 16 million colors and warm/cool white. Control via app or voice. Schedule and scene settings. Energy efficient." },
  { name: "Portable Bluetooth Speaker", cat: "Electronics", price: 19.99, orig: 39.99, disc: 50, stock: 1800, rating: 4.5, reviews: 4567, specs: {"Power":"10W","Battery":"12h","Waterproof":"IPX7","Bluetooth":"5.0","Weight":"300g","TF Card":"Yes"}, desc: "Portable Bluetooth speaker with 10W powerful sound. IPX7 waterproof for pool and beach. 12-hour playtime. TF card slot. Built-in microphone." },
  { name: "Fitness Tracker Band", cat: "Electronics", price: 15.99, orig: 29.99, disc: 47, stock: 3200, rating: 4.2, reviews: 1890, specs: {"Display":"1.1 AMOLED","Battery":"14days","Waterproof":"5ATM","Sensors":"HR SpO2","Sports":"100+","Weight":"23g"}, desc: "Slim fitness tracker with 1.1-inch AMOLED display. Heart rate, SpO2, sleep monitoring. 100+ sport modes. 14-day battery life. 5ATM waterproof." },
  { name: "Wireless Mouse Ergonomic", cat: "Electronics", price: 14.99, orig: 27.99, disc: 46, stock: 2100, rating: 4.4, reviews: 1234, specs: {"DPI":"1600","Buttons":"6","Battery":"18months","Connection":"2.4GHz+BT","Weight":"85g","Silent":"Yes"}, desc: "Ergonomic wireless mouse with silent clicks. 2.4GHz + Bluetooth dual connection. 1600 DPI. 18-month battery life. Compatible with all OS." },
  { name: "USB Microphone Condenser", cat: "Electronics", price: 29.99, orig: 49.99, disc: 40, stock: 780, rating: 4.6, reviews: 678, specs: {"Pattern":"Cardioid","Sample":"48kHz","Bit":"16bit","Connection":"USB-C","Gain":"Yes","Mute":"Yes"}, desc: "Professional USB condenser microphone for streaming, podcasting, and recording. Cardioid pattern reduces background noise. Plug and play." },
  { name: "Tablet Stand Adjustable", cat: "Electronics", price: 11.99, orig: 19.99, disc: 40, stock: 3500, rating: 4.5, reviews: 2345, specs: {"Compatible":"4-13 inch","Angle":"270 degrees","Material":"Aluminum","Weight":"180g","Foldable":"Yes","Anti-slip":"Yes"}, desc: "Adjustable tablet stand compatible with all tablets and phones. 270-degree rotation. Premium aluminum alloy. Foldable and portable." },
  { name: "HDMI Cable 4K 6ft 3-Pack", cat: "Electronics", price: 9.99, orig: 19.99, disc: 50, stock: 8000, rating: 4.6, reviews: 5678, specs: {"Resolution":"4K 60Hz","Length":"6ft","Version":"2.0","Pack":"3","Gold-plated":"Yes","Braided":"Yes"}, desc: "High-speed HDMI cable supporting 4K 60Hz. Gold-plated connectors for reliable signal. Nylon braided for durability. 3-pack value." },
  { name: "Men's Premium Cotton T-Shirt", cat: "Fashion", price: 12.99, orig: 24.99, disc: 48, stock: 3200, rating: 4.5, reviews: 8934, specs: {"Material":"100% Cotton","Weight":"220gsm","Fit":"Oversized","Sizes":"S-3XL","Colors":"12","Care":"Machine Wash"}, desc: "Premium 100% combed cotton oversized t-shirt. 220gsm heavyweight fabric. Pre-shrunk and enzyme washed for softness. Double-stitched seams." },
  { name: "Women's High-Waist Cargo Pants", cat: "Fashion", price: 28.99, orig: 49.99, disc: 42, stock: 1850, rating: 4.6, reviews: 3421, specs: {"Material":"97% Cotton","Fit":"High Waist","Pockets":"6","Sizes":"XS-XXL","Style":"Cargo"}, desc: "Trendy high-waist cargo pants with 6 pockets. Stretchy cotton-blend fabric. Wide leg design with adjustable ankle cuffs." },
  { name: "Classic Canvas Sneakers", cat: "Fashion", price: 19.99, orig: 39.99, disc: 50, stock: 2100, rating: 4.4, reviews: 6789, specs: {"Upper":"Canvas","Sole":"Rubber","Insole":"EVA","Sizes":"36-46","Colors":"15","Style":"Low-top"}, desc: "Timeless canvas sneakers with vulcanized rubber sole. Breathable cotton canvas upper. Padded collar and cushioned insole." },
  { name: "Denim Jacket Classic Fit", cat: "Fashion", price: 35.99, orig: 64.99, disc: 45, stock: 890, rating: 4.5, reviews: 2345, specs: {"Material":"100% Denim","Fit":"Classic","Closure":"Button","Pockets":"4","Wash":"Medium","Sizes":"S-XXL"}, desc: "Classic denim jacket with button closure. 4 pockets. Medium wash finish. Perfect for layering in all seasons." },
  { name: "Leather Belt Genuine", cat: "Fashion", price: 14.99, orig: 29.99, disc: 50, stock: 4500, rating: 4.6, reviews: 3456, specs: {"Material":"Genuine Leather","Width":"3.5cm","Buckle":"Auto","Sizes":"28-44","Color":"Black/Brown"}, desc: "Genuine leather belt with automatic buckle. 3.5cm width suitable for jeans and dress pants. Available in black and brown." },
  { name: "Sunglasses UV400 Polarized", cat: "Fashion", price: 9.99, orig: 19.99, disc: 50, stock: 6000, rating: 4.3, reviews: 4567, specs: {"Lens":"Polarized","UV":"UV400","Frame":"PC","Weight":"25g","Style":"Aviator"}, desc: "Polarized sunglasses with UV400 protection. Lightweight polycarbonate frame. Reduces glare for driving and outdoor activities." },
  { name: "Baseball Cap Adjustable", cat: "Fashion", price: 7.99, orig: 14.99, disc: 47, stock: 8000, rating: 4.4, reviews: 5678, specs: {"Material":"Cotton","Closure":"Snapback","Brim":"Curved","Sizes":"Adjustable","UV":"Yes"}, desc: "Classic baseball cap with adjustable snapback closure. Pre-curved brim. Cotton twill construction. UV protection for outdoor activities." },
  { name: "Running Shoes Lightweight", cat: "Fashion", price: 32.99, orig: 59.99, disc: 45, stock: 1500, rating: 4.5, reviews: 2890, specs: {"Upper":"Mesh","Sole":"EVA+Rubber","Weight":"220g","Sizes":"39-46","Cushion":"Yes","Breathable":"Yes"}, desc: "Lightweight running shoes with breathable mesh upper. EVA+rubber outsole for traction. Cushioned midsole for comfort. Perfect for daily runs." },
  { name: "Backpack Travel 40L", cat: "Fashion", price: 25.99, orig: 44.99, disc: 42, stock: 2300, rating: 4.4, reviews: 1890, specs: {"Capacity":"40L","Material":"Nylon","Laptop":"15.6 inch","Pockets":"8","Waterproof":"Yes","USB Port":"Yes"}, desc: "Large capacity travel backpack with USB charging port. Fits 15.6-inch laptop. Water-resistant nylon. 8 organized pockets. Perfect for travel and school." },
  { name: "Wallet RFID Blocking", cat: "Fashion", price: 11.99, orig: 22.99, disc: 48, stock: 5600, rating: 4.5, reviews: 3456, specs: {"Material":"PU Leather","Slots":"12","ID Window":"Yes","RFID":"Blocking","Size":"Bifold","Color":"5 options"}, desc: "RFID blocking wallet with 12 card slots. Genuine PU leather. ID window. Bifold design. Protects against electronic pickpocketing." },
  { name: "LED Desk Lamp Wireless Charger", cat: "Home & Living", price: 25.99, orig: 45.99, disc: 43, stock: 670, rating: 4.5, reviews: 2134, specs: {"Light":"LED 5 temps","Brightness":"10 levels","Charge":"15W wireless","Timer":"30/60min","Adjust":"360 degrees"}, desc: "Multi-functional LED desk lamp with built-in 15W wireless charger. 5 color temperatures and 10 brightness levels. Touch control." },
  { name: "Robot Vacuum Cleaner 4000Pa", cat: "Home & Living", price: 149.99, orig: 299.99, disc: 50, stock: 230, rating: 4.7, reviews: 4567, specs: {"Suction":"4000Pa","Nav":"LiDAR","Battery":"250min","Dustbin":"2.5L","Noise":"55dB","App":"Yes"}, desc: "Smart robot vacuum with 4000Pa strong suction. LiDAR navigation with room mapping. 2-in-1 vacuum and mopping. Self-emptying station." },
  { name: "Air Purifier HEPA H13", cat: "Home & Living", price: 59.99, orig: 99.99, disc: 40, stock: 450, rating: 4.6, reviews: 2345, specs: {"Filter":"H13 HEPA","CADR":"200m3/h","Room":"30m2","Noise":"24dB","Timer":"Yes","Auto":"Yes"}, desc: "HEPA H13 air purifier removes 99.97% of particles. Covers up to 30m2. Ultra-quiet 24dB sleep mode. Auto mode with air quality sensor." },
  { name: "Electric Kettle 1.7L", cat: "Home & Living", price: 19.99, orig: 34.99, disc: 43, stock: 1200, rating: 4.5, reviews: 3456, specs: {"Capacity":"1.7L","Power":"1500W","Material":"Stainless Steel","Safety":"Auto-off","Boil":"5min","BPA-Free":"Yes"}, desc: "Fast boiling electric kettle with 1500W power. 1.7L capacity. Stainless steel interior. Auto shut-off and boil-dry protection. BPA-free." },
  { name: "Memory Foam Pillow 2-Pack", cat: "Home & Living", price: 22.99, orig: 39.99, disc: 43, stock: 3400, rating: 4.4, reviews: 4567, specs: {"Material":"Memory Foam","Size":"60x40cm","Pack":"2","Cover":"Removable","Wash":"Machine","Height":"Adjustable"}, desc: "Premium memory foam pillows with adjustable height. Removable and washable bamboo cover. CertiPUR-US certified. Pack of 2." },
  { name: "Smart Plug WiFi 4-Pack", cat: "Home & Living", price: 16.99, orig: 29.99, disc: 43, stock: 5600, rating: 4.3, reviews: 2345, specs: {"WiFi":"2.4GHz","Max Load":"10A","Voice":"Alexa/Google","App":"Yes","Schedule":"Yes","Pack":"4"}, desc: "WiFi smart plug compatible with Alexa and Google Home. Control devices from your phone. Set schedules and timers. 4-pack value." },
  { name: "Bamboo Cutting Board Set", cat: "Home & Living", price: 14.99, orig: 24.99, disc: 40, stock: 2800, rating: 4.5, reviews: 1890, specs: {"Material":"Bamboo","Sizes":"3","Thickness":"1.5cm","Juice Groove":"Yes","Handle":"Yes","Eco":"Yes"}, desc: "Set of 3 bamboo cutting boards with juice groove. Eco-friendly and sustainable. Knife-friendly surface. Easy to clean and maintain." },
  { name: "Shower Head High Pressure", cat: "Home & Living", price: 12.99, orig: 22.99, disc: 43, stock: 4500, rating: 4.4, reviews: 3456, specs: {"Spray":"5 modes","Pressure":"High","Material":"ABS","Filter":"Yes","Install":"Easy","Size":"4 inch"}, desc: "High pressure shower head with 5 spray modes. Built-in water filter. Easy tool-free installation. Universal fit. Chrome finish." },
  { name: "LED Strip Lights 50ft", cat: "Home & Living", price: 11.99, orig: 19.99, disc: 40, stock: 6700, rating: 4.3, reviews: 5678, specs: {"Length":"50ft","LEDs":"300","Colors":"16M","Remote":"Yes","Music":"Sync","Timer":"Yes"}, desc: "50ft RGB LED strip lights with remote control. 16 million colors. Music sync mode. Timer function. Easy installation with adhesive backing." },
  { name: "Mattress Topper Queen", cat: "Home & Living", price: 34.99, orig: 59.99, disc: 42, stock: 1200, rating: 4.5, reviews: 2345, specs: {"Size":"Queen 60x80","Thickness":"3 inch","Material":"Memory Foam","Density":"3 lb","Cover":"Bamboo","Cert":"CertiPUR"}, desc: "3-inch memory foam mattress topper. Cooling gel-infused foam. Bamboo cover. CertiPUR-US certified. Transforms your sleep comfort." },
  { name: "Vitamin C Serum 30ml", cat: "Beauty", price: 16.99, orig: 34.99, disc: 51, stock: 1560, rating: 4.6, reviews: 7823, specs: {"Ingredient":"20% Vit C","Volume":"30ml","Skin":"All types","Free":"Paraben-free","pH":"3.5-4.0","Usage":"Daily"}, desc: "Advanced vitamin C serum with 20% L-Ascorbic Acid. Brightens skin, reduces dark spots. Contains Hyaluronic Acid for deep hydration." },
  { name: "Retinol Cream Anti-Aging", cat: "Beauty", price: 14.99, orig: 29.99, disc: 50, stock: 2300, rating: 4.5, reviews: 4567, specs: {"Ingredient":"Retinol 2.5%","Volume":"50ml","Skin":"All types","Anti-aging":"Yes","Night":"Yes","Cruelty-free":"Yes"}, desc: "Anti-aging retinol cream with 2.5% retinol. Reduces wrinkles and fine lines. Promotes collagen production. Night use recommended." },
  { name: "Hyaluronic Acid Moisturizer", cat: "Beauty", price: 12.99, orig: 24.99, disc: 48, stock: 3400, rating: 4.4, reviews: 3456, specs: {"Ingredient":"HA 2%","Volume":"60ml","Skin":"All types","Hydration":"72h","Texture":"Lightweight","SPF":"No"}, desc: "Intense hydrating moisturizer with 2% Hyaluronic Acid. 72-hour moisture lock. Lightweight, non-greasy formula. Suitable for all skin types." },
  { name: "Sunscreen SPF 50 PA++++", cat: "Beauty", price: 9.99, orig: 18.99, disc: 47, stock: 5600, rating: 4.5, reviews: 6789, specs: {"SPF":"50","PA":"++++","Volume":"50ml","Type":"Chemical","White Cast":"No","Waterproof":"Yes"}, desc: "Lightweight sunscreen with SPF 50 PA++++ protection. No white cast. Water and sweat resistant. Perfect for daily use under makeup." },
  { name: "Hair Growth Serum", cat: "Beauty", price: 19.99, orig: 39.99, disc: 50, stock: 1800, rating: 4.3, reviews: 2345, specs: {"Volume":"60ml","Ingredient":"Biotin+Caffeine","Hair":"All types","Results":"4 weeks","Cruelty-free":"Yes","Paraben-free":"Yes"}, desc: "Hair growth serum with biotin and caffeine. Stimulates hair follicles. Reduces hair fall. Visible results in 4 weeks." },
  { name: "Clay Face Mask Set", cat: "Beauty", price: 8.99, orig: 16.99, disc: 47, stock: 4500, rating: 4.4, reviews: 3456, specs: {"Types":"3 masks","Volume":"100g each","Skin":"All types","Ingredient":"Natural Clay","Cruelty-free":"Yes"}, desc: "Set of 3 clay face masks - charcoal, green tea, and turmeric. Deep cleansing and pore minimizing. Natural ingredients." },
  { name: "Lip Balm Set 6-Pack", cat: "Beauty", price: 6.99, orig: 12.99, disc: 46, stock: 8000, rating: 4.5, reviews: 5678, specs: {"Pack":"6","Flavors":"6","SPF":"15","Moisture":"8h","Natural":"Yes","Size":"4.5g each"}, desc: "6-pack moisturizing lip balm with SPF 15. Natural ingredients. 6 delicious flavors. 8-hour moisture. Perfect for dry lips." },
  { name: "Makeup Brush Set 12-Piece", cat: "Beauty", price: 11.99, orig: 22.99, disc: 48, stock: 3200, rating: 4.4, reviews: 2890, specs: {"Pieces":"12","Bristles":"Synthetic","Handle":"Wood","Case":"Included","Cruelty-free":"Yes","Use":"Face+Eyes"}, desc: "Professional 12-piece makeup brush set. Synthetic bristles. Wooden handles. Carrying case included. For face and eye makeup application." },
  { name: "Adjustable Dumbbell Set 5-25kg", cat: "Sports", price: 89.99, orig: 159.99, disc: 44, stock: 340, rating: 4.7, reviews: 1234, specs: {"Range":"5-25kg","Increments":"17","Handle":"Steel","Space":"80% saved","Pair":"Yes"}, desc: "Space-saving adjustable dumbbell set replacing 15 pairs. Quick-change weight selector dial. Anti-slip textured steel handle." },
  { name: "Yoga Mat 6mm Non-Slip", cat: "Sports", price: 14.99, orig: 27.99, disc: 46, stock: 4500, rating: 4.5, reviews: 5678, specs: {"Thickness":"6mm","Material":"TPE","Size":"183x61cm","Weight":"800g","Non-slip":"Yes","Carry Strap":"Yes"}, desc: "6mm thick yoga mat with non-slip surface. Eco-friendly TPE material. 183x61cm size. Includes carrying strap. Perfect for yoga and fitness." },
  { name: "Resistance Bands Set 5-Pack", cat: "Sports", price: 9.99, orig: 18.99, disc: 47, stock: 6700, rating: 4.4, reviews: 4567, specs: {"Bands":"5","Resistance":"10-50lbs","Material":"Latex","Length":"30cm","Bag":"Included","Guide":"Yes"}, desc: "Set of 5 resistance bands with different resistance levels (10-50lbs). Natural latex. Portable carrying bag. Exercise guide included." },
  { name: "Jump Rope Speed", cat: "Sports", price: 7.99, orig: 14.99, disc: 47, stock: 8900, rating: 4.3, reviews: 3456, specs: {"Length":"Adjustable","Handle":"Foam","Rope":"Steel","Bearings":"2","Weight":"150g","Counter":"Yes"}, desc: "Speed jump rope with ball bearings for smooth rotation. Foam grip handles. Adjustable steel wire rope. Built-in counter." },
  { name: "Foam Roller 18-inch", cat: "Sports", price: 12.99, orig: 22.99, disc: 43, stock: 3400, rating: 4.5, reviews: 2345, specs: {"Size":"18 inch","Density":"Medium","Material":"EVA","Texture":"Trigger Point","Weight":"300g","Use":"Recovery"}, desc: "High-density EVA foam roller for muscle recovery. Trigger point texture for deep tissue massage. 18-inch length for full body use." },
  { name: "Pull-Up Bar Doorway", cat: "Sports", price: 19.99, orig: 34.99, disc: 43, stock: 2100, rating: 4.4, reviews: 1890, specs: {"Fit":"24-32 inch","Max Load":"300lbs","Grip":"Foam","Mount":"No screws","Exercises":"6+","Steel":"Yes"}, desc: "Doorway pull-up bar with no-screw installation. Supports up to 300lbs. Foam grip comfort. Multiple grip positions for 6+ exercises." },
  { name: "Ab Roller Wheel", cat: "Sports", price: 8.99, orig: 16.99, disc: 47, stock: 5600, rating: 4.3, reviews: 2345, specs: {"Wheel":"Dual","Handle":"Foam","Knee Pad":"Included","Max Load":"300lbs","Width":"7 inch","Material":"Steel+Rubber"}, desc: "Dual wheel ab roller for core strengthening. Foam comfort grips. Includes knee pad. Supports up to 300lbs. Steel core for durability." },
  { name: "Kettlebell Adjustable 5-15kg", cat: "Sports", price: 34.99, orig: 59.99, disc: 42, stock: 890, rating: 4.6, reviews: 1234, specs: {"Range":"5-15kg","Increments":"3","Handle":"Steel","Base":"Flat","Weight Plates":"Included"}, desc: "Adjustable kettlebell from 5-15kg. 3 weight increments. Textured steel handle. Flat base for easy storage. Includes weight plates." },
  { name: "Automatic Pet Feeder 6L Camera", cat: "Pet Supplies", price: 49.99, orig: 89.99, disc: 44, stock: 450, rating: 4.5, reviews: 892, specs: {"Capacity":"6L","Camera":"1080P","Meals":"6/day","Portions":"1-39","App":"Yes","Power":"USB-C+Battery"}, desc: "Smart automatic pet feeder with 1080P HD camera and two-way audio. 6L capacity. App control for scheduling and monitoring." },
  { name: "Pet Water Fountain 2L", cat: "Pet Supplies", price: 22.99, orig: 39.99, disc: 43, stock: 1200, rating: 4.4, reviews: 1567, specs: {"Capacity":"2L","Filter":"3-stage","Noise":"Ultra-quiet","Material":"Stainless Steel","Modes":"3","LED":"Yes"}, desc: "Stainless steel pet water fountain with 3 filtration modes. Ultra-quiet pump. 2L capacity. LED night light. Encourages pets to drink more." },
  { name: "Dog Collar GPS Tracker", cat: "Pet Supplies", price: 29.99, orig: 49.99, disc: 40, stock: 670, rating: 4.3, reviews: 890, specs: {"GPS":"Real-time","Battery":"7 days","Waterproof":"IP67","Alert":"Yes","App":"Yes","Weight":"30g"}, desc: "GPS pet tracker collar with real-time location tracking. 7-day battery. IP67 waterproof. Geofence alerts. Works with iOS and Android." },
  { name: "Cat Tree 5-Level", cat: "Pet Supplies", price: 44.99, orig: 79.99, disc: 44, stock: 340, rating: 4.5, reviews: 1234, specs: {"Levels":"5","Height":"150cm","Material":"Particle Board","Sisal":"Yes","Hammock":"Yes","Condos":"2"}, desc: "5-level cat tree with sisal scratching posts. Includes hammock and 2 condos. Sturdy particle board construction. Keeps cats entertained." },
  { name: "Pet Carrier Airline Approved", cat: "Pet Supplies", price: 19.99, orig: 34.99, disc: 43, stock: 2300, rating: 4.4, reviews: 1890, specs: {"Size":"44x28x28cm","Weight":"1.5kg","Material":"Oxford","Airline":"Yes","Mesh":"3 sides","Foldable":"Yes"}, desc: "Airline-approved pet carrier for small dogs and cats. 3 mesh windows for ventilation. Foldable design. Padded shoulder strap." },
  { name: "Building Blocks 1000pcs", cat: "Toys & Games", price: 19.99, orig: 34.99, disc: 43, stock: 3400, rating: 4.5, reviews: 4567, specs: {"Pieces":"1000","Age":"6+","Material":"ABS","Storage":"Box","Compatible":"Yes","Non-toxic":"Yes"}, desc: "1000-piece building blocks set compatible with major brands. Non-toxic ABS plastic. Storage box included. Endless creative possibilities." },
  { name: "RC Car 4WD Off-Road", cat: "Toys & Games", price: 29.99, orig: 49.99, disc: 40, stock: 1200, rating: 4.4, reviews: 2345, specs: {"Drive":"4WD","Speed":"45km/h","Battery":"2x 1500mAh","Range":"100m","Scale":"1:16","Suspension":"Independent"}, desc: "High-speed 4WD remote control car. 45km/h top speed. Dual batteries for 40min playtime. Independent suspension for off-road." },
  { name: "Puzzle 1000 Pieces", cat: "Toys & Games", price: 9.99, orig: 18.99, disc: 47, stock: 5600, rating: 4.5, reviews: 3456, specs: {"Pieces":"1000","Size":"70x50cm","Material":"Cardboard","Image":"HD","Poster":"Included"}, desc: "1000-piece jigsaw puzzle with HD image. Premium cardboard. 70x50cm finished size. Reference poster included. Perfect for family time." },
  { name: "Drone with 4K Camera", cat: "Toys & Games", price: 59.99, orig: 99.99, disc: 40, stock: 450, rating: 4.3, reviews: 1234, specs: {"Camera":"4K","Flight":"25min","Range":"500m","GPS":"Yes","Follow":"Yes","Foldable":"Yes"}, desc: "Foldable drone with 4K camera. GPS return home. Follow me mode. 25-minute flight time. 500m control range. Perfect for aerial photography." },
  { name: "Board Game Strategy", cat: "Toys & Games", price: 24.99, orig: 39.99, disc: 38, stock: 2300, rating: 4.7, reviews: 2890, specs: {"Players":"2-6","Age":"10+","Time":"60-90min","Type":"Strategy","Language":"EN"}, desc: "Award-winning strategy board game for 2-6 players. 60-90 minute gameplay. Perfect for game night. Ages 10 and up." },
  { name: "Atomic Habits by James Clear", cat: "Books", price: 11.99, orig: 16.99, disc: 30, stock: 8900, rating: 4.8, reviews: 89012, specs: {"Pages":"320","Format":"Paperback","Language":"EN","Bestseller":"NYT #1","Rating":"4.8"}, desc: "The #1 New York Times bestseller. An easy and proven way to build good habits and break bad ones. Over 15 million copies sold." },
  { name: "The Psychology of Money", cat: "Books", price: 13.99, orig: 18.99, disc: 26, stock: 6700, rating: 4.7, reviews: 45678, specs: {"Pages":"256","Format":"Paperback","Language":"EN","Topic":"Finance","Rating":"4.7"}, desc: "Timeless lessons on wealth, greed, and happiness. Over 4 million copies sold. A must-read for anyone interested in personal finance." },
  { name: "Rich Dad Poor Dad", cat: "Books", price: 9.99, orig: 14.99, disc: 33, stock: 12000, rating: 4.6, reviews: 67890, specs: {"Pages":"336","Format":"Paperback","Language":"EN","Topic":"Finance","Rating":"4.6"}, desc: "What the rich teach their kids about money. The #1 personal finance book of all time. Over 40 million copies sold worldwide." },
  { name: "The 7 Habits of Highly Effective People", cat: "Books", price: 10.99, orig: 15.99, disc: 31, stock: 7800, rating: 4.6, reviews: 34567, specs: {"Pages":"432","Format":"Paperback","Language":"EN","Topic":"Self-help","Rating":"4.6"}, desc: "The classic guide to personal and professional effectiveness. Over 40 million copies sold. A timeless masterpiece." },
  { name: "Thinking Fast and Slow", cat: "Books", price: 12.99, orig: 17.99, disc: 28, stock: 5600, rating: 4.5, reviews: 23456, specs: {"Pages":"499","Format":"Paperback","Language":"EN","Topic":"Psychology","Rating":"4.5"}, desc: "Nobel laureate Daniel Kahneman takes us on a tour of the mind. A groundbreaking tour of the two systems that drive the way we think." },
];

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 80);
}

async function main() {
  console.log('===================================================');
  console.log('ALLIANCEHUB PRODUCT GENERATOR');
  console.log('===================================================');
  console.log('Generating ' + PRODUCTS.length + ' products...');
  
  if (!SUPABASE_KEY) {
    console.error('ERROR: VITE_SUPABASE_ANON_KEY not set');
    process.exit(1);
  }
  
  let inserted = 0;
  let errors = 0;
  
  for (const product of PRODUCTS) {
    const slug = slugify(product.name);
    
    try {
      const body = JSON.stringify({
        name: product.name,
        description: product.desc,
        price: product.price,
        original_price: product.orig,
        discount: product.disc,
        stock: product.stock,
        rating: product.rating,
        review_count: product.reviews,
        specs: product.specs,
        images: [
          'https://picsum.photos/seed/' + slug + '1/600/600',
          'https://picsum.photos/seed/' + slug + '2/600/600',
          'https://picsum.photos/seed/' + slug + '3/600/600',
          'https://picsum.photos/seed/' + slug + '4/600/600',
          'https://picsum.photos/seed/' + slug + '5/600/600',
        ],
        slug: slug,
        status: 'active',
        is_recommended: Math.random() > 0.6,
        sales_count: Math.floor(Math.random() * 5000 + 100),
        goods_id: 'AH-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      });
      
      const response = await fetch(SUPABASE_URL + '/rest/v1/products', {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: body,
      });
      
      if (response.ok) {
        inserted++;
        console.log('  OK: ' + product.name);
      } else {
        const errText = await response.text();
        errors++;
        console.log('  ERR: ' + product.name + ' - HTTP ' + response.status);
      }
    } catch (error) {
      errors++;
      console.log('  ERR: ' + product.name + ' - ' + error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log('\n===================================================');
  console.log('RESULTS');
  console.log('Total: ' + PRODUCTS.length);
  console.log('Inserted: ' + inserted);
  console.log('Errors: ' + errors);
  console.log('===================================================');
}

main().catch(console.error);
