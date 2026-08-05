import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, Order, Section, Table, CartItem, CustomerReview } from '../types';
import { INITIAL_MENU, INITIAL_SECTIONS, INITIAL_REVIEWS } from '../mockData';
import { calculateAiPrepTime } from '../services/geminiService';
import { db, isFirebaseConfigured } from '../firebase';
import { 
  collection, doc, setDoc, addDoc, updateDoc, deleteDoc, 
  onSnapshot, query, orderBy, getDocs, writeBatch 
} from 'firebase/firestore';

interface AppContextType {

  menu: MenuItem[];
  sections: Section[];
  orders: Order[];
  reviews: CustomerReview[];
  isCloudSync: boolean;
  placeOrder: (tableId: string, sectionName: string, items: CartItem[]) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  requestBill: (tableId: string, sectionName: string) => void;
  settleBill: (orderId: string, paymentMethod: 'UPI' | 'Card' | 'Cash') => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  addCustomerReview: (review: Omit<CustomerReview, 'id' | 'timestamp'>) => void;
  resetMenuToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'hms_system_state';
const CHANNEL_NAME = 'hms_broadcast_channel';

// Helper interface for flattening tables from Firestore
interface FirestoreTable {
  id: string;
  name: string;
  sectionName: string;
  status: 'free' | 'occupied' | 'billing_requested';
  currentOrderId?: string;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>(INITIAL_REVIEWS);

  // Helper to re-seed Firestore with complete INITIAL_MENU
  const seedFirestoreMenu = async () => {
    if (!db) return;
    try {
      console.log("Seeding/Updating complete 34-item menu collection in Firestore...");
      const batch = writeBatch(db);
      INITIAL_MENU.forEach((item) => {
        const itemRef = doc(db, 'menu', item.id);
        batch.set(itemRef, item);
      });
      await batch.commit();
    } catch (e) {
      console.error("Error seeding Firestore menu:", e);
    }
  };

  // -----------------------------------------------------------------
  // 1. FIREBASE ACTIVE MODE
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    console.log("App running in CLOUD SYNC mode (Firebase)");

    // Listener for Menu
    const unsubscribeMenu = onSnapshot(collection(db, 'menu'), async (snapshot) => {
      if (snapshot.empty || snapshot.docs.length < INITIAL_MENU.length) {
        // DB is empty or has old small menu, seed full 34-item initial menu items
        await seedFirestoreMenu();
      } else {
        const menuItems: MenuItem[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as MenuItem;
          // Auto migrate old category names
          if ((data.category as string) === 'Appetizers') data.category = 'Starters';
          if ((data.category as string) === 'Mains') data.category = 'Main Course';
          menuItems.push(data);
        });
        setMenu(menuItems);
      }
    });


    // Listener for Tables & Sections
    const unsubscribeTables = onSnapshot(collection(db, 'tables'), async (snapshot) => {
      if (snapshot.empty) {
        // Seed flat tables
        console.log("Seeding tables collection in Firestore...");
        try {
          const batch = writeBatch(db);
          INITIAL_SECTIONS.forEach((section) => {
            section.tables.forEach((table) => {
              const tableRef = doc(db, 'tables', table.id);
              const flatTable: FirestoreTable = {
                id: table.id,
                name: table.name,
                sectionName: section.name,
                status: table.status,
                currentOrderId: table.currentOrderId || ""
              };
              batch.set(tableRef, flatTable);
            });
          });
          await batch.commit();
        } catch (e) {
          console.error("Error seeding tables:", e);
        }
      } else {
        const flatTables: FirestoreTable[] = [];
        snapshot.forEach((doc) => flatTables.push(doc.data() as FirestoreTable));
        
        // Rebuild nested Section[] structure
        const sectionsMap: Record<string, Table[]> = {};
        flatTables.forEach(t => {
          if (!sectionsMap[t.sectionName]) {
            sectionsMap[t.sectionName] = [];
          }
          sectionsMap[t.sectionName].push({
            id: t.id,
            name: t.name,
            status: t.status,
            currentOrderId: t.currentOrderId || undefined
          });
        });

        const rebuiltSections = Object.entries(sectionsMap).map(([name, tables]) => ({
          name,
          tables: tables.sort((a, b) => a.name.localeCompare(b.name))
        })).sort((a,b) => a.name.localeCompare(b.name));
        
        setSections(rebuiltSections);
      }
    });

