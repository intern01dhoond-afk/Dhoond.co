import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  Trash2, ArrowRight, ShieldCheck, ShoppingBag, ChevronLeft,
  Sparkles, X, Phone, User, Lock, Package
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
    <div style={{ background: 'linear-gradient(160deg,#f0f4ff 0%,#f8fafc 60%)', minHeight: '100vh', paddingBottom: '5rem', fontFamily: "'Inter',sans-serif" }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a8a 60%,#2563eb 100%)', padding: '2.5rem 5% 4rem', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(96,165,250,0.10)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative' }}>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: '1rem' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Home</Link> <span style={{ opacity: 0.4 }}>/</span> <span style={{ color: '#fff' }}>Cart</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '52px', height: '52px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
              <ShoppingBag size={26} color="#fff" />
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem,5vw,2.6rem)', margin: 0, fontWeight: 900, letterSpacing: '-0.03em' }}>My Cart</h1>
          </div>
          {cartItems.length > 0 && <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.9rem' }}>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} · {categoryKeys.length} service categor{categoryKeys.length !== 1 ? 'ies' : 'y'}</p>}
        </div>
      </div>

      <div style={{ maxWidth: '860px', margin: '-2rem auto 0', padding: '0 5%', position: 'relative', zIndex: 10 }}>
        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <ShoppingBag size={32} color="#94a3b8" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Your cart is empty</h2>
            <p style={{ color: '#64748b', margin: '0.5rem 0 2rem' }}>Looks like you haven't added any services yet.</p>
            <button onClick={() => navigate('/')} style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', color: '#fff', padding: '0.85rem 2.25rem', borderRadius: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(37,99,235,0.35)', fontSize: '0.95rem' }}>Browse Services</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {categoryKeys.map((cat) => {
              const items = groups[cat];
              const subtotal = items.reduce((acc, item) => acc + (item.discountPrice * item.quantity), 0);
              
              return (
                <div key={cat} style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{getCategoryLabel(cat)}</h3>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>{items.length} items</span>
                  </div>
                  
                  <div style={{ padding: '0 1.5rem' }}>
                    {items.map((item, idx) => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem 0', borderBottom: idx === items.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#f1f5f9', overflow: 'hidden' }}>
                          <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 600 }}>{item.title}</h4>
                          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>₹{item.discountPrice}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.25rem' }}>
                            <button onClick={() => updateQuantity(item.id, -1)} style={{ background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700, lineHeight: 1 }}>−</button>
                            <span style={{ width: '24px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 700 }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} style={{ background: '#1e3a8a', color: '#fff', border: 'none', padding: '0.35rem 0.55rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, borderRadius: '6px', lineHeight: 1 }}>+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} style={{ background: '#fef2f2', border: 'none', padding: '0.6rem', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '1.25rem 1.75rem', background: 'linear-gradient(135deg,#f8faff,#f1f5f9)', borderTop: '1px solid #e8edf5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Subtotal</div>
                      <div style={{ fontWeight: 900, fontSize: '1.4rem', color: '#0f172a', letterSpacing: '-0.02em' }}>₹{subtotal}</div>
                    </div>
                    <button onClick={() => handleProceed(cat)}
                      style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)', color: '#fff', border: 'none', padding: '0.9rem 2rem', borderRadius: '16px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 6px 20px rgba(37,99,235,0.35)', transition: 'all 0.25s' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(37,99,235,0.45)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.35)'; }}
                    >Checkout this order <ArrowRight size={18} /></button>
                  </div>
                </div>
              );
            })}

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', padding: '0.5rem 0' }}>
              {[{ icon: <ShieldCheck size={14} />, text: 'Secure Payment' }, { icon: <Sparkles size={14} />, text: 'Quality Guaranteed' }, { icon: <Phone size={14} />, text: '24/7 Support' }].map(b => (
                <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.78rem', fontWeight: 600 }}>
                  <span style={{ color: '#2563eb' }}>{b.icon}</span>{b.text}
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', paddingBottom: '1rem' }}>
              <button onClick={() => { if (window.history.state && window.history.state.idx > 0) navigate(-1); else navigate('/painting'); }}
                style={{ background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}
              ><ChevronLeft size={15} /> Continue Shopping</button>
            </div>
          </div>
        )}
      </div>

      {showLogin && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '400px', background: '#fff', padding: '2rem', borderRadius: '24px', position: 'relative' }}>
            <button onClick={() => setShowLogin(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>{authStep === 'mobile' ? 'Verify your number' : 'Enter OTP'}</h2>
            {authError && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{authError}</div>}
            {authStep === 'mobile' ? (
              <input type="tel" value={authData.mobile} onChange={e => setAuthData({...authData, mobile: e.target.value.replace(/\D/g, '')})} placeholder="Enter 10-digit number" style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem', fontSize: '1rem' }} />
            ) : (
              <input type="text" value={authData.otp} onChange={e => setAuthData({...authData, otp: e.target.value})} placeholder="Enter 4-digit OTP" style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem', fontSize: '1rem' }} />
            )}
            <button onClick={authStep === 'mobile' ? handleSendOtp : handleVerifyOtp} style={{ width: '100%', padding: '1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>
              {isLoading ? 'Processing...' : (authStep === 'mobile' ? 'Send OTP' : 'Verify')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
