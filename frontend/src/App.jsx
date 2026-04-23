import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, User, ChevronDown, MapPin, Zap, LogOut, Package, LayoutDashboard, ChevronLeft } from 'lucide-react';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Checkout from './pages/Checkout';
import Cart from './pages/Cart';
import ServiceDetail from './pages/ServiceDetail';
import Painting from './pages/Painting';
import CommercialPainting from './pages/CommercialPainting';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Footer from './components/Footer';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UIProvider, useUI } from './context/UIContext';
import ComingSoonModal from './components/ComingSoonModal';
import { detectCurrentLocation, waitForGoogleMaps } from './utils/location';
import './index.css';

const SUGGESTIONS = ['Painting Service', 'AC Repair', 'RO Technician', 'Plumber', 'Electrician', 'Washing Machine Repair', 'Refrigerator Repair'];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { user, logout, isAuthenticated } = useAuth();

  const userName = user?.name || 'User';
  const userMobile = user?.mobile || '';

  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  const [locationLabel, setLocationLabel] = React.useState(() => localStorage.getItem('dhoond_location') || 'Fetching location…');
  const [locationSubtext, setLocationSubtext] = React.useState(() => localStorage.getItem('dhoond_location_sub') || '');
  const [showLocationModal, setShowLocationModal] = React.useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = React.useState('');
  const [locating, setLocating] = React.useState(false);
  const { openComingSoon } = useUI();

  const searchRef = React.useRef(null);
  const locationInputRef = React.useRef(null);

  React.useEffect(() => {
    if (!localStorage.getItem('dhoond_location')) {
      detectLocation();
    }
  }, []);
  const detectLocation = async () => {
    setLocating(true);
    setLocationLabel('Detecting…');
    try {
      const loc = await detectCurrentLocation();
      setLocationLabel(loc.label);
      setLocationSubtext(loc.sub);
      localStorage.setItem('dhoond_location', loc.label);
      localStorage.setItem('dhoond_location_sub', loc.sub);
    } catch (err) {
      setLocationLabel('Enable location');
      console.error("Location detection failed:", err);
    } finally {
      setLocating(false);
    }
  };

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  React.useEffect(() => {
    if (!showLocationModal) return;
    setTimeout(() => {
      locationInputRef.current?.focus();
      waitForGoogleMaps(() => {
        if (!locationInputRef.current) return;
        const autocomplete = new window.google.maps.places.Autocomplete(
          locationInputRef.current,
          { types: ['geocode', 'establishment'], componentRestrictions: { country: 'in' } }
        );
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (!place || !place.address_components) return;
          const comps = place.address_components;
          const find = (types) => {
            const c = comps.find(c => types.some(t => c.types.includes(t)));
            return c ? c.long_name : null;
          };
          const label = place.formatted_address || place.name || 'Selected Location';
          const city = find(['locality', 'administrative_area_level_2']) || '';
          const state = find(['administrative_area_level_1']) || '';
          const sub = [city, state].filter(Boolean).join(', ');
          setLocationLabel(label);
          setLocationSubtext(sub);
          localStorage.setItem('dhoond_location', label);
          localStorage.setItem('dhoond_location_sub', sub);
          setShowLocationModal(false);
        });
      });
    }, 150);
  }, [showLocationModal]);

  const filteredSuggestions = searchQuery.length > 0
    ? SUGGESTIONS.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    : SUGGESTIONS;

  const handleSearchSubmit = (query) => {
    const q = (query || searchQuery).toLowerCase();
    setShowSuggestions(false);
    setIsSearchOpen(false);
    if (q.includes('paint')) {
      navigate('/painting');
    } else {
      openComingSoon();
    }
  };

  const NAV_LINKS = [
    { label: 'Home', to: '/' },
    { label: 'Painting', to: '/painting', badge: 'New' },
    { label: 'Other Services', type: 'soon' },
    { label: 'Contact', to: '/painting' },
  ];

  const LocationButton = ({ onClick, style = {} }) => (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: '#f9fafb', border: '1px solid #e5e7eb',
        padding: '0.4rem 0.85rem', borderRadius: '99px',
        cursor: 'pointer', fontWeight: 600, fontSize: '13px',
        color: '#374151', transition: 'border-color 0.2s, background 0.2s',
        maxWidth: '380px', overflow: 'hidden',
        ...style
      }}
    >
      <MapPin size={16} color={locating ? '#9ca3af' : '#2563eb'} style={{ flexShrink: 0 }} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}>
        {locationLabel}
      </span>
      <ChevronDown size={14} style={{ flexShrink: 0 }} />
    </button>
  );

  return (
    <>
      <style>{`
        .nav-link { position: relative; text-decoration: none; font-size: 14px; font-weight: 600; color: #374151; padding: 0.4rem 0; transition: color 0.2s; }
        .nav-link::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px; background: #2563eb; border-radius: 2px; transition: width 0.25s ease; }
        .nav-link:hover::after, .nav-link.active::after { width: 100%; }
        .nav-link:hover { color: #2563eb; }
        .nav-link.highlight { color: #d97706; }
        .nav-link.highlight::after { background: #d97706; }
        .icon-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 50%; transition: background 0.2s; color: #1e293b; }
        .icon-btn:hover { background: #f1f5f9; color: #000; }
        .suggest-item:hover { background: #f0f9ff; }
        .loc-use-btn:hover { background: #f0f0ff; }
        
        @media(max-width: 900px) { 
          .desktop-only { display: none !important; }
          .dhoond-logo { 
            height: 240% !important; 
            width: 100% !important;
            object-fit: contain;
            flex-shrink: 0;
          }
          .mobile-nav-container { padding: 0 0.75rem !important; height: 72px !important; }
        }
        @media(min-width: 901px) { 
          .mobile-only { display: none !important; } 
          .dhoond-logo-desktop {
            height: 260% !important;
            width: 100% !important;
            object-fit: contain;
          }
        }
        .dhoond-logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          width: 150px;
          overflow: hidden; /* This masks the vertical whitespace */
          position: relative;
        }
      `}</style>

      <div style={{
        position: 'sticky', top: 0, zIndex: 1000, width: '100%',
        background: '#fff', borderBottom: '1px solid #f1f5f9',
        boxShadow: scrolled ? '0 8px 30px rgba(0,0,0,0.04)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <nav className="mobile-nav-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 5%', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* LEFT */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
            <div className="mobile-only">
              {location.pathname !== '/' && !location.pathname.startsWith('/admin') ? (
                <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Go back">
                  <ChevronLeft size={28} />
                </button>
              ) : (
                <button className="icon-btn" onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
                  <Menu size={28} />
                </button>
              )}
            </div>

            <Link to="/" className="desktop-only" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <div className="dhoond-logo-container">
                <img src="/logo.png" alt="Dhoond" className="dhoond-logo dhoond-logo-desktop" style={{ width: 'auto', objectFit: 'contain' }} />
              </div>
            </Link>

            <div className="desktop-only" style={{ display: 'flex', gap: '1.75rem', alignItems: 'center', marginLeft: '1rem' }}>
              {NAV_LINKS.map(link => (
                <Link key={link.label} to={link.to || '#'}
                  onClick={link.type === 'soon' ? (e) => { e.preventDefault(); openComingSoon(); } : undefined}
                  className={`nav-link ${link.badge ? 'highlight' : ''} ${location.pathname === link.to ? 'active' : ''}`}>
                  {link.label}
                  {link.badge && <span style={{ background: '#fef08a', color: '#854d0e', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '8px', marginLeft: '6px' }}>{link.badge}</span>}
                </Link>
              ))}
            </div>
          </div>

          {/* CENTER: Mobile Logo */}
          <div className="mobile-only" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1.5, height: '100%' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <div className="dhoond-logo-container">
                <img src="/logo.png" alt="Dhoond" className="dhoond-logo" />
              </div>
            </Link>
          </div>

          {/* RIGHT: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1, justifyContent: 'flex-end' }}>
            <div className="desktop-only" style={{ marginRight: '1rem' }}>
              <LocationButton onClick={() => setShowLocationModal(true)} />
            </div>

            <div className="desktop-only" style={{ position: 'relative', width: '240px', marginRight: '1rem' }} ref={searchRef}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', borderRadius: '99px', padding: '0.55rem 1rem' }}>
                <Search size={16} color="#64748b" />
                <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={() => setShowSuggestions(true)} style={{ background: 'none', border: 'none', outline: 'none', marginLeft: '8px', fontSize: '14px', width: '100%' }} />
              </div>
            </div>

            <button className="icon-btn mobile-only" onClick={() => setIsSearchOpen(true)}>
              <Search size={26} />
            </button>

            <div style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={() => isAuthenticated ? setIsProfileOpen(!isProfileOpen) : navigate('/painting')}>
                <User size={isAuthenticated ? 26 : 24} color={isAuthenticated ? '#2563eb' : 'currentColor'} />
              </button>

              {isAuthenticated && isProfileOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 900 }} onClick={() => setIsProfileOpen(false)} />
                  <div style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: '240px', background: '#fff', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9', zIndex: 1000, overflow: 'hidden', padding: '0.75rem', animation: 'dropdownFade 0.2s ease-out' }}>
                    <div style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111' }}>{userName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>+91 {userMobile}</div>
                    </div>
                    <Link to="/profile" onClick={() => setIsProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '12px', textDecoration: 'none', color: '#475569', fontWeight: 600, fontSize: '0.9rem' }} className="profile-item"><User size={18} /> My Profile</Link>
                    <Link to="/profile" onClick={() => setIsProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '12px', textDecoration: 'none', color: '#475569', fontWeight: 600, fontSize: '0.9rem' }} className="profile-item"><Package size={18} /> My Bookings</Link>
                    <div style={{ height: '1px', background: '#f1f5f9', margin: '0.5rem 0' }} />
                    <button onClick={() => { logout(); setIsProfileOpen(false); navigate('/'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '12px', border: 'none', background: 'transparent', color: '#ef4444', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }} className="profile-logout"><LogOut size={18} /> Logout</button>
                  </div>
                </>
              )}
            </div>

            <button className="icon-btn" onClick={() => navigate('/shop/cart')} style={{ position: 'relative' }}>
              <ShoppingCart size={26} />
              {totalItems > 0 && (
                <span style={{ position: 'absolute', top: '2px', right: '2px', background: '#2563eb', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* MOBILE: Location Bar */}
        <div className="mobile-only" onClick={() => setShowLocationModal(true)} style={{ padding: '0.65rem 1.25rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.65rem', background: '#fff', cursor: 'pointer' }}>
          <MapPin size={15} color="#2563eb" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{locationLabel}</span>
          <ChevronDown size={14} color="#64748b" />
        </div>
      </div>

      {/* LOCATION MODAL */}
      {showLocationModal && (
        <>
          <div onClick={() => setShowLocationModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000, backdropFilter: 'blur(3px)' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', borderRadius: '20px', width: '92%', maxWidth: '520px', zIndex: 2100, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>
            <button onClick={() => setShowLocationModal(false)} style={{ position: 'absolute', top: '14px', right: '14px', background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}><X size={18} color="#374151" /></button>
            <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fff', border: '1.5px solid #d1d5db', borderRadius: '12px', padding: '0.85rem 1.25rem' }}>
                <button onClick={() => setShowLocationModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#6b7280', padding: 0, flexShrink: 0 }}><ChevronLeft size={20} /></button>
                <input ref={locationInputRef} type="text" placeholder="Search for location..." value={locationSearchQuery} onChange={e => setLocationSearchQuery(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', fontSize: '15px', fontWeight: 500, color: '#111', width: '100%' }} />
              </div>
            </div>
            <div style={{ padding: '0 1.5rem 1rem' }}>
              <button className="loc-use-btn" onClick={() => { setShowLocationModal(false); detectLocation(); }} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.75rem', borderRadius: '12px', width: '100%' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={20} color="#6d28d9" /></div>
                <div style={{ textAlign: 'left' }}><p style={{ fontWeight: 700, fontSize: '15px', color: '#4c1d95', margin: 0 }}>Use current location</p>{locating && <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>Detecting…</p>}</div>
              </button>
            </div>
            <div style={{ height: '1px', background: '#f3f4f6', margin: '0 1.5rem' }} />
            <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}><span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>powered by</span><span style={{ fontWeight: 700, fontSize: '14px' }}><span style={{ color: '#4285F4' }}>G</span><span style={{ color: '#EA4335' }}>o</span><span style={{ color: '#FBBC05' }}>o</span><span style={{ color: '#4285F4' }}>g</span><span style={{ color: '#34A853' }}>l</span><span style={{ color: '#EA4335' }}>e</span></span></div>
          </div>
        </>
      )}

      {/* MOBILE SIDEBAR MENU */}
      {isMenuOpen && (
        <>
          <div onClick={() => setIsMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1100, backdropFilter: 'blur(2px)' }} />
          <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px', background: '#fff', zIndex: 1200, display: 'flex', flexDirection: 'column', boxShadow: '8px 0 32px rgba(0,0,0,0.12)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to="/" onClick={() => setIsMenuOpen(false)}><img src="/logo.png" alt="Dhoond" style={{ height: '60px', width: 'auto' }} /></Link>
              <button className="icon-btn" onClick={() => setIsMenuOpen(false)}><X size={22} /></button>
            </div>
            <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', overflowY: 'auto' }}>
              <Link to={isAuthenticated ? "/profile" : "/painting"} onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', textDecoration: 'none' }}>
                <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}><User size={20} /></div>
                <div><div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111' }}>{isAuthenticated ? userName : 'Login / Register'}</div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>{isAuthenticated ? `+91 ${userMobile}` : 'View Profile'}</div></div>
              </Link>
              {NAV_LINKS.map(link => (
                <Link key={link.label} to={link.to || '#'} onClick={() => { setIsMenuOpen(false); if (link.type === 'soon') openComingSoon(); }} style={{ textDecoration: 'none', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, color: '#111' }}>{link.label}</Link>
              ))}
            </nav>
          </div>
        </>
      )}

      {/* MOBILE SEARCH MODAL */}
      {isSearchOpen && (
        <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 1300, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #f1f5f9' }}>
            <button className="icon-btn" onClick={() => setIsSearchOpen(false)}><X size={24} /></button>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f3f4f6', borderRadius: '99px', padding: '0.65rem 1rem' }}>
              <Search size={18} color="#6b7280" />
              <input autoFocus type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()} style={{ background: 'none', border: 'none', outline: 'none', marginLeft: '8px', fontSize: '16px', width: '100%' }} />
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
            {filteredSuggestions.map(s => (
              <div key={s} onClick={() => handleSearchSubmit(s)} style={{ padding: '1rem', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Search size={16} color="#2563eb" />{s}</div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

const MainLayout = () => {
  const { showComingSoon, closeComingSoon } = useUI();
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      {showComingSoon && <ComingSoonModal onClose={closeComingSoon} />}
    </>
  );
};

function App() {
  return (
    <UIProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/admin/*" element={<Admin />} />
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/service/:id" element={<ServiceDetail />} />
                <Route path="/shop/cart" element={<Cart />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/painting" element={<Painting />} />
                <Route path="/commercial-painting" element={<CommercialPainting />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </UIProvider>
  );
}

export default App;
