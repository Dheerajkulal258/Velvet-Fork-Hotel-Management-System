import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { generateAdminAiInsights, generateDishDescription, AdminAnalyticsSummary } from '../../services/geminiService';
import { Sparkles, TrendingUp, ThumbsUp, MessageSquare, Lightbulb, Wand2, DollarSign, CheckCircle2 } from 'lucide-react';

export const AiAdminAnalytics: React.FC = () => {
  const { orders, reviews, menu, addMenuItem } = useApp();
  const [insights, setInsights] = useState<AdminAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // AI Menu Item Description Generator state
  const [newDishName, setNewDishName] = useState('');
  const [newCategory, setNewCategory] = useState<'Starters' | 'Rice & Biryanis' | 'Tandoori & Grills' | 'Chef Specials' | 'Main Course' | 'Desserts' | 'Beverages'>('Main Course');


  const [isVeg, setIsVeg] = useState(true);
  const [generatedDesc, setGeneratedDesc] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState<number | ''>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      const data = await generateAdminAiInsights(orders, reviews, menu);
      setInsights(data);
      setLoading(false);
    };
    fetchInsights();
  }, [orders, reviews, menu]);

  const handleGenerateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName.trim()) return;
    setIsGenerating(true);
    try {
      const result = await generateDishDescription(newDishName, newCategory, isVeg);
      setGeneratedDesc(result.description);
      setSuggestedPrice(result.suggestedPrice);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGeneratedDish = () => {
    if (!newDishName || !generatedDesc || !suggestedPrice) return;
    addMenuItem({
      name: newDishName,
      category: newCategory,
      price: Number(suggestedPrice),
      description: generatedDesc,
      isVeg,
      isAvailable: true,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
    });
    setAddSuccess(true);
    setTimeout(() => {
      setNewDishName('');
      setGeneratedDesc('');
      setSuggestedPrice('');
      setAddSuccess(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Sparkles size={28} color="#ea580c" className="rotate-cog" />
        <p style={{ color: '#a1a1aa', fontSize: '14px', marginTop: '12px' }}>
          Gemini AI is analyzing sales data, customer feedback, and order pairings...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Banner */}
      <div style={styles.banner}>
        <div style={styles.bannerTextGroup}>
          <div style={styles.badge}>
            <Sparkles size={14} color="#ffffff" />
            <span>Google Gemini Business Intelligence</span>
          </div>
          <h2 style={styles.bannerTitle}>Executive AI Performance & Sentiment Dashboard</h2>
          <p style={styles.bannerDesc}>
            Real-time automated analytics synthesized from table orders, kitchen velocity, and customer reviews.
          </p>
        </div>
      </div>

      {/* Executive Summary */}
      {insights && (
        <div style={styles.summaryCard}>
          <div style={styles.cardHeader}>
            <TrendingUp size={18} color="#ea580c" />
            <h3 style={styles.cardTitle}>Executive Performance Summary</h3>
          </div>
          <p style={styles.summaryText}>{insights.executiveSummary}</p>
        </div>
      )}

      {/* Grid Section: Sentiment & Insights */}
      {insights && (
        <div style={styles.grid2Col}>
          {/* Sentiment Analysis Gauge */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <ThumbsUp size={18} color="#10b981" />
              <h3 style={styles.cardTitle}>Customer Sentiment Score</h3>
            </div>
            
            <div style={styles.scoreRow}>
              <div style={styles.scoreNumber}>{insights.sentimentAnalysis.score}%</div>
              <div>
                <div style={styles.sentimentBadge}>{insights.sentimentAnalysis.overallSentiment}</div>
                <div style={styles.scoreSub}>Based on verified dining reviews</div>
              </div>
            </div>

            <div style={styles.reviewLists}>
              <div>
                <h4 style={styles.listHeading}>🟢 Top Customer Praises:</h4>
                <ul style={styles.bulletList}>
                  {insights.sentimentAnalysis.topPraises.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={styles.listHeading}>🔴 Feedback & Growth Areas:</h4>
                <ul style={styles.bulletList}>
                  {insights.sentimentAnalysis.commonComplaints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <Lightbulb size={18} color="#f59e0b" />
              <h3 style={styles.cardTitle}>AI Actionable Operational Recommendations</h3>
            </div>
            
            <div style={styles.recsList}>
              {insights.actionableRecommendations.map((rec, idx) => (
                <div key={idx} style={styles.recItem}>
                  <div style={styles.recNumber}>{idx + 1}</div>
                  <div style={styles.recText}>{rec}</div>
                </div>
              ))}
            </div>

            <h4 style={{ ...styles.listHeading, marginTop: '16px' }}>⭐ Top Menu Pairings:</h4>
            <div style={styles.pairChips}>
              {insights.popularPairs.map((pair, pIdx) => (
                <span key={pIdx} style={styles.pairChip}>{pair}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Dish Description & Menu Creator Tool */}
      <div style={{ ...styles.card, marginTop: '24px' }}>
        <div style={styles.cardHeader}>
          <Wand2 size={18} color="#a855f7" />
          <h3 style={styles.cardTitle}>AI Dish Description & Menu Generator</h3>
        </div>
        <p style={{ color: '#a1a1aa', fontSize: '13px', marginBottom: '16px' }}>
          Enter a dish name and category to let Gemini AI generate appetizing descriptions and suggested pricing in seconds.
        </p>

        <form onSubmit={handleGenerateDish} style={styles.genForm}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Dish Name</label>
            <input 
              type="text" 
              placeholder="e.g. Garlic Butter Shrimp" 
              value={newDishName} 
              onChange={(e) => setNewDishName(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Category</label>
            <select 
              value={newCategory} 
              onChange={(e) => setNewCategory(e.target.value as any)}
              style={styles.input}
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

          <div style={styles.formGroupCheck}>
            <label style={styles.labelCheck}>
              <input 
                type="checkbox" 
                checked={isVeg} 
                onChange={(e) => setIsVeg(e.target.checked)} 
              /> Vegetarian
            </label>
          </div>

          <button type="submit" style={styles.genBtn} disabled={isGenerating || !newDishName.trim()}>
            <Wand2 size={16} />
            {isGenerating ? 'Generating with Gemini...' : 'Generate AI Details'}
          </button>
        </form>

        {/* Output Box */}
        {generatedDesc && (
          <div style={styles.outputBox}>
            <h4 style={styles.outputTitle}>✨ AI Generated Proposal:</h4>
            <p style={styles.outputDesc}>{generatedDesc}</p>
            <div style={styles.priceRow}>
              <span style={styles.priceLabel}>Suggested Price:</span>
              <input 
                type="number" 
                value={suggestedPrice} 
                onChange={(e) => setSuggestedPrice(Number(e.target.value))}
                style={styles.priceInput} 
              />
            </div>

            <button onClick={handleSaveGeneratedDish} style={styles.saveDishBtn}>
              {addSuccess ? (
                <> <CheckCircle2 size={16} /> Added to Restaurant Menu! </>
              ) : (
                'Add Item directly to Active Menu'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  loadingContainer: {
    padding: '60px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  banner: {
    background: 'linear-gradient(135deg, #1e1b4b 0%, #311b92 100%)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '24px',
  },
  bannerTextGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    backgroundColor: '#ea580c',
    color: '#ffffff',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    width: 'fit-content',
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: 800,
    margin: 0,
  },
  bannerDesc: {
    color: '#c7d2fe',
    fontSize: '13px',
    margin: 0,
  },
  summaryCard: {
    backgroundColor: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '12px',
    padding: '20px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 700,
    margin: 0,
  },
  summaryText: {
    color: '#d4d4d8',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: 0,
  },
  grid2Col: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '12px',
    padding: '20px',
  },
  scoreRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  scoreNumber: {
    fontSize: '36px',
    fontWeight: 800,
    color: '#10b981',
  },
  sentimentBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    fontWeight: 700,
    fontSize: '13px',
    padding: '2px 8px',
    borderRadius: '4px',
    display: 'inline-block',
  },
  scoreSub: {
    color: '#71717a',
    fontSize: '11px',
    marginTop: '4px',
  },
  reviewLists: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  listHeading: {
    color: '#e4e4e7',
    fontSize: '12px',
    fontWeight: 700,
    margin: '0 0 6px 0',
  },
  bulletList: {
    margin: 0,
    paddingLeft: '18px',
    color: '#a1a1aa',
    fontSize: '12px',
    lineHeight: '1.5',
  },
  recsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  recItem: {
    display: 'flex',
    gap: '10px',
    backgroundColor: '#09090b',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '8px',
    padding: '10px',
  },
  recNumber: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#ea580c',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  recText: {
    color: '#d4d4d8',
    fontSize: '12px',
    lineHeight: '1.4',
  },
  pairChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  pairChip: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    color: '#c084fc',
    fontSize: '11px',
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: '12px',
  },
  genForm: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    marginBottom: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    minWidth: '160px',
  },
  formGroupCheck: {
    display: 'flex',
    alignItems: 'center',
    height: '38px',
  },
  label: {
    color: '#a1a1aa',
    fontSize: '11px',
    fontWeight: 600,
  },
  labelCheck: {
    color: '#d4d4d8',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  input: {
    backgroundColor: '#09090b',
    border: '1px solid #27272a',
    borderRadius: '6px',
    padding: '8px 12px',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none',
  },
  genBtn: {
    backgroundColor: '#a855f7',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '9px 16px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  outputBox: {
    backgroundColor: '#09090b',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  outputTitle: {
    color: '#c084fc',
    fontSize: '13px',
    fontWeight: 700,
    margin: 0,
  },
  outputDesc: {
    color: '#f4f4f5',
    fontSize: '13px',
    margin: 0,
    fontStyle: 'italic',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  priceLabel: {
    color: '#a1a1aa',
    fontSize: '12px',
  },
  priceInput: {
    width: '80px',
    backgroundColor: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: '4px',
    padding: '4px 8px',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 700,
  },
  saveDishBtn: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 14px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    alignSelf: 'flex-start',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  }
};
