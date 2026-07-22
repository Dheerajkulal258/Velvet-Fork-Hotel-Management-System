import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface MockPaymentProps {
  amount: number;
  onPaymentSuccess: (method: 'UPI' | 'Card') => void;
  onClose: () => void;
}

export const MockPayment: React.FC<MockPaymentProps> = ({ amount, onPaymentSuccess, onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [loadingText, setLoadingText] = useState('Initiating secure transaction...');

  const upiQrCanvasRef = useRef<HTMLCanvasElement>(null);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    
    // Simulate payment processing stages
    setTimeout(() => {
      setLoadingText('Verifying card/UPI credentials...');
      setTimeout(() => {
        setLoadingText('Securing authorization from bank...');
        setTimeout(() => {
          setStatus('success');
          // Complete payment after showing success screen briefly
          setTimeout(() => {
            onPaymentSuccess(paymentMethod);
          }, 1500);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  // Generate real scannable UPI QR code on mount or when tab changes
  useEffect(() => {
    if (paymentMethod === 'UPI' && status === 'idle') {
      setTimeout(() => {
        if (upiQrCanvasRef.current) {
          // Standard UPI deep link URL format
          const upiUrl = `upi://pay?pa=velvetfork@upi&pn=TheVelvetFork&am=${amount.toFixed(2)}&cu=INR`;
          QRCode.toCanvas(upiQrCanvasRef.current, upiUrl, {
            width: 150,
            margin: 1,
            color: {
              dark: '#ea580c',
              light: '#ffffff'
            }
          }, (err) => {
            if (err) console.error("Error generating UPI QR code", err);
          });
        }
      }, 50);
    }
  }, [paymentMethod, status, amount]);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} className="animate-scale-in">
        {status === 'idle' && (
          <>
            <div style={styles.header}>
              <h2 style={styles.title}>Secure Payment</h2>
              <button onClick={onClose} style={styles.closeBtn}>&times;</button>
            </div>
            
            <div style={styles.amountBox}>
              <span style={styles.amountLabel}>Amount to Pay</span>
              <span style={styles.amountValue}>₹{amount.toFixed(2)}</span>
            </div>

            <div style={styles.tabs}>
              <button
                type="button"
                style={{ ...styles.tab, ...(paymentMethod === 'UPI' ? styles.activeTab : {}) }}
                onClick={() => setPaymentMethod('UPI')}
              >
                UPI / QR Code
              </button>
              <button
                type="button"
                style={{ ...styles.tab, ...(paymentMethod === 'Card' ? styles.activeTab : {}) }}
                onClick={() => setPaymentMethod('Card')}
              >
                Credit / Debit Card
              </button>
            </div>

            <form onSubmit={handlePay} style={styles.form}>
              {paymentMethod === 'UPI' ? (
                <div style={styles.upiContainer}>
                  <div style={styles.qrPlaceholder}>
                    <canvas ref={upiQrCanvasRef} style={{ display: 'block', borderRadius: '8px' }}></canvas>
                    <p style={styles.qrText}>Scan to Pay using any UPI App</p>
                  </div>
                  <div style={styles.divider}>OR</div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Enter UPI ID</label>
                    <input
                      type="text"
                      placeholder="e.g. name@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      required
                      style={styles.input}
                    />
                  </div>
                </div>
              ) : (
                <div style={styles.cardContainer}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Card Number</label>
                    <input
                      type="text"
                      maxLength={19}
                      placeholder="4111 2222 3333 4444"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim())}
                      required
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.row}>
                    <div style={{ ...styles.inputGroup, flex: 1 }}>
                      <label style={styles.label}>Expiry Date</label>
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value.replace(/^([0-9]{2})$/g, '$1/'))}
                        required
                        style={styles.input}
                      />
                    </div>
                    <div style={{ ...styles.inputGroup, flex: 1, marginLeft: '12px' }}>
                      <label style={styles.label}>CVV</label>
                      <input
                        type="password"
                        maxLength={3}
                        placeholder="***"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        required
                        style={styles.input}
                      />
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" style={styles.payBtn} className="shine-btn">
                Simulate Payment of ₹{amount.toFixed(2)}
              </button>
            </form>
          </>
        )}

        {status === 'processing' && (
          <div style={styles.statusScreen}>
            <div style={styles.spinner}></div>
            <h3 style={styles.statusTitle}>Processing Payment</h3>
            <p style={styles.statusSubtext}>{loadingText}</p>
          </div>
        )}

        {status === 'success' && (
          <div style={styles.statusScreen}>
            <div style={styles.successCircle}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 style={styles.successTitle}>Payment Successful!</h3>
            <p style={styles.statusSubtext}>Your order is being transmitted to the kitchen.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 15, 17, 0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    width: '90%',
    maxWidth: '450px',
    padding: '28px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    color: '#1c1917',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#1c1917',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    color: '#a8a29e',
    cursor: 'pointer',
    padding: '4px',
  },
  amountBox: {
    backgroundColor: '#fff7ed',
    border: '1px solid #ffedd5',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  amountLabel: {
    fontSize: '14px',
    color: '#c2410c',
    fontWeight: 500,
  },
  amountValue: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#ea580c',
  },
  tabs: {
    display: 'flex',
    backgroundColor: '#f5f5f4',
    padding: '4px',
    borderRadius: '10px',
    marginBottom: '24px',
  },
  tab: {
    flex: 1,
    background: 'none',
    border: 'none',
    padding: '10px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#78716c',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  activeTab: {
    backgroundColor: '#ffffff',
    color: '#ea580c',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  upiContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
  },
  qrPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '16px',
    border: '1px dashed #e7e5e4',
    borderRadius: '12px',
    backgroundColor: '#fafaf9',
    width: '100%',
  },
  qrText: {
    fontSize: '12px',
    color: '#78716c',
    fontWeight: 500,
  },
  divider: {
    fontSize: '12px',
    color: '#a8a29e',
    fontWeight: 600,
    margin: '16px 0',
    position: 'relative',
    textAlign: 'center',
    width: '100%',
  },
  cardContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    textAlign: 'left',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#78716c',
  },
  input: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #e7e5e4',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: '#fafaf9',
  },
  row: {
    display: 'flex',
  },
  payBtn: {
    backgroundColor: '#ea580c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 0',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.2)',
  },
  statusScreen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #ea580c',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '24px',
  },
  statusTitle: {
    fontSize: '18px',
    fontWeight: 700,
    marginBottom: '8px',
  },
  statusSubtext: {
    fontSize: '14px',
    color: '#78716c',
    textAlign: 'center',
  },
  successCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#ecfdf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  successTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#10b981',
    marginBottom: '8px',
  }
};

// Inject keyframe spinner
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}
export default MockPayment;
