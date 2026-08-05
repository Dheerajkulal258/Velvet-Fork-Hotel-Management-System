export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: 'Starters' | 'Chef Specials' | 'Main Course' | 'Rice & Biryanis' | 'Tandoori & Grills' | 'Desserts' | 'Beverages';

  isVeg: boolean;
  isAvailable: boolean;
  image: string;
}


export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface CustomerReview {
  id: string;
  orderId: string;
  rating: number; // 1 to 5 stars
  comment: string;
  timestamp: string;
  tableId: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface Order {
  id: string;
  tableId: string;
  sectionName: string;
  items: CartItem[];
  status: 'received' | 'preparing' | 'ready' | 'served' | 'completed';
  timestamp: string; // ISO string
  totalAmount: number;
  paymentStatus: 'pending' | 'completed';
  paymentMethod?: 'UPI' | 'Card' | 'Cash';
  billingRequested: boolean;
  estimatedPrepTimeMinutes?: number;
  feedback?: CustomerReview;
}

export interface Table {
  id: string;
  name: string; // e.g. "T1", "T2"
  status: 'free' | 'occupied' | 'billing_requested';
  currentOrderId?: string;
}

export interface Section {
  name: string; // e.g. "Classic Dining", "Rooftop", "Lounge"
  tables: Table[];
}

export interface SystemState {
  orders: Order[];
  menu: MenuItem[];
  sections: Section[];
  reviews: CustomerReview[];
}

export interface AiRecommendation {
  menuItem: MenuItem;
  reason: string;
  pairingSuggestion?: string;
}

