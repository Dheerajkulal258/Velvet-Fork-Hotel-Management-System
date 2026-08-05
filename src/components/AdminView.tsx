import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { MenuItem, Order, Table } from '../types';
import { HOTEL_INFO } from '../mockData';
import { AiAdminAnalytics } from './ai/AiAdminAnalytics';
import { 
  BarChart3, QrCode, ClipboardList, Plus, Edit2, Trash2, 
  DollarSign, Percent, Receipt, Check, RefreshCw, Layers, 
  ExternalLink, Download, AlertCircle, ShoppingBag, Sparkles 
} from 'lucide-react';
import QRCode from 'qrcode';

export const AdminView: React.FC = () => {
  const { 
    menu, sections, orders, updateOrderStatus, settleBill, 
    addMenuItem, updateMenuItem, deleteMenuItem, resetMenuToDefault, isCloudSync 
  } = useApp();


  const [activeTab, setActiveTab] = useState<'tables' | 'qr' | 'menu' | 'analytics' | 'ai_insights'>('ai_insights');

  
  const [selectedTable, setSelectedTable] = useState<{ sectionName: string; table: Table } | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [taxPercent] = useState<number>(5); // GST 5%
  const [serviceChargePercent, setServiceChargePercent] = useState<number>(5);

  const [qrSection, setQrSection] = useState(sections[0]?.name || '');
  const [qrTableId, setQrTableId] = useState('');
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategory, setItemCategory] = useState<MenuItem['category']>('Main Course');

  const [itemIsVeg, setItemIsVeg] = useState(true);
  const [itemDesc, setItemDesc] = useState('');
  const [itemImage, setItemImage] = useState('');

  // Re-sync default values if sections are loaded async
  useEffect(() => {
    if (sections.length > 0 && !qrSection) {
      setQrSection(sections[0].name);
    }
  }, [sections]);

  useEffect(() => {
    if (sections.length > 0 && qrSection) {
      const section = sections.find(s => s.name === qrSection) || sections[0];
      if (section && section.tables.length > 0) {
        setQrTableId(section.tables[0].id);
      }
    }
  }, [qrSection, sections]);

  const getCustomerUrl = (sec: string, tabId: string) => {
    return `${window.location.origin}/?section=${encodeURIComponent(sec)}&table=${encodeURIComponent(tabId)}`;
  };

  useEffect(() => {
    if (activeTab === 'qr' && qrCanvasRef.current && qrSection && qrTableId) {
      const url = getCustomerUrl(qrSection, qrTableId);
      QRCode.toCanvas(qrCanvasRef.current, url, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }, (err) => {
        if (err) console.error("Error drawing QR", err);
      });
    }
  }, [activeTab, qrSection, qrTableId]);

  const getActiveOrderForTable = (table: Table, sectionName: string): Order | undefined => {
    if (!table.currentOrderId) return undefined;
    return orders.find(o => o.id === table.currentOrderId && o.status !== 'completed');
  };

  const handleSettle = (orderId: string, method: 'UPI' | 'Card' | 'Cash') => {
    settleBill(orderId, method);
    setSelectedTable(null);
  };

  const handleMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemData = {
      name: itemName,
      price: parseFloat(itemPrice),
      category: itemCategory,
      isVeg: itemIsVeg,
      description: itemDesc,
      image: itemImage || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
      isAvailable: true
    };

    if (editingItem) {
      updateMenuItem({ ...editingItem, ...itemData });
      setEditingItem(null);
    } else {
      addMenuItem(itemData);
      setIsAddingItem(false);
    }

    setItemName('');
    setItemPrice('');
    setItemDesc('');
    setItemImage('');
  };

  const startEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemPrice(item.price.toString());
    setItemCategory(item.category);
    setItemIsVeg(item.isVeg);
    setItemDesc(item.description);
    setItemImage(item.image);
    setIsAddingItem(true);
  };

  const getTotals = (order: Order) => {
    const subtotal = order.totalAmount;
    const tax = subtotal * (taxPercent / 100);
    const service = subtotal * (serviceChargePercent / 100);
    const discount = subtotal * (discountPercent / 100);
    const grand = subtotal + tax + service - discount;
    return { subtotal, tax, service, discount, grand };
  };

  const getTotalRevenue = () => {
    return orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  };

  const getOccupancyRate = () => {
    let totalTables = 0;
    let occupiedTables = 0;
    sections.forEach(s => {
      totalTables += s.tables.length;
      occupiedTables += s.tables.filter(t => t.status !== 'free').length;
    });
    return totalTables ? Math.round((occupiedTables / totalTables) * 100) : 0;
  };

  const getTopSellingItem = () => {
    const counts: Record<string, { count: number; name: string }> = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        if (!counts[item.menuItem.id]) {
          counts[item.menuItem.id] = { count: 0, name: item.menuItem.name };
        }
        counts[item.menuItem.id].count += item.quantity;
      });
    });
    const sorted = Object.values(counts).sort((a, b) => b.count - a.count);
    return sorted[0] ? `${sorted[0].name} (${sorted[0].count} sold)` : 'N/A';
  };

  return (
    <div className="dashboard-layout" style={styles.container}>
      {/* Top Navbar */}
      <header style={styles.navHeader} className="dashboard-glass-card">
        <div style={styles.navBrand}>
          <div style={styles.logoBg}>
            <Layers size={22} color="#09090b" />
          </div>
          <div>
            <h1 style={styles.navTitle}>{HOTEL_INFO.name}</h1>
            <p style={styles.navSubtitle}>
              {isCloudSync ? "Owner Cloud Admin Dashboard" : "Owner & Restaurant Admin Dashboard"}
            </p>
          </div>
        </div>

        <nav style={styles.navLinks}>
          <button 
            onClick={() => setActiveTab('tables')} 
            style={{ ...styles.navLink, ...(activeTab === 'tables' ? styles.activeNavLink : {}) }}
          >
            <ClipboardList size={16} /> Table Layout
          </button>
          <button 
            onClick={() => setActiveTab('qr')} 
            style={{ ...styles.navLink, ...(activeTab === 'qr' ? styles.activeNavLink : {}) }}
          >
            <QrCode size={16} /> QR Codes
          </button>
          <button 
            onClick={() => setActiveTab('menu')} 
            style={{ ...styles.navLink, ...(activeTab === 'menu' ? styles.activeNavLink : {}) }}
          >
            <Layers size={16} /> Menu Manager
          </button>
          <button 
            onClick={() => setActiveTab('ai_insights')} 
            style={{ 
              ...styles.navLink, 
              ...(activeTab === 'ai_insights' ? {
                ...styles.activeNavLink,
                backgroundImage: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)'
              } : {}) 
            }}
          >
            <Sparkles size={16} color={activeTab === 'ai_insights' ? '#ffffff' : '#f97316'} /> AI Business Intelligence
          </button>

          <button 
            onClick={() => setActiveTab('analytics')} 
            style={{ ...styles.navLink, ...(activeTab === 'analytics' ? styles.activeNavLink : {}) }}
          >
            <BarChart3 size={16} /> Live Analytics
          </button>
        </nav>
      </header>

      {/* Main View Area */}
      <div style={styles.contentArea}>

        {/* AI BUSINESS INTELLIGENCE TAB */}
        {activeTab === 'ai_insights' && (
          <AiAdminAnalytics />
        )}
        
        {/* TABLE LAYOUT TAB */}
        {activeTab === 'tables' && (

          <div style={styles.tabContentRow}>
            {/* Sections and Tables */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {sections.map(section => (
                <div key={section.name}>
                  <h2 style={styles.sectionHeader}>{section.name}</h2>
                  <div style={styles.tableGrid}>
                    {section.tables.map(table => {
                      const activeOrder = getActiveOrderForTable(table, section.name);
                      const isOccupied = table.status === 'occupied';
                      const isBilling = table.status === 'billing_requested';
                      
                      let cardStyle = styles.tableCardFree;
                      let statusText = "FREE";
                      if (isOccupied) {
                        cardStyle = styles.tableCardOccupied;
                        statusText = activeOrder ? activeOrder.status.toUpperCase() : "OCCUPIED";
                      } else if (isBilling) {
                        cardStyle = styles.tableCardBilling;
                        statusText = "BILL REQUEST";
                      }

                      return (
                        <div 
                          key={table.id} 
                          onClick={() => setSelectedTable({ sectionName: section.name, table })}
                          style={{
                            ...styles.tableCardBase,
                            ...cardStyle,
                            animation: isBilling ? 'pulseRedBorder 1.5s infinite' : 'none'
                          }}
                          className="dashboard-glass-card animate-scale-in"
                        >
                          <div style={styles.tableCardHeader}>
                            <span style={styles.tableCardName}>{table.name}</span>
                            <span style={{
                              ...styles.tableStatusBadge,
                              color: isBilling ? '#ef4444' : isOccupied ? '#f59e0b' : '#10b981',
                              backgroundColor: isBilling ? 'rgba(239,68,68,0.1)' : isOccupied ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)'
                            }}>
                              {statusText}
                            </span>
                          </div>

                          {activeOrder && (
                            <div style={styles.tableCardOrderBrief}>
                              <p style={styles.orderBriefItems}>{activeOrder.items.reduce((s, i) => s + i.quantity, 0)} Items ordered</p>
                              <p style={styles.orderBriefPrice}>₹{activeOrder.totalAmount}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Billing & Order details */}
            {selectedTable && (
              <div style={styles.billingSidebar} className="dashboard-glass-card animate-slide-up">
                {(() => {
                  const tableData = selectedTable.table;
                  const activeOrder = getActiveOrderForTable(tableData, selectedTable.sectionName);
                  
                  return (
                    <>
                      <div style={styles.sidebarHeader}>
                        <div>
                          <h3 style={styles.sidebarTitle}>{tableData.name}</h3>
                          <p style={styles.sidebarSubtitle}>{selectedTable.sectionName}</p>
                        </div>
                        <button onClick={() => setSelectedTable(null)} style={styles.sidebarClose}>&times;</button>
                      </div>

                      {activeOrder ? (
                        <div style={styles.sidebarBody}>
                          {/* Order Items list */}
                          <div style={styles.orderListContainer}>
                            <h4 style={styles.detailsGroupTitle}>Ordered Items</h4>
                            <div style={styles.orderedItemsScroll}>
                              {activeOrder.items.map((item, idx) => (
                                <div key={idx} style={styles.sidebarItemRow}>
                                  <div>
                                    <p style={styles.sidebarItemName}>{item.menuItem.name} &times; {item.quantity}</p>
                                    {item.notes && <p style={styles.sidebarItemNotes}>Note: {item.notes}</p>}
                                  </div>
                                  <span style={styles.sidebarItemTotal}>₹{item.menuItem.price * item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Billing modifiers */}
                          <div style={styles.billingModifiers}>
                            <h4 style={styles.detailsGroupTitle}>Bill Calculations</h4>
                            
                            <div style={styles.inputRow}>
                              <div style={styles.modifierInputGroup}>
                                <Percent size={14} style={{ marginRight: '6px' }} />
                                <label style={styles.modifierLabel}>Discount (%)</label>
                                <input 
                                  type="number" 
                                  min="0" 
                                  max="100" 
                                  value={discountPercent} 
                                  onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                                  style={styles.modifierInput}
                                />
                              </div>
                              <div style={styles.modifierInputGroup}>
                                <Percent size={14} style={{ marginRight: '6px' }} />
                                <label style={styles.modifierLabel}>Service Chg (%)</label>
                                <input 
                                  type="number" 
                                  min="0" 
                                  max="100" 
                                  value={serviceChargePercent} 
                                  onChange={(e) => setServiceChargePercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                                  style={styles.modifierInput}
                                />
                              </div>
                            </div>

                            {/* Totals Summary */}
                            {(() => {
                              const calc = getTotals(activeOrder);
                              return (
                                <div style={styles.billingSummary}>
                                  <div style={styles.billCalcRow}>
                                    <span>Subtotal</span>
                                    <span>₹{calc.subtotal.toFixed(2)}</span>
                                  </div>
                                  <div style={styles.billCalcRow}>
                                    <span>Taxes (GST {taxPercent}%)</span>
                                    <span>₹{calc.tax.toFixed(2)}</span>
                                  </div>
                                  <div style={styles.billCalcRow}>
                                    <span>Service Charge ({serviceChargePercent}%)</span>
                                    <span>₹{calc.service.toFixed(2)}</span>
                                  </div>
                                  {calc.discount > 0 && (
                                    <div style={{ ...styles.billCalcRow, color: '#ef4444' }}>
                                      <span>Discount ({discountPercent}%)</span>
                                      <span>-₹{calc.discount.toFixed(2)}</span>
                                    </div>
                                  )}
                                  <div style={styles.billCalcRowTotal}>
                                    <span>Total Bill</span>
                                    <span>₹{calc.grand.toFixed(2)}</span>
                                  </div>

                                  {/* Settlement Actions */}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                                    <button 
                                      onClick={() => handleSettle(activeOrder.id, 'Cash')}
                                      style={{ ...styles.settleButton, backgroundColor: '#10b981', color: '#ffffff' }}
                                    >
                                      Settle with Cash
                                    </button>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                      <button 
                                        onClick={() => handleSettle(activeOrder.id, 'Card')}
                                        style={{ ...styles.settleButton, flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                                      >
                                        Settle Card
                                      </button>
                                      <button 
                                        onClick={() => handleSettle(activeOrder.id, 'UPI')}
                                        style={{ ...styles.settleButton, flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                                      >
                                        Settle UPI
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      ) : (
                        <div style={styles.emptySidebarBody}>
                          <AlertCircle size={28} color="#71717a" />
                          <p style={{ marginTop: '12px', fontSize: '13px', color: '#a1a1aa' }}>
                            This table has no active order. Customers can scan the QR code to begin ordering.
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* QR CODE GENERATOR TAB */}
        {activeTab === 'qr' && (
          <div style={styles.qrTabContainer} className="dashboard-glass-card">
            <div style={styles.qrSelectorBox}>
              <h2 style={styles.tabSectionTitle}>Print Table QR Codes</h2>
              <p style={{ color: '#a1a1aa', fontSize: '13px', marginBottom: '24px' }}>
                Select a section and table to generate its unique QR ordering code.
              </p>

              <div style={styles.formGroup}>
                <label style={styles.label}>Select Dining Section</label>
                <select 
                  value={qrSection} 
                  onChange={(e) => setQrSection(e.target.value)}
                  style={styles.select}
                >
                  {sections.map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Select Table</label>
                <select 
                  value={qrTableId} 
                  onChange={(e) => setQrTableId(e.target.value)}
                  style={styles.select}
                >
                  {sections.find(s => s.name === qrSection)?.tables.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.qrPreviewBox}>
              <div style={styles.qrPaper}>
                <h3 style={styles.qrPaperHotelName}>{HOTEL_INFO.name}</h3>
                <p style={styles.qrPaperSubtitle}>Scan to Order Food</p>
                
                <div style={styles.qrCanvasWrapper}>
                  <canvas ref={qrCanvasRef}></canvas>
                </div>

                <div style={styles.qrPaperTableBadge}>
                  {qrSection} - {sections.find(s => s.name === qrSection)?.tables.find(t => t.id === qrTableId)?.name || qrTableId}
                </div>
              </div>

              <div style={styles.qrActions}>
                <button 
                  onClick={() => {
                    const canvas = qrCanvasRef.current;
                    if (canvas) {
                      const image = canvas.toDataURL("image/png");
                      const link = document.createElement('a');
                      link.download = `QR-${qrSection}-${qrTableId}.png`;
                      link.href = image;
                      link.click();
                    }
                  }} 
                  style={styles.actionBtn}
                  className="shine-btn"
                >
                  <Download size={14} /> Download QR Image
                </button>
                
                <a 
                  href={getCustomerUrl(qrSection, qrTableId)} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ ...styles.actionBtn, backgroundColor: 'rgba(255,255,255,0.05)', color: '#fafafa', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}
                >
                  <ExternalLink size={14} /> Open Customer View <span style={{fontSize: '11px', color: '#a1a1aa'}}>(Simulate Scan)</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* MENU MANAGER TAB */}
        {activeTab === 'menu' && (
          <div style={styles.menuTabContainer}>
            <div style={styles.menuHeaderRow}>
              <h2 style={styles.tabSectionTitle}>Menu Management</h2>
              {!isAddingItem && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={resetMenuToDefault}
                    style={{ ...styles.addMenuBtn, backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#d4d4d8' }}
                  >
                    <RefreshCw size={14} /> Re-sync 34 Default Items
                  </button>
                  <button 
                    onClick={() => {
                      setEditingItem(null);
                      setIsAddingItem(true);
                    }} 
                    style={styles.addMenuBtn}
                    className="shine-btn"
                  >
                    <Plus size={16} /> Add Menu Item
                  </button>
                </div>
              )}

            </div>

            {isAddingItem ? (
              <form onSubmit={handleMenuSubmit} style={styles.menuForm} className="dashboard-glass-card">
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>
                  {editingItem ? 'Edit Menu Item' : 'Create New Menu Item'}
                </h3>
                
                <div style={styles.formRow}>
                  <div style={{ ...styles.formGroup, flex: 2 }}>
                    <label style={styles.label}>Item Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Garlic Naan" 
                      value={itemName} 
                      onChange={(e) => setItemName(e.target.value)}
                      required 
                      style={styles.input}
                    />
                  </div>
                  <div style={{ ...styles.formGroup, flex: 1 }}>
                    <label style={styles.label}>Price (₹)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 150" 
                      value={itemPrice} 
                      onChange={(e) => setItemPrice(e.target.value)}
                      required 
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={{ ...styles.formGroup, flex: 1 }}>
                    <label style={styles.label}>Category</label>
                    <select 
                      value={itemCategory} 
                      onChange={(e) => setItemCategory(e.target.value as MenuItem['category'])}
                      style={styles.select}
                    >
                      <option value="Starters">Starters</option>
                      <option value="Rice & Biryanis">Rice & Biryanis</option>
                      <option value="Tandoori & Grills">Tandoori & Grills</option>
                      <option value="Chef Specials">Chef Specials</option>
                      <option value="Main Course">Main Course</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Beverages">Beverages</option>

                    </select>

                  </div>
                  <div style={{ ...styles.formGroup, flex: 1 }}>
                    <label style={styles.label}>Dietary Marker</label>
                    <select 
                      value={itemIsVeg ? 'veg' : 'non-veg'} 
                      onChange={(e) => setItemIsVeg(e.target.value === 'veg')}
                      style={styles.select}
                    >
                      <option value="veg">Vegetarian</option>
                      <option value="non-veg">Non-Vegetarian</option>
                    </select>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Image URL (Unsplash/Web)</label>
                  <input 
                    type="url" 
                    placeholder="https://images.unsplash.com/..." 
                    value={itemImage} 
                    onChange={(e) => setItemImage(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea 
                    placeholder="Describe the dish ingredients and flavor profile..." 
                    value={itemDesc} 
                    onChange={(e) => setItemDesc(e.target.value)}
                    required
                    style={styles.textarea}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsAddingItem(false);
                      setEditingItem(null);
                    }} 
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button type="submit" style={styles.saveBtn} className="shine-btn">
                    {editingItem ? 'Save Changes' : 'Add Item to Menu'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={styles.menuItemsListGrid}>
                {menu.map(item => (
                  <div key={item.id} style={styles.menuItemCard} className="dashboard-glass-card">
                    <img src={item.image} alt={item.name} style={styles.menuItemImg} />
                    <div style={styles.menuItemInfo}>
                      <div style={styles.menuItemHeader}>
                        <h4 style={styles.menuItemName}>{item.name}</h4>
                        <span style={styles.menuItemPrice}>₹{item.price}</span>
                      </div>
                      <p style={styles.menuItemDesc}>{item.description}</p>
                      
                      <div style={styles.menuItemFooter}>
                        <span style={item.isVeg ? styles.tagVeg : styles.tagNonVeg}>
                          {item.isVeg ? 'Veg' : 'Non-Veg'}
                        </span>
                        
                        <div style={styles.menuItemActions}>
                          <button onClick={() => startEditItem(item)} style={styles.actionIconBtn}>
                            <Edit2 size={14} color="#f59e0b" />
                          </button>
                          <button onClick={() => deleteMenuItem(item.id)} style={styles.actionIconBtn}>
                            <Trash2 size={14} color="#ef4444" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div style={styles.analyticsContainer}>
            <div style={styles.analyticsSummaryGrid}>
              <div style={styles.metricCard} className="dashboard-glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={styles.metricLabel}>Total Revenue (Settled)</span>
                  <DollarSign size={20} color="#10b981" />
                </div>
                <h3 style={styles.metricValue}>₹{getTotalRevenue().toFixed(2)}</h3>
                <p style={styles.metricSubtext}>Based on completed table checkouts</p>
              </div>

              <div style={styles.metricCard} className="dashboard-glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={styles.metricLabel}>Table Occupancy</span>
                  <RefreshCw size={20} color="#f59e0b" />
                </div>
                <h3 style={styles.metricValue}>{getOccupancyRate()}%</h3>
                <p style={styles.metricSubtext}>Percentage of active dining tables</p>
              </div>

              <div style={styles.metricCard} className="dashboard-glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={styles.metricLabel}>Top Seller</span>
                  <ShoppingBag size={20} color="#a855f7" />
                </div>
                <h3 style={{ ...styles.metricValue, fontSize: '20px', marginTop: '12px' }}>
                  {getTopSellingItem()}
                </h3>
                <p style={styles.metricSubtext}>Most popular item by order volume</p>
              </div>
            </div>

            {/* Orders Log */}
            <div style={styles.ordersLogBox} className="dashboard-glass-card">
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>System Order Log</h3>
              
              <div style={styles.tableScrollWrapper}>
                <table style={styles.logTable}>
                  <thead>
                    <tr>
                      <th style={styles.tableTh}>Order ID</th>
                      <th style={styles.tableTh}>Table</th>
                      <th style={styles.tableTh}>Status</th>
                      <th style={styles.tableTh}>Bill Amount</th>
                      <th style={styles.tableTh}>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length > 0 ? (
                      orders.map(order => (
                        <tr key={order.id} style={styles.tableTr}>
                          <td style={styles.tableTd}>{order.id.toUpperCase()}</td>
                          <td style={styles.tableTd}>{order.sectionName} - {order.tableId.split('-').pop()}</td>
                          <td style={styles.tableTd}>
                            <span style={{ 
                              padding: '2px 8px', 
                              borderRadius: '4px', 
                              fontSize: '11px', 
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              backgroundColor: order.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                              color: order.status === 'completed' ? '#10b981' : '#f59e0b'
                            }}>
                              {order.status}
                            </span>
                          </td>
                          <td style={styles.tableTd}>₹{order.totalAmount}</td>
                          <td style={styles.tableTd}>
                            <span style={{
                              color: order.paymentStatus === 'completed' ? '#10b981' : '#ef4444',
                              fontWeight: 600,
                              fontSize: '12px'
                            }}>
                              {order.paymentStatus.toUpperCase()} {order.paymentMethod ? `(${order.paymentMethod})` : ''}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ ...styles.tableTd, textAlign: 'center', color: '#71717a' }}>No orders placed yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  navHeader: {
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoBg: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#f59e0b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: '20px',
    fontWeight: 700,
    letterSpacing: '-0.5px',
  },
  navSubtitle: {
    fontSize: '12px',
    color: '#a1a1aa',
  },
  navLinks: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  navLink: {
    background: 'none',
    border: 'none',
    color: '#a1a1aa',
    fontSize: '14px',
    fontWeight: 600,
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  activeNavLink: {
    backgroundColor: '#f59e0b',
    color: '#09090b',
  },
  contentArea: {
    flex: 1,
  },
  tabContentRow: {
    display: 'flex',
    gap: '24px',
    alignItems: 'start',
    flexWrap: 'wrap-reverse',
  },
  sectionHeader: {
    fontSize: '18px',
    fontWeight: 700,
    marginBottom: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: '8px',
  },
  tableGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  tableCardBase: {
    padding: '16px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minHeight: '110px',
    justifyContent: 'space-between',
  },
  tableCardFree: {
    borderLeft: '4px solid #10b981',
  },
  tableCardOccupied: {
    borderLeft: '4px solid #f59e0b',
  },
  tableCardBilling: {
    borderLeft: '4px solid #ef4444',
  },
  tableCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableCardName: {
    fontSize: '15px',
    fontWeight: 700,
  },
  tableStatusBadge: {
    fontSize: '10px',
    fontWeight: 800,
    padding: '2px 6px',
    borderRadius: '4px',
  },
  tableCardOrderBrief: {
    fontSize: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    color: '#a1a1aa',
  },
  orderBriefItems: {
    fontWeight: 500,
  },
  orderBriefPrice: {
    fontWeight: 700,
    color: '#f59e0b',
  },
  billingSidebar: {
    width: '100%',
    maxWidth: '380px',
    padding: '20px',
    position: 'sticky',
    top: '24px',
    flexShrink: 0,
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: '14px',
    marginBottom: '16px',
  },
  sidebarTitle: {
    fontSize: '18px',
    fontWeight: 700,
  },
  sidebarSubtitle: {
    fontSize: '12px',
    color: '#a1a1aa',
  },
  sidebarClose: {
    background: 'none',
    border: 'none',
    color: '#71717a',
    fontSize: '24px',
    cursor: 'pointer',
  },
  sidebarBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  orderListContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  detailsGroupTitle: {
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#71717a',
    marginBottom: '10px',
    letterSpacing: '0.5px',
  },
  orderedItemsScroll: {
    maxHeight: '180px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingRight: '6px',
  },
  sidebarItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
  },
  sidebarItemName: {
    fontWeight: 500,
  },
  sidebarItemNotes: {
    fontSize: '11px',
    color: '#f59e0b',
    fontStyle: 'italic',
    marginTop: '2px',
  },
  sidebarItemTotal: {
    fontWeight: 600,
  },
  billingModifiers: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    paddingTop: '16px',
  },
  inputRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  modifierInputGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  modifierLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#a1a1aa',
  },
  modifierInput: {
    padding: '8px 10px',
    borderRadius: '6px',
    backgroundColor: '#09090b',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fafafa',
    fontSize: '13px',
    outline: 'none',
  },
  billingSummary: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: '8px',
    padding: '12px',
    border: '1px solid rgba(255,255,255,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  billCalcRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#a1a1aa',
  },
  billCalcRowTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '15px',
    fontWeight: 800,
    color: '#f59e0b',
    borderTop: '1px dashed rgba(255,255,255,0.1)',
    paddingTop: '8px',
    marginTop: '4px',
  },
  settleButton: {
    padding: '10px 0',
    borderRadius: '8px',
    border: 'none',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  emptySidebarBody: {
    textAlign: 'center',
    padding: '40px 0',
  },
  qrTabContainer: {
    padding: '28px',
    display: 'flex',
    gap: '40px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  qrSelectorBox: {
    flex: 1,
    minWidth: '280px',
  },
  tabSectionTitle: {
    fontSize: '20px',
    fontWeight: 700,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#a1a1aa',
  },
  select: {
    padding: '12px 14px',
    borderRadius: '8px',
    backgroundColor: '#09090b',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fafafa',
    fontSize: '14px',
    outline: 'none',
  },
  qrPreviewBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  qrPaper: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '16px',
    textAlign: 'center',
    color: '#000000',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    width: '240px',
  },
  qrPaperHotelName: {
    fontSize: '16px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  qrPaperSubtitle: {
    fontSize: '11px',
    color: '#71717a',
    marginBottom: '16px',
  },
  qrCanvasWrapper: {
    display: 'inline-block',
    padding: '8px',
    border: '1px solid #e4e4e7',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
  },
  qrPaperTableBadge: {
    fontSize: '13px',
    fontWeight: 700,
    backgroundColor: '#f4f4f5',
    padding: '6px 12px',
    borderRadius: '6px',
    marginTop: '16px',
    display: 'inline-block',
  },
  qrActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
  },
  actionBtn: {
    backgroundColor: '#f59e0b',
    color: '#09090b',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  menuTabContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  menuHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addMenuBtn: {
    backgroundColor: '#f59e0b',
    color: '#09090b',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  menuForm: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '600px',
    margin: '0 auto',
    width: '100%',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
  },
  input: {
    padding: '12px 14px',
    borderRadius: '8px',
    backgroundColor: '#09090b',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fafafa',
    fontSize: '14px',
    outline: 'none',
  },
  textarea: {
    padding: '12px 14px',
    borderRadius: '8px',
    backgroundColor: '#09090b',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fafafa',
    fontSize: '14px',
    outline: 'none',
    minHeight: '80px',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fafafa',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  saveBtn: {
    backgroundColor: '#f59e0b',
    color: '#09090b',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  menuItemsListGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  menuItemCard: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  menuItemImg: {
    width: '100%',
    height: '140px',
    objectFit: 'cover',
    backgroundColor: '#1c1917',
  },
  menuItemInfo: {
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  menuItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  menuItemName: {
    fontSize: '15px',
    fontWeight: 700,
  },
  menuItemPrice: {
    fontSize: '15px',
    fontWeight: 800,
    color: '#f59e0b',
  },
  menuItemDesc: {
    fontSize: '12px',
    color: '#a1a1aa',
    lineHeight: '1.4',
    flex: 1,
  },
  menuItemFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    paddingTop: '8px',
  },
  tagVeg: {
    color: '#10b981',
    border: '1px solid #10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    padding: '1px 6px',
    fontSize: '10px',
    fontWeight: 700,
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  tagNonVeg: {
    color: '#ef4444',
    border: '1px solid #ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    padding: '1px 6px',
    fontSize: '10px',
    fontWeight: 700,
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  menuItemActions: {
    display: 'flex',
    gap: '8px',
  },
  actionIconBtn: {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: 'rgba(255,255,255,0.02)',
    transition: 'all 0.2s',
  },
  analyticsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  analyticsSummaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
  },
  metricCard: {
    padding: '20px',
  },
  metricLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#a1a1aa',
  },
  metricValue: {
    fontSize: '28px',
    fontWeight: 800,
    marginTop: '8px',
  },
  metricSubtext: {
    fontSize: '11px',
    color: '#71717a',
    marginTop: '4px',
  },
  ordersLogBox: {
    padding: '20px',
  },
  tableScrollWrapper: {
    overflowX: 'auto',
  },
  logTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableTh: {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#71717a',
  },
  tableTr: {
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  tableTd: {
    padding: '14px 16px',
    fontSize: '13px',
    color: '#e4e4e7',
  }
};

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    @keyframes pulseRedBorder {
      0%, 100% { border-color: rgba(239, 68, 68, 0.4); }
      50% { border-color: rgba(239, 68, 68, 1); box-shadow: 0 0 10px rgba(239, 68, 68, 0.3); }
    }
  `;
  document.head.appendChild(styleSheet);
}
export default AdminView;
