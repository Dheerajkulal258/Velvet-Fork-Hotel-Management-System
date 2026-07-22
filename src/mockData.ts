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
  // Appetizers
  {
    id: "app-1",
    name: "Crispy Truffle Fries",
    price: 349,
    description: "Golden fries tossed in white truffle oil, grated parmesan cheese, and fresh parsley, served with garlic aioli.",
    category: "Appetizers",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "app-2",
    name: "Spiced Chicken Skewers",
    price: 429,
    description: "Tender chicken chunks marinated in yogurt and Mediterranean spices, grilled to perfection, served with mint chutney.",
    category: "Appetizers",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1598515214211-89d3e73ae83b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "app-3",
    name: "Avocado Bruschetta",
    price: 389,
    description: "Toasted sourdough bread topped with mashed avocado, cherry tomatoes, fresh basil, and a drizzle of aged balsamic glaze.",
    category: "Appetizers",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=600&q=80"
  },
  // Main Course
  {
    id: "main-1",
    name: "Paneer Butter Masala",
    price: 499,
    description: "Succulent cottage cheese cubes simmered in a rich, creamy tomato gravy with butter and aromatic spices.",
    category: "Mains",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "main-2",
    name: "Smoked Butter Chicken",
    price: 549,
    description: "Tandoori chicken pieces cooked in a velvety tomato-butter gravy with a subtle smoky coal-infused aroma.",
    category: "Mains",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "main-3",
    name: "Wild Mushroom Risotto",
    price: 529,
    description: "Creamy Arborio rice slowly cooked with a medley of wild forest mushrooms, parmesan cheese, and truffle essence.",
    category: "Mains",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "main-4",
    name: "Grilled Salmon",
    price: 749,
    description: "Atlantic salmon fillet grilled with lemon-herb butter, served with sautéed asparagus and garlic mashed potatoes.",
    category: "Mains",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80"
  },
  // Desserts
  {
    id: "des-1",
    name: "Molten Chocolate Lava Cake",
    price: 299,
    description: "Rich chocolate cake with a warm, gooey liquid chocolate center, served with a scoop of vanilla bean ice cream.",
    category: "Desserts",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "des-2",
    name: "Classic New York Cheesecake",
    price: 329,
    description: "Velvety smooth cream cheese filling on a buttery graham cracker crust, topped with a fresh strawberry compote.",
    category: "Desserts",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80"
  },
  // Beverages
  {
    id: "bev-1",
    name: "Mint Mojito",
    price: 199,
    description: "Refreshing blend of fresh mint leaves, lime wedges, simple syrup, and sparkling soda over crushed ice.",
    category: "Beverages",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "bev-2",
    name: "Iced Caramel Macchiato",
    price: 249,
    description: "Rich espresso combined with milk, vanilla-flavored syrup, and marked with a caramel drizzle over ice.",
    category: "Beverages",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80"
  }
];
