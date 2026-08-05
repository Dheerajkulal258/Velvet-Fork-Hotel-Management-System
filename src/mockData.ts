import { MenuItem, Section } from './types';

export const HOTEL_INFO = {
  name: "The Velvet Fork",
  tagline: "A Symphony of Flavors",
  description: "Experience premium culinary dining where heritage recipes meet modern innovation. Located in the heart of the city, we offer multiple unique dining environments including our elegant Classic Hall, the breezy Rooftop Oasis, and the serene Garden Lounge.",
  address: "102 Culinary Boulevard, Sector 5, Metro City",
  phone: "+91 98765 43210",
  email: "reservations@velvetfork.com",
  timings: "11:00 AM - 11:30 PM",
  rating: 4.8,
  reviewsCount: 1420
};

export const INITIAL_SECTIONS: Section[] = [
  {
    name: "Classic Hall",
    tables: [
      { id: "CH-T1", name: "Table 1", status: "free" },
      { id: "CH-T2", name: "Table 2", status: "free" },
      { id: "CH-T3", name: "Table 3", status: "free" },
      { id: "CH-T4", name: "Table 4", status: "free" }
    ]
  },
  {
    name: "Rooftop Oasis",
    tables: [
      { id: "RT-T1", name: "Rooftop 1", status: "free" },
      { id: "RT-T2", name: "Rooftop 2", status: "free" },
      { id: "RT-T3", name: "Rooftop 3", status: "free" },
      { id: "RT-T4", name: "Rooftop 4", status: "free" }
    ]
  },
  {
    name: "Garden Lounge",
    tables: [
      { id: "GL-T1", name: "Garden 1", status: "free" },
      { id: "GL-T2", name: "Garden 2", status: "free" },
      { id: "GL-T3", name: "Garden 3", status: "free" },
      { id: "GL-T4", name: "Garden 4", status: "free" }
    ]
  }
];

