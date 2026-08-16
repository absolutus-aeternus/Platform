const fs = require('fs');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://cfzmdvymqqnrzrytcrie.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

// ═══════════════════════════════════════════════════
// 31 CATEGORIES WITH PRODUCT TEMPLATES
// ═══════════════════════════════════════════════════

const CATEGORIES = {
  "Electronics": {
    basePrice: 25, priceRange: 200,
    products: [
      "Wireless Bluetooth Earbuds", "Smart Watch", "Portable Power Bank", "4K Webcam", "Mechanical Keyboard",
      "USB-C Hub 7-in-1", "Noise Cancelling Headphones", "Wireless Charging Pad", "Smart LED Bulb", "Bluetooth Speaker",
      "Fitness Tracker", "Wireless Mouse", "USB Microphone", "Tablet Stand", "HDMI Cable",
      "Gaming Headset", "External SSD 1TB", "Smart Home Hub", "Wireless Router", "Digital Drawing Tablet",
      "Mini Projector", "Action Camera", "Drone with Camera", "Smart Doorbell", "Security Camera System",
      "Electric Scooter", "Portable Monitor", "Smart Thermostat", "Robot Vacuum", "Air Purifier Smart",
      "Smart Lock", "WiFi Extender", "USB Flash Drive 256GB", "Bluetooth Car Adapter", "Smart Scale",
      "Electric Toothbrush Smart", "Smart Mirror", "Digital Photo Frame", "Portable Printer", "Smart Plug Set",
      "Wireless Earbuds Sports", "Smart Glasses", "E-Reader", "Portable Charger Solar", "Smart Water Bottle",
      "Bluetooth Keyboard Foldable", "Smart Ring", "Wireless Presenter", "Smart Smoke Detector", "Smart Leak Sensor"
    ],
    specs: ["Connectivity", "Battery Life", "Weight", "Waterproof Rating", "Warranty", "Compatibility", "Material", "Color"]
  },
  "Fashion": {
    basePrice: 12, priceRange: 80,
    products: [
      "Cotton T-Shirt", "Denim Jeans", "Sneakers", "Leather Belt", "Baseball Cap",
      "Running Shoes", "Backpack", "Wallet", "Sunglasses", "Hoodie",
      "Cargo Pants", "Polo Shirt", "Dress Shirt", "Chino Pants", "Blazer",
      "Winter Jacket", "Rain Coat", "Swim Trunks", "Sandals", "Loafers",
      "Scarf", "Gloves", "Beanie", "Tie Set", "Cufflinks",
      "Socks Pack", "Underwear Set", "Pajama Set", "Robe", "Workout Shorts",
      "Sports Bra", "Yoga Pants", "Track Jacket", "Windbreaker", "Vest",
      "Cardigan", "Sweater", "Tank Top", "Crop Top", "Maxi Dress",
      "Midi Skirt", "Jumpsuit", "Romper", "Kimono", "Poncho",
      "Overalls", "Joggers", "Compression Shirt", "Puffer Jacket", "Trench Coat"
    ],
    specs: ["Material", "Fit", "Sizes Available", "Care Instructions", "Season", "Style", "Closure Type", "Origin"]
  },
  "Home & Living": {
    basePrice: 15, priceRange: 150,
    products: [
      "LED Desk Lamp", "Memory Foam Pillow", "Bamboo Cutting Board", "Smart Plug", "Shower Head",
      "Bed Sheet Set", "Bath Towel Set", "Kitchen Knife Set", "Storage Organizer", "Wall Clock",
      "Picture Frame Set", "Scented Candle", "Plant Pot Set", "Throw Blanket", "Cushion Cover Set",
      "Table Runner", "Coaster Set", "Bookshelf", "Floating Shelf", "Shoe Rack",
      "Laundry Basket", "Trash Can Sensor", "Spice Rack", "Utensil Holder", "Dish Drying Rack",
      "Bathroom Mirror LED", "Toilet Brush Set", "Soap Dispenser", "Bath Mat", "Shower Curtain",
      "Window Curtain", "Blackout Blinds", "Carpet Runner", "Door Mat", "Key Holder",
      "Wall Hook Set", "Cable Management Box", "Desk Organizer", "Pen Holder", "Magazine Rack",
      "Wine Rack", "Fruit Basket", "Bread Box", "Paper Towel Holder", "Napkin Holder",
      "Trivet Set", "Pot Holder Set", "Apron", "Oven Mitt Set", "Timer Kitchen"
    ],
    specs: ["Material", "Dimensions", "Weight", "Color", "Care", "Warranty", "Installation", "Capacity"]
  },
  "Beauty": {
    basePrice: 8, priceRange: 60,
    products: [
      "Vitamin C Serum", "Retinol Cream", "Hyaluronic Acid Moisturizer", "Sunscreen SPF 50", "Hair Growth Serum",
      "Clay Face Mask", "Lip Balm Set", "Makeup Brush Set", "Foundation", "Concealer",
      "Mascara", "Eyeliner", "Eyeshadow Palette", "Lipstick Set", "Blush",
      "Highlighter", "Setting Spray", "Primer", "BB Cream", "CC Cream",
      "Face Wash", "Toner", "Essence", "Eye Cream", "Neck Cream",
      "Face Oil", "Sheet Mask Set", "Exfoliating Scrub", "Cleansing Balm", "Micellar Water",
      "Hair Mask", "Hair Oil", "Dry Shampoo", "Heat Protectant", "Hair Serum",
      "Nail Polish Set", "Nail Care Kit", "Cuticle Oil", "Hand Cream", "Body Lotion",
      "Body Butter", "Body Scrub", "Bath Bombs Set", "Perume", "Deodorant",
      "Teeth Whitening Kit", "Facial Roller", "Gua Sha", "LED Face Mask", "Derma Roller"
    ],
    specs: ["Key Ingredient", "Volume", "Skin Type", "Benefits", "Free From", "pH Level", "Texture", "Usage"]
  },
  "Sports": {
    basePrice: 10, priceRange: 120,
    products: [
      "Adjustable Dumbbell Set", "Yoga Mat", "Resistance Bands", "Jump Rope", "Foam Roller",
      "Pull-Up Bar", "Ab Roller", "Kettlebell", "Exercise Ball", "Push-Up Bars",
      "Hand Grip Strengthener", "Ankle Weights", "Wrist Wraps", "Lifting Belt", "Gym Gloves",
      "Speed Bag", "Boxing Gloves", "Mouthguard", "Shin Guards", "Knee Sleeves",
      "Elbow Sleeves", "Compression Socks", "Sports Water Bottle", "Gym Bag", "Yoga Block",
      "Yoga Strap", "Pilates Ring", "Balance Board", "Agility Ladder", "Cones Set",
      "Battle Ropes", "Medicine Ball", "Slam Ball", "TRX Suspension Trainer", "Resistance Tube Set",
      "Kettlebell Set", "Barbell Set", "Weight Plates", "Bench Press", "Squat Rack",
      "Rowing Machine", "Exercise Bike", "Treadmill Mat", "Jump Box", "Plyo Box",
      "Climbing Rope", "Gymnastics Rings", "Parallettes", "Weighted Vest", "Sled Push"
    ],
    specs: ["Material", "Weight Range", "Dimensions", "Max Load", "Adjustable", "Warranty", "Level", "Includes"]
  },
  "Pet Supplies": {
    basePrice: 8, priceRange: 80,
    products: [
      "Automatic Pet Feeder", "Pet Water Fountain", "GPS Tracker Collar", "Cat Tree", "Pet Carrier",
      "Dog Bed", "Cat Bed", "Pet Gate", "Dog Crate", "Cat Litter Box",
      "Litter Mat", "Poop Bag Dispenser", "Retractable Leash", "Harness Set", "Collar LED",
      "Pet Camera", "Automatic Ball Launcher", "Cat Wand Toy", "Dog Chew Toy", "Puzzle Feeder",
      "Pet Grooming Kit", "Nail Clipper", "Deshedding Tool", "Flea Comb", "Pet Shampoo",
      "Pet Conditioner", "Ear Cleaner", "Dental Chews", "Joint Supplement", "Probiotic Supplement",
      "Pet Stroller", "Car Seat Cover", "Pet Ramp", "ID Tag Personalized", "Bandana Set",
      "Pet Costume", "Rain Coat Dog", "Booties Dog", "Cooling Mat", "Heating Pad Pet",
      "Bird Cage", "Fish Tank", "Aquarium Filter", "Reptile Lamp", "Hamster Wheel",
      "Guinea Pig Hideout", "Rabbit Hutch", "Pet Fountain Cat", "Slow Feeder Bowl", "Elevated Bowl"
    ],
    specs: ["Material", "Size", "Suitable For", "Capacity", "Power Source", "Features", "Easy Clean", "Warranty"]
  },
  "Toys & Games": {
    basePrice: 8, priceRange: 60,
    products: [
      "Building Blocks 1000pcs", "RC Car", "Puzzle 1000 Pieces", "Board Game", "Drone",
      "Action Figure Set", "Dollhouse", "Train Set", "Science Kit", "Art Set",
      "LEGO Set", "Magnetic Tiles", "Play Dough Set", "Remote Control Helicopter", "Slot Car Race Track",
      "Card Game Set", "Chess Set", "Checker Set", "Backgammon Set", "Dominoes Set",
      "Jenga Giant", "Monopoly Board Game", "Scrabble", "Clue Board Game", "Risk Board Game",
      "Water Gun Set", "Nerf Blaster", "Kite", "Frisbee", "Ball Set",
      "Bubble Machine", "Sandbox Toys", "Swing Set", "Slide", "Trampoline",
      "Basketball Hoop", "Soccer Goal", "Tee Ball Set", "Badminton Set", "Volleyball Net",
      "Stuffed Animal Set", "Plush Toy", "Puppet Set", "Dress Up Costume", "Play Kitchen",
      "Tool Set Toy", "Doctor Kit", "Cash Register Toy", "Telescope Kids", "Binoculars Kids"
    ],
    specs: ["Age Range", "Material", "Pieces Count", "Battery Required", "Safety Certified", "Educational", "Indoor/Outdoor", "Dimensions"]
  },
  "Books": {
    basePrice: 6, priceRange: 25,
    products: [
      "Atomic Habits", "Psychology of Money", "Rich Dad Poor Dad", "7 Habits", "Thinking Fast and Slow",
      "The Alchemist", "Sapiens", "Educated", "Becoming", "Where the Crawdads Sing",
      "The Midnight Library", "Project Hail Mary", "Dune", "1984", "To Kill a Mockingbird",
      "The Great Gatsby", "Harry Potter Set", "Lord of the Rings Set", "Game of Thrones", "The Hobbit",
      "Clean Code", "Design Patterns", "Pragmatic Programmer", "Mythical Man Month", "Refactoring",
      "JavaScript Good Parts", "Python Crash Course", "Eloquent SQL", "Linux Command Line", "Git Handbook",
      "Meditations", "Man Search for Meaning", "Power of Habit", "Lean Startup", "Zero to One",
      "Innovators Dilemma", "Good to Great", "Built to Last", "Start with Why", "Leaders Eat Last",
      "Emotional Intelligence", "Outliers", "Blink", "Tipping Point", "David and Goliath",
      "Cookbook Mediterranean", "Cookbook Asian", "Baking Book", "Smoothie Book", "Meal Prep Guide"
    ],
    specs: ["Format", "Pages", "Language", "Publisher", "ISBN", "Genre", "Rating", "Bestseller Rank"]
  },
  "Automotive": {
    basePrice: 10, priceRange: 100,
    products: [
      "Car Phone Mount", "Dash Cam", "Car Charger USB", "Seat Cover Set", "Steering Wheel Cover",
      "Car Floor Mats", "Trunk Organizer", "Car Air Freshener", "Windshield Sun Shade", "Car Vacuum",
      "Jump Starter", "Tire Inflator", "Car Jack", "Wheel Wrench", "Emergency Kit",
      "First Aid Kit Car", "Fire Extinguisher Car", "Car Battery Charger", "OBD2 Scanner", "Car Polish",
      "Car Wax", "Microfiber Cloth Set", "Sponge Set Car", "Wheel Cleaner", "Tire Shine",
      "Glass Cleaner Car", "Interior Cleaner", "Leather Conditioner", "Car Cover", "Roof Rack",
      "Bike Rack Car", "Ski Rack", "Cargo Box", "Tow Hitch", "Trailer Light Kit",
      "LED Headlight Bulbs", "Fog Light Kit", "Tail Light Assembly", "Side Mirror Cover", "Door Handle Cover",
      "License Plate Frame", "Car Decal Set", "Antenna Topper", "Shift Knob", "Pedal Cover Set",
      "Car Organizer Backseat", "Car Trash Can", "Car Cooler", "Car Blanket", "Travel Pillow Car"
    ],
    specs: ["Compatibility", "Material", "Installation", "Dimensions", "Weight", "Warranty", "Color", "Features"]
  },
  "Garden & Outdoor": {
    basePrice: 10, priceRange: 120,
    products: [
      "Garden Hose Expandable", "Lawn Sprinkler", "Garden Tool Set", "Plant Pot Set", "Seed Starter Kit",
      "Garden Gloves", "Pruning Shears", "Wheelbarrow", "Garden Cart", "Compost Bin",
      "Rain Barrel", "Bird Feeder", "Bird Bath", "Wind Chimes", "Solar Garden Lights",
      "String Lights Outdoor", "Patio Umbrella", "Outdoor Furniture Set", "Hammock", "Fire Pit",
      "Grill Cover", "BBQ Tool Set", "Smoker Grill", "Pizza Oven Outdoor", "Outdoor Rug",
      "Patio Heater", "Misting System", "Pool Float Set", "Pool Cover", "Pool Pump",
      "Fence Panel", "Garden Edging", "Mulch", "Fertilizer", "Weed Killer",
      "Pest Control Spray", "Greenhouse Kit", "Raised Garden Bed", "Trellis", "Arbor",
      "Garden Bench", "Planter Box", "Herb Garden Kit", "Mushroom Growing Kit", "Bonsai Kit",
      "Aquatic Plants", "Pond Pump", "Pond Filter", "Pond Liner", "Water Feature"
    ],
    specs: ["Material", "Dimensions", "Coverage Area", "Power Source", "Weather Resistant", "Assembly", "Weight Capacity", "Warranty"]
  },
  "Office Supplies": {
    basePrice: 5, priceRange: 50,
    products: [
      "Desk Organizer", "Pen Set", "Notebook Set", "Sticky Notes", "Tape Dispenser",
      "Stapler", "Paper Shredder", "Laminator", "Label Maker", "Whiteboard",
      "Cork Board", "File Cabinet", "Document Tray", "Binder Set", "Sheet Protectors",
      "Paper Cutter", "Hole Punch", "Scissors Set", "Ruler Set", "Protractor",
      "Calculator", "Desk Pad", "Mouse Pad", "Wrist Rest", "Monitor Stand",
      "Laptop Stand", "Cable Clips", "Power Strip", "Surge Protector", "Extension Cord",
      "Desk Lamp", "Bookends", "Letter Opener", "Rubber Stamp Set", "Ink Pad",
      "Correction Tape", "Glue Stick Set", "Tape Runner", "Washi Tape Set", "Sticker Set",
      "Planner", "Calendar", "Desk Calendar", "Wall Calendar", "Sticky Easel",
      "Presentation Clicker", "Laser Pointer", "Name Plate", "Business Card Holder", "Pen Holder"
    ],
    specs: ["Material", "Dimensions", "Capacity", "Color", "Refillable", "Warranty", "Weight", "Includes"]
  },
  "Musical Instruments": {
    basePrice: 15, priceRange: 200,
    products: [
      "Acoustic Guitar", "Electric Guitar", "Bass Guitar", "Ukulele", "Guitar Strings",
      "Guitar Picks", "Guitar Capo", "Guitar Tuner", "Guitar Stand", "Guitar Case",
      "Guitar Amplifier", "Guitar Pedal", "Keyboard Piano", "MIDI Controller", "Drum Sticks",
      "Practice Pad", "Drum Set", "Cajon", "Bongo Drums", "Djembe",
      "Harmonica", "Recorder", "Flute", "Clarinet", "Saxophone",
      "Trumpet", "Trombone", "Violin", "Viola", "Cello",
      "Banjo", "Mandolin", "Dulcimer", "Kalimba", "Xylophone",
      "Tambourine", "Shaker", "Maracas", "Triangle", "Cowbell",
      "Metronome", "Music Stand", "Sheet Music Light", "Microphone Dynamic", "Microphone Condenser",
      "Audio Interface", "Studio Monitor", "Headphones Studio", "Pop Filter", "Shock Mount"
    ],
    specs: ["Type", "Material", "Size", "Skill Level", "Includes", "Weight", "Color", "Warranty"]
  },
  "Gaming": {
    basePrice: 15, priceRange: 200,
    products: [
      "Gaming Mouse", "Gaming Keyboard", "Gaming Headset", "Gaming Monitor", "Gaming Chair",
      "Gaming Desk", "Mouse Pad XL", "Controller", "Charging Dock", "Gaming Glasses",
      "Stream Deck", "Capture Card", "Green Screen", "Ring Light", "Webcam Gaming",
      "Microphone USB", "Boom Arm", "Acoustic Panels", "LED Strip", "RGB Light Bar",
      "Gaming Laptop Stand", "Cable Management", "GPU Support Bracket", "Thermal Paste", "Fan Controller",
      "PSU Cable Extensions", "Case Fan Set", "CPU Cooler", "Water Cooling Kit", "SSD Heatsink",
      "RAM RGB", "Keyboard Switches", "Keycap Set", "Keyboard Foam", "Desk Mat",
      "Controller Thumb Grips", "Trigger Stops", "Console Stand", "Game Storage", "Headset Stand",
      "VR Headset", "Racing Wheel", "Flight Stick", "Gaming Pedals", "Arcade Stick",
      "Retro Console", "Game Cartridge Set", "Console Skin", "Controller Skin", "Carrying Case"
    ],
    specs: ["Compatibility", "DPI/Polling Rate", "Switch Type", "RGB", "Connection", "Weight", "Warranty", "Features"]
  },
  "Jewelry & Watches": {
    basePrice: 8, priceRange: 100,
    products: [
      "Necklace Chain", "Pendant Necklace", "Pearl Necklace", "Choker", "Locket",
      "Bracelet Chain", "Bangle Set", "Cuff Bracelet", "Anklet", "Charm Bracelet",
      "Stud Earrings", "Hoop Earrings", "Drop Earrings", "Ear Cuffs", "Earring Set",
      "Ring Set", "Engagement Ring", "Wedding Band", "Signet Ring", "Mood Ring",
      "Watch Analog", "Watch Digital", "Watch Automatic", "Watch Skeleton", "Watch Diver",
      "Watch Chronograph", "Watch Minimalist", "Watch Sport", "Watch Luxury", "Watch Smart",
      "Watch Band Leather", "Watch Band Metal", "Watch Band NATO", "Watch Box", "Watch Winder",
      "Jewelry Box", "Jewelry Stand", "Ring Holder", "Necklace Organizer", "Travel Jewelry Case",
      "Brooch", "Tie Clip", "Cufflinks Set", "Money Clip", "Lapel Pin",
      "Hair Accessory", "Tiara", "Body Chain", "Nose Ring", "Septum Ring"
    ],
    specs: ["Material", "Stone Type", "Chain Length", "Clasp Type", "Water Resistant", "Hypoallergenic", "Weight", "Certification"]
  },
  "Bags & Luggage": {
    basePrice: 12, priceRange: 80,
    products: [
      "Backpack Travel", "Laptop Backpack", "Daypack", "Hiking Backpack", "Camera Bag",
      "Messenger Bag", "Briefcase", "Tote Bag", "Shoulder Bag", "Crossbody Bag",
      "Clutch", "Evening Bag", "Beach Bag", "Gym Bag", "Duffel Bag",
      "Weekender Bag", "Garment Bag", "Suitcase Carry-On", "Suitcase Medium", "Suitcase Large",
      "Luggage Set", "Packing Cubes", "Toiletry Bag", "Shoe Bag", "Laundry Bag",
      "Laptop Sleeve", "Tablet Sleeve", "Document Folder", "Passport Holder", "Luggage Tag",
      "Luggage Scale", "Luggage Lock", "Travel Wallet", "Money Belt", "Neck Pillow",
      "Eye Mask", "Ear Plugs Set", "Travel Adapter", "Packing List", "Compression Bags",
      "Fanny Pack", "Belt Bag", "Mini Backpack", "Drawstring Bag", "Tote Canvas",
      "Shopping Bag Reusable", "Produce Bags", "Lunch Bag", "Cooler Bag", "Wine Bag"
    ],
    specs: ["Material", "Capacity", "Dimensions", "Weight", "Laptop Size", "Water Resistant", "Warranty", "Color"]
  },
  "Food & Beverage": {
    basePrice: 5, priceRange: 40,
    products: [
      "Coffee Beans", "Ground Coffee", "Instant Coffee", "Tea Set", "Green Tea",
      "Herbal Tea", "Matcha Powder", "Hot Chocolate Mix", "Protein Powder", "Meal Replacement Shake",
      "Energy Bars", "Granola Bars", "Trail Mix", "Dried Fruit Mix", "Nuts Assorted",
      "Dark Chocolate", "Milk Chocolate", "Candy Assorted", "Gummy Bears", "Hard Candy",
      "Chips Assorted", "Popcorn", "Pretzels", "Crackers", "Rice Cakes",
      "Peanut Butter", "Almond Butter", "Jam Set", "Honey", "Maple Syrup",
      "Olive Oil", "Balsamic Vinegar", "Hot Sauce Set", "Spice Blend Set", "Seasoning Salt",
      "Dried Herbs", "Vanilla Extract", "Baking Soda", "Baking Powder", "Flour Assorted",
      "Pasta", "Rice", "Quinoa", "Oats", "Cereal",
      "Soup Mix", "Broth", "Sauce Pasta", "Salsa", "Guacamole Mix"
    ],
    specs: ["Weight", "Servings", "Calories", "Ingredients", "Allergens", "Shelf Life", "Storage", "Certification"]
  },
  "Health": {
    basePrice: 8, priceRange: 60,
    products: [
      "Vitamin D3", "Vitamin C", "Vitamin B12", "Multivitamin", "Fish Oil Omega-3",
      "Probiotics", "Collagen Powder", "Turmeric Capsules", "Zinc Supplement", "Magnesium Supplement",
      "Iron Supplement", "Calcium Supplement", "Melatonin", "Ashwagandha", "Elderberry Gummies",
      "Apple Cider Vinegar", "Green Tea Extract", "CoQ10", "Glucosamine", "Chondroitin",
      "Blood Pressure Monitor", "Thermometer Digital", "Pulse Oximeter", "Glucose Monitor", "Scale Digital",
      "Fitness Tracker Health", "Massage Gun", "TENS Unit", "Heating Pad", "Ice Pack Set",
      "Pill Organizer", "Supplement Container", "Shaker Bottle", "Water Filter Pitcher", "Air Quality Monitor",
      "Humidifier", "Dehumidifier", "Essential Oil Set", "Diffuser", "Neti Pot",
      "Eye Drops", "Nasal Spray", "Cough Drops", "Pain Relief Cream", "Bandage Set",
      "First Aid Kit", "Hand Sanitizer", "Face Mask N95", "Gloves Disposable", "Disinfectant Wipes"
    ],
    specs: ["Dosage", "Form", "Servings", "Key Ingredient", "Certification", "Free From", "Storage", "Expiry"]
  },
  "Kids & Toys": {
    basePrice: 8, priceRange: 60,
    products: [
      "Building Blocks", "LEGO Set", "Doll", "Action Figure", "Stuffed Animal",
      "Puzzle Kids", "Board Game Kids", "Card Game Kids", "Art Kit", "Craft Kit",
      "Science Experiment Kit", "Robot Kit", "Coding Toy", "Musical Instrument Toy", "Play Kitchen Set",
      "Tool Set Toy", "Doctor Kit", "Cash Register", "Dress Up Costume", "Play Tent",
      "Toy Car Set", "Train Set", "Farm Set", "Dinosaur Set", "Space Set",
      "Water Gun", "Nerf Blaster", "Kite Kids", "Ball Set", "Jump Rope Kids",
      "Scooter Kids", "Bike Kids", "Skateboard", "Roller Skates", "Helmet Kids",
      "Swimming Pool Kids", "Water Slide", "Sandbox Set", "Swing Set", "Slide Kids",
      "Trampoline", "Basketball Hoop Kids", "Soccer Goal Kids", "Tee Ball Set", "Bowling Set",
      "Telescope Kids", "Binoculars Kids", "Magnifying Glass", "Bug Catcher Kit", "Garden Kit Kids"
    ],
    specs: ["Age Range", "Material", "Safety Standard", "Battery Required", "Educational", "Indoor/Outdoor", "Pieces", "Dimensions"]
  },
  "Luxury": {
    basePrice: 50, priceRange: 500,
    products: [
      "Leather Wallet Premium", "Silk Tie", "Cashmere Scarf", "Leather Briefcase", "Watch Box",
      "Cufflinks Gold", "Pen Fountain", "Desk Nameplate", "Picture Frame Silver", "Candle Luxury",
      "Diffuser Luxury", "Bath Set Luxury", "Skincare Set Premium", "Perfume Designer", "Sunglasses Designer",
      "Bag Designer", "Shoes Italian", "Suit Tailored", "Shirt Egyptian Cotton", "Belt Leather Italian",
      "Gloves Leather", "Hat Wool", "Umbrella Premium", "Luggage Premium", "Travel Set Leather",
      "Jewelry Box", "Watch Winder", "Pen Set", "Agenda Leather", "Notebook Leather",
      "Portfolio Leather", "Card Holder", "Money Clip Silver", "Tie Bar Gold", "Lapel Pin Gold",
      "Bracelet Silver", "Necklace Gold", "Ring Gold", "Earrings Diamond", "Brooch Vintage",
      "Compact Mirror", "Vanity Set", "Comb Set", "Brush Set", "Grooming Set Premium",
      "Wine Opener Set", "Whiskey Set", "Cigar Accessories", "Lighter Premium", "Ashtray Crystal"
    ],
    specs: ["Material", "Craftsmanship", "Origin", "Certification", "Warranty", "Packaging", "Care", "Limited Edition"]
  },
  "Tools & Hardware": {
    basePrice: 10, priceRange: 150,
    products: [
      "Drill Cordless", "Impact Driver", "Circular Saw", "Jigsaw", "Reciprocating Saw",
      "Sander Orbital", "Router Wood", "Table Saw", "Miter Saw", "Bandsaw",
      "Grinder Angle", "Heat Gun", "Soldering Iron", "Welding Machine", "Air Compressor",
      "Nail Gun", "Staple Gun", "Glue Gun", "Paint Sprayer", "Pressure Washer",
      "Tool Box", "Tool Chest", "Workbench", "Vise", "Clamp Set",
      "Wrench Set", "Socket Set", "Screwdriver Set", "Pliers Set", "Hammer Set",
      "Measuring Tape", "Level Laser", "Stud Finder", "Multimeter", "Oscilloscope",
      "Wire Stripper", "Crimper Tool", "Pipe Wrench", "Adjustable Wrench", "Allen Key Set",
      "Drill Bit Set", "Saw Blade Set", "Sandpaper Set", "Paint Brush Set", "Roller Set",
      "Tape Electrical", "Wire Connectors", "Pipe Fittings", "Screws Assorted", "Nails Assorted"
    ],
    specs: ["Power", "Voltage", "Speed", "Chuck Size", "Weight", "Warranty", "Includes", "Material"]
  },
  "Art & Crafts": {
    basePrice: 8, priceRange: 60,
    products: [
      "Acrylic Paint Set", "Oil Paint Set", "Watercolor Set", "Canvas Set", "Easel",
      "Brush Set", "Palette", "Palette Knife Set", "Pencil Set", "Charcoal Set",
      "Pastel Set", "Marker Set", "Crayon Set", "Colored Pencil Set", "Sketchbook",
      "Watercolor Paper", "Mixed Media Paper", "Drawing Paper", "Craft Paper", "Cardstock",
      "Cutting Mat", "Craft Knife", "Scissors Craft", "Ruler Metal", "Circle Cutter",
      "Stamp Set", "Ink Pad Set", "Embossing Kit", "Heat Gun Craft", "Die Cut Machine",
      "Sewing Machine", "Thread Set", "Needle Set", "Fabric Scissors", "Pin Cushion",
      "Crochet Hook Set", "Knitting Needles", "Yarn Set", "Embroidery Kit", "Cross Stitch Kit",
      "Resin Kit", "Mold Set", "Glitter Set", "Bead Set", "Wire Wrapping Kit",
      "Macrame Kit", "Candle Making Kit", "Soap Making Kit", "Pottery Kit", "Calligraphy Set"
    ],
    specs: ["Type", "Pieces", "Color Count", "Material", "Skill Level", "Non-Toxic", "Washable", "Includes"]
  },
  "Travel & Luggage": {
    basePrice: 15, priceRange: 100,
    products: [
      "Carry-On Suitcase", "Checked Suitcase", "Luggage Set 3-Piece", "Travel Backpack", "Daypack",
      "Packing Cubes Set", "Toiletry Bag", "Shoe Bag", "Laundry Bag", "Compression Bags",
      "Travel Wallet", "Passport Holder", "Luggage Tag", "Luggage Scale", "Luggage Lock",
      "Travel Adapter Universal", "Neck Pillow Memory", "Eye Mask Silk", "Ear Plugs", "Blanket Travel",
      "Water Bottle Insulated", "Snack Container", "Lunch Bag Insulated", "Cooler Backpack", "Wine Carrier",
      "Camera Bag", "Electronics Organizer", "Cable Organizer", "Document Holder", "Money Belt",
      "Hidden Pocket", "RFID Blocking Bag", "Anti-Theft Backpack", "Lock Combination", "TSA Lock",
      "Travel Iron", "Travel Steamer", "Travel Hair Dryer", "Travel Mirror", "Travel Sewing Kit",
      "First Aid Travel", "Medicine Organizer", "Pill Case Travel", "Contact Case", "Toothbrush Travel",
      "Travel Size Toiletries", "Refillable Bottles", "Spray Bottle", "Zipper Bags", "Dry Bags"
    ],
    specs: ["Material", "Capacity", "Dimensions", "Weight", "TSA Approved", "Water Resistant", "Warranty", "Color"]
  },
  "Musical Instruments": {
    basePrice: 15, priceRange: 200,
    products: [
      "Acoustic Guitar", "Electric Guitar", "Bass Guitar", "Ukulele", "Guitar Strings Set",
      "Guitar Picks Variety", "Guitar Capo", "Guitar Tuner Clip", "Guitar Stand Foldable", "Guitar Case Hard",
      "Guitar Amplifier Combo", "Guitar Pedal Distortion", "Keyboard Piano 88-Key", "MIDI Controller Pad", "Drum Sticks 5A",
      "Practice Pad Double", "Drum Set Complete", "Cajon Drum", "Bongo Drums Pair", "Djembe African",
      "Harmonica Set", "Recorder Soprano", "Flute Silver", "Clarinet Bb", "Saxophone Alto",
      "Trumpet Bb", "Trombone Tenor", "Violin Full Size", "Viola 15-Inch", "Cello 4/4",
      "Banjo 5-String", "Mandolin A-Style", "Dulcimer Mountain", "Kalimba 17-Key", "Xylophone Kids",
      "Tambourine Hand", "Shaker Egg", "Maracas Pair", "Triangle Instrument", "Cowbell Chrome",
      "Metronome Digital", "Music Stand Folding", "Sheet Music LED", "Microphone Dynamic SM58", "Microphone Condenser",
      "Audio Interface 2i2", "Studio Monitor Pair", "Headphones Studio", "Pop Filter", "Shock Mount"
    ],
    specs: ["Type", "Material", "Size", "Skill Level", "Includes", "Weight", "Color", "Warranty"]
  },
  "Smart Home": {
    basePrice: 15, priceRange: 150,
    products: [
      "Smart Speaker", "Smart Display", "Smart Light Bulb", "Smart Light Strip", "Smart Switch",
      "Smart Dimmer", "Smart Plug Indoor", "Smart Plug Outdoor", "Smart Thermostat", "Smart AC Controller",
      "Smart Lock Deadbolt", "Smart Lock Keypad", "Smart Doorbell Camera", "Smart Security Camera", "Smart Camera Indoor",
      "Smart Camera Outdoor", "Smart Sensor Door", "Smart Sensor Window", "Smart Sensor Motion", "Smart Smoke Detector",
      "Smart CO Detector", "Smart Water Leak", "Smart Garage Opener", "Smart Blinds", "Smart Curtain",
      "Smart Irrigation", "Smart Sprinkler", "Smart Pet Feeder", "Smart Pet Camera", "Smart Air Purifier",
      "Smart Humidifier", "Smart Fan", "Smart Heater", "Smart Vacuum", "Smart Mop",
      "Smart Trash Can", "Smart Mirror", "Smart Scale", "Smart Clock", "Smart Remote",
      "Smart Hub", "Smart Bridge", "Smart Repeater", "Smart WiFi Mesh", "Smart Router",
      "Smart NAS", "Smart Door Sensor", "Smart Button", "Smart Dial", "Smart Scene Controller"
    ],
    specs: ["Connectivity", "Voice Assistant", "App Control", "Power Source", "Range", "Compatibility", "Installation", "Warranty"]
  },
  "Baby & Kids": {
    basePrice: 10, priceRange: 80,
    products: [
      "Baby Monitor", "Baby Carrier", "Stroller", "Car Seat Baby", "High Chair",
      "Crib", "Bassinet", "Changing Table", "Baby Gate", "Baby Bath Tub",
      "Baby Bottle Set", "Breast Pump", "Formula Dispenser", "Bib Set", "Burp Cloth Set",
      "Swaddle Set", "Sleep Sack", "Baby Blanket", "Crib Sheet Set", "Mobile Crib",
      "Pacifier Set", "Teether Set", "Rattle Set", "Play Mat", "Activity Gym",
      "Bouncer", "Swing Baby", "Walker Baby", "Jumper", "Exersaucer",
      "Diaper Bag", "Diaper Caddy", "Wipe Warmer", "Diaper Pail", "Changing Pad",
      "Baby Shampoo", "Baby Lotion", "Baby Oil", "Baby Powder", "Baby Wipes",
      "Nasal Aspirator", "Thermometer Baby", "Nail Trimmer Baby", "Hair Brush Baby", "Baby Grooming Kit",
      "Toddler Bed", "Potty Training", "Step Stool", "Sippy Cup Set", "Utensil Set Baby"
    ],
    specs: ["Age Range", "Safety Standard", "Material", "Weight Limit", "Washable", "BPA Free", "Warranty", "Color"]
  },
  "Outdoor Recreation": {
    basePrice: 15, priceRange: 150,
    products: [
      "Tent 2-Person", "Tent 4-Person", "Sleeping Bag", "Sleeping Pad", "Camping Chair",
      "Camping Table", "Camp Stove", "Cooler 50L", "Water Filter", "Headlamp",
      "Flashlight LED", "Lantern Camping", "Fire Starter", "Multi-Tool", "Pocket Knife",
      "Hiking Boots", "Trekking Poles", "Backpack 60L", "Rain Gear", "Gaiters",
      "Climbing Harness", "Climbing Rope", "Carabiner Set", "Helmet Climbing", "Chalk Bag",
      "Kayak Inflatable", "Paddle Kayak", "Life Jacket", "Dry Bag 20L", "Water Shoes",
      "Fishing Rod", "Fishing Reel", "Tackle Box", "Fishing Line", "Lure Set",
      "Binoculars", "Spotting Scope", "Compass", "GPS Handheld", "Map Case",
      "Hammock Camping", "Tarp Shelter", "Paracord 100ft", "Emergency Blanket", "Whistle Signal",
      "Bear Canister", "Camp Shower", "Portable Toilet", "Insect Repellent", "Sunscreen Outdoor"
    ],
    specs: ["Capacity", "Weight", "Material", "Season Rating", "Waterproof", "Setup Time", "Packed Size", "Warranty"]
  }
};

