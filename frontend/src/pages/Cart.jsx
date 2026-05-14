import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  Trash2, ArrowRight, ShieldCheck, ShoppingBag, ChevronLeft,
  Sparkles, X, Phone, User, Lock, Package, Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Friendly display names per category
const CATEGORY_LABELS = {
  painting: '🎨 Painting Services',
  painter: '🎨 Painting Services',
  ac: '❄️ AC Services',
  cleaning: '🧹 Cleaning Services',
  plumbing: '🔧 Plumbing Services',
  electrical: '⚡ Electrical Services',
  appliance: '🔌 Appliance Repair',
  carpentry: '🪵 Carpentry',
  pest: '🐜 Pest Control',
};

const getCategoryLabel = (cat) =>
  CATEGORY_LABELS[cat?.toLowerCase()] || `📦 ${cat || 'Services'}`;

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, setCheckoutCategory } = useCart();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Login Modal States
  const [showLogin, setShowLogin] = React.useState(false);
  const [authStep, setAuthStep] = React.useState('mobile'); // mobile, otp
  const [authData, setAuthData] = React.useState({ name: '', mobile: '', otp: '' });
  const [isLoading, setIsLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState('');
  const [resendTimer, setResendTimer] = React.useState(0);
  const [pendingCategory, setPendingCategory] = React.useState(null);

  const API_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Group items by category
  const groups = cartItems.reduce((acc, item) => {
    const cat = item.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const categoryKeys = Object.keys(groups);

  const handleProceed = (category) => {
    if (authLoading) return;
    setCheckoutCategory(category);
    if (isAuthenticated) {
      navigate(`/checkout?category=${encodeURIComponent(category)}`);
    } else {
      setPendingCategory(category);
      setAuthStep('mobile');
      setShowLogin(true);
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    const mobile = authData.mobile.replace(/\D/g, '').slice(-10);
    if (mobile.length < 10) { setAuthError('Please enter a valid 10-digit mobile number'); return; }
    setIsLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setAuthData(prev => ({ ...prev, otp: '' }));
      setAuthStep('otp');
      startResendTimer();
    } catch (err) {
      setAuthError(err.message || 'Could not send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (authData.otp.length < 4) { setAuthError('Please enter the 4-digit OTP'); return; }
    setIsLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: authData.mobile, otp: authData.otp, name: authData.name || 'Customer' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      login(data.user?.name || authData.name || 'Customer', authData.mobile, {
        id: data.user?.id,
        email: data.user?.email || '',
        role: data.user?.role || 'user',
        created_at: data.user?.created_at || new Date().toISOString(),
      }, data.token);
      setShowLogin(false);
      if (pendingCategory) navigate(`/checkout?category=${encodeURIComponent(pendingCategory)}`);
    } catch (err) {
      setAuthError(err.message || 'Incorrect OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '5rem', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .cart-header-img { position: absolute; right: 2%; top: 50%; transform: translateY(-50%); height: 110%; width: auto; object-fit: contain; pointer-events: none; user-select: none; opacity: 0.9; }
        .cart-card { background: #fff; border-radius: 24px; border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 10px 40px -10px rgba(0,0,0,0.04); overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .cart-card:hover { box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .checkout-btn { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #fff; border: none; padding: 1rem 2rem; border-radius: 16px; font-weight: 800; font-size: 1rem; cursor: pointer; display: flex; align-items: center; gap: 0.75rem; box-shadow: 0 8px 25px rgba(37,99,235,0.3); transition: all 0.25s; }
        .checkout-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(37,99,235,0.4); }
        .qty-btn { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.2rem; font-weight: 600; color: #475569; transition: all 0.2s; }
        .qty-btn:hover { background: #e2e8f0; color: #0f172a; }
        .qty-btn.plus { background: #eff6ff; color: #2563eb; }
        .qty-btn.plus:hover { background: #dbeafe; }
        .trust-badge { display: flex; align-items: center; gap: 0.5rem; background: #fff; padding: 0.6rem 1rem; border-radius: 99px; border: 1px solid #f1f5f9; box-shadow: 0 2px 10px rgba(0,0,0,0.02); color: #475569; font-size: 0.8rem; font-weight: 600; }
        /* Cart item row: image left, content right — controls always on own row on mobile */
        .cart-item-row { display: flex; align-items: center; gap: 1.25rem; padding: 1.5rem 0; }
        .cart-item-content { flex: 1; min-width: 0; }
        .cart-item-controls { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
        @media (max-width: 600px) {
          .cart-header-img { height: 70px; opacity: 0.4; }
          .checkout-btn { width: 100%; justify-content: center; }
          .trust-badge { padding: 0.5rem 0.8rem; font-size: 0.75rem; }
          /* On mobile: wrap item content so controls go to second line */
          .cart-item-row { align-items: flex-start; }
          .cart-item-content { display: flex; flex-direction: column; gap: 0.6rem; }
          .cart-item-controls { margin-top: 0.25rem; }
          .cart-item-img { width: 58px !important; height: 58px !important; }
        }
      `}</style>
      
      {/* Header */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        padding: 'clamp(2rem, 5vw, 3rem) 5% clamp(3rem, 7vw, 5rem)',
        color: '#fff',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
        <img src="/images/cart nav.png" alt="" aria-hidden="true" className="cart-header-img" />
        
        <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}>Home</Link>
            <span style={{ opacity: 0.5 }}>/</span>
            <span style={{ color: '#fff' }}>Cart</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
              <ShoppingBag size={28} color="#fff" strokeWidth={2.5} />
            </div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.75rem)', margin: 0, fontWeight: 900, letterSpacing: '-0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>My Cart</h1>
          </div>
          {cartItems.length > 0 && (
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontWeight: 500, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 700 }}>{cartItems.length}</span> items across {categoryKeys.length} categories
            </p>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '860px', margin: '-2.5rem auto 0', padding: '0 5%', position: 'relative', zIndex: 10 }}>
        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', border: '4px solid #fff', boxShadow: '0 10px 20px rgba(0,0,0,0.03)' }}>
              <Package size={40} color="#94a3b8" strokeWidth={1.5} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>Your cart is empty</h2>
            <p style={{ color: '#64748b', margin: '0 0 2.5rem', fontSize: '1.05rem', maxWidth: '300px', marginInline: 'auto' }}>Looks like you haven't added any services to your cart yet.</p>
            <button onClick={() => navigate('/')} style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', padding: '1rem 2.5rem', borderRadius: '16px', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 8px 25px rgba(37,99,235,0.3)', fontSize: '1.05rem', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(37,99,235,0.4)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(37,99,235,0.3)'; }}>Explore Services</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {categoryKeys.map((cat) => {
              const items = groups[cat];
              const subtotal = items.reduce((acc, item) => acc + (item.discountPrice * item.quantity), 0);
              
              return (
                <div key={cat} className="cart-card">
                  <div style={{ padding: '1.25rem 1.75rem', background: '#fff', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }} />
                      {getCategoryLabel(cat)}
                    </h3>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '0.3rem 0.75rem', borderRadius: '99px' }}>{items.length} items</span>
                  </div>
                  
                  <div style={{ padding: '0 1.75rem' }}>
                    {items.map((item, idx) => (
                      <div key={item.id} className="cart-item-row" style={{ borderBottom: idx === items.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                        {/* Thumbnail */}
                        <div className="cart-item-img" style={{ width: '70px', height: '70px', borderRadius: '16px', background: '#f8fafc', overflow: 'hidden', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                          <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        {/* Title + price + controls — stacks on mobile */}
                        <div className="cart-item-content">
                          <div>
                            <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>{item.title}</h4>
                            <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#2563eb' }}>₹{item.discountPrice}</p>
                          </div>
                          {/* Controls always visible */}
                          <div className="cart-item-controls">
                            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '4px' }}>
                              <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>−</button>
                              <span style={{ width: '32px', textAlign: 'center', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{item.quantity}</span>
                              <button className="qty-btn plus" onClick={() => updateQuantity(item.id, 1)}>+</button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              style={{ background: '#fff', border: '1px solid #fee2e2', width: '36px', height: '36px', borderRadius: '10px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                              aria-label="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '1.5rem 1.75rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Category Subtotal</div>
                      <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#0f172a', letterSpacing: '-0.02em' }}>₹{subtotal}</div>
                    </div>
                    <button className="checkout-btn" onClick={() => handleProceed(cat)}>
                      Checkout this order <ArrowRight size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', padding: '1rem 0' }}>
              {[{ icon: <ShieldCheck size={16} />, text: 'Secure Payment' }, { icon: <Sparkles size={16} />, text: 'Quality Guaranteed' }, { icon: <Phone size={16} />, text: '24/7 Support' }].map(b => (
                <div key={b.text} className="trust-badge">
                  <span style={{ color: '#2563eb', display: 'flex' }}>{b.icon}</span>{b.text}
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', paddingBottom: '2rem' }}>
              <button onClick={() => { if (window.history.state && window.history.state.idx > 0) navigate(-1); else navigate('/painting'); }}
                style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '0.75rem 1.5rem', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#475569'; }}
              ><ChevronLeft size={16} /> Continue Shopping</button>
            </div>
          </div>
        )}
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }} onClick={() => setShowLogin(false)} />
          <div style={{ width: '100%', maxWidth: '420px', background: '#fff', padding: '2.5rem 2rem', borderRadius: '24px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <button onClick={() => setShowLogin(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', border: 'none', background: '#f1f5f9', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }} onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}><X size={18} /></button>
            
            <div style={{ width: '56px', height: '56px', background: '#eff6ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid #dbeafe' }}>
              <User size={28} color="#2563eb" />
            </div>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>{authStep === 'mobile' ? 'Verify your number' : 'Enter OTP'}</h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {authStep === 'mobile' ? 'We need this to confirm your booking and send updates.' : `Sent to +91 ${authData.mobile}`}
            </p>
            
            {authError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Info size={16} /> {authError}</div>}
            
            {authStep === 'mobile' ? (
              <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: 600 }}>+91</span>
                <input type="tel" value={authData.mobile} onChange={e => setAuthData({...authData, mobile: e.target.value.replace(/\D/g, '')})} placeholder="Mobile Number" maxLength={10} style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '14px', border: '2px solid #e2e8f0', fontSize: '1.05rem', fontWeight: 600, color: '#0f172a', outline: 'none', transition: 'border-color 0.2s', background: '#fafafa' }} onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.background = '#fff'; }} onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#fafafa'; }} />
              </div>
            ) : (
              <div style={{ marginBottom: '1.5rem' }}>
                <input type="text" value={authData.otp} onChange={e => setAuthData({...authData, otp: e.target.value})} placeholder="Enter 4-digit OTP" maxLength={4} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '2px solid #e2e8f0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', outline: 'none', textAlign: 'center', letterSpacing: '0.2em', transition: 'border-color 0.2s', background: '#fafafa' }} onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.background = '#fff'; }} onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#fafafa'; }} />
              </div>
            )}
            
            <button onClick={authStep === 'mobile' ? handleSendOtp : handleVerifyOtp} disabled={isLoading} style={{ width: '100%', padding: '1rem', background: isLoading ? '#94a3b8' : '#0f172a', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 800, fontSize: '1.05rem', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'background 0.2s', boxShadow: isLoading ? 'none' : '0 4px 15px rgba(15,23,42,0.2)' }}>
              {isLoading ? 'Processing...' : (authStep === 'mobile' ? 'Send OTP' : 'Verify & Continue')}
            </button>
            
            {authStep === 'otp' && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button onClick={resendTimer === 0 ? handleSendOtp : null} style={{ background: 'none', border: 'none', color: resendTimer === 0 ? '#2563eb' : '#94a3b8', fontWeight: 600, cursor: resendTimer === 0 ? 'pointer' : 'default', fontSize: '0.9rem' }}>
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
