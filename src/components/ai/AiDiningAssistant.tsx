import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem, CartItem } from '../../types';
import { askGeminiChatbot, ChatMessage } from '../../services/geminiService';
import { Sparkles, X, Send, Bot, User, Plus, Check, Utensils, ShieldAlert } from 'lucide-react';

interface AiDiningAssistantProps {
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
}

export const AiDiningAssistant: React.FC<AiDiningAssistantProps> = ({ cart, onAddToCart }) => {
  const { menu } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'gemini',
      text: "👋 Hello! I am Gemini Gourmet, your personal AI Dining Assistant. How can I help you customize your meal today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsLoading(true);

    try {
      // Artificial delay (1.4s) to show natural AI thinking / typing animation
      const [response] = await Promise.all([
        askGeminiChatbot(query, menu, cart),
        new Promise(resolve => setTimeout(resolve, 1400))
      ]);

      const aiMsg: ChatMessage = {
        sender: 'gemini',
        text: response.text,
        recommendations: response.recommendedItems.map(item => ({
          menuItem: item,
          reason: 'Matches your preferences'
        })),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("AI Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };


  const handleAddFromAi = (item: MenuItem) => {
    onAddToCart(item);
    setAddedItemIds(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds(prev => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  const promptChips = [
    { label: '🌶️ Spicy Veg Dishes', query: 'Recommend spicy vegetarian dishes under ₹200' },

    { label: '🍹 Drink Pairings', query: 'What drink pairs best with my order?' },
    { label: '🍨 Top Desserts', query: 'Show me your best handcrafted desserts' },
    { label: '🥜 Gluten & Allergen Check', query: 'Which dishes are gluten-free and allergen friendly?' }
  ];

  return (
    <>
      {/* Floating Action Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={styles.floatingTrigger}
        title="Ask Gemini Gourmet AI Assistant"
      >
        <Sparkles size={22} className="sparkle-icon" />
        <span style={styles.floatingLabel}>Ask Gemini AI</span>
      </button>

      {/* Chat Window Drawer */}
      {isOpen && (
        <div style={styles.chatContainer}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerTitleContainer}>
              <div style={styles.botBadge}>
                <Sparkles size={16} color="#ffffff" />
              </div>
              <div>
                <h3 style={styles.headerTitle}>Gemini Gourmet AI</h3>
                <span style={styles.headerSubtitle}>Powered by Google Gemini 1.5</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>
              <X size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div style={styles.messagesBox}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                style={{
                  ...styles.messageRow,
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                {msg.sender === 'gemini' && (
                  <div style={styles.avatarBot}>
                    <Bot size={14} color="#f97316" />
                  </div>
                )}

                <div 
                  style={{
                    ...styles.messageBubble,
                    ...(msg.sender === 'user' ? styles.userBubble : styles.botBubble)
                  }}
                >
                  <p style={styles.messageText}>{msg.text}</p>
                  <span style={styles.timestamp}>{msg.timestamp}</span>

                  {/* Recommended Item Cards */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div style={styles.recommendationsGrid}>
                      {msg.recommendations.map((rec, recIdx) => (
                        <div key={recIdx} style={styles.itemCard}>
                          <img 
                            src={rec.menuItem.image} 
                            alt={rec.menuItem.name} 
                            style={styles.itemImg}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
                            }}
                          />

                          <div style={styles.itemInfo}>
                            <div style={styles.itemNameRow}>
                              <span style={styles.itemName}>{rec.menuItem.name}</span>
                              <span style={styles.itemPrice}>₹{rec.menuItem.price}</span>
                            </div>
                            <p style={styles.itemDesc}>{rec.menuItem.description}</p>

                            <button 
                              onClick={() => handleAddFromAi(rec.menuItem)}
                              style={{
                                ...styles.addBtn,
                                ...(addedItemIds[rec.menuItem.id] ? styles.addBtnSuccess : {})
                              }}
                            >
                              {addedItemIds[rec.menuItem.id] ? (
                                <> <Check size={14} /> Added to Cart </>
                              ) : (
                                <> <Plus size={14} /> Add to Cart </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div style={styles.avatarUser}>
                    <User size={14} color="#ffffff" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
                <div style={styles.avatarBot}>
                  <Bot size={14} color="#f97316" />
                </div>
                <div style={{ ...styles.messageBubble, ...styles.botBubble }}>
                  <div style={styles.typingContainer}>
                    <div style={styles.dotsWrapper}>
                      <span className="bouncing-dot dot-1"></span>
                      <span className="bouncing-dot dot-2"></span>
                      <span className="bouncing-dot dot-3"></span>
                    </div>
                    <span style={styles.typingText}>Gemini AI is analyzing flavors...</span>
                  </div>
                </div>
              </div>
            )}


            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div style={styles.chipsRow}>
            {promptChips.map((chip, idx) => (
              <button 
                key={idx} 
                onClick={() => handleSendMessage(chip.query)}
                style={styles.chipBtn}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            style={styles.inputForm}
          >
            <input 
              type="text"
              placeholder="Ask about dishes, pairings, or dietary options..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              style={styles.inputField}
            />
            <button type="submit" style={styles.sendBtn} disabled={!inputQuery.trim() || isLoading}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  floatingTrigger: {
    position: 'fixed',
    bottom: '24px',
    left: '24px',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '30px',
    cursor: 'pointer',
    boxShadow: '0 8px 25px rgba(234, 88, 12, 0.4)',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'all 0.3s ease',
  },
  floatingLabel: {
    fontWeight: 600,
    letterSpacing: '0.3px',
  },
  chatContainer: {
    position: 'fixed',
    bottom: '84px',
    left: '24px',
    width: '380px',
    maxHeight: '560px',
    height: '80vh',
    backgroundColor: '#18181b',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '16px',
    zIndex: 10000,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
    overflow: 'hidden',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    padding: '14px 16px',
    backgroundColor: '#09090b',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  botBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 700,
    margin: 0,
  },
  headerSubtitle: {
    color: '#a1a1aa',
    fontSize: '11px',
    display: 'block',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#a1a1aa',
    cursor: 'pointer',
    padding: '4px',
  },
  messagesBox: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  messageRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
  },
  avatarBot: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarUser: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: '#3f3f46',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  messageBubble: {
    maxWidth: '82%',
    padding: '10px 14px',
    borderRadius: '14px',
    fontSize: '13px',
    lineHeight: '1.45',
  },
  botBubble: {
    backgroundColor: '#27272a',
    color: '#f4f4f5',
    borderBottomLeftRadius: '2px',
  },
  userBubble: {
    backgroundColor: '#ea580c',
    color: '#ffffff',
    borderBottomRightRadius: '2px',
  },
  messageText: {
    margin: 0,
  },
  timestamp: {
    fontSize: '10px',
    opacity: 0.6,
    display: 'block',
    marginTop: '4px',
    textAlign: 'right',
  },
  recommendationsGrid: {
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  itemCard: {
    backgroundColor: '#18181b',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '8px',
    display: 'flex',
    gap: '8px',
  },
  itemImg: {
    width: '50px',
    height: '50px',
    borderRadius: '6px',
    objectFit: 'cover',
  },
  itemInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  itemNameRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    fontWeight: 600,
    color: '#ffffff',
  },
  itemName: {
    color: '#fafafa',
  },
  itemPrice: {
    color: '#f97316',
    fontWeight: 700,
  },
  itemDesc: {
    fontSize: '10px',
    color: '#a1a1aa',
    margin: '2px 0 6px 0',
    lineHeight: '1.3',
  },
  addBtn: {
    backgroundColor: '#ea580c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    transition: 'all 0.2s',
  },
  addBtnSuccess: {
    backgroundColor: '#16a34a',
  },
  typingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 0',
  },
  dotsWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  typingText: {
    fontSize: '11px',
    color: '#a1a1aa',
    fontStyle: 'italic',
  },

  chipsRow: {
    padding: '8px 12px',
    display: 'flex',
    gap: '6px',
    overflowX: 'auto',
    backgroundColor: '#121214',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  chipBtn: {
    whiteSpace: 'nowrap',
    padding: '4px 10px',
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#d4d4d8',
    fontSize: '11px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  inputForm: {
    padding: '12px',
    backgroundColor: '#09090b',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    gap: '8px',
  },
  inputField: {
    flex: 1,
    backgroundColor: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '8px',
    padding: '8px 12px',
    color: '#ffffff',
    fontSize: '12px',
    outline: 'none',
  },
  sendBtn: {
    backgroundColor: '#ea580c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};
