import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, User, ChevronDown, MapPin, Zap, LogOut, Package, LayoutDashboard, ChevronLeft } from 'lucide-react';
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

const SUGGESTIONS = ['Painting Service', 'AC Repair', 'RO Technician', 'Plumber', 'Electrician', 'Washing Machine Repair', 'Refrigerator Repair'];

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
    if (!localStorage.getItem('dhoond_location')) {
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
      updateLocation('Location not found', 'Please enter manually');
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
    ? SUGGESTIONS.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    : SUGGESTIONS;

  const handleSearchSubmit = (query) => {
    const q = (query || searchQuery).toLowerCase();
    setShowSuggestions(false);
    setIsSearchOpen(false);
    if (q.includes('paint')) {
      if (isBengaluru) {
        navigate('/painting');
      } else {
        openComingSoon();
      }
    } else {
      if (isNagpur) {
        navigate('/shop');
      } else {
        openComingSoon();
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
              {NAV_LINKS.map(link => {
                const isSoon = link.type === 'soon';
                const isActive = link.to && location.pathname === link.to;
                
                if (link.href) {
                  return (
                    <a key={link.label} href={link.href} className="nav-link">
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
              <LocationButton onClick={openLocation} />
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
              <button className="icon-btn" onClick={() => isAuthenticated ? setIsProfileOpen(!isProfileOpen) : setIsAuthOpen(true)}>
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

        {/* Auth Modal */}
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

        {/* MOBILE: Location Bar */}
        <div className="mobile-only" onClick={openLocation} style={{ padding: '0.65rem 1.25rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.65rem', background: '#fff', cursor: 'pointer' }}>
          <MapPin size={15} color="#2563eb" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{locationLabel}</span>
          <ChevronDown size={14} color="#64748b" />
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
          <div onClick={() => setIsMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1100, backdropFilter: 'blur(2px)' }} />
          <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px', background: '#fff', zIndex: 1200, display: 'flex', flexDirection: 'column', boxShadow: '8px 0 32px rgba(0,0,0,0.12)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to="/" onClick={() => setIsMenuOpen(false)}><img src="/logo.png" alt="Dhoond" style={{ height: '60px', width: 'auto' }} /></Link>
              <button className="icon-btn" onClick={() => setIsMenuOpen(false)}><X size={22} /></button>
            </div>
            <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', overflowY: 'auto' }}>
              <div onClick={() => {
                setIsMenuOpen(false);
                if (isAuthenticated) { navigate('/profile'); }
                else { setIsAuthOpen(true); }
              }} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', cursor: 'pointer' }}>
                <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}><User size={20} /></div>
                <div><div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111' }}>{isAuthenticated ? userName : 'Login / Register'}</div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>{isAuthenticated ? `+91 ${userMobile}` : 'View Profile'}</div></div>
              </div>
              {NAV_LINKS.map(link => {
                const isPaintingRestricted = link.label === 'Painting' && !isBengaluru;
                
                if (link.href) {
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      style={{ textDecoration: 'none', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, color: '#111' }}
                    >
                      {link.label}
                    </a>
                  );
                }

                return (
                  <Link
                    key={link.label}
                    to={link.to || '#'}
                    onClick={() => {
                      setIsMenuOpen(false);
                      const isPaintingRestricted = link.label === 'Painting' && !isBengaluru;
                      if (link.type === 'soon' || isPaintingRestricted) {
                        openComingSoon();
                      }
                    }}
                    style={{ textDecoration: 'none', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, color: '#111' }}
                  >
                    {link.label}
                  </Link>
                );
              })}
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
