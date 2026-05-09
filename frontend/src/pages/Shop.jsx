import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, ChevronRight, ChevronLeft, ArrowLeft, ArrowRight, ShieldCheck, Star, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PaintingBookingModal from '../components/PaintingBookingModal';
import { useUI } from '../context/UIContext';
import { isInsideGeofence } from '../utils/location';

// ─── Painting sub-category data (frontend-only, no DB needed) ─────────────────
const FEW_ROOMS_SERVICES = [
  { id: 'fw1', title: 'Few walls painting', image: '/services/Touch-Up Painter.webp', discountPrice: 999, originalPrice: 1499, discountTag: '33% OFF', description: 'Paint 1-3 individual walls in any room with premium emulsion paint.', category: 'painter', subcategory: 'few-rooms' },
  { id: 'fw2', title: 'Bedroom painting', image: '/services/Interior painter.webp', discountPrice: 1499, originalPrice: 2199, discountTag: '32% OFF', description: 'Full bedroom walls and ceiling painted with smooth finish emulsion.', category: 'painter', subcategory: 'few-rooms' },
  { id: 'fw3', title: 'Living & dining room painting', image: '/services/House Painter.webp', discountPrice: 2499, originalPrice: 3499, discountTag: '28% OFF', description: 'Complete living and dining space painted including ceiling.', category: 'painter', subcategory: 'few-rooms' },
  { id: 'fw4', title: 'Few rooms painting', image: '/services/Painter.webp', discountPrice: 3499, originalPrice: 4999, discountTag: '30% OFF', description: 'Painting of 2-3 rooms including all walls with quality emulsion.', category: 'painter', subcategory: 'few-rooms' },
  { id: 'fw5', title: 'Kitchen & bathroom painting', image: '/services/House Painter.webp', discountPrice: 1299, originalPrice: 1999, discountTag: '35% OFF', description: 'Expert kitchen and bathroom wall painting with moisture-resistant paint.', category: 'painter', subcategory: 'few-rooms' },
  { id: 'fw6', title: 'Doors, grills & cabinets', image: '/services/Wood Polisher.webp', discountPrice: 799, originalPrice: 1199, discountTag: '33% OFF', description: 'Sanding and repainting of doors, grills, and wooden cabinets.', category: 'painter', subcategory: 'few-rooms' },
];

const FULL_HOME_SERVICES = {
  '1bhk': { id: 'fh1', title: '1 BHK Full Home Painting', image: '/services/Interior painter.webp', discountPrice: 6999, originalPrice: 8999, discountTag: '22% OFF', description: 'Complete interior painting of a 1 BHK home — all rooms, ceiling, and walls.', category: 'painter', subcategory: 'full-home' },
  '2bhk': { id: 'fh2', title: '2 BHK Full Home Painting', image: '/services/House Painter.webp', discountPrice: 10999, originalPrice: 13999, discountTag: '21% OFF', description: 'Complete interior painting of a 2 BHK home — all rooms, ceiling, and walls.', category: 'painter', subcategory: 'full-home' },
  '3bhk': { id: 'fh3', title: '3 BHK Full Home Painting', image: '/services/House Painter.webp', discountPrice: 15999, originalPrice: 19999, discountTag: '20% OFF', description: 'Complete interior painting of a 3 BHK home — all rooms, ceiling, and walls.', category: 'painter', subcategory: 'full-home' },
};


// ─── Electrician Subcategories ────────────────────────────────────────────────
const ELECTRICIAN_SUBCATS = [
  { id: 'fan', label: 'Fan', emoji: <img src="/services/electrician_fan.webp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Fan" /> },
  { id: 'switch', label: 'Switch & socket', emoji: <img src="/services/switchboard_installation_6_points_.webp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Switch" /> },
  { id: 'wiring', label: 'Wiring', emoji: <img src="/services/external_wiring.webp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Wiring" /> },
  { id: 'doorbell', label: 'Doorbell', emoji: <img src="/services/doorbell.webp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Doorbell" /> },
  { id: 'other', label: 'Other', emoji: <img src="/services/submeter.webp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Other" /> },
  { id: 'painting', label: 'Painting', emoji: <img src="/icons/painter.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Painting" /> },
];

