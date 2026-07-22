import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { CartItem, MenuItem, Order } from '../types';
import { HOTEL_INFO } from '../mockData';
import { MockPayment } from './MockPayment';
import { 
  Search, Plus, Minus, ShoppingBag, Info, Clock, 
  Phone, MapPin, Coffee, Utensils, X, ChevronRight, 
  CreditCard, Sparkles, AlertCircle, CheckCircle 
} from 'lucide-react';
import QRCode from 'qrcode';

export const CustomerView: React.FC = () => {
  const { menu, sections, orders, placeOrder, requestBill, settleBill, isCloudSync } = useApp();
  
  // Ref for landing screen QR code canvas
  const landingQrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Extract table and section from URL query params
  const [tableId, setTableId] = useState<string | null>(null);
  const [sectionName, setSectionName] = useState<string | null>(null);

  // If no table/section selected in URL, let them select one (Mock Scan)
  const [tempSection, setTempSection] = useState('');
  const [tempTable, setTempTable] = useState('');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartNotes, setCartNotes] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Menu filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [vegOnly, setVegOnly] = useState(false);

  // Active Order state for this table
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Payment modal state
  const [showPayment, setShowPayment] = useState(false);

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sec = params.get('section');
    const tab = params.get('table');
    if (sec && tab) {
      setSectionName(sec);
      setTableId(tab);
    }
  }, []);

  // Generate QR code for landing screen
  useEffect(() => {
    if (!tableId || !sectionName) {
      setTimeout(() => {
        if (landingQrCanvasRef.current) {
          let url = window.location.origin + '/';
          if (tempSection && tempTable) {
            url = `${window.location.origin}/?section=${encodeURIComponent(tempSection)}&table=${encodeURIComponent(tempTable)}`;
          }
          QRCode.toCanvas(landingQrCanvasRef.current, url, {
            width: 140,
            margin: 1,
            color: {
              dark: '#ea580c',
              light: '#ffffff'
            }
          }, (err) => {
            if (err) console.error("Error generating landing QR", err);
          });
        }
      }, 50);
    }
  }, [tableId, sectionName, tempSection, tempTable]);

  // Sync active order for this table
  useEffect(() => {
    if (tableId && sectionName) {
      const active = orders.find(
        o => o.tableId === tableId && 
             o.sectionName === sectionName && 
             o.status !== 'completed'
      );
      setActiveOrder(active || null);
    }
  }, [orders, tableId, sectionName]);

  const handleMockScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempSection && tempTable) {
      setSectionName(tempSection);
      setTableId(tempTable);
      
      const newUrl = `${window.location.origin}${window.location.pathname}?section=${encodeURIComponent(tempSection)}&table=${encodeURIComponent(tempTable)}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  };

  const getTableName = () => {
    if (!sectionName || !tableId) return '';
    const section = sections.find(s => s.name === sectionName);
    const table = section?.tables.find(t => t.id === tableId);
    return table ? `${sectionName} - ${table.name}` : `${sectionName} - ${tableId}`;
  };

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existing = prevCart.find(i => i.menuItem.id === item.id);
      if (existing) {
        return prevCart.map(i => 
          i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { menuItem: item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const existing = prevCart.find(i => i.menuItem.id === itemId);
      if (existing && existing.quantity > 1) {
        return prevCart.map(i => 
          i.menuItem.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prevCart.filter(i => i.menuItem.id !== itemId);
    });
  };

  const getCartCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const getCartTotal = () => cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowPayment(true);
  };

  const handlePaymentSuccess = (method: 'UPI' | 'Card') => {
    if (!tableId || !sectionName) return;
    
    const finalCart = cart.map(item => ({
      ...item,
      notes: cartNotes
    }));

    placeOrder(tableId, sectionName, finalCart);
    
    setCart([]);
    setCartNotes('');
    setIsCartOpen(false);
    setShowPayment(false);
  };

  const filteredMenu = menu.filter(item => {
    if (!item.isAvailable) return false;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesVeg = !vegOnly || item.isVeg;
    return matchesSearch && matchesCategory && matchesVeg;
  });

  const categories = ['All', 'Appetizers', 'Mains', 'Desserts', 'Beverages'];

  if (!tableId || !sectionName) {
    return (
      <div style={styles.qrScanContainer}>
        <div style={styles.qrScanCard} className="animate-scale-in">
          <div style={styles.qrIconWrapper}>
            <Utensils size={40} color="#ea580c" />
          </div>
          <h1 style={styles.scanTitle}>{HOTEL_INFO.name}</h1>
          <p style={styles.scanSubtitle}>Digital Dining Experience</p>
          
          <div style={styles.qrBox}>
            <div style={styles.qrScanLine}></div>
            <canvas ref={landingQrCanvasRef} style={{ display: 'block', borderRadius: '8px' }}></canvas>
          </div>
          
          <p style={styles.scanHint}>Please scan a table QR code to view the menu and order. Or simulate a table scan below:</p>

          <form onSubmit={handleMockScan} style={styles.scanForm}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Select Dining Section</label>
              <select 
                value={tempSection} 
                onChange={(e) => {
                  setTempSection(e.target.value);
                  setTempTable('');
                }}
                required
                style={styles.select}
              >
                <option value="">-- Choose Section --</option>
                {sections.map(s => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            {tempSection && (
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Select Table Number</label>
                <select 
                  value={tempTable} 
                  onChange={(e) => setTempTable(e.target.value)}
                  required
                  style={styles.select}
                >
                  <option value="">-- Choose Table --</option>
                  {sections.find(s => s.name === tempSection)?.tables.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (Status: {t.status})</option>
                  ))}
                </select>
              </div>
            )}

            <button type="submit" disabled={!tempTable} style={styles.scanSubmitBtn} className="shine-btn">
              Open Digital Menu
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-layout">
      {/* Top Welcome Header */}
      <header style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.hotelTitle}>{HOTEL_INFO.name}</h1>
            <p style={styles.tableBadge}>{getTableName()}</p>
          </div>
          <div style={styles.hotelStatus}>
            <Sparkles size={16} color="#eab308" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#b45309' }}>
              {isCloudSync ? "Live Cloud Sync" : "Contactless Dining"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.mainContent}>
        
        {/* Active Order Tracker */}
        {activeOrder && (
          <div style={styles.trackerCard} className="animate-slide-up">
            <div style={styles.trackerHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#ea580c" />
                <h3 style={styles.trackerTitle}>Current Order Status</h3>
              </div>
              <span style={{ ...styles.statusBadge, ...statusStyles[activeOrder.status] }}>
                {activeOrder.status}
              </span>
            </div>

            {/* Stepper progress */}
            <div style={styles.stepperContainer}>
              {['received', 'preparing', 'ready', 'served'].map((step, idx) => {
                const stepNames = ['Received', 'Preparing', 'Ready', 'Served'];
                const orderSteps = ['received', 'preparing', 'ready', 'served', 'completed'];
                const currentIdx = orderSteps.indexOf(activeOrder.status);
                const stepIdx = orderSteps.indexOf(step);
                const isCompleted = currentIdx >= stepIdx;
                const isActive = activeOrder.status === step;
                
                return (
                  <div key={step} style={styles.step}>
                    <div style={{
                      ...styles.stepCircle,
                      backgroundColor: isCompleted ? '#ea580c' : '#e7e5e4',
                      border: isActive ? '3px solid #ffedd5' : 'none',
                    }}>
                      {isCompleted && <CheckCircle size={14} color="#fff" />}
                    </div>
                    <span style={{ 
                      ...styles.stepLabel, 
                      color: isCompleted ? '#ea580c' : '#78716c',
                      fontWeight: isActive || isCompleted ? 600 : 400
                    }}>
                      {stepNames[idx]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={styles.trackerFooter}>
              <p style={styles.orderIdText}>Order ID: {activeOrder.id.toUpperCase()}</p>
              
              {activeOrder.status === 'ready' && !activeOrder.billingRequested && (
                <button 
                  onClick={() => requestBill(tableId, sectionName)} 
                  style={styles.requestBillBtn}
                >
                  Request Bill
                </button>
              )}

              {activeOrder.billingRequested && (
                <div style={styles.billingAlert}>
                  <AlertCircle size={16} color="#d97706" />
                  <span>Waiter will arrive shortly with the bill. Or pay below:</span>
                  <button 
                    onClick={() => {
                      setCart([]);
                      setShowPayment(true);
                    }}
                    style={styles.payNowBtn}
                  >
                    Pay ₹{activeOrder.totalAmount} Online
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* About Hotel info collapsible */}
        <details style={styles.aboutDetails} className="glass-panel">
          <summary style={styles.aboutSummary}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={16} color="#ea580c" />
              <span style={{ fontWeight: 600, fontSize: '14px' }}>About The Velvet Fork</span>
            </div>
            <ChevronRight size={16} style={styles.chevron} />
          </summary>
          <div style={styles.aboutContent}>
            <p style={styles.aboutDesc}>{HOTEL_INFO.description}</p>
            <div style={styles.aboutMetaGrid}>
              <div style={styles.aboutMetaItem}>
                <Clock size={14} color="#78716c" />
                <span>{HOTEL_INFO.timings}</span>
              </div>
              <div style={styles.aboutMetaItem}>
                <Phone size={14} color="#78716c" />
                <span>{HOTEL_INFO.phone}</span>
              </div>
              <div style={styles.aboutMetaItem}>
                <MapPin size={14} color="#78716c" />
                <span>{HOTEL_INFO.address}</span>
              </div>
            </div>
          </div>
        </details>

        {/* Search & Filter Bar */}
        <div style={styles.filterSection}>
          <div style={styles.searchWrapper}>
            <Search size={18} color="#a8a29e" style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search delicious dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            {searchQuery && (
              <X size={16} color="#78716c" onClick={() => setSearchQuery('')} style={styles.clearSearchIcon} />
            )}
          </div>

          <div style={styles.filterRow}>
            <div style={styles.categoriesScroll}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    ...styles.categoryTab,
                    ...(activeCategory === cat ? styles.activeCategoryTab : {})
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setVegOnly(!vegOnly)}
              style={{
                ...styles.vegFilterBtn,
                borderColor: vegOnly ? '#10b981' : '#e7e5e4',
                color: vegOnly ? '#10b981' : '#78716c',
                backgroundColor: vegOnly ? '#ecfdf5' : '#ffffff'
              }}
            >
              Veg Only
            </button>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div style={styles.menuGrid}>
          {filteredMenu.length > 0 ? (
            filteredMenu.map(item => {
              const cartItem = cart.find(c => c.menuItem.id === item.id);
              return (
                <div key={item.id} style={styles.menuCard} className="animate-scale-in">
                  <div style={styles.cardImageWrapper}>
                    <img src={item.image} alt={item.name} style={styles.cardImage} />
                    <span style={item.isVeg ? styles.vegBadge : styles.nonVegBadge}>
                      {item.isVeg ? 'Veg' : 'Non-Veg'}
                    </span>
                  </div>

                  <div style={styles.cardBody}>
                    <div style={styles.cardHeader}>
                      <h3 style={styles.itemName}>{item.name}</h3>
                      <span style={styles.itemPrice}>₹{item.price}</span>
                    </div>
                    <p style={styles.itemDesc}>{item.description}</p>
                    
                    <div style={styles.cardFooter}>
                      {cartItem ? (
                        <div style={styles.quantityWidget}>
                          <button onClick={() => removeFromCart(item.id)} style={styles.qtyBtn}>
                            <Minus size={14} color="#ea580c" />
                          </button>
                          <span style={styles.qtyText}>{cartItem.quantity}</span>
                          <button onClick={() => addToCart(item)} style={styles.qtyBtn}>
                            <Plus size={14} color="#ea580c" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(item)} style={styles.addCartBtn} className="shine-btn">
                          Add to Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={styles.noResults}>
              <Utensils size={36} color="#a8a29e" />
              <p style={{ marginTop: '8px', color: '#78716c', fontWeight: 500 }}>No items match your preferences.</p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Cart Bar */}
      {cart.length > 0 && (
        <div style={styles.stickyCartBar} className="glass-panel animate-slide-up">
          <div style={styles.stickyCartLeft}>
            <div style={styles.cartIconBadge}>
              <ShoppingBag size={20} color="#ffffff" />
              <span style={styles.cartBadgeCount}>{getCartCount()}</span>
            </div>
            <div>
              <p style={styles.cartSummaryText}>{getCartCount()} Item{getCartCount() > 1 ? 's' : ''} added</p>
              <p style={styles.cartPriceText}>₹{getCartTotal().toFixed(2)}</p>
            </div>
          </div>
          <button onClick={() => setIsCartOpen(true)} style={styles.viewCartBtn} className="shine-btn">
            View Cart <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Slide-over Cart Panel */}
      {isCartOpen && (
        <div style={styles.cartDrawerOverlay} onClick={() => setIsCartOpen(false)}>
          <div style={styles.cartDrawer} onClick={(e) => e.stopPropagation()} className="animate-slide-up">
            <div style={styles.drawerHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={20} color="#ea580c" />
                <h2 style={styles.drawerTitle}>Your Cart</h2>
              </div>
              <button onClick={() => setIsCartOpen(false)} style={styles.drawerCloseBtn}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.drawerContent}>
              {cart.map(item => (
                <div key={item.menuItem.id} style={styles.cartItemRow}>
                  <div style={styles.cartItemLeft}>
                    <span style={item.menuItem.isVeg ? styles.vegSquare : styles.nonVegSquare}></span>
                    <div>
                      <h4 style={styles.cartItemName}>{item.menuItem.name}</h4>
                      <p style={styles.cartItemPrice}>₹{item.menuItem.price} &times; {item.quantity}</p>
                    </div>
                  </div>
                  <div style={styles.cartItemRight}>
                    <div style={styles.drawerQuantityWidget}>
                      <button onClick={() => removeFromCart(item.menuItem.id)} style={styles.drawerQtyBtn}>
                        <Minus size={12} color="#78716c" />
                      </button>
                      <span style={styles.drawerQtyText}>{item.quantity}</span>
                      <button onClick={() => addToCart(item.menuItem)} style={styles.drawerQtyBtn}>
                        <Plus size={12} color="#78716c" />
                      </button>
                    </div>
                    <span style={styles.cartItemRowTotal}>₹{item.menuItem.price * item.quantity}</span>
                  </div>
                </div>
              ))}

              <div style={styles.notesSection}>
                <label style={styles.notesLabel}>Special Cooking Instructions / Notes</label>
                <textarea
                  placeholder="e.g. make it extra spicy, no onions, etc."
                  value={cartNotes}
                  onChange={(e) => setCartNotes(e.target.value)}
                  style={styles.notesTextarea}
                />
              </div>

              <div style={styles.billDetails}>
                <div style={styles.billRow}>
                  <span>Item Total</span>
                  <span>₹{getCartTotal().toFixed(2)}</span>
                </div>
                <div style={styles.billRow}>
                  <span>Taxes & Charges (GST 5%)</span>
                  <span>₹{(getCartTotal() * 0.05).toFixed(2)}</span>
                </div>
                <div style={{ ...styles.billRow, borderTop: '1px dashed #e7e5e4', paddingTop: '12px', marginTop: '12px' }}>
                  <span style={{ fontWeight: 700, fontSize: '16px' }}>Grand Total</span>
                  <span style={{ fontWeight: 800, fontSize: '18px', color: '#ea580c' }}>
                    ₹{(getCartTotal() * 1.05).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div style={styles.drawerFooter}>
              <button onClick={handleCheckout} style={styles.checkoutBtn} className="shine-btn">
                <CreditCard size={18} /> Pay & Place Order (₹{(getCartTotal() * 1.05).toFixed(2)})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Online Mock Payment Gateway Modal */}
      {showPayment && (
        <MockPayment
          amount={activeOrder ? activeOrder.totalAmount : getCartTotal() * 1.05}
          onClose={() => setShowPayment(false)}
          onPaymentSuccess={(method) => {
            if (activeOrder) {
              settleBill(activeOrder.id, method);
              setShowPayment(false);
            } else {
              handlePaymentSuccess(method);
            }
          }}
        />
      )}
    </div>
  );
};

const statusStyles: Record<string, React.CSSProperties> = {
  received: { backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' },
  preparing: { backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' },
  ready: { backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
  served: { backgroundColor: '#fcf7ff', color: '#7e22ce', border: '1px solid #e9d5ff' },
};

const styles: Record<string, React.CSSProperties> = {
  qrScanContainer: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafaf9',
    padding: '16px',
  },
  qrScanCard: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '36px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid #e7e5e4',
  },
  qrIconWrapper: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: '#ffedd5',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  scanTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '28px',
    fontWeight: 700,
    color: '#1c1917',
  },
  scanSubtitle: {
    fontSize: '14px',
    color: '#78716c',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    fontWeight: 600,
    marginBottom: '24px',
  },
  qrBox: {
    width: '160px',
    height: '160px',
    border: '2px solid #fdba74',
    borderRadius: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#fff7ed',
    marginBottom: '20px',
    overflow: 'hidden',
  },
  qrScanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '2px',
    backgroundColor: '#ea580c',
    boxShadow: '0 0 8px #ea580c',
    animation: 'scanLineMove 2s linear infinite',
  },
  scanHint: {
    fontSize: '13px',
    color: '#78716c',
    lineHeight: '1.6',
    marginBottom: '24px',
  },
  scanForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    textAlign: 'left',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#78716c',
  },
  select: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #e7e5e4',
    backgroundColor: '#fafaf9',
    fontSize: '14px',
    outline: 'none',
    color: '#1c1917',
  },
  scanSubmitBtn: {
    backgroundColor: '#ea580c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '14px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '8px',
    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.2)',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e7e5e4',
    padding: '16px 20px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hotelTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '22px',
    fontWeight: 700,
  },
  tableBadge: {
    fontSize: '12px',
    color: '#ea580c',
    fontWeight: 600,
    backgroundColor: '#ffedd5',
    padding: '2px 8px',
    borderRadius: '6px',
    display: 'inline-block',
    marginTop: '2px',
  },
  hotelStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#fef3c7',
    padding: '6px 12px',
    borderRadius: '20px',
  },
  mainContent: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  trackerCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e7e5e4',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  trackerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  trackerTitle: {
    fontSize: '15px',
    fontWeight: 700,
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    padding: '2px 8px',
    borderRadius: '6px',
  },
  stepperContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    margin: '12px 0 20px 0',
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    flex: 1,
    zIndex: 1,
  },
  stepCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontSize: '11px',
  },
  trackerFooter: {
    borderTop: '1px solid #f5f5f4',
    paddingTop: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  orderIdText: {
    fontSize: '11px',
    color: '#78716c',
    fontWeight: 500,
  },
  requestBillBtn: {
    backgroundColor: '#1e1b4b',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  billingAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#fffbeb',
    border: '1px solid #fef3c7',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#b45309',
    width: '100%',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  payNowBtn: {
    backgroundColor: '#ea580c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  aboutDetails: {
    borderRadius: '16px',
    padding: '14px',
  },
  aboutSummary: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    listStyle: 'none',
    outline: 'none',
  },
  chevron: {
    transition: 'transform 0.2s',
  },
  aboutContent: {
    marginTop: '12px',
    borderTop: '1px solid rgba(0,0,0,0.05)',
    paddingTop: '12px',
  },
  aboutDesc: {
    fontSize: '13px',
    color: '#6b6661',
    lineHeight: '1.6',
    marginBottom: '12px',
  },
  aboutMetaGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  aboutMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#78716c',
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
  },
  clearSearchIcon: {
    position: 'absolute',
    right: 14,
    cursor: 'pointer',
  },
  searchInput: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    borderRadius: '12px',
    border: '1px solid #e7e5e4',
    outline: 'none',
    fontSize: '14px',
    backgroundColor: '#ffffff',
  },
  filterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  categoriesScroll: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    paddingBottom: '4px',
    flex: 1,
    scrollbarWidth: 'none',
  },
  categoryTab: {
    background: '#ffffff',
    border: '1px solid #e7e5e4',
    borderRadius: '20px',
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#78716c',
    cursor: 'pointer',
  },
  activeCategoryTab: {
    backgroundColor: '#ea580c',
    borderColor: '#ea580c',
    color: '#ffffff',
  },
  vegFilterBtn: {
    border: '1px solid',
    borderRadius: '20px',
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  menuCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e7e5e4',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
    display: 'flex',
    flexDirection: 'column',
  },
  cardImageWrapper: {
    position: 'relative',
    height: '180px',
    backgroundColor: '#f5f5f4',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  vegBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: '#ecfdf5',
    color: '#10b981',
    border: '1px solid #10b981',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  nonVegBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    border: '1px solid #ef4444',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  cardBody: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  itemName: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#1c1917',
  },
  itemPrice: {
    fontSize: '16px',
    fontWeight: 800,
    color: '#ea580c',
  },
  itemDesc: {
    fontSize: '13px',
    color: '#78716c',
    marginBottom: '16px',
    flex: 1,
    lineHeight: '1.5',
  },
  cardFooter: {
    marginTop: 'auto',
  },
  addCartBtn: {
    width: '100%',
    backgroundColor: '#ffffff',
    border: '1px solid #ea580c',
    color: '#ea580c',
    borderRadius: '10px',
    padding: '10px 0',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  quantityWidget: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '1px solid #ea580c',
    borderRadius: '10px',
    padding: '4px',
    backgroundColor: '#ffedd5',
  },
  qtyBtn: {
    background: 'none',
    border: 'none',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  qtyText: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#ea580c',
  },
  noResults: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '40px 0',
  },
  stickyCartBar: {
    position: 'fixed',
    bottom: '16px',
    left: '16px',
    right: '16px',
    borderRadius: '16px',
    padding: '12px 18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 999,
  },
  stickyCartLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  cartIconBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#ea580c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadgeCount: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    backgroundColor: '#1e1b4b',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: 700,
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartSummaryText: {
    fontSize: '12px',
    color: '#78716c',
    fontWeight: 500,
  },
  cartPriceText: {
    fontSize: '16px',
    fontWeight: 800,
    color: '#ea580c',
  },
  viewCartBtn: {
    backgroundColor: '#ea580c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.15)',
  },
  cartDrawerOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  cartDrawer: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: '480px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
  },
  drawerHeader: {
    padding: '20px',
    borderBottom: '1px solid #e7e5e4',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drawerTitle: {
    fontSize: '18px',
    fontWeight: 700,
  },
  drawerCloseBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#78716c',
  },
  drawerContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  cartItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '16px',
    borderBottom: '1px solid #f5f5f4',
  },
  cartItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  vegSquare: {
    width: '12px',
    height: '12px',
    border: '1px solid #10b981',
    backgroundColor: '#ffffff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  nonVegSquare: {
    width: '12px',
    height: '12px',
    border: '1px solid #ef4444',
    backgroundColor: '#ffffff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartItemName: {
    fontSize: '14px',
    fontWeight: 600,
  },
  cartItemPrice: {
    fontSize: '12px',
    color: '#78716c',
  },
  cartItemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  drawerQuantityWidget: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #d6d3d1',
    borderRadius: '6px',
    padding: '2px',
    backgroundColor: '#fafaf9',
  },
  drawerQtyBtn: {
    background: 'none',
    border: 'none',
    width: '22px',
    height: '22px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerQtyText: {
    fontSize: '12px',
    fontWeight: 600,
    width: '16px',
    textAlign: 'center',
  },
  cartItemRowTotal: {
    fontSize: '14px',
    fontWeight: 700,
    width: '50px',
    textAlign: 'right',
  },
  notesSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  notesLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#78716c',
  },
  notesTextarea: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e7e5e4',
    outline: 'none',
    fontSize: '13px',
    resize: 'none',
    height: '60px',
    fontFamily: 'inherit',
  },
  billDetails: {
    backgroundColor: '#fafaf9',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #e7e5e4',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  billRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#78716c',
  },
  drawerFooter: {
    padding: '20px',
    borderTop: '1px solid #e7e5e4',
  },
  checkoutBtn: {
    width: '100%',
    backgroundColor: '#ea580c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 0',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  }
};

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    .veg-dot::after {
      content: '';
      position: absolute;
      width: 6px;
      height: 6px;
      background-color: #10b981;
      border-radius: 50%;
    }
    .nonveg-dot::after {
      content: '';
      position: absolute;
      width: 6px;
      height: 6px;
      background-color: #ef4444;
      border-radius: 50%;
    }
    @keyframes scanLineMove {
      0% { top: 0; }
      50% { top: 100%; }
      100% { top: 0; }
    }
  `;
  document.head.appendChild(styleSheet);
}
export default CustomerView;
