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
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Login Modal States
  const [showLogin, setShowLogin] = React.useState(false);
  const [authStep, setAuthStep] = React.useState('mobile'); // mobile, otp
  const [authData, setAuthData] = React.useState({ name: '', mobile: '', otp: '' });
  const [isLoading, setIsLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState('');
  const [resendTimer, setResendTimer] = React.useState(0);
  const [pendingCategory, setPendingCategory] = React.useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

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
    setCheckoutCategory(category);
    if (isAuthenticated) {
      navigate(`/checkout?category=${encodeURIComponent(category)}`);
    } else {
      setPendingCategory(category);
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
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 72px)', paddingBottom: '5rem' }}>

      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(to right, #1c6bbb, #2a85db)', padding: '2.5rem 5%', color: '#fff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.5rem' }}>
            <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</Link>
            {' / '}
            <span style={{ fontWeight: 600 }}>Cart</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShoppingBag size={32} /> My Cart
          </h1>
          {cartItems.length > 0 && (
            <p style={{ margin: '0.5rem 0 0', opacity: 0.85, fontWeight: 600, fontSize: '0.95rem' }}>
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} · {categoryKeys.length} service categor{categoryKeys.length !== 1 ? 'ies' : 'y'}
            </p>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '-1.5rem auto 0', padding: '0 5%', position: 'relative', zIndex: 10 }}>

        {/* Empty State */}
        {cartItems.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '24px', padding: '5rem 2rem', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', marginTop: '2rem' }}>
            <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <ShoppingBag size={40} color="#94a3b8" />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Your cart is empty</h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Browse our services and add something to get started.</p>
            <button onClick={() => navigate('/')} style={{ background: '#1c6bbb', color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: '99px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(28,107,187,0.3)' }}>
              Explore Services
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '1rem' }}>

            {/* Multi-category info banner */}
            {categoryKeys.length > 1 && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Package size={18} color="#d97706" />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#92400e' }}>
                  You have {categoryKeys.length} different service types. Each requires a separate checkout & booking.
                </span>
              </div>
            )}

            {/* One card per category */}
            {categoryKeys.map((cat) => {
              const items = groups[cat];
              const catSubtotal = items.reduce((s, i) => s + (Number(i.discountPrice || 0) * (i.quantity || 1)), 0);
              const catOriginal = items.reduce((s, i) => s + (Number(i.originalPrice || i.discountPrice || 0) * (i.quantity || 1)), 0);
              const catSaving = catOriginal - catSubtotal;

              return (
                <div key={cat} style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #f1f5f9' }}>

                  {/* Category Header */}
                  <div style={{ padding: '1.25rem 1.75rem', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                        {getCategoryLabel(cat)}
                      </h3>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                        {items.length} item{items.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {catSaving > 0 && (
                      <span style={{ background: '#dcfce7', color: '#15803d', fontWeight: 800, fontSize: '0.78rem', padding: '0.3rem 0.75rem', borderRadius: '99px' }}>
                        Save ₹{catSaving.toFixed(0)}
                      </span>
                    )}
                  </div>

                  {/* Items */}
                  <div style={{ padding: '1.25rem 1.75rem' }}>
                    {items.map((item, idx) => (
                      <div key={item.id} style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        paddingBottom: idx < items.length - 1 ? '1.25rem' : 0,
                        marginBottom: idx < items.length - 1 ? '1.25rem' : 0,
                        borderBottom: idx < items.length - 1 ? '1px solid #f1f5f9' : 'none'
                      }}>
                        {/* Thumbnail */}
                        <div style={{ width: '64px', height: '64px', borderRadius: '14px', overflow: 'hidden', flexShrink: 0, background: '#f1f5f9' }}>
                          <img src={item.image || '/ac_tech.png'} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span style={{ fontWeight: 900, fontSize: '1rem', color: '#111' }}>₹{Number(item.discountPrice || 0).toFixed(0)}</span>
                            {item.originalPrice > item.discountPrice && (
                              <span style={{ fontSize: '0.82rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>₹{Number(item.originalPrice).toFixed(0)}</span>
                            )}
                          </div>
                        </div>

                        {/* Qty Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '99px', padding: '0.2rem' }}>
                            <button style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#0f172a', fontWeight: 800, fontSize: '1.2rem' }} onClick={() => updateQuantity(item.id, -1)}>−</button>
                            <span style={{ width: '28px', textAlign: 'center', fontSize: '0.95rem', fontWeight: 800, color: '#1c6bbb' }}>{item.quantity}</span>
                            <button style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1c6bbb', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', fontWeight: 800, fontSize: '1.2rem' }} onClick={() => updateQuantity(item.id, 1)}>+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} style={{ background: '#fef2f2', border: 'none', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                            onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Per-category Checkout Footer */}
                  <div style={{ padding: '1.25rem 1.75rem', background: '#fafbfc', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Subtotal</div>
                      <div style={{ fontWeight: 900, fontSize: '1.25rem', color: '#0f172a' }}>₹{catSubtotal.toFixed(0)}</div>
                    </div>
                    <button
                      onClick={() => handleProceed(cat)}
                      style={{
                        background: 'linear-gradient(135deg, #1c6bbb 0%, #2a85db 100%)',
                        color: '#fff', border: 'none', padding: '0.85rem 1.75rem',
                        borderRadius: '14px', fontWeight: 800, fontSize: '0.95rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem',
                        boxShadow: '0 4px 16px rgba(28,107,187,0.3)', transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      Checkout this order <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Global back link */}
            <div style={{ paddingBottom: '1rem' }}>
              <button 
                onClick={() => {
                  if (window.history.state && window.history.state.idx > 0) {
                    navigate(-1);
                  } else {
                    navigate('/painting');
                  }
                }} 
                style={{ background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}
              >
                <ChevronLeft size={16} /> Continue Shopping
              </button>
            </div>

          </div>
        )}
      </div>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)' }} onClick={() => !isLoading && setShowLogin(false)} />
          <div style={{ position: 'relative', width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '28px', padding: '2.5rem', boxShadow: '0 30px 60px rgba(0,0,0,0.25)', animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <button onClick={() => setShowLogin(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f8fafc', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} color="#64748b" />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '64px', height: '64px', background: '#eff6ff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#1c6bbb' }}>
                {authStep === 'mobile' ? <Phone size={30} /> : <Lock size={30} />}
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.4rem' }}>
                {authStep === 'mobile' ? 'Phone Verification' : 'Enter OTP'}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                {authStep === 'mobile' ? 'Enter your mobile number to continue' : `Enter the 4-digit code sent to +91 ${authData.mobile}`}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Error Banner */}
              {authError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem 1rem', color: '#991b1b', fontSize: '0.85rem', fontWeight: 600 }}>
                  {authError}
                </div>
              )}

              {authStep === 'mobile' && (
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>+91</span>
                  <input type="tel" placeholder="Mobile Number" maxLength={10} value={authData.mobile}
                    onChange={e => { setAuthData({ ...authData, mobile: e.target.value.replace(/\D/g, '') }); setAuthError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                    style={{ width: '100%', padding: '1rem 1rem 1rem 3.75rem', borderRadius: '14px', border: '2px solid #f1f5f9', fontSize: '1.1rem', fontWeight: 800, outline: 'none', letterSpacing: '2px', boxSizing: 'border-box' }}
                    autoFocus
                  />
                </div>
              )}

              {authStep === 'otp' && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                  {[0, 1, 2, 3].map((i) => (
                    <input key={i} id={`cart-otp-${i}`} type="text" maxLength={1}
                      value={authData.otp[i] || ''}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        const newOtp = authData.otp.split('');
                        newOtp[i] = val;
                        setAuthData({ ...authData, otp: newOtp.join('') });
                        setAuthError('');
                        if (val && i < 3) document.getElementById(`cart-otp-${i+1}`)?.focus();
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Backspace') {
                          const newOtp = authData.otp.split('');
                          newOtp[i] = '';
                          setAuthData({ ...authData, otp: newOtp.join('') });
                          if (i > 0) document.getElementById(`cart-otp-${i-1}`)?.focus();
                        }
                      }}
                      style={{ width: '58px', height: '62px', textAlign: 'center', fontSize: '1.5rem', fontWeight: 900, borderRadius: '14px', border: '2px solid #1c6bbb', background: '#f8fafc', color: '#111', outline: 'none' }}
                    />
                  ))}
                </div>
              )}

              {/* Main CTA Button */}
              <button
                onClick={authStep === 'mobile' ? handleSendOtp : handleVerifyOtp}
                disabled={isLoading}
                style={{ width: '100%', background: isLoading ? '#94a3b8' : '#0f172a', color: '#fff', border: 'none', padding: '1rem', borderRadius: '14px', fontWeight: 800, fontSize: '1rem', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', transition: 'background 0.2s' }}
              >
                {isLoading
                  ? (authStep === 'mobile' ? 'Sending...' : 'Verifying...')
                  : (authStep === 'mobile' ? 'Send OTP' : 'Verify & Continue')}
                {!isLoading && <ArrowRight size={18} />}
              </button>

              {/* Resend / Change number */}
              {authStep === 'otp' && (
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {resendTimer > 0
                    ? <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Resend OTP in {resendTimer}s</span>
                    : <button onClick={handleSendOtp} disabled={isLoading} style={{ background: 'none', border: 'none', color: '#1c6bbb', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>Resend OTP</button>
                  }
                  <button onClick={() => { setAuthStep('mobile'); setAuthError(''); setAuthData(prev => ({ ...prev, otp: '' })); }} style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Change Number</button>
                </div>
              )}
            </div>
          </div>

          <style>{`
            @keyframes modalSlideUp {
              from { opacity: 0; transform: translateY(40px) scale(0.96); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default Cart;