const getElectricianSubcategory = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('visit') || lower.includes('consultation')) return 'all'; // Global services
  if (lower.includes('fan')) return 'fan';
  if (lower.includes('switch') || lower.includes('socket') || lower.includes('holder')) return 'switch';
  if (lower.includes('wiring')) return 'wiring';
  if (lower.includes('door bell') || lower.includes('doorbell')) return 'doorbell';
  if (lower.includes('geyser') || lower.includes('submeter') || lower.includes('sub-meter')) return 'other';
  return 'none';
};

// ─── Technician Subcategories ─────────────────────────────────────────────────
const TECHNICIAN_SUBCATS = [
  { id: 'ac', label: 'AC', emoji: <img src="/services/ac_inspection.webp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="AC" /> },
  { id: 'ro', label: 'RO', emoji: <img src="/services/ro_inspection.webp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="RO" /> },
  { id: 'washing', label: 'Washing Machine', emoji: <img src="/services/washing_machine.webp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Washing Machine" /> },
  { id: 'fridge', label: 'Refrigerator', emoji: <img src="/services/refrigarator.webp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Refrigerator" /> },
  { id: 'microwave', label: 'Microwave', emoji: <img src="/services/microwave_oven.webp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Microwave" /> },
  { id: 'painting', label: 'Painting', emoji: <img src="/icons/painter.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Painting" /> },
];

const getTechnicianSubcategory = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('washing machine')) return 'washing';
  if (lower.includes('refrigerator') || lower.includes('fridge')) return 'fridge';
  if (lower.includes('microwave')) return 'microwave';
  if ((lower.includes('ro') && !lower.includes('microwave') && !lower.includes('frost') && !lower.includes('iron')) || lower.includes('water purif')) return 'ro';
  
  if ((lower.includes('ac') && !lower.includes('machine') && !lower.includes('replace')) || lower.includes('air condition')) return 'ac';
  
  return 'all';
};

// ─── Pill Component ────────────────────────────────────────────────────────────
const Pill = ({ label, emoji, active, onClick }) => (
  <div onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    padding: '0.4rem 1.25rem 0.4rem 0.4rem',
    background: active ? '#1c6bbb' : 'rgba(255,255,255,0.7)',
    borderRadius: '99px', cursor: 'pointer',
    border: active ? '1px solid #1c6bbb' : '1px solid #e2e8f4',
    transition: 'all 0.2s',
    boxShadow: active ? '0 4px 12px rgba(28,107,187,0.2)' : 'none'
  }}>
    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: active ? 'rgba(255,255,255,0.2)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', overflow: 'hidden' }}>
      {emoji}
    </div>
    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: active ? '#fff' : '#64748b' }}>{label}</span>
  </div>
);