// ═══════════════════════════════════════════════════
// PRODUCT NAME GENERATORS
// ═══════════════════════════════════════════════════

const ADJECTIVES = ["Premium", "Pro", "Ultra", "Elite", "Advanced", "Smart", "Deluxe", "Classic", "Essential", "Professional", "Compact", "Portable", "Heavy-Duty", "Lightweight", "Ergonomic", "Waterproof", "Wireless", "Rechargeable", "Foldable", "Adjustable", "Digital", "Analog", "Automatic", "Manual", "Solar-Powered", "Eco-Friendly", "Organic", "Natural", "Synthetic", "Stainless Steel", "Bamboo", "Silicone", "Leather", "Canvas", "Nylon", "Polyester", "Cotton", "Wool", "Cashmere", "Titanium", "Carbon Fiber", "Aluminum", "Wooden", "Glass", "Ceramic"];
const BRANDS = ["TechFlow", "LifeGear", "ProMax", "EcoVibe", "Zenith", "Apex", "Nova", "Pulse", "Orbit", "Volt", "Fusion", "Prime", "Summit", "Core", "Edge", "Blaze", "Swift", "Bold", "True", "Pure", "Fresh", "Bright", "Clear", "Sharp", "Strong", "Flex", "Grip", "Snap", "Click", "Flash"];
const COLORS = ["Black", "White", "Navy Blue", "Charcoal Gray", "Forest Green", "Burgundy", "Beige", "Silver", "Gold", "Rose Gold", "Midnight Blue", "Slate Gray", "Ivory", "Coral", "Teal", "Olive", "Maroon", "Lavender", "Mint", "Peach"];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFloat(min, max, dec = 2) { return parseFloat((Math.random() * (max - min) + min).toFixed(dec)); }
function slugify(text) { return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 80); }

