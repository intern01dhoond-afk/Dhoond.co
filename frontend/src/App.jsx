import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, User, ChevronDown, MapPin, Zap, LogOut, Package, LayoutDashboard } from 'lucide-react';
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
import './index.css';

const SUGGESTIONS = ['Painting Service', 'AC Repair', 'RO Technician', 'Plumber', 'Electrician', 'Washing Machine Repair', 'Refrigerator Repair'];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { user, logout, isAuthenticated } = useAuth();

  // Safety check for user properties
  const userName = user?.name || 'User';
  const userMobile = user?.mobile || '';

  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  // Location state
  const [locationLabel, setLocationLabel] = React.useState(() => localStorage.getItem('dhoond_location') || 'Fetching location…');
  const [locationSubtext, setLocationSubtext] = React.useState(() => localStorage.getItem('dhoond_location_sub') || '');
  const [showLocationModal, setShowLocationModal] = React.useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = React.useState('');
  const [locating, setLocating] = React.useState(false);
  const { openComingSoon } = useUI();

  const searchRef = React.useRef(null);
  const locationInputRef = React.useRef(null);

  // ── Auto-detect location on mount ──
  React.useEffect(() => {
    if (!localStorage.getItem('dhoond_location')) {
      detectLocation();
    }
  }, []);

  // Waits for Google Maps JS SDK to load, then calls cb
  const waitForGoogleMaps = (cb, retries = 20) => {
    if (window.google && window.google.maps && window.google.maps.Geocoder) {
      cb();
    } else if (retries > 0) {
      setTimeout(() => waitForGoogleMaps(cb, retries - 1), 300);
    }
  };

  const detectLocation = () => {
    setLocating(true);
    setLocationLabel('Detecting…');
    if (!navigator.geolocation) {
      setLocationLabel('Enable location');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const latLng = { lat: latitude, lng: longitude };

        waitForGoogleMaps(() => {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: latLng }, (results, status) => {
            if (status === 'OK' && results && results.length > 0) {
              // Try to find a sublocality or neighborhood for the short label
              const result = results[0];
              const comps = result.address_components || [];
              const find = (types) => {
                const c = comps.find(c => types.some(t => c.types.includes(t)));
                return c ? c.long_name : null;
              };
              // Use full formatted address
              const label = result.formatted_address || 'My Location';
              const city = find(['locality', 'administrative_area_level_2']) || '';
              const state = find(['administrative_area_level_1']) || '';
              const sub = [city, state].filter(Boolean).join(', ');
              setLocationLabel(label);
              setLocationSubtext(sub);
              localStorage.setItem('dhoond_location', label);
              localStorage.setItem('dhoond_location_sub', sub);
            } else {
              setLocationLabel('Location found');
            }
            setLocating(false);
          });
        });
      },
      () => {
        setLocationLabel('Enable location');
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // ── Scroll shadow ──
  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Click outside search ──
  React.useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Focus location input + init Places Autocomplete when modal opens ──
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
        .icon-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; transition: background 0.2s; color: #374151; }
        .icon-btn:hover { background: #f3f4f6; color: #111; }
        .suggest-item:hover { background: #f0f9ff; }
        .loc-use-btn:hover { background: #f0f0ff; }
        @media(max-width: 900px) { 
          .desktop-only { display: none !important; }
          .dhoond-logo { height: 60px !important; margin: 5px 0; }
          nav { height: auto !important; min-height: 80px; }
        }
        @media(min-width: 901px) { .mobile-only { display: none !important; } }
      `}</style>

      <div style={{
        position: 'sticky', top: 0, zIndex: 1000, width: '100%',
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.06)' : 'none',
        transition: 'box-shadow 0.3s ease',
      }}>
        <nav style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 5%', height: '68px', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

          {/* MOBILE: Hamburger */}
          <button className="icon-btn mobile-only" onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
            <Menu size={24} />
          </button>

          {/* LOGO */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <img src="/logo.png" alt="Dhoond" className="dhoond-logo" style={{ height: '50px', width: 'auto', objectFit: 'contain' }} />
          </Link>

          {/* DESKTOP: Nav Links */}
          <div className="desktop-only" style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
            {NAV_LINKS.map(link => {
              if (link.type === 'soon') {
                return (
                  <button key={link.label} onClick={openComingSoon} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem 0' }}>
                    {link.label}
                  </button>
                );
              }
              return (
                <Link key={link.label} to={link.to}
                  className={`nav-link ${link.badge ? 'highlight' : ''} ${location.pathname === link.to ? 'active' : ''}`}
                  style={link.badge ? { display: 'flex', alignItems: 'center', gap: '6px' } : {}}
                >
                  {link.label}
                  {link.badge && (
                    <span style={{ background: '#fef08a', color: '#854d0e', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div style={{ flex: 1 }} />

          {/* DESKTOP: Location */}
          <div className="desktop-only">
            <LocationButton onClick={() => setShowLocationModal(true)} />
          </div>

          {/* DESKTOP: Search Bar */}
          <div className="desktop-only" style={{ position: 'relative', width: '260px' }} ref={searchRef}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', borderRadius: '99px', padding: '0.55rem 1rem', border: showSuggestions ? '1.5px solid #2563eb' : '1.5px solid transparent', transition: 'border-color 0.2s' }}>
              <Search size={16} color="#6b7280" style={{ flexShrink: 0 }} />
              <input
                type="text" placeholder="Search for services..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
                style={{ background: 'none', border: 'none', outline: 'none', marginLeft: '8px', fontSize: '14px', fontWeight: 500, color: '#111', width: '100%' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}>
                  <X size={14} />
                </button>
              )}
            </div>
            {showSuggestions && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', overflow: 'hidden', zIndex: 200 }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', padding: '0.75rem 1rem 0.25rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Suggestions</p>
                {filteredSuggestions.map(s => (
                  <div key={s} className="suggest-item" onClick={() => handleSearchSubmit(s)} style={{ padding: '0.65rem 1rem', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#374151', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Search size={14} color="#9ca3af" /> {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MOBILE: Search Icon */}
          <button className="icon-btn mobile-only" onClick={() => setIsSearchOpen(true)} aria-label="Search">
            <Search size={22} />
          </button>

          {/* Profile */}
          <div style={{ position: 'relative' }}>
            <button
              className="icon-btn desktop-only"
              onClick={() => isAuthenticated ? setIsProfileOpen(!isProfileOpen) : navigate('/painting')}
              aria-label="Profile"
              onMouseEnter={() => isAuthenticated && setIsProfileOpen(true)}
            >
              <User size={22} color={isAuthenticated ? '#2563eb' : 'currentColor'} />
            </button>

            {/* Profile Dropdown */}
            {isAuthenticated && isProfileOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 900 }}
                  onClick={() => setIsProfileOpen(false)}
                />
                <div
                  style={{
                    position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                    width: '240px', background: '#fff', borderRadius: '20px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9',
                    zIndex: 1000, overflow: 'hidden', padding: '0.75rem',
                    animation: 'dropdownFade 0.2s ease-out'
                  }}
                  onMouseLeave={() => setIsProfileOpen(false)}
                >
                  <div style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111' }}>{userName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>+91 {userMobile}</div>
                  </div>

                  <Link to="/profile" onClick={() => setIsProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '12px', textDecoration: 'none', color: '#475569', fontWeight: 600, fontSize: '0.9rem', transition: 'background 0.2s' }} className="profile-item">
                    <User size={18} /> My Profile
                  </Link>
                  <Link to="/profile" onClick={() => setIsProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '12px', textDecoration: 'none', color: '#475569', fontWeight: 600, fontSize: '0.9rem', transition: 'background 0.2s' }} className="profile-item">
                    <Package size={18} /> My Bookings
                  </Link>

                  <div style={{ height: '1px', background: '#f1f5f9', margin: '0.5rem 0' }} />

                  <button onClick={() => { logout(); setIsProfileOpen(false); navigate('/'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '12px', border: 'none', background: 'transparent', color: '#ef4444', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.2s' }} className="profile-logout">
                    <LogOut size={18} /> Logout
                  </button>
                </div>
                <style>{`
                  @keyframes dropdownFade {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                  .profile-item:hover { background: #f8fafc; color: #2563eb; }
                  .profile-logout:hover { background: #fef2f2; }
                `}</style>
              </>
            )}
          </div>

          {/* Cart */}
          <button className="icon-btn" onClick={() => navigate('/shop/cart')} aria-label="Cart" style={{ position: 'relative' }}>
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span style={{ position: 'absolute', top: '4px', right: '4px', background: '#2563eb', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(37,99,235,0.4)' }}>
                {totalItems}
              </span>
            )}
          </button>

        </nav>

        {/* MOBILE: Location Bar */}
        <div className="mobile-only" onClick={() => setShowLocationModal(true)} style={{ padding: '0.5rem 5%', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fafafa', cursor: 'pointer' }}>
          <MapPin size={14} color="#2563eb" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{locationLabel}</span>
          {locationSubtext && <span style={{ fontSize: '12px', color: '#9ca3af' }}>{locationSubtext}</span>}
          <ChevronDown size={12} color="#6b7280" />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          LOCATION MODAL (Urban Company style)
      ══════════════════════════════════════════ */}
      {showLocationModal && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowLocationModal(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000, backdropFilter: 'blur(3px)' }}
          />
          {/* Modal Card */}
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#fff', borderRadius: '20px',
            width: '92%', maxWidth: '520px',
            zIndex: 2100,
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
          }}>
            {/* Close button */}
            <button
              onClick={() => setShowLocationModal(false)}
              style={{ position: 'absolute', top: '14px', right: '14px', background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}
            >
              <X size={18} color="#374151" />
            </button>

            {/* Search field */}
            <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fff', border: '1.5px solid #d1d5db', borderRadius: '12px', padding: '0.85rem 1.25rem' }}>
                <button
                  onClick={() => setShowLocationModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#6b7280', padding: 0, flexShrink: 0 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                </button>
                <input
                  ref={locationInputRef}
                  type="text"
                  placeholder="Search for your location/society/apartment"
                  value={locationSearchQuery}
                  onChange={e => setLocationSearchQuery(e.target.value)}
                  style={{ background: 'none', border: 'none', outline: 'none', fontSize: '15px', fontWeight: 500, color: '#111', width: '100%' }}
                />
              </div>
            </div>

            {/* Use current location */}
            <div style={{ padding: '0 1.5rem 1rem' }}>
              <button
                className="loc-use-btn"
                onClick={() => {
                  setShowLocationModal(false);
                  detectLocation();
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '0.75rem', borderRadius: '12px', width: '100%',
                  transition: 'background 0.15s'
                }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {/* Target/crosshair icon */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                    <circle cx="12" cy="12" r="9" stroke="#6d28d9" strokeOpacity="0.3" />
                  </svg>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontWeight: 700, fontSize: '15px', color: '#4c1d95', margin: 0 }}>Use current location</p>
                  {locating && <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>Detecting…</p>}
                </div>
              </button>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#f3f4f6', margin: '0 1.5rem' }} />

            {/* Powered by Google */}
            <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>powered by</span>
              <span style={{ fontWeight: 700, fontSize: '14px' }}>
                <span style={{ color: '#4285F4' }}>G</span>
                <span style={{ color: '#EA4335' }}>o</span>
                <span style={{ color: '#FBBC05' }}>o</span>
                <span style={{ color: '#4285F4' }}>g</span>
                <span style={{ color: '#34A853' }}>l</span>
                <span style={{ color: '#EA4335' }}>e</span>
              </span>
            </div>
          </div>
        </>
      )}

      {/* ── MOBILE: Sidebar Menu ── */}
      {isMenuOpen && (
        <>
          <div onClick={() => setIsMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1100, backdropFilter: 'blur(2px)' }} />
          <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px', background: '#fff', zIndex: 1200, display: 'flex', flexDirection: 'column', boxShadow: '8px 0 32px rgba(0,0,0,0.12)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to="/" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                <img src="/logo.png" alt="Dhoond" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />
              </Link>
              <button className="icon-btn" onClick={() => setIsMenuOpen(false)}><X size={22} /></button>
            </div>
            <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
              <div
                onClick={() => { setIsMenuOpen(false); setShowLocationModal(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', background: '#f0f9ff', borderRadius: '12px', cursor: 'pointer' }}
              >
                <MapPin size={16} color="#2563eb" />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ fontWeight: 700, fontSize: '14px', color: '#1e40af', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{locationLabel}</p>
                  {locationSubtext && <p style={{ fontSize: '11px', color: '#60a5fa', margin: 0 }}>{locationSubtext}</p>}
                </div>
                <ChevronDown size={14} color="#2563eb" />
              </div>
            </div>
            <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', overflowY: 'auto' }}>
                <div style={{ padding: '0.5rem 0.5rem 1rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.75rem' }}>
                  <Link to={isAuthenticated ? "/profile" : "/painting"} onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', cursor: 'pointer' }}>
                    <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
                      <User size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {isAuthenticated ? userName : 'Login / Register'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                        {isAuthenticated ? `+91 ${userMobile}` : 'Login to view profile'}
                      </div>
                    </div>
                  </Link>
                </div>

              <p style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.5rem 1rem 0.25rem' }}>Explore Dhoond</p>

              {NAV_LINKS.map(link => {
                if (link.type === 'soon') {
                  return (
                    <button key={link.label} onClick={() => { setIsMenuOpen(false); openComingSoon(); }} style={{ textAlign: 'left', background: 'none', border: 'none', textDecoration: 'none', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, color: '#475569', display: 'block' }}>
                      {link.label}
                    </button>
                  );
                }
                return (
                  <Link key={link.label} to={link.to} onClick={() => setIsMenuOpen(false)}
                    style={{ textDecoration: 'none', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, color: link.badge ? '#d97706' : '#111', background: location.pathname === link.to ? '#eff6ff' : 'transparent', display: 'block', transition: 'background 0.15s' }}>
                    {link.label}
                  </Link>
                );
              })}

              {isAuthenticated && (
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, color: '#111', display: 'flex', alignItems: 'center', gap: '0.75rem', background: location.pathname === '/profile' ? '#eff6ff' : 'transparent' }}>
                  <Package size={18} color="#64748b" /> My Bookings
                </Link>
              )}
            </nav>
            <div style={{ padding: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
              <button onClick={() => { navigate('/painting'); setIsMenuOpen(false); }} style={{ width: '100%', background: '#2563eb', color: '#fff', padding: '1rem', borderRadius: '14px', fontWeight: 800, fontSize: '1rem', border: 'none', cursor: 'pointer' }}>
                Book a Service
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── MOBILE: Full-screen Search Modal ── */}
      {isSearchOpen && (
        <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 1300, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #f1f5f9' }}>
            <button className="icon-btn" onClick={() => setIsSearchOpen(false)}><X size={24} /></button>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f3f4f6', borderRadius: '99px', padding: '0.65rem 1rem' }}>
              <Search size={18} color="#6b7280" />
              <input
                autoFocus type="text" placeholder="Search for services..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
                style={{ background: 'none', border: 'none', outline: 'none', marginLeft: '8px', fontSize: '16px', fontWeight: 500, color: '#111', width: '100%' }}
              />
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', padding: '0 0.25rem' }}>Popular Searches</p>
            {filteredSuggestions.map(s => (
              <div key={s} onClick={() => handleSearchSubmit(s)} className="suggest-item"
                style={{ padding: '1rem', borderRadius: '14px', cursor: 'pointer', fontSize: '15px', fontWeight: 600, color: '#111', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <div style={{ width: '36px', height: '36px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Search size={16} color="#2563eb" />
                </div>
                {s}
              </div>
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
