import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ChefHat, Clock, Flame, Check, CheckCircle2, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { AiKitchenInsights } from './ai/AiKitchenInsights';

export const KitchenView: React.FC = () => {
  const { orders, menu, updateOrderStatus, isCloudSync } = useApp();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevOrdersCount = useRef(orders.length);


  const kitchenOrders = orders.filter(
    order => order.status === 'received' || order.status === 'preparing' || order.status === 'ready'
  );

  useEffect(() => {
    const receivedOrders = orders.filter(o => o.status === 'received');
    const prevCount = prevOrdersCount.current;
    prevOrdersCount.current = orders.length;

    if (soundEnabled && orders.length > prevCount && receivedOrders.length > 0) {
      playKitchenChime();
    }
  }, [orders, soundEnabled]);

  const playKitchenChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain1.gain.setValueAtTime(0.15, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1);
      gain2.gain.setValueAtTime(0.1, ctx.currentTime + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1);
      osc2.stop(ctx.currentTime + 1);
    } catch (e) {
      console.warn('Audio play blocked or unsupported', e);
    }
  };

  const getElapsedTime = (isoString: string) => {
    const start = new Date(isoString).getTime();
    const now = new Date().getTime();
    const diffMin = Math.floor((now - start) / 60000);
    if (diffMin < 1) return 'Just now';
    return `${diffMin}m ago`;
  };

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="dashboard-layout" style={styles.container}>
      {/* Top Navbar */}
      <header style={styles.navHeader} className="dashboard-glass-card">
        <div style={styles.navBrand}>
          <div style={styles.chefIconBg}>
            <ChefHat size={22} color="#09090b" />
          </div>
          <div>
            <h1 style={styles.navTitle}>Kitchen Display System (KDS)</h1>
            <p style={styles.navSubtitle}>
              {isCloudSync ? "Live Cloud Sync active" : "Active preparation dashboard"}
            </p>
          </div>
        </div>

        <div style={styles.navActions}>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            style={{ 
              ...styles.soundBtn, 
              backgroundColor: soundEnabled ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.05)',
              borderColor: soundEnabled ? '#f59e0b' : 'rgba(255,255,255,0.1)'
            }}
          >
            {soundEnabled ? <Volume2 size={16} color="#f59e0b" /> : <VolumeX size={16} color="#a1a1aa" />}
            <span style={{ color: soundEnabled ? '#f59e0b' : '#a1a1aa', fontWeight: 600 }}>
              {soundEnabled ? 'Alerts ON' : 'Alerts OFF'}
            </span>
          </button>
          <div style={styles.orderCountBadge}>
            <span style={styles.orderCountNum}>{kitchenOrders.length}</span>
            <span style={styles.orderCountLabel}>Active Orders</span>
          </div>
        </div>
      </header>

      {/* AI Kitchen Intelligence Advisor */}
      <AiKitchenInsights orders={orders} menu={menu} />

      {/* Main Board Grid */}
      <main style={styles.boardGrid}>

        
        {/* Column 1: Received / New Queue */}
        <section style={styles.column}>
          <div style={styles.columnHeader}>
            <div style={styles.pulseDot}></div>
            <h2 style={styles.columnTitle}>New Orders ({kitchenOrders.filter(o => o.status === 'received').length})</h2>
          </div>
          <div style={styles.columnBody}>
            {kitchenOrders.filter(o => o.status === 'received').length > 0 ? (
              kitchenOrders.filter(o => o.status === 'received').map(order => (
                <div key={order.id} style={styles.orderCardNew} className="dashboard-glass-card animate-scale-in">
                  <div style={styles.cardHeader}>
                    <div>
                      <h3 style={styles.cardTable}>{order.sectionName} - {order.tableId.split('-').pop()}</h3>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                        <span style={styles.cardTime}>
                          <Clock size={12} style={{ marginRight: '4px' }} />
                          {getElapsedTime(order.timestamp)}
                        </span>
                        <span style={styles.aiPrepBadge}>
                          <Sparkles size={11} color="#ea580c" /> AI Est: ~{order.estimatedPrepTimeMinutes || 15}m
                        </span>
                      </div>
                    </div>
                    <span style={styles.statusLabelNew}>NEW</span>
                  </div>
                  
                  <div style={styles.cardItems}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={styles.itemRow}>
                        <span style={styles.itemQty}>{item.quantity}x</span>
                        <div style={{ flex: 1 }}>
                          <span style={styles.itemName}>{item.menuItem.name}</span>
                          {item.notes && <p style={styles.itemNotes}>Note: {item.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => updateOrderStatus(order.id, 'preparing')} 
                    style={styles.startPrepBtn}
                    className="shine-btn"
                  >
                    <Flame size={16} /> Start Preparing
                  </button>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <CheckCircle2 size={32} color="#3f3f46" />
                <p style={styles.emptyStateText}>No new orders in queue</p>
              </div>
            )}
          </div>
        </section>

        {/* Column 2: In Preparation */}
        <section style={styles.column}>
          <div style={styles.columnHeader}>
            <Flame size={18} color="#f59e0b" style={{ marginRight: '8px' }} />
            <h2 style={styles.columnTitle}>Preparing ({kitchenOrders.filter(o => o.status === 'preparing').length})</h2>
          </div>
          <div style={styles.columnBody}>
            {kitchenOrders.filter(o => o.status === 'preparing').length > 0 ? (
              kitchenOrders.filter(o => o.status === 'preparing').map(order => (
                <div key={order.id} style={styles.orderCardPrep} className="dashboard-glass-card animate-scale-in">
                  <div style={styles.cardHeader}>
                    <div>
                      <h3 style={styles.cardTable}>{order.sectionName} - {order.tableId.split('-').pop()}</h3>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                        <span style={styles.cardTime}>
                          <Clock size={12} style={{ marginRight: '4px' }} />
                          {getElapsedTime(order.timestamp)}
                        </span>
                        <span style={styles.aiPrepBadge}>
                          <Sparkles size={11} color="#ea580c" /> AI Est: ~{order.estimatedPrepTimeMinutes || 15}m
                        </span>
                      </div>
                    </div>
                    <span style={styles.statusLabelPrep}>PREPARING</span>
                  </div>


                  <div style={styles.cardItems}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={styles.itemRow}>
                        <span style={styles.itemQty}>{item.quantity}x</span>
                        <div style={{ flex: 1 }}>
                          <span style={styles.itemName}>{item.menuItem.name}</span>
                          {item.notes && <p style={styles.itemNotes}>Note: {item.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => updateOrderStatus(order.id, 'ready')} 
                    style={styles.readyBtn}
                    className="shine-btn"
                  >
                    <Check size={16} /> Mark as Ready
                  </button>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <ChefHat size={32} color="#3f3f46" />
                <p style={styles.emptyStateText}>No orders currently cooking</p>
              </div>
            )}
          </div>
        </section>

        {/* Column 3: Ready / Served Queue */}
        <section style={styles.column}>
          <div style={styles.columnHeader}>
            <CheckCircle2 size={18} color="#10b981" style={{ marginRight: '8px' }} />
            <h2 style={styles.columnTitle}>Ready to Serve ({kitchenOrders.filter(o => o.status === 'ready').length})</h2>
          </div>
          <div style={styles.columnBody}>
            {kitchenOrders.filter(o => o.status === 'ready').length > 0 ? (
              kitchenOrders.filter(o => o.status === 'ready').map(order => (
                <div key={order.id} style={styles.orderCardReady} className="dashboard-glass-card animate-scale-in">
                  <div style={styles.cardHeader}>
                    <div>
                      <h3 style={styles.cardTable}>{order.sectionName} - {order.tableId.split('-').pop()}</h3>
                      <p style={styles.cardTime}>
                        <Clock size={12} style={{ marginRight: '4px' }} />
                        {getElapsedTime(order.timestamp)}
                      </p>
                    </div>
                    <span style={styles.statusLabelReady}>READY</span>
                  </div>

                  <div style={styles.cardItems}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={styles.itemRow}>
                        <span style={styles.itemQty}>{item.quantity}x</span>
                        <span style={{ ...styles.itemName, textDecoration: 'line-through', opacity: 0.6 }}>
                          {item.menuItem.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => updateOrderStatus(order.id, 'served')} 
                    style={styles.serveBtn}
                    className="shine-btn"
                  >
                    <CheckCircle2 size={16} /> Mark as Served
                  </button>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <CheckCircle2 size={32} color="#3f3f46" />
                <p style={styles.emptyStateText}>No orders waiting to be served</p>
              </div>
            )}
          </div>
        </section>
        
      </main>
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
    gap: '16px',
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  chefIconBg: {
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
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  soundBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    fontSize: '13px',
  },
  orderCountBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  orderCountNum: {
    fontSize: '16px',
    fontWeight: 800,
    color: '#f59e0b',
  },
  orderCountLabel: {
    fontSize: '12px',
    color: '#a1a1aa',
    fontWeight: 500,
  },
  boardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
    alignItems: 'start',
    flex: 1,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    minHeight: '600px',
  },
  columnHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 8px',
  },
  pulseDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#ef4444',
    borderRadius: '50%',
    marginRight: '8px',
    animation: 'pulseGlowRed 1.5s infinite ease-in-out',
  },
  columnTitle: {
    fontSize: '16px',
    fontWeight: 700,
  },
  columnBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  orderCardNew: {
    padding: '16px',
    borderLeft: '4px solid #ef4444',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.02)',
  },
  orderCardPrep: {
    padding: '16px',
    borderLeft: '4px solid #f59e0b',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: 'rgba(245, 158, 11, 0.02)',
  },
  orderCardReady: {
    padding: '16px',
    borderLeft: '4px solid #10b981',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: 'rgba(16, 185, 129, 0.02)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: '10px',
  },
  cardTable: {
    fontSize: '16px',
    fontWeight: 700,
  },
  cardTime: {
    fontSize: '11px',
    color: '#a1a1aa',
    display: 'flex',
    alignItems: 'center',
    marginTop: '2px',
  },
  statusLabelNew: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
    fontSize: '10px',
    fontWeight: 800,
    padding: '2px 8px',
    borderRadius: '4px',
  },
  statusLabelPrep: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#f59e0b',
    fontSize: '10px',
    fontWeight: 800,
    padding: '2px 8px',
    borderRadius: '4px',
  },
  statusLabelReady: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    fontSize: '10px',
    fontWeight: 800,
    padding: '2px 8px',
    borderRadius: '4px',
  },
  cardItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '4px 0',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  },
  itemQty: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: '1px 6px',
    borderRadius: '4px',
  },
  itemName: {
    fontSize: '13.5px',
    fontWeight: 500,
  },
  itemNotes: {
    fontSize: '11px',
    color: '#f59e0b',
    fontStyle: 'italic',
    marginTop: '2px',
  },
  startPrepBtn: {
    backgroundColor: '#ea580c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 0',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '4px',
  },
  readyBtn: {
    backgroundColor: '#f59e0b',
    color: '#09090b',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 0',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '4px',
  },
  serveBtn: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 0',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '4px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 0',
    border: '1px dashed rgba(255,255,255,0.08)',
    borderRadius: '12px',
  },
  emptyStateText: {
    fontSize: '13px',
    color: '#71717a',
    marginTop: '12px',
  },
  aiPrepBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    backgroundColor: 'rgba(234, 88, 12, 0.12)',
    border: '1px solid rgba(234, 88, 12, 0.3)',
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '10px',
    fontWeight: 600,
    color: '#f97316',
  }
};


if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    @keyframes pulseGlowRed {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }
  `;
  document.head.appendChild(styleSheet);
}
export default KitchenView;