    // Listener for Orders
    const unsubscribeOrders = onSnapshot(
      query(collection(db, 'orders'), orderBy('timestamp', 'asc')), 
      (snapshot) => {
        const activeOrders: Order[] = [];
        snapshot.forEach((doc) => activeOrders.push(doc.data() as Order));
        setOrders(activeOrders);
      }
    );

    return () => {
      unsubscribeMenu();
      unsubscribeTables();
      unsubscribeOrders();
    };
  }, []);

  // -----------------------------------------------------------------
  // 2. LOCAL FALLBACK MODE
  // -----------------------------------------------------------------
  useEffect(() => {
    if (isFirebaseConfigured && db) return;

    console.log("App running in LOCAL FALLBACK mode (localStorage)");

    // Initialize state from local storage or defaults with auto-migration
    const savedMenuStr = localStorage.getItem(`${LOCAL_STORAGE_KEY}_menu`);
    let activeMenu = INITIAL_MENU;

    if (savedMenuStr) {
      try {
        const parsed = JSON.parse(savedMenuStr);
        // If saved menu is an older version with fewer items or outdated schema, update to fresh INITIAL_MENU
        if (parsed.length < INITIAL_MENU.length) {
          activeMenu = INITIAL_MENU;
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_menu`, JSON.stringify(INITIAL_MENU));
        } else {
          // Migrate category names
          activeMenu = parsed.map((item: any) => ({
            ...item,
            category: item.category === 'Appetizers' ? 'Starters' : item.category === 'Mains' ? 'Main Course' : item.category
          }));
        }
      } catch (e) {
        activeMenu = INITIAL_MENU;
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_menu`, JSON.stringify(INITIAL_MENU));
      }
    } else {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_menu`, JSON.stringify(INITIAL_MENU));
    }
    setMenu(activeMenu);


    const savedSections = localStorage.getItem(`${LOCAL_STORAGE_KEY}_sections`);
    setSections(savedSections ? JSON.parse(savedSections) : INITIAL_SECTIONS);


    const savedOrders = localStorage.getItem(`${LOCAL_STORAGE_KEY}_orders`);
    setOrders(savedOrders ? JSON.parse(savedOrders) : []);

    const savedReviews = localStorage.getItem(`${LOCAL_STORAGE_KEY}_reviews`);
    setReviews(savedReviews ? JSON.parse(savedReviews) : INITIAL_REVIEWS);

    const channel = new BroadcastChannel(CHANNEL_NAME);

    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data;
      if (type === 'STATE_UPDATE') {
        if (payload.menu) setMenu(payload.menu);
        if (payload.sections) setSections(payload.sections);
        if (payload.orders) setOrders(payload.orders);
        if (payload.reviews) setReviews(payload.reviews);
      }
    };

    channel.addEventListener('message', handleMessage);

    // Sync via storage event
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `${LOCAL_STORAGE_KEY}_menu` && e.newValue) setMenu(JSON.parse(e.newValue));
      if (e.key === `${LOCAL_STORAGE_KEY}_sections` && e.newValue) setSections(JSON.parse(e.newValue));
      if (e.key === `${LOCAL_STORAGE_KEY}_orders` && e.newValue) setOrders(JSON.parse(e.newValue));
      if (e.key === `${LOCAL_STORAGE_KEY}_reviews` && e.newValue) setReviews(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Helper to save state locally & broadcast
  const saveAndBroadcastLocal = (
    updatedMenu: MenuItem[], 
    updatedSections: Section[], 
    updatedOrders: Order[], 
    updatedReviews: CustomerReview[] = reviews
  ) => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_menu`, JSON.stringify(updatedMenu));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_sections`, JSON.stringify(updatedSections));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_orders`, JSON.stringify(updatedOrders));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_reviews`, JSON.stringify(updatedReviews));

    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({
      type: 'STATE_UPDATE',
      payload: { menu: updatedMenu, sections: updatedSections, orders: updatedOrders, reviews: updatedReviews }
    });
    channel.close();
  };

  // -----------------------------------------------------------------
  // 3. API METHODS (Handles Firebase writes OR Local Fallbacks)
  // -----------------------------------------------------------------
  
  // Place Order with AI Prep Time
  const placeOrder = (tableId: string, sectionName: string, items: CartItem[]): Order => {
    const activeKitchenOrdersCount = orders.filter(o => o.status === 'received' || o.status === 'preparing').length;
    const aiPrepTime = calculateAiPrepTime(items, activeKitchenOrdersCount);

    const newOrder: Order = {
      id: `ord-${Math.random().toString(36).substr(2, 9)}`,
      tableId,
      sectionName,
      items,
      status: 'received',
      timestamp: new Date().toISOString(),
      totalAmount: items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0),
      paymentStatus: 'pending',
      billingRequested: false,
      estimatedPrepTimeMinutes: aiPrepTime
    };

    if (isFirebaseConfigured && db) {
      // Cloud Write
      try {
        setDoc(doc(db, 'orders', newOrder.id), newOrder);
        updateDoc(doc(db, 'tables', tableId), {
          status: 'occupied',
          currentOrderId: newOrder.id
        });
      } catch (e) {
        console.error("Firestore placeOrder failed:", e);
      }
    } else {
      // Local fallback
      const newOrders = [...orders, newOrder];
      const newSections = sections.map(section => {
        if (section.name === sectionName) {
          return {
            ...section,
            tables: section.tables.map(table => {
              if (table.id === tableId) {
                return { ...table, status: 'occupied' as const, currentOrderId: newOrder.id };
              }
              return table;
            })
          };
        }
        return section;
      });

      setOrders(newOrders);
      setSections(newSections);
      saveAndBroadcastLocal(menu, newSections, newOrders);
    }

    return newOrder;
  };

  // Update Order Status
  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    if (isFirebaseConfigured && db) {
      // Cloud Write
      try {
        updateDoc(doc(db, 'orders', orderId), { status });
        
        if (status === 'completed') {
          const targetOrder = orders.find(o => o.id === orderId);
          if (targetOrder) {
            updateDoc(doc(db, 'tables', targetOrder.tableId), {
              status: 'free',
              currentOrderId: ""
            });
          }
        }
      } catch (e) {
        console.error("Firestore updateOrderStatus failed:", e);
      }
    } else {
      // Local fallback
      const newOrders = orders.map(order => order.id === orderId ? { ...order, status } : order);
      let newSections = [...sections];

      if (status === 'completed') {
        const targetOrder = orders.find(o => o.id === orderId);
        if (targetOrder) {
          newSections = sections.map(section => {
            if (section.name === targetOrder.sectionName) {
              return {
                ...section,
                tables: section.tables.map(table => {
                  if (table.id === targetOrder.tableId) {
                    return { ...table, status: 'free' as const, currentOrderId: undefined };
                  }
                  return table;
                })
              };
            }
            return section;
          });
        }
      }

      setOrders(newOrders);
      setSections(newSections);
      saveAndBroadcastLocal(menu, newSections, newOrders);
    }
  };

  // Request billing
  const requestBill = (tableId: string, sectionName: string) => {
    const activeOrder = orders.find(
      o => o.tableId === tableId && o.sectionName === sectionName && o.status !== 'completed'
    );
    
    if (!activeOrder) return;

    if (isFirebaseConfigured && db) {
      // Cloud Write
      try {
        updateDoc(doc(db, 'orders', activeOrder.id), { billingRequested: true });
        updateDoc(doc(db, 'tables', tableId), { status: 'billing_requested' });
      } catch (e) {
        console.error("Firestore requestBill failed:", e);
      }
    } else {
      // Local fallback
      const newOrders = orders.map(order => order.id === activeOrder.id ? { ...order, billingRequested: true } : order);
      const newSections = sections.map(section => {
        if (section.name === sectionName) {
          return {
            ...section,
            tables: section.tables.map(table => {
              if (table.id === tableId) {
                return { ...table, status: 'billing_requested' as const };
              }
              return table;
            })
          };
        }
        return section;
      });

      setOrders(newOrders);
      setSections(newSections);
      saveAndBroadcastLocal(menu, newSections, newOrders);
    }
  };

  // Settle Bill
  const settleBill = (orderId: string, paymentMethod: 'UPI' | 'Card' | 'Cash') => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    if (isFirebaseConfigured && db) {
      // Cloud Write
      try {
        updateDoc(doc(db, 'orders', orderId), {
          paymentStatus: 'completed',
          paymentMethod,
          status: 'completed'
        });
        updateDoc(doc(db, 'tables', targetOrder.tableId), {
          status: 'free',
          currentOrderId: ""
        });
      } catch (e) {
        console.error("Firestore settleBill failed:", e);
      }
    } else {
      // Local fallback
      const newOrders = orders.map(order => {
        if (order.id === orderId) {
          return { ...order, paymentStatus: 'completed' as const, paymentMethod, status: 'completed' as const };
        }
        return order;
      });

      const newSections = sections.map(section => {
        if (section.name === targetOrder.sectionName) {
          return {
            ...section,
            tables: section.tables.map(table => {
              if (table.id === targetOrder.tableId) {
                return { ...table, status: 'free' as const, currentOrderId: undefined };
              }
              return table;
            })
          };
        }
        return section;
      });

      setOrders(newOrders);
      setSections(newSections);
      saveAndBroadcastLocal(menu, newSections, newOrders);
    }
  };

  // Menu Management
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newId = `menu-${Math.random().toString(36).substr(2, 9)}`;
    const newItem: MenuItem = { ...item, id: newId };

    if (isFirebaseConfigured && db) {
      try {
        setDoc(doc(db, 'menu', newId), newItem);
      } catch (e) {
        console.error("Firestore addMenuItem failed:", e);
      }
    } else {
      const newMenu = [...menu, newItem];
      setMenu(newMenu);
      saveAndBroadcastLocal(newMenu, sections, orders);
    }
  };

  const updateMenuItem = (updatedItem: MenuItem) => {
    if (isFirebaseConfigured && db) {
      try {
        setDoc(doc(db, 'menu', updatedItem.id), updatedItem);
      } catch (e) {
        console.error("Firestore updateMenuItem failed:", e);
      }
    } else {
      const newMenu = menu.map(item => item.id === updatedItem.id ? updatedItem : item);
      setMenu(newMenu);
      saveAndBroadcastLocal(newMenu, sections, orders);
    }
  };

  const deleteMenuItem = (id: string) => {
    if (isFirebaseConfigured && db) {
      try {
        deleteDoc(doc(db, 'menu', id));
      } catch (e) {
        console.error("Firestore deleteMenuItem failed:", e);
      }
    } else {
      const newMenu = menu.filter(item => item.id !== id);
      setMenu(newMenu);
      saveAndBroadcastLocal(newMenu, sections, orders);
    }
  };

  const addCustomerReview = (review: Omit<CustomerReview, 'id' | 'timestamp'>) => {
    const newId = `rev-${Math.random().toString(36).substr(2, 9)}`;
    const newReview: CustomerReview = {
      ...review,
      id: newId,
      timestamp: new Date().toISOString(),
      sentiment: review.rating >= 4 ? 'positive' : review.rating === 3 ? 'neutral' : 'negative'
    };

    const newReviews = [newReview, ...reviews];
    setReviews(newReviews);

    if (isFirebaseConfigured && db) {
      try {
        setDoc(doc(db, 'reviews', newId), newReview);
      } catch (e) {
        console.error("Firestore addCustomerReview failed:", e);
      }
    } else {
      saveAndBroadcastLocal(menu, sections, orders, newReviews);
    }
  };

  const resetMenuToDefault = async () => {
    setMenu(INITIAL_MENU);
    if (isFirebaseConfigured && db) {
      await seedFirestoreMenu();
    } else {
      saveAndBroadcastLocal(INITIAL_MENU, sections, orders, reviews);
    }
  };

  return (
    <AppContext.Provider value={{
      menu,
      sections,
      orders,
      reviews,
      isCloudSync: isFirebaseConfigured,
      placeOrder,
      updateOrderStatus,
      requestBill,
      settleBill,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      addCustomerReview,
      resetMenuToDefault
    }}>
      {children}
    </AppContext.Provider>
  );
};



export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
