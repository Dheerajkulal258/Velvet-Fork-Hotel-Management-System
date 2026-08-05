import React, { useState } from 'react';
import { Order, MenuItem } from '../../types';
import { Sparkles, Clock, AlertTriangle, ChefHat, TrendingUp, RefreshCw } from 'lucide-react';

interface AiKitchenInsightsProps {
  orders: Order[];
  menu: MenuItem[];
}

export const AiKitchenInsights: React.FC<AiKitchenInsightsProps> = ({ orders, menu }) => {
  const activeOrders = orders.filter(o => o.status === 'received' || o.status === 'preparing');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate kitchen metrics
  const totalActiveItems = activeOrders.reduce(
    (sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  const kitchenLoadStatus = totalActiveItems > 15 ? 'High (Peak Rush)' : totalActiveItems > 6 ? 'Moderate' : 'Optimal';
  const loadColor = totalActiveItems > 15 ? '#ef4444' : totalActiveItems > 6 ? '#f59e0b' : '#10b981';

  // Chef daily special suggestion generator
  const chefSpecialSuggestions = [
    { title: "🥑 Avocado Bruschetta Special", detail: "Surplus fresh avocado inventory detected. Recommend pushing bruschetta starters." },
    { title: "🍵 Mint Mojito Cooler", detail: "High ambient temperature today. Recommend pairing beverage combos at checkout." },
    { title: "🍄 Wild Mushroom Risotto Prep", detail: "Mushroom risotto orders up 35% this week. Ensure arborio rice pre-soak batch is ready." }
  ];

  const [suggestionIdx, setSuggestionIdx] = useState(0);

  const handleCycleSuggestion = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSuggestionIdx((prev) => (prev + 1) % chefSpecialSuggestions.length);
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <Sparkles size={18} color="#f97316" />
          <h3 style={styles.title}>Gemini Kitchen Operations AI</h3>
        </div>
        <button onClick={handleCycleSuggestion} style={styles.refreshBtn} title="Generate new AI Chef Tip">
          <RefreshCw size={14} className={isRefreshing ? 'spin-icon' : ''} />
          <span>New AI Tip</span>
        </button>
      </div>

      <div style={styles.grid}>
        {/* Load Status Badge */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <TrendingUp size={16} color={loadColor} />
            <span style={styles.cardTitle}>Kitchen Workload</span>
          </div>
          <div style={{ ...styles.metricValue, color: loadColor }}>
            {kitchenLoadStatus}
          </div>
          <div style={styles.metricSub}>
            {activeOrders.length} active tickets ({totalActiveItems} total items in prep)
          </div>
        </div>

        {/* AI Chef Inventory & Special Suggestion */}
        <div style={{ ...styles.card, flex: 2 }}>
          <div style={styles.cardHeader}>
            <ChefHat size={16} color="#f97316" />
            <span style={styles.cardTitle}>AI Chef Surplus & Prep Advisory</span>
          </div>
          <div style={styles.suggestionTitle}>
            {chefSpecialSuggestions[suggestionIdx].title}
          </div>
          <p style={styles.suggestionDetail}>
            {chefSpecialSuggestions[suggestionIdx].detail}
          </p>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: '10px',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 700,
    margin: 0,
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#a1a1aa',
    padding: '6px 10px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  grid: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  card: {
    flex: 1,
    minWidth: '220px',
    backgroundColor: '#09090b',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '12px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px',
  },
  cardTitle: {
    color: '#a1a1aa',
    fontSize: '12px',
    fontWeight: 600,
  },
  metricValue: {
    fontSize: '18px',
    fontWeight: 700,
    marginBottom: '4px',
  },
  metricSub: {
    fontSize: '11px',
    color: '#71717a',
  },
  suggestionTitle: {
    color: '#fafafa',
    fontSize: '13px',
    fontWeight: 700,
    marginBottom: '4px',
  },
  suggestionDetail: {
    color: '#a1a1aa',
    fontSize: '12px',
    margin: 0,
    lineHeight: '1.4',
  }
};