// ─── Main Shop Component ───────────────────────────────────────────────────────
const Shop = () => {
  const [allServices, setAllServices] = useState([]);
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('cat') || 'all';
  const subcat   = searchParams.get('subcat') || 'all';
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  // Painting drill-down state
  const [paintingView, setPaintingView] = useState(null); // null | 'choose' | 'few-rooms' | 'full-home'
  const { addToCart, cartItems, updateQuantity, removeFromCart, totalAmount } = useCart();
  const { openComingSoon, locationLabel, locationSubtext, updateLocation, userLat, userLng } = useUI();
  const [selectedPaintService, setSelectedPaintService] = useState(null); 
  const navigate = useNavigate();

  const isBengaluru = (locationLabel || '').toLowerCase().includes('bengaluru') || 
                      (locationLabel || '').toLowerCase().includes('bangalore') ||
                      (locationSubtext || '').toLowerCase().includes('bengaluru') ||
                      (locationSubtext || '').toLowerCase().includes('bangalore');

  const isNagpur = isInsideGeofence(userLat, userLng, 21.1497877, 79.0806859, 8000) || 
                    (locationLabel || '').toLowerCase().includes('nagpur') ||
                    (locationSubtext || '').toLowerCase().includes('nagpur');

  useEffect(() => {
    // Only run geofence guard once location is fully determined
    const locationReady = locationLabel && 
                          locationLabel !== 'Fetching location…' && 
                          locationLabel !== 'Detecting…';
    if (!locationReady) return;

    if (category === 'painter' && !isBengaluru) {
      openComingSoon();
      const params = new URLSearchParams(searchParams);
      params.delete('cat');
      setSearchParams(params);
      setPaintingView(null);
    } else if (category && category !== 'all' && category !== 'painter' && !isNagpur && !isBengaluru) {
      openComingSoon();
      const params = new URLSearchParams(searchParams);
      params.delete('cat');
      params.delete('subcat');
      setSearchParams(params);
    }
  }, [category, isBengaluru, isNagpur, openComingSoon, searchParams, setSearchParams, locationLabel]);

  useEffect(() => {
    if (window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_category: category,
        content_name: getCategoryName(),
        content_type: 'product_group'
      });
    }
  }, [category, subcat]);

  useEffect(() => {
    // Don't fetch from API when in a painting sub-view
    if (category === 'painter') return;
    // In dev, VITE_API_URL is empty → Vite proxy forwards /api → localhost:5001
    // In production, VITE_API_URL is set to the real backend URL
    const apiUrl = import.meta.env.VITE_API_URL || '';
    fetch(`${apiUrl}/api/V1/services?category=${category}&search=${search}`)
      .then(res => res.json())
      .then(data => {
        // Extract services array from response
        const servicesArray = Array.isArray(data) ? data : (data.services || []);
        
        // Normalize DB snake_case → camelCase
        const normalized = servicesArray.map(s => ({
          ...s,
          discountPrice: s.discountPrice ?? s.discount_price ?? 0,
          originalPrice: s.originalPrice ?? s.original_price ?? 0,
          discountTag:   s.discountTag   ?? s.discount_tag   ?? '',
        }));
        setAllServices(normalized);
      })
      .catch(err => console.error(err));
  }, [search, category]);

  const services = allServices.filter(s => {
    // Hide raw painter services from the DB since painting has its own hardcoded drill-down views
    if (s.category === 'painter') return false;

    if (category === 'electrician' && subcat !== 'all') {
      const sSub = getElectricianSubcategory(s.title);
      // Show if it matches exactly OR if it's a global service (all)
      if (sSub !== subcat && sSub !== 'all') return false;
    }
    if (category === 'technician' && subcat !== 'all') {
      if (getTechnicianSubcategory(s.title) !== subcat) return false;
    }
    return true;
  });

  // Human-readable category/subcat label for the sidebar header
  const getCategoryName = () => {
    if (category === 'electrician') {
      const sc = ELECTRICIAN_SUBCATS.find(s => s.id === subcat);
      return sc ? sc.label : 'Electrician';
    }
    if (category === 'technician') {
      const names = { ac: 'AC Technician', ro: 'RO Technician', washing: 'Washing Machine', fridge: 'Refrigerator', microwave: 'Microwave Oven', chimney: 'Chimney' };
      return names[subcat] || 'Technician Services';
    }
    if (category === 'painter') return 'Painting Services';
    if (category === 'plumber') return 'Plumber';
    return 'All Services';
  };

  // Subcategory click — updates URL
  const handleSubcatClick = (id, label) => {
    // Check if subcategory is available
    const isComingSoon = (label === 'Refrigerator' || label === 'Microwave') || (label === 'Painting' && !isBengaluru);
    
    if (isComingSoon) {
      openComingSoon();
      return;
    }

    if (label === 'Painting') {
      navigate('/painting');
      return;
    }

    setPage(1);
    const params = new URLSearchParams(searchParams);
    params.set('subcat', id);
    setSearchParams(params);
  };

  // Should we show the subcategory grid in sidebar?
  const showSubcatGrid = (category === 'electrician' || category === 'technician');

  const handlePainterClick = () => {
    if (isBengaluru) {
      setSearchParams({ cat: 'painter' });
      setPaintingView('choose');
    } else {
      openComingSoon();
    }
  };


  const handlePaintingServiceClick = (service) => {
    setSelectedPaintService(service); // open the multi-step modal
  };

  // ─── Painting Sub-view: Choose subcategory ──────────────────────────────────
  const renderPaintingChoose = () => (
    <div style={{ padding: '0' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#111', marginBottom: '1.5rem' }}>🎨 Select Painting Type</h2>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Few rooms & walls */}
        <div onClick={() => setPaintingView('few-rooms')} style={{ flex: '1 1 280px', cursor: 'pointer', border: '1px solid #eaeaea', borderRadius: '12px', padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: '#fffbeb', transition: 'box-shadow 0.2s' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
          <div style={{ fontSize: '3rem' }}>🖌️</div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111', margin: '0 0 0.4rem 0' }}>Few Rooms & Walls</h3>
            <p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>Walls, bedroom, kitchen, doors and more</p>
          </div>
          <ChevronRight size={20} color="#aaa" style={{ marginLeft: 'auto', flexShrink: 0 }} />
        </div>

        {/* Full Home */}
        <div onClick={() => setPaintingView('full-home')} style={{ flex: '1 1 280px', cursor: 'pointer', border: '1px solid #eaeaea', borderRadius: '12px', padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: '#eff6ff', transition: 'box-shadow 0.2s' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
          <div style={{ fontSize: '3rem' }}>🏠</div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111', margin: '0 0 0.4rem 0' }}>Full Home Painting</h3>
            <p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>Complete 1 BHK, 2 BHK or 3 BHK painting</p>
          </div>
          <ChevronRight size={20} color="#aaa" style={{ marginLeft: 'auto', flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );

  // ─── Painting Sub-view: Few rooms grid ─────────────────────────────────────
  const renderFewRooms = () => (
    <div>
      <button onClick={() => setPaintingView('choose')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2a70b2', fontWeight: 500, fontSize: '0.9rem', marginBottom: '1.5rem', padding: 0 }}>
        <ArrowLeft size={16} /> Back
      </button>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#111', marginBottom: '1.5rem' }}>🖌️ Few Rooms & Walls Painting</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1.25rem' }}>
        {FEW_ROOMS_SERVICES.map(service => (
          <div key={service.id} onClick={() => handlePaintingServiceClick(service)} style={{ border: '1px solid #eaeaea', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', background: '#fff', transition: 'box-shadow 0.2s' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
            <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden', background: '#f5f5f5' }}>
              <img src={service.image} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '0.75rem' }}>
              <p style={{ fontWeight: 500, fontSize: '0.85rem', color: '#166fb5', margin: '0 0 0.4rem 0', lineHeight: 1.3 }}>{service.title}</p>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#222', fontSize: '0.9rem' }}>₹{service.discountPrice}</span>
                <span style={{ color: '#999', textDecoration: 'line-through', fontSize: '0.75rem' }}>₹{service.originalPrice}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── Painting Sub-view: Full Home — pick BHK ───────────────────────────────
  const renderFullHome = () => (
    <div>
      <button onClick={() => setPaintingView('choose')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2a70b2', fontWeight: 500, fontSize: '0.9rem', marginBottom: '1.5rem', padding: 0 }}>
        <ArrowLeft size={16} /> Back
      </button>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#111', marginBottom: '1.5rem' }}>🏠 Full Home Painting — Choose your home size</h2>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {['1bhk', '2bhk', '3bhk'].map(bhk => {
          const svc = FULL_HOME_SERVICES[bhk];
          return (
            <div key={bhk} onClick={() => handlePaintingServiceClick(svc)} style={{ flex: '1 1 200px', cursor: 'pointer', border: '2px solid #eaeaea', borderRadius: '12px', padding: '2rem', textAlign: 'center', background: '#fff', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#2a70b2'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(42,112,178,0.12)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#eaeaea'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{bhk === '1bhk' ? '🏠' : bhk === '2bhk' ? '🏡' : '🏘️'}</div>
              <h3 style={{ fontWeight: 700, fontSize: '1.2rem', color: '#111', margin: '0 0 0.5rem 0' }}>{bhk.toUpperCase()}</h3>
              <p style={{ color: '#555', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>{svc.title}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#2a70b2' }}>₹{svc.discountPrice.toLocaleString()}</span>
                <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.85rem' }}>₹{svc.originalPrice.toLocaleString()}</span>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#22c55e', fontWeight: 600 }}>{svc.discountTag}</div>
              <button style={{ marginTop: '1rem', background: '#2a70b2', color: '#fff', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '99px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>Book Now</button>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── Render service list (row/list style) ─────────────────────────────────
  const renderGrid = () => (
    <div style={{ marginTop: '0.5rem' }}>
      {/* Search bar */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '480px', marginBottom: '1.25rem' }}>
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '0.75rem 1.25rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', outline: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        />
        <Search size={16} color="#94a3b8" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
      </div>

      {(() => {
        const totalPages = Math.max(1, Math.ceil(services.length / ITEMS_PER_PAGE));
        const currentPage = Math.min(page, totalPages);
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const pageServices = services.slice(start, start + ITEMS_PER_PAGE);

        if (services.length === 0) {
          return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>No services found</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '300px', margin: '0 auto' }}>
                {category === 'all' ? 'Select a category to browse services.' : `We're bringing ${getCategoryName()} services to your area soon!`}
              </p>
            </div>
          );
        }

        return (
          <>
            {/* Service list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {pageServices.map(service => (
                <div
                  key={service.id}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', background: '#fff', border: '1px solid #f0f0f0', borderRadius: '14px', padding: '1rem', cursor: 'default', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  {/* Image */}
                  <div style={{ width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#f8fafc' }}>
                    <img src={service.image} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111', margin: '0 0 0.25rem', lineHeight: 1.3 }}>{service.title}</p>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.5rem', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{service.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, color: '#111', fontSize: '1rem' }}>₹{service.discountPrice}</span>
                      <span style={{ color: '#aaa', textDecoration: 'line-through', fontSize: '0.78rem' }}>₹{service.originalPrice}</span>
                      {service.discountTag && (
                        <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '6px' }}>{service.discountTag}</span>
                      )}
                    </div>
                  </div>

                  {/* Add button / Quantity controls */}
                  <div style={{ flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                    {(() => {
                      const cartItem = cartItems.find(item => item.id === service.id);
                      if (cartItem) {
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #22c55e', borderRadius: '10px', padding: '0.1rem', background: '#f0fdf4' }}>
                              <button 
                                onClick={() => {
                                  if (cartItem.quantity === 1) {
                                    removeFromCart(service.id);
                                  } else {
                                    updateQuantity(service.id, -1);
                                  }
                                }} 
                                style={{ background: 'none', border: 'none', padding: '0.3rem 0.75rem', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 800, lineHeight: 1, color: '#ef4444' }}>−</button>
                              <span style={{ width: '20px', textAlign: 'center', fontSize: '1rem', fontWeight: 800, color: '#111' }}>{cartItem.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(service.id, 1)} 
                                disabled={service.title?.toLowerCase().includes('consultation')}
                                style={{ background: 'none', border: 'none', padding: '0.3rem 0.75rem', cursor: service.title?.toLowerCase().includes('consultation') ? 'not-allowed' : 'pointer', fontSize: '1.1rem', fontWeight: 800, lineHeight: 1, color: service.title?.toLowerCase().includes('consultation') ? '#cbd5e1' : '#22c55e' }}>+</button>
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#16a34a' }}>In Cart</span>
                          </div>
                        );
                      }
                      return (
                        <button
                          onClick={() => addToCart(service)}
                          style={{ padding: '0.5rem 1.1rem', background: '#fff', color: '#1c6bbb', border: '1.5px solid #1c6bbb', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#1c6bbb'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#1c6bbb'; }}
                        >
                          <Plus size={13} strokeWidth={3} /> Add
                        </button>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === 1 ? 'default' : 'pointer', opacity: currentPage === 1 ? 0.3 : 1 }}>
                  <ChevronLeft size={16} color="#1c6bbb" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    style={{ width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', border: 'none', background: p === currentPage ? '#1c6bbb' : '#f4f8ff', color: p === currentPage ? '#fff' : '#64748b' }}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === totalPages ? 'default' : 'pointer', opacity: currentPage === totalPages ? 0.3 : 1 }}>
                  <ChevronRight size={16} color="#1c6bbb" />
                </button>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );


  return (
    <div className="mobile-stack mobile-p-0 shop-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 5%', display: 'flex', gap: '3rem' }}>

      {/* Sidebar */}
      <div style={{ flexShrink: 0 }} className="mobile-p-0 responsive-sidebar">
        <style>{`
          @media (min-width: 769px) { .responsive-sidebar { width: 250px; } }
          @media (max-width: 768px) { 
            .responsive-sidebar { width: 100%; margin-bottom: 1rem; }
            .subcat-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 0.5rem !important; }
            .shop-container { gap: 0.5rem !important; padding: 1rem 5% !important; }
          }
          @media (max-width: 480px) {
            .subcat-grid { grid-template-columns: repeat(3, 1fr) !important; }
          }
        `}</style>

        {/* Category name header */}
        {category !== 'all' && category !== 'painter' && (
          <div style={{ padding: '0.85rem 1.25rem', background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', marginBottom: '0.75rem' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#111', margin: 0 }}>{getCategoryName()}</h2>
          </div>
        )}

        {/* Subcategory grid — only when no specific subcat selected */}
        {showSubcatGrid && (
          <div style={{ padding: '1rem', background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', marginBottom: '0.5rem' }}>
            <h4 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111', marginBottom: '1rem', letterSpacing: '-0.01em' }}>What are you looking for?</h4>
            <div className="subcat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
              {(category === 'electrician' ? ELECTRICIAN_SUBCATS : TECHNICIAN_SUBCATS)
                .sort((a, b) => {
                  const aSoon = (a.label === 'Refrigerator' || a.label === 'Microwave') || (a.label === 'Painting' && !isBengaluru);
                  const bSoon = (b.label === 'Refrigerator' || b.label === 'Microwave') || (b.label === 'Painting' && !isBengaluru);
                  if (aSoon && !bSoon) return 1;
                  if (!aSoon && bSoon) return -1;
                  return 0;
                })
                .map(sc => {
                  const isComingSoon = (sc.label === 'Refrigerator' || sc.label === 'Microwave') || (sc.label === 'Painting' && !isBengaluru);
                  return (
                    <div key={sc.id} onClick={() => handleSubcatClick(sc.id, sc.label)} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', cursor: 'pointer',
                      padding: '0.8rem 0.2rem', borderRadius: '16px',
                      background: subcat === sc.id ? '#f0f7ff' : '#fff',
                      border: subcat === sc.id ? '2px solid #2563eb' : '1px solid #f1f5f9',
                      boxShadow: subcat === sc.id ? '0 4px 15px rgba(37,99,235,0.12)' : 'none',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      opacity: isComingSoon ? 0.75 : 1,
                    }}>
                      {isComingSoon && (
                        <div style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)', border: '1px solid #e2e8f0', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                          🔒
                        </div>
                      )}
                      {subcat === sc.id && !isComingSoon && (
                        <div style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#2563eb', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', border: '2px solid #fff', boxShadow: '0 4px 8px rgba(37,99,235,0.25)', fontWeight: 800 }}>
                          ✓
                        </div>
                      )}
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                        {sc.emoji}
                      </div>
                      <span style={{ fontSize: '0.58rem', textAlign: 'center', lineHeight: 1.1, color: isComingSoon ? '#94a3b8' : (subcat === sc.id ? '#1e40af' : '#475569'), fontWeight: subcat === sc.id ? 800 : 700, maxWidth: '100%', wordBreak: 'break-word', letterSpacing: '-0.02em', height: '2.2em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{sc.label}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Painting drill-down or normal grid */}
        {category === 'painter' && paintingView === 'choose' && renderPaintingChoose()}
        {category === 'painter' && paintingView === 'few-rooms' && renderFewRooms()}
        {category === 'painter' && paintingView === 'full-home' && renderFullHome()}
        {category !== 'painter' && renderGrid()}
      </div>

      {/* Painting Multi-step Modal */}
      {selectedPaintService && (
        <PaintingBookingModal
          service={selectedPaintService}
          onClose={() => setSelectedPaintService(null)}
        />
      )}

      {/* Sticky Cart Footer */}
      {cartItems.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #e2e8f0', padding: '1rem 5%', display: 'flex', justifyContent: 'center', zIndex: 1000, boxShadow: '0 -4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '100%', maxWidth: '1400px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                {cartItems.length} service{cartItems.length !== 1 ? 's' : ''} added
              </p>
              <p style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 900 }}>
                ₹{totalAmount}
              </p>
            </div>
            <button 
              onClick={() => navigate('/shop/cart')} 
              style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(37,99,235,0.25)', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              View Cart <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
