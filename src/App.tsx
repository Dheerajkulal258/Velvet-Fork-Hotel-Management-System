import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { CustomerView } from './components/CustomerView';
import { KitchenView } from './components/KitchenView';
import { AdminView } from './components/AdminView';
import { Layers, ChefHat, User, Settings } from 'lucide-react';

const AppContent: React.FC = () => {
  const [path, setPath] = useState(window.location.pathname);
  const [showDemoSwitcher, setShowDemoSwitcher] = useState(false);

  useEffect(() => {
    const handleLocationChange = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
    };
  }, []);

  const navigateTo = (newPath: string, searchParams: string = '') => {
    const newUrl = `${window.location.origin}${newPath}${searchParams}`;
    window.history.pushState({}, '', newUrl);
    setShowDemoSwitcher(false);
  };

  const renderView = () => {
    switch (path) {
      case '/admin':
        return <AdminView />;
      case '/kitchen':
        return <KitchenView />;
      default:
        return <CustomerView />;
    }
  };

  return (
    <>
      {renderView()}

      {/* Floating Demo View Switcher */}
      <div style={styles.switcherContainer}>
        <button 
          onClick={() => setShowDemoSwitcher(!showDemoSwitcher)} 
          style={styles.switcherTrigger}
          title="Demo Portal Quick Access"
        >
          <Settings size={20} className={showDemoSwitcher ? 'rotate-cog' : ''} />
        </button>

        {showDemoSwitcher && (
          <div style={styles.switcherMenu} className="animate-scale-in">
            <h4 style={styles.menuTitle}>College Project Demo Panel</h4>
            <p style={styles.menuDesc}>Quickly switch between dashboards to test the real-time cross-tab updates:</p>
            
            <button 
              onClick={() => navigateTo('/admin')} 
              style={{ ...styles.menuItemBtn, ...(path === '/admin' ? styles.menuItemActive : {}) }}
            >
              <Layers size={14} /> Owner/Admin Dashboard
            </button>
            <button 
              onClick={() => navigateTo('/kitchen')} 
              style={{ ...styles.menuItemBtn, ...(path === '/kitchen' ? styles.menuItemActive : {}) }}
            >
              <ChefHat size={14} /> Kitchen Dashboard (KDS)
            </button>
            <button 
              onClick={() => navigateTo('/', '?section=Classic%20Hall&table=CH-T2')} 
              style={{ ...styles.menuItemBtn, ...(path === '/' ? styles.menuItemActive : {}) }}
            >
              <User size={14} /> Customer View (Table 2)
            </button>
            
            <div style={styles.menuFooter}>
              💡 Tip: Open these views in different browser tabs/windows side-by-side to watch live syncing!
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

const styles: Record<string, React.CSSProperties> = {
  switcherContainer: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 99999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    fontFamily: 'sans-serif',
  },
  switcherTrigger: {
    backgroundColor: '#1e1b4b',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
  },
  switcherMenu: {
    backgroundColor: '#121214',
    border: '1px solid #27272a',
    borderRadius: '12px',
    padding: '16px',
    width: '260px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
    marginBottom: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  menuTitle: {
    color: '#fafafa',
    fontSize: '13px',
    fontWeight: 700,
    marginBottom: '2px',
  },
  menuDesc: {
    color: '#a1a1aa',
    fontSize: '11px',
    lineHeight: '1.4',
    marginBottom: '8px',
  },
  menuItemBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '6px',
    color: '#fafafa',
    fontSize: '12px',
    fontWeight: 600,
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  menuItemActive: {
    backgroundColor: '#ea580c',
    borderColor: '#ea580c',
    color: '#ffffff',
  },
  menuFooter: {
    fontSize: '10px',
    color: '#71717a',
    marginTop: '6px',
    borderTop: '1px solid #27272a',
    paddingTop: '6px',
    lineHeight: '1.4',
  }
};

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    .rotate-cog {
      animation: spinGear 2s linear infinite;
    }
    @keyframes spinGear {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}
export default App;
