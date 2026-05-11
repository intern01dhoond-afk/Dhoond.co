import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, User, ChevronDown, MapPin, Zap, LogOut, Package, LayoutDashboard, ChevronLeft, Home as HomeIcon, Paintbrush, Phone, Store, ArrowUpRight } from 'lucide-react';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Checkout from './pages/Checkout';
import Cart from './pages/Cart';
import Painting from './pages/Painting';
import CommercialPainting from './pages/CommercialPainting';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Footer from './components/Footer';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UIProvider, useUI } from './context/UIContext';
import ComingSoonModal from './components/ComingSoonModal';
import AuthModal from './components/AuthModal';
import { detectCurrentLocation, waitForGoogleMaps, isInsideGeofence } from './utils/location';
import './index.css';

const SEARCH_SUGGESTIONS = [
  { label: 'Painting Service', path: '/painting', isPainting: true },
  { label: 'AC Repair', path: '/shop?cat=technician&subcat=ac' },
  { label: 'RO Technician', path: '/shop?cat=technician&subcat=ro' },
  { label: 'Plumber', path: '', isComingSoon: true },
  { label: 'Electrician', path: '/shop?cat=electrician' },
  { label: 'Washing Machine Repair', path: '/shop?cat=technician&subcat=washing' },
  { label: 'Refrigerator Repair', path: '', isComingSoon: true }
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { user, logout, isAuthenticated } = useAuth();

  const userName = user?.name || 'User';
  const userMobile = user?.mobile || '';

  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  const [locating, setLocating] = React.useState(false);
  const [showMap, setShowMap] = React.useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = React.useState('');
  const [mapSelectedLabel, setMapSelectedLabel] = React.useState('');
  const { openComingSoon, showLocationModal, openLocation, closeLocation, locationLabel, locationSubtext, updateLocation, userLat, userLng } = useUI();

  const searchRef = React.useRef(null);
  const locationInputRef = React.useRef(null);
  const mapContainerRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const markerRef = React.useRef(null);
  const mapSearchRef = React.useRef(null);

  React.useEffect(() => {
    const savedLoc = localStorage.getItem('dhoond_location');
    if (!savedLoc || savedLoc === 'Detecting…' || savedLoc === 'Location not found' || savedLoc === 'Fetching location…') {
      detectLocation();
    }
  }, []);

  const detectLocation = async () => {
    setLocating(true);
    updateLocation('Detecting…', '');
    try {
      const loc = await detectCurrentLocation();
      updateLocation(loc.label, loc.sub, loc.lat, loc.lng);
    } catch (err) {
      console.error("Location detection failed:", err);
      updateLocation('Location not detected', 'Click to set manually');
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
    if (!showLocationModal) { setShowMap(false); setMapSelectedLabel(''); return; }
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
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          updateLocation(label, sub, lat, lng);
          closeLocation();
        });
      });
    }, 150);
  }, [showLocationModal]);

  // Init Google Map when showMap becomes true
  React.useEffect(() => {
    if (!showMap || !mapContainerRef.current) return;

    const initMap = (startPos) => {
      waitForGoogleMaps(() => {
        const map = new window.google.maps.Map(mapContainerRef.current, {
          center: startPos,
          zoom: 16,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy',
          styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }],
        });
        const marker = new window.google.maps.Marker({
          position: startPos,
          map,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
        });
        mapInstanceRef.current = map;
        markerRef.current = marker;

        const geocoder = new window.google.maps.Geocoder();
        const reverseGeocode = (latLng) => {
          geocoder.geocode({ location: latLng }, (results, status) => {
            if (status === 'OK' && results[0]) {
              setMapSelectedLabel(results[0].formatted_address);
            }
          });
        };

        reverseGeocode(startPos);

        marker.addListener('dragend', () => {
          const pos = marker.getPosition();
          reverseGeocode({ lat: pos.lat(), lng: pos.lng() });
        });
        map.addListener('click', (e) => {
          marker.setPosition(e.latLng);
          reverseGeocode({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        });

        // Search bar autocomplete inside map view
        if (mapSearchRef.current) {
          const mapAC = new window.google.maps.places.Autocomplete(mapSearchRef.current, {
            types: ['geocode', 'establishment'],
            componentRestrictions: { country: 'in' },
          });
          mapAC.addListener('place_changed', () => {
            const place = mapAC.getPlace();
            if (!place.geometry) return;
            const loc = place.geometry.location;
            map.panTo(loc);
            map.setZoom(17);
            marker.setPosition(loc);
            reverseGeocode({ lat: loc.lat(), lng: loc.lng() });
          });
        }
      });
    };

    // Try GPS first, fall back to Bengaluru
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => initMap({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => initMap({ lat: 12.9716, lng: 77.5946 }),
        { timeout: 5000 }
      );
    } else {
      initMap({ lat: 12.9716, lng: 77.5946 });
    }
  }, [showMap]);

  const isBengaluru = (locationLabel || '').toLowerCase().includes('bengaluru') ||
    (locationLabel || '').toLowerCase().includes('bangalore') ||
    (locationSubtext || '').toLowerCase().includes('bengaluru') ||
    (locationSubtext || '').toLowerCase().includes('bangalore');

  const isNagpur = isInsideGeofence(userLat, userLng, 21.1497877, 79.0806859, 8000) ||
    (locationLabel || '').toLowerCase().includes('nagpur') ||
    (locationSubtext || '').toLowerCase().includes('nagpur');

  const filteredSuggestions = searchQuery.length > 0
    ? SEARCH_SUGGESTIONS.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : SEARCH_SUGGESTIONS;

  const handleSearchSubmit = (itemOrQuery) => {
    setShowSuggestions(false);
    setIsSearchOpen(false);

    if (itemOrQuery && typeof itemOrQuery === 'object' && itemOrQuery.label) {
      if (itemOrQuery.isComingSoon) {
        openComingSoon();
        return;
      }
      if (itemOrQuery.isPainting) {
        if (isBengaluru) navigate(itemOrQuery.path);
        else openComingSoon();
        return;
      }
      if (isNagpur) navigate(itemOrQuery.path);
      else openComingSoon();
      return;
    }

    const q = (typeof itemOrQuery === 'string' ? itemOrQuery : searchQuery).toLowerCase();
    const match = SEARCH_SUGGESTIONS.find(s => s.label.toLowerCase() === q) || 
                  SEARCH_SUGGESTIONS.find(s => s.label.toLowerCase().includes(q));
                  
    if (match) {
      if (match.isComingSoon) {
        openComingSoon();
      } else if (match.isPainting) {
        if (isBengaluru) navigate(match.path);
        else openComingSoon();
      } else {
        if (isNagpur) navigate(match.path);
        else openComingSoon();
      }
    } else {
      if (q.includes('paint')) {
        if (isBengaluru) navigate('/painting');
        else openComingSoon();
      } else {
        if (isNagpur) navigate('/shop');
        else openComingSoon();
      }
    }
  };

  const PHONE_NUMBER = '+919102740274';
  const NAV_LINKS = [
    { label: 'Home', to: '/' },
    { label: 'Painting', to: '/painting', badge: 'New' },
    { label: 'Contact', href: `tel:${PHONE_NUMBER}` },
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
        .icon-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 12px; transition: all 0.2s; color: #334155; }
        .icon-btn:hover { background: #f1f5f9; color: #0f172a; }
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
          .mobile-nav-container { padding: 0 0.75rem !important; height: 64px !important; }
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
          overflow: hidden;
          position: relative;
        }

        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes backdropFadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(4px); }
        }
        @keyframes rotateIn {
          from { transform: rotate(-180deg) scale(0.5); opacity: 0; }
          to { transform: rotate(0) scale(1); opacity: 1; }
        }
      `}</style>

      <div style={{
        position: 'sticky', top: 0, zIndex: 1000, width: '100%',
        background: scrolled ? 'rgba(255,255,255,0.85)' : '#fff',
        backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(241,245,249,0.8)' : '1px solid #f1f5f9',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.03)' : 'none',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <nav className="mobile-nav-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 5%', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* LEFT */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
            <div className="mobile-only">
              {location.pathname !== '/' && !location.pathname.startsWith('/admin') ? (
                <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Go back">
                  <ChevronLeft size={28} />
                </button>
              ) : (
                <button className="icon-btn" onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
                  <Menu size={24} />
                </button>
              )}
            </div>

            <Link to="/" className="desktop-only" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <div className="dhoond-logo-container">
                <img src="/logo.png" alt="Dhoond" className="dhoond-logo dhoond-logo-desktop" style={{ width: 'auto', objectFit: 'contain' }} />
              </div>
            </Link>

            <div className="desktop-only" style={{ display: 'flex', gap: '1.75rem', alignItems: 'center', marginLeft: '1rem' }}>
              {NAV_LINKS.map(link => {
                const isSoon = link.type === 'soon';
                const isActive = link.to && location.pathname === link.to;
                
                if (link.href) {
                  return (
                    <a key={link.label} href={link.href} className="nav-link" onClick={() => {
                      if (window.fbq) window.fbq('track', 'Contact');
                    }}>
                      {link.label}
                    </a>
                  );
                }

                return (
                  <Link key={link.label} to={link.to || '#'}
                    onClick={(e) => {
                      const isPaintingRestricted = link.label === 'Painting' && !isBengaluru;
                      if (isSoon || isPaintingRestricted) {
                        e.preventDefault();
                        openComingSoon();
                      }
                    }}
                    className={`nav-link ${link.badge ? 'highlight' : ''} ${isActive ? 'active' : ''}`}>
                    {link.label}
                    {link.badge && <span style={{ background: '#fef08a', color: '#854d0e', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '8px', marginLeft: '6px' }}>{link.badge}</span>}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* CENTER: Mobile Logo */}
          <div className="mobile-only" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, height: '100%' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <div className="dhoond-logo-container">
                <img src="/logo.png" alt="Dhoond" className="dhoond-logo" />
              </div>
            </Link>
          </div>

          {/* RIGHT: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1, justifyContent: 'flex-end' }}>
            <div className="desktop-only" style={{ marginRight: '1rem' }}>
              <LocationButton onClick={openLocation} />
            </div>

            <div className="desktop-only" style={{ position: 'relative', width: '240px', marginRight: '1rem' }} ref={searchRef}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', borderRadius: '99px', padding: '0.55rem 1rem' }}>
                <Search size={16} color="#64748b" />
                <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={() => setShowSuggestions(true)} onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()} style={{ background: 'none', border: 'none', outline: 'none', marginLeft: '8px', fontSize: '14px', width: '100%' }} />
              </div>
            </div>

            <button className="icon-btn mobile-only" onClick={() => setIsSearchOpen(true)}>
              <Search size={24} />
            </button>

            <div style={{ position: 'relative' }} className="desktop-only">
              <button className="icon-btn" onClick={() => isAuthenticated ? setIsProfileOpen(!isProfileOpen) : setIsAuthOpen(true)}>
                <User size={24} color={isAuthenticated ? '#2563eb' : 'currentColor'} />
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
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span style={{ position: 'absolute', top: '2px', right: '2px', background: '#2563eb', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* Auth Modal */}
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

        {/* MOBILE: Location Bar */}
        <div className="mobile-only" onClick={openLocation} style={{ padding: '0.5rem 1rem', borderTop: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fafbfc', cursor: 'pointer' }}>
          <MapPin size={13} color="#2563eb" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{locationLabel}</span>
          <ChevronDown size={12} color="#94a3b8" style={{ flexShrink: 0 }} />
        </div>
      </div>

      {/* LOCATION MODAL */}
      {showLocationModal && (
        <>
          <div onClick={closeLocation} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, backdropFilter: 'blur(4px)' }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#fff', borderRadius: '24px',
            width: '92%', maxWidth: '480px',
            zIndex: 2100, overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
            transition: 'all 0.3s ease',
          }}>

            {showMap ? (
              /* ── MAP VIEW ── */
              <>
                {/* Map header */}
                <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                  <button onClick={() => setShowMap(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ChevronLeft size={18} color="#374151" />
                  </button>
                  <div>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>Select on map</p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>Tap or drag the pin to your exact location</p>
                  </div>
                </div>

                {/* Search bar on map */}
                <div style={{ padding: '0.75rem 1rem 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#f3f4f6', borderRadius: '12px', padding: '0.65rem 1rem' }}>
                    <Search size={15} color="#64748b" style={{ flexShrink: 0 }} />
                    <input
                      ref={mapSearchRef}
                      type="text"
                      placeholder="Search a location on map..."
                      className="no-input-style"
                      style={{ fontSize: '13.5px', fontWeight: 500, color: '#111', width: '100%' }}
                    />
                  </div>
                </div>

                {/* Map canvas */}
                <div ref={mapContainerRef} style={{ width: '100%', height: '260px', marginTop: '0.75rem' }} />

                {/* Selected address preview + confirm */}
                <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.85rem' }}>
                    <MapPin size={16} color="#2563eb" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: '0.83rem', color: '#374151', fontWeight: 600, lineHeight: 1.4 }}>
                      {mapSelectedLabel || 'Drag the pin to set your location…'}
                    </p>
                  </div>
                  <button
                    disabled={!mapSelectedLabel}
                    onClick={() => {
                      if (!mapSelectedLabel) return;
                      const pos = markerRef.current.getPosition();
                      updateLocation(mapSelectedLabel, '', pos.lat(), pos.lng());
                      closeLocation();
                      setShowMap(false);
                    }}
                    style={{
                      width: '100%', padding: '0.85rem',
                      background: mapSelectedLabel ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#e2e8f0',
                      color: mapSelectedLabel ? '#fff' : '#94a3b8',
                      border: 'none', borderRadius: '14px',
                      fontWeight: 800, fontSize: '0.9rem',
                      cursor: mapSelectedLabel ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s',
                    }}
                  >
                    Confirm this Location
                  </button>
                </div>
              </>
            ) : (
              /* ── DEFAULT VIEW ── */
              <>
                {/* Header */}
                <div style={{ padding: '1.25rem 1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 900, fontSize: '1.05rem', color: '#0f172a', letterSpacing: '-0.01em' }}>Set your location</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>Find services near you</p>
                  </div>
                  <button onClick={closeLocation} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={16} color="#374151" />
                  </button>
                </div>

                {/* Search pill */}
                <div style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#f3f4f6', borderRadius: '12px', padding: '0.75rem 1rem' }}>
                    <Search size={16} color="#64748b" style={{ flexShrink: 0 }} />
                    <input
                      ref={locationInputRef}
                      type="text"
                      placeholder="Search city, area or landmark..."
                      value={locationSearchQuery}
                      onChange={e => setLocationSearchQuery(e.target.value)}
                      className="no-input-style"
                      style={{ fontSize: '14px', fontWeight: 500, color: '#111', width: '100%' }}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: '#f1f5f9', margin: '0 1.5rem' }} />

                {/* Use current location */}
                <div style={{ padding: '0.5rem 1rem 0' }}>
                  <button className="loc-use-btn" onClick={() => { closeLocation(); detectLocation(); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.85rem 0.75rem', borderRadius: '14px', width: '100%', textAlign: 'left' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #ede9fe, #dbeafe)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MapPin size={20} color="#6d28d9" />
                    </div>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e1b4b', margin: 0 }}>Use current location</p>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>
                        {locating ? 'Detecting your location…' : 'Automatically detect via GPS'}
                      </p>
                    </div>
                  </button>
                </div>

                {/* Select on Map */}
                <div style={{ padding: '0 1rem 0.5rem' }}>
                  <button onClick={() => setShowMap(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.85rem 0.75rem', borderRadius: '14px', width: '100%', textAlign: 'left' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #dcfce7, #d1fae5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="2">
                        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                        <line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" />
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: '0.9rem', color: '#14532d', margin: 0 }}>Select on map</p>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>Pin your exact location on the map</p>
                    </div>
                  </button>
                </div>

                {/* Footer */}
                <div style={{ padding: '0.6rem 1.5rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 500 }}>powered by</span>
                  <span style={{ fontWeight: 800, fontSize: '12px' }}>
                    <span style={{ color: '#4285F4' }}>G</span><span style={{ color: '#EA4335' }}>o</span>
                    <span style={{ color: '#FBBC05' }}>o</span><span style={{ color: '#4285F4' }}>g</span>
                    <span style={{ color: '#34A853' }}>l</span><span style={{ color: '#EA4335' }}>e</span>
                  </span>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* MOBILE SIDEBAR MENU */}
      {isMenuOpen && (
        <>
          <div onClick={() => setIsMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, animation: 'backdropFadeIn 0.3s ease forwards' }} />
          <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '300px', background: '#fff', zIndex: 1200, display: 'flex', flexDirection: 'column', boxShadow: '8px 0 40px rgba(0,0,0,0.15)', animation: 'slideInLeft 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}>
            {/* Header */}
            <div style={{ padding: '1.25rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
              <Link to="/" onClick={() => setIsMenuOpen(false)} style={{ height: '40px', display: 'flex' }}>
                <div className="dhoond-logo-container" style={{ width: '130px', justifyContent: 'flex-start' }}>
                  <img src="/logo.png" alt="Dhoond" className="dhoond-logo" />
                </div>
              </Link>
              <button onClick={() => setIsMenuOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'rotateIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both' }}><X size={18} color="#475569" /></button>
            </div>

            {/* Profile */}
            <div onClick={() => {
              setIsMenuOpen(false);
              if (isAuthenticated) { navigate('/profile'); }
              else { setIsAuthOpen(true); }
            }} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.25rem', cursor: 'pointer', borderBottom: '1px solid #f8fafc' }}>
              <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #eff6ff 0%, #ede9fe 100%)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}><User size={22} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{isAuthenticated ? userName : 'Login / Register'}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, marginTop: '1px' }}>{isAuthenticated ? `+91 ${userMobile}` : 'Tap to get started'}</div>
              </div>
              <ChevronDown size={16} color="#94a3b8" style={{ transform: 'rotate(-90deg)' }} />
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
              {[
                { label: 'Home', to: '/', icon: <HomeIcon size={20} /> },
                { label: 'Painting', to: '/painting', icon: <Paintbrush size={20} />, badge: 'New', restricted: !isBengaluru },
                { label: 'My Bookings', to: '/profile', icon: <Package size={20} /> },
                { label: 'Contact', href: `tel:${PHONE_NUMBER}`, icon: <Phone size={20} /> },
              ].map(link => {
                const isActive = link.to && location.pathname === link.to;
                const content = (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.85rem',
                    padding: '0.85rem 1rem', borderRadius: '14px',
                    background: isActive ? '#eff6ff' : 'transparent',
                    transition: 'background 0.2s',
                    cursor: 'pointer',
                  }}>
                    <span style={{ color: isActive ? '#2563eb' : '#64748b', display: 'flex' }}>{link.icon}</span>
                    <span style={{ fontWeight: isActive ? 800 : 600, fontSize: '0.92rem', color: isActive ? '#1e40af' : '#334155', flex: 1 }}>{link.label}</span>
                    {link.badge && <span style={{ background: '#fef08a', color: '#854d0e', fontSize: '9px', fontWeight: 800, padding: '2px 7px', borderRadius: '8px' }}>{link.badge}</span>}
                  </div>
                );

                if (link.href) {
                  return <a key={link.label} href={link.href} style={{ textDecoration: 'none' }}>{content}</a>;
                }
                return (
                  <Link key={link.label} to={link.to || '#'} onClick={() => {
                    setIsMenuOpen(false);
                    if (link.restricted) { openComingSoon(); }
                  }} style={{ textDecoration: 'none' }}>{content}</Link>
                );
              })}

              {/* CTA Button */}
              <div style={{ padding: '0.5rem 0.5rem 0', marginTop: '0.5rem' }}>
                <button onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/');
                  setTimeout(() => document.querySelector('#services-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
                }} style={{
                  width: '100%', padding: '0.9rem',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                  color: '#fff', border: 'none', borderRadius: '14px',
                  fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 6px 20px rgba(37,99,235,0.3)',
                }}>
                  Book a Service <ArrowUpRight size={16} strokeWidth={3} />
                </button>
              </div>
            </nav>

            {/* Footer */}
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #f1f5f9' }}>
              <div onClick={() => { setIsMenuOpen(false); openLocation(); }} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', padding: '0.5rem 0' }}>
                <MapPin size={14} color="#2563eb" />
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{locationLabel}</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#cbd5e1', fontWeight: 500, marginTop: '0.25rem' }}>Dhoond v1.0 · Made in India 🇮🇳</div>
            </div>
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
              <div key={s.label} onClick={() => handleSearchSubmit(s)} style={{ padding: '1rem', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}><Search size={16} color="#2563eb" />{s.label}</div>
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

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
    // Track PageView on route change
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
    if (window.gtag) {
      window.gtag('config', 'G-H6MH24CL5L', {
        page_path: pathname,
      });
    }
  }, [pathname]);
  return null;
};

function App() {
  return (
    <UIProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/admin/*" element={<Admin />} />
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
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