export const INITIAL_MENU: MenuItem[] = [
  // --- STARTERS & APPETIZERS ---
  {
    id: "str-1",
    name: "Crispy Truffle Fries",
    price: 129,
    description: "Golden fries tossed in white truffle oil, grated parmesan cheese, and fresh parsley, served with garlic aioli.",
    category: "Starters",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "str-2",
    name: "Mediterranean Spiced Chicken Skewers",
    price: 179,
    description: "Tender chicken chunks marinated in Greek yogurt and spices, charcoal grilled, served with mint tzatziki.",
    category: "Starters",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "str-3",
    name: "Avocado Sourdough Bruschetta",
    price: 149,
    description: "Toasted sourdough bread topped with creamy smashed avocado, heirloom cherry tomatoes, fresh basil, and aged balsamic reduction.",
    category: "Starters",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "str-4",
    name: "Paneer Tikka Angaara",
    price: 169,
    description: "Charcoal-grilled cottage cheese marinated in crushed Kashmiri chilies, mustard oil, and ground aromatic spices.",
    category: "Starters",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "str-5",
    name: "Creamy Wild Mushroom Soup",
    price: 119,
    description: "Velvety woodland mushroom bisque infused with thyme, garlic crostini, and a drizzle of white truffle oil.",
    category: "Starters",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "str-6",
    name: "Cheesy Jalapeno Poppers",
    price: 139,
    description: "Crispy golden fried jalapeño peppers stuffed with melted cheddar and cream cheese, served with salsa.",
    category: "Starters",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1531749668029-2db88e4276c7?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "str-7",
    name: "Dynamite Crispy Prawns",
    price: 189,
    description: "Batter-fried king prawns tossed in a creamy, spicy sriracha mayo glaze garnished with green scallions.",
    category: "Starters",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80"
  },

  // --- RICE & BIRYANIS (NEW CATEGORY) ---
  {
    id: "rc-1",
    name: "Hyderabadi Chicken Dum Biryani",
    price: 219,
    description: "Fragrant long-grain Basmati rice dum-cooked with secret spices, mint, saffron, and tender marinated chicken.",
    category: "Rice & Biryanis",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rc-2",
    name: "Kashmiri Mutton Dum Biryani",
    price: 249,
    description: "Slow-simmered juicy mutton, caramelized onions, kewra water, and saffron layered basmati rice served with raita.",
    category: "Rice & Biryanis",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rc-3",
    name: "Paneer Tikka Biryani",
    price: 199,
    description: "Charcoal roasted spiced paneer cubes layered with aromatic basmati rice, fried mint, and ghee.",
    category: "Rice & Biryanis",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rc-4",
    name: "Schezwan Chicken Fried Rice",
    price: 169,
    description: "High-flame wok tossed rice with shredded chicken, crunchy capsicum, scallions, and fiery Schezwan chili sauce.",
    category: "Rice & Biryanis",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rc-5",
    name: "Classic Veg Triple Schezwan Fried Rice",
    price: 159,
    description: "Indo-Chinese favorite combining fried rice, soft noodles, crispy fried noodles, and spicy Manchurian gravy.",
    category: "Rice & Biryanis",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rc-6",
    name: "Classic Egg Fried Rice",
    price: 139,
    description: "Fluffy wok-tossed long grain basmati rice loaded with fluffy scrambled eggs, spring onions, and light soy sauce.",
    category: "Rice & Biryanis",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rc-7",
    name: "Jeera Rice with Dal Tadka Combo",
    price: 139,
    description: "Fragrant cumin-tempered ghee basmati rice served with yellow arhar dal tempered with garlic, ghee, and dry chilies.",
    category: "Rice & Biryanis",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80"
  },

  // --- TANDOORI & GRILLS (NEW CATEGORY) ---
  {
    id: "td-1",
    name: "Classic Tandoori Chicken (Half)",
    price: 229,
    description: "Bone-in chicken marinated in hung curd, mustard oil, garlic, and traditional tandoori masala, roasted in clay bhatti.",
    category: "Tandoori & Grills",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "td-2",
    name: "Coastal Chicken Ghee Roast",
    price: 219,
    description: "Mangalorean specialty succulent chicken chunks roasted in pure desi ghee and fiery Byadgi chili paste.",
    category: "Tandoori & Grills",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "td-3",
    name: "Paneer Ghee Roast",
    price: 189,
    description: "Rich cottage cheese cubes tossed in clarifying ghee, coastal roasted spice blend, curry leaves, and tamarind zip.",
    category: "Tandoori & Grills",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "td-4",
    name: "Tandoori Malai Chicken Tikka",
    price: 199,
    description: "Melt-in-mouth chicken breast pieces marinated in cashew cream, green cardamom, cheese, and mild spices.",
    category: "Tandoori & Grills",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80"
  },

  // --- CHEF SPECIALS ---
  {
    id: "spf-1",
    name: "Pan-Seared Atlantic Herb Salmon",
    price: 299,
    description: "Crispy skin Atlantic salmon fillet served over garlic mashed potatoes, tender asparagus spears, and lemon-caper butter sauce.",
    category: "Chef Specials",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "spf-2",
    name: "Wild Mushroom & Truffle Risotto",
    price: 229,
    description: "Slow-cooked Italian Arborio rice cooked with porcini and wild chanterelle mushrooms, finished with Reggiano parmesan.",
    category: "Chef Specials",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "spf-3",
    name: "Smoked Coal Butter Chicken",
    price: 239,
    description: "Tandoori charred chicken tikka simmered in a velvet tomato gravy infused with smoky coal dungar essence.",
    category: "Chef Specials",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "spf-4",
    name: "Gourmet Truffle Cheeseburger",
    price: 199,
    description: "Artisan brioche bun, double grilled beef patty, melted sharp cheddar, caramelized onions, and black truffle mayo.",
    category: "Chef Specials",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "spf-5",
    name: "Rosemary Grilled Lamb Chops",
    price: 299,
    description: "Prime tender lamb chops marinated in fresh rosemary, garlic, and sea salt, served with red wine reduction.",
    category: "Chef Specials",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "spf-6",
    name: "Truffle Mushroom Fettuccine Alfredo",
    price: 219,
    description: "Handcrafted fettuccine pasta tossed in rich parmesan cream sauce, wild mushrooms, and white truffle oil.",
    category: "Chef Specials",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1621996346565-e3def616403c?auto=format&fit=crop&w=800&q=80"
  },

  // --- MAIN COURSE ---
  {
    id: "mc-1",
    name: "Royal Paneer Butter Masala",
    price: 189,
    description: "Succulent cottage cheese cubes simmered in a rich cream gravy with sun-ripened tomatoes and cashews.",
    category: "Main Course",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "mc-2",
    name: "Dal Makhani with Garlic Naan",
    price: 159,
    description: "Black lentils slow-simmered overnight over clay oven charcoal with butter, cream, served with fresh garlic naan.",
    category: "Main Course",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "mc-3",
    name: "Wood-Fired Margherita Pizza",
    price: 199,
    description: "Traditional hand-stretched Neapolitan crust, San Marzano tomato sauce, fresh buffalo mozzarella, and aromatic basil leaves.",
    category: "Main Course",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "mc-5",
    name: "Tandoori Garlic Butter Naan Basket",
    price: 69,
    description: "Freshly baked clay oven naan topped with melted butter, minced garlic, and fresh coriander leaves.",
    category: "Main Course",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "mc-6",
    name: "Kadhai Paneer Special",
    price: 179,
    description: "Cottage cheese cooked with bell peppers, onions, and coarsely ground dry spices in a traditional iron kadhai.",
    category: "Main Course",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "mc-7",
    name: "Kashmiri Mutton Rogan Josh",
    price: 249,
    description: "Tender goat meat slow-cooked in a rich gravy flavored with Kashmiri chilies, ratanjot, and aromatic garam masala.",
    category: "Main Course",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=800&q=80"
  },

  // --- DESSERTS ---
  {
    id: "des-1",
    name: "Molten Chocolate Lava Cake",
    price: 119,
    description: "Rich dark chocolate cake with a warm liquid lava center, accompanied by a scoop of Madagascar vanilla bean ice cream.",
    category: "Desserts",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "des-2",
    name: "Classic New York Cheesecake",
    price: 139,
    description: "Dense, velvety smooth cream cheese filling on a buttery graham cracker crust, topped with fresh strawberry compote.",
    category: "Desserts",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "des-3",
    name: "Saffron Gulab Jamun with Shahi Rabri",
    price: 99,
    description: "Soft milk dumplings deep fried to golden perfection, soaked in rose-cardamom syrup, paired with thick saffron rabri.",
    category: "Desserts",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "des-4",
    name: "Belgian Dark Chocolate Mousse",
    price: 129,
    description: "Silky 70% dark Belgian chocolate mousse layered with roasted hazelnut crunch and edible gold leaf.",
    category: "Desserts",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "des-5",
    name: "Classic Italian Tiramisu",
    price: 149,
    description: "Layers of espresso-soaked ladyfingers, mascarpone cream, dusted with Dutch cocoa powder.",
    category: "Desserts",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80"
  },

  // --- BEVERAGES & MOCKTAILS ---
  {
    id: "bev-1",
    name: "Fresh Mint Lime Mojito",
    price: 79,
    description: "Invigorating muddled fresh mint leaves, lime juice, simple syrup, topped with crushed ice and sparkling soda.",
    category: "Beverages",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "bev-2",
    name: "Iced Caramel Macchiato",
    price: 99,
    description: "Rich dark espresso poured over cold whole milk and vanilla syrup, crowned with handcrafted caramel drizzle.",
    category: "Beverages",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "bev-3",
    name: "Tropical Mango Passionfruit Cooler",
    price: 89,
    description: "Sweet Alphonso mango puree blended with tangy passionfruit syrup, fresh lime, and crushed ice.",
    category: "Beverages",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "bev-4",
    name: "Wild Berry Hibiscus Iced Tea",
    price: 89,
    description: "Cold-brewed hibiscus flower tea infused with fresh strawberries, blueberries, and a hint of mint.",
    category: "Beverages",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "bev-5",
    name: "Artisanal Cold Brew Coffee",
    price: 99,
    description: "16-hour slow steeped Arabica coffee served over ice with a splash of cream.",
    category: "Beverages",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80"
  }
];

export const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    orderId: "ord-mock-1",
    rating: 5,
    comment: "The Smoked Butter Chicken was extraordinary! Loved the smoky aroma and quick table service.",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    tableId: "CH-T2",
    sentiment: "positive" as const
  },
  {
    id: "rev-2",
    orderId: "ord-mock-2",
    rating: 5,
    comment: "Crispy Truffle Fries were fresh and parmesan was delightful. Gemini AI recommended a great mint mojito pairing!",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    tableId: "RT-T1",
    sentiment: "positive" as const
  },
  {
    id: "rev-3",
    orderId: "ord-mock-3",
    rating: 4,
    comment: "Food taste was wonderful. Waiting time during 8 PM rush was slightly longer, but overall fantastic.",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    tableId: "GL-T3",
    sentiment: "positive" as const
  }
];