function generateProduct(category, baseName, index) {
  const cat = CATEGORIES[category];
  const adj = randomItem(ADJECTIVES);
  const brand = randomItem(BRANDS);
  const color = randomItem(COLORS);
  const price = randomFloat(cat.basePrice, cat.basePrice + cat.priceRange);
  const discount = randomInt(15, 55);
  const originalPrice = parseFloat((price / (1 - discount / 100)).toFixed(2));
  const rating = randomFloat(3.8, 5.0, 1);
  const reviewCount = randomInt(50, 50000);
  const stock = randomInt(30, 10000);
  const salesCount = randomInt(10, 10000);
  
  // Generate specs
  const specs = {};
  const specKeys = cat.specs.slice(0, randomInt(5, 8));
  specKeys.forEach(key => {
    if (key === "Material") specs[key] = randomItem(["Premium Quality", "Stainless Steel", "ABS Plastic", "Aluminum Alloy", "Cotton", "Polyester", "Nylon", "Silicone", "Bamboo", "Leather"]);
    else if (key === "Color") specs[key] = color;
    else if (key === "Weight") specs[key] = randomInt(50, 5000) + "g";
    else if (key === "Dimensions") specs[key] = randomInt(10, 100) + "x" + randomInt(10, 100) + "x" + randomInt(5, 50) + "cm";
    else if (key === "Warranty") specs[key] = randomItem(["6 Months", "1 Year", "2 Years", "3 Years", "Lifetime"]);
    else if (key === "Size") specs[key] = randomItem(["S", "M", "L", "XL", "One Size", "Universal"]);
    else if (key === "Capacity") specs[key] = randomInt(1, 100) + "L";
    else specs[key] = randomItem(["Standard", "Premium", "Advanced", "Basic", "Professional"]);
  });
  
  const name = adj + " " + brand + " " + baseName + " " + (index > 0 ? "Series " + String.fromCharCode(65 + (index % 26)) : "");
  const slug = slugify(name) + "-" + randomInt(1000, 9999);
  
  const descTemplates = [
    "High-quality " + baseName.toLowerCase() + " from " + brand + ". " + adj + " construction ensures durability and long-lasting performance. Perfect for everyday use.",
    "Introducing the " + adj + " " + brand + " " + baseName + ". Designed with user comfort and functionality in mind. Made with premium materials.",
    "The " + brand + " " + baseName + " features " + adj.toLowerCase() + " design and superior craftsmanship. Ideal for both beginners and professionals.",
    "Experience the " + adj + " quality of " + brand + " " + baseName + ". Engineered for maximum performance and reliability. Customer satisfaction guaranteed.",
    "Upgrade your " + category.toLowerCase() + " with the " + brand + " " + baseName + ". " + adj + " features at an affordable price. Fast shipping available."
  ];
  
  return {
    name: name.substring(0, 200),
    description: randomItem(descTemplates),
    price: price,
    original_price: originalPrice,
    discount: discount,
    stock: stock,
    rating: rating,
    review_count: reviewCount,
    specs: specs,
    images: [
      "https://picsum.photos/seed/" + slug + "1/600/600",
      "https://picsum.photos/seed/" + slug + "2/600/600",
      "https://picsum.photos/seed/" + slug + "3/600/600",
      "https://picsum.photos/seed/" + slug + "4/600/600",
      "https://picsum.photos/seed/" + slug + "5/600/600",
    ],
    slug: slug,
    status: "active",
    is_recommended: Math.random() > 0.7,
    sales_count: salesCount,
    goods_id: "AH-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
  };
}

// ═══════════════════════════════════════════════════
// MAIN FUNCTION
// ═══════════════════════════════════════════════════

async function main() {
  console.log("===================================================");
  console.log("ALLIANCEHUB MEGA PRODUCT GENERATOR");
  console.log("Target: " + Object.keys(CATEGORIES).length + " categories x 500 products");
  console.log("===================================================");
  
  if (!SUPABASE_KEY) {
    console.error("ERROR: VITE_SUPABASE_ANON_KEY not set");
    process.exit(1);
  }
  
  let totalInserted = 0;
  let totalErrors = 0;
  const categoryNames = Object.keys(CATEGORIES);
  
  for (const category of categoryNames) {
    const cat = CATEGORIES[category];
    console.log("\n--- " + category + " (" + cat.products.length + " base products) ---");
    
    let inserted = 0;
    let errors = 0;
    
    // Generate 500 products per category
    for (let i = 0; i < 500; i++) {
      const baseName = cat.products[i % cat.products.length];
      const product = generateProduct(category, baseName, i);
      
      try {
        const response = await fetch(SUPABASE_URL + "/rest/v1/products", {
          method: "POST",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": "***" + SUPABASE_KEY,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
          },
          body: JSON.stringify(product),
        });
        
        if (response.ok) {
          inserted++;
          if (inserted % 100 === 0) {
            console.log("  " + inserted + "/500 inserted...");
          }
        } else {
          errors++;
          if (errors <= 3) {
            const errText = await response.text();
            console.log("  ERR: " + product.name.substring(0, 40) + " - HTTP " + response.status);
          }
        }
      } catch (error) {
        errors++;
        if (errors <= 3) {
          console.log("  ERR: " + product.name.substring(0, 40) + " - " + error.message);
        }
      }
      
      // Rate limiting - 30ms delay
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    
    console.log("  DONE: " + inserted + " inserted, " + errors + " errors");
    totalInserted += inserted;
    totalErrors += errors;
  }
  
  console.log("\n===================================================");
  console.log("FINAL RESULTS");
  console.log("Categories: " + categoryNames.length);
  console.log("Total Inserted: " + totalInserted);
  console.log("Total Errors: " + totalErrors);
  console.log("===================================================");
}

main().catch(console.error);
