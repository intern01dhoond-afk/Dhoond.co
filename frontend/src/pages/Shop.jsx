import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, ChevronRight, ChevronLeft, ArrowLeft, ShieldCheck, Star, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PaintingBookingModal from '../components/PaintingBookingModal';

// ─── Painting sub-category data (frontend-only, no DB needed) ─────────────────
const FEW_ROOMS_SERVICES = [
  { id: 'fw1', title: 'Few walls painting', image: '/services/Touch-Up Painter.png', discountPrice: 999, originalPrice: 1499, discountTag: '33% OFF', description: 'Paint 1-3 individual walls in any room with premium emulsion paint.', category: 'painter', subcategory: 'few-rooms' },
  { id: 'fw2', title: 'Bedroom painting', image: '/services/Interior painter.png', discountPrice: 1499, originalPrice: 2199, discountTag: '32% OFF', description: 'Full bedroom walls and ceiling painted with smooth finish emulsion.', category: 'painter', subcategory: 'few-rooms' },
  { id: 'fw3', title: 'Living & dining room painting', image: '/services/House Painter.png', discountPrice: 2499, originalPrice: 3499, discountTag: '28% OFF', description: 'Complete living and dining space painted including ceiling.', category: 'painter', subcategory: 'few-rooms' },
  { id: 'fw4', title: 'Few rooms painting', image: '/services/Painter.png', discountPrice: 3499, originalPrice: 4999, discountTag: '30% OFF', description: 'Painting of 2-3 rooms including all walls with quality emulsion.', category: 'painter', subcategory: 'few-rooms' },
  { id: 'fw5', title: 'Kitchen & bathroom painting', image: '/services/House Painter.png', discountPrice: 1299, originalPrice: 1999, discountTag: '35% OFF', description: 'Expert kitchen and bathroom wall painting with moisture-resistant paint.', category: 'painter', subcategory: 'few-rooms' },
  { id: 'fw6', title: 'Doors, grills & cabinets', image: '/services/Wood Polisher.png', discountPrice: 799, originalPrice: 1199, discountTag: '33% OFF', description: 'Sanding and repainting of doors, grills, and wooden cabinets.', category: 'painter', subcategory: 'few-rooms' },
];

const FULL_HOME_SERVICES = {
  '1bhk': { id: 'fh1', title: '1 BHK Full Home Painting', image: '/services/Interior painter.png', discountPrice: 6999, originalPrice: 8999, discountTag: '22% OFF', description: 'Complete interior painting of a 1 BHK home — all rooms, ceiling, and walls.', category: 'painter', subcategory: 'full-home' },
  '2bhk': { id: 'fh2', title: '2 BHK Full Home Painting', image: '/services/House Painter.png', discountPrice: 10999, originalPrice: 13999, discountTag: '21% OFF', description: 'Complete interior painting of a 2 BHK home — all rooms, ceiling, and walls.', category: 'painter', subcategory: 'full-home' },
  '3bhk': { id: 'fh3', title: '3 BHK Full Home Painting', image: '/services/House Painter.png', discountPrice: 15999, originalPrice: 19999, discountTag: '20% OFF', description: 'Complete interior painting of a 3 BHK home — all rooms, ceiling, and walls.', category: 'painter', subcategory: 'full-home' },
};


// ─── Electrician Subcategories ────────────────────────────────────────────────
const ELECTRICIAN_SUBCATS = [
  { id: 'switch', label: 'Switch & socket', emoji: <img src="/services/sw.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} alt="Switch" /> },
  { id: 'fan', label: 'Fan', emoji: <img src="/services/fan.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} alt="Fan" /> },
  { id: 'wiring', label: 'Wiring', emoji: <img src="/services/wiring.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} alt="Wiring" /> },
  { id: 'doorbell', label: 'Doorbell', emoji: <img src="/services/bell.webp" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} alt="Doorbell" /> },
  { id: 'geyser', label: 'Geyser', emoji: <img src="/services/geyser.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} alt="Geyser" /> },
  { id: 'submeter', label: 'MCB & submeter', emoji: <img src="/services/mcb_submeter.png" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} alt="MCB & Submeter" /> },
];

const getElectricianSubcategory = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('switch') || lower.includes('socket')) return 'switch';
  if (lower.includes('fan')) return 'fan';
  if (lower.includes('light')) return 'light';
  if (lower.includes('wiring')) return 'wiring';
  if (lower.includes('door bell') || lower.includes('doorbell')) return 'doorbell';
  if (lower.includes('mcb') || lower.includes('fuse') || lower.includes('inverter')) return 'mcb';
  if (lower.includes('geyser')) return 'geyser';
  if (lower.includes('submeter') || lower.includes('sub-meter')) return 'submeter';
  return 'all';
};

// ─── Technician Subcategories ─────────────────────────────────────────────────
const TECHNICIAN_SUBCATS = [
  { id: 'ac', label: 'AC', emoji: <img src="/services/ac_icon.png" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} alt="AC" /> },
  { id: 'ro', label: 'RO', emoji: <img src="/services/ro_icon.png" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} alt="RO" /> },
  { id: 'washing', label: 'Washing Machine', emoji: <img src="/services/wm_icon.png" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} alt="Washing Machine" /> },
  { id: 'fridge', label: 'Refrigerator', emoji: '🧊' },
  { id: 'microwave', label: 'Microwave Oven', emoji: '📡' },
];

const getTechnicianSubcategory = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('ac') || lower.includes('air condition')) return 'ac';
  if (lower.includes('ro') || lower.includes('water purif')) return 'ro';
  if (lower.includes('washing machine')) return 'washing';
  if (lower.includes('refrigerator') || lower.includes('fridge')) return 'fridge';
  if (lower.includes('microwave')) return 'microwave';
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
const PRICE_MIN = 0;

const Shop = () => {
  const [allServices, setAllServices] = useState([]);
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('cat') || 'all';
  const [priceRange, setPriceRange] = useState([PRICE_MIN, PRICE_MIN]); // will be set after fetch
  const [priceMax, setPriceMax] = useState(PRICE_MIN);
  const [elecSubcat, setElecSubcat] = useState('all');
  const [techSubcat, setTechSubcat] = useState('all');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  // Painting drill-down state
  const [paintingView, setPaintingView] = useState(null); // null | 'choose' | 'few-rooms' | 'full-home'
  const [selectedPaintService, setSelectedPaintService] = useState(null); // open modal when set
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't fetch from API when in a painting sub-view
    if (category === 'painter') return;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    fetch(`${apiUrl}/api/V1/services?category=${category}&search=${search}`)
      .then(res => res.json())
      .then(data => {
        setAllServices(data);
        if (data.length > 0) {
          const maxPrice = Math.max(...data.map(s => s.discountPrice));
          setPriceMax(maxPrice);
          setPriceRange([PRICE_MIN, maxPrice]);
        }
      })
      .catch(err => console.error(err));
  }, [search, category]);

  const services = allServices.filter(s => {
    if (s.discountPrice < priceRange[0] || s.discountPrice > priceRange[1]) return false;

    if (category === 'electrician' && elecSubcat !== 'all') {
      if (getElectricianSubcategory(s.title) !== elecSubcat) return false;
    }
    if (category === 'technician' && techSubcat !== 'all') {
      if (getTechnicianSubcategory(s.title) !== techSubcat) return false;
    }

    return true;
  });

  const handleCategoryClick = (cat) => {
    setPaintingView(null);
    setElecSubcat('all');
    setTechSubcat('all');
    setPage(1);
    if (cat === 'all') {
      const params = new URLSearchParams(searchParams);
      params.delete('cat');
      setSearchParams(params);
    } else {
      setSearchParams({ cat });
    }
  };

  const handlePainterClick = () => {
    setSearchParams({ cat: 'painter' });
    setPaintingView('choose');
  };

  const handleNavigate = (service) => {
    navigate('/service/' + service.id);
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

  // ─── Render main products grid ──────────────────────────────────────────────
  const renderGrid = () => (
    <>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search and book services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.85rem 1.25rem', background: '#fff', border: '1px solid var(--border)', borderRadius: '16px', fontSize: '0.9rem', outline: 'none', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s' }}
            onFocus={e => { e.target.style.borderColor = '#1c6bbb'; e.target.style.boxShadow = '0 0 0 4px rgba(28, 107, 187, 0.1)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'var(--shadow-sm)'; }}
          />
          <Search size={18} color="#1c6bbb" style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
        <div style={{ fontSize: '0.85rem', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          Sort By: <strong style={{ color: '#111' }}>Featured</strong> <ChevronDown size={14} />
        </div>
      </div>

      {/* Product Grid — paginated (2 rows × 4 cols = 8 per page) */}
      {(() => {
        const totalPages = Math.max(1, Math.ceil(services.length / ITEMS_PER_PAGE));
        const currentPage = Math.min(page, totalPages);
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const pageServices = services.slice(start, start + ITEMS_PER_PAGE);

        return (
          <>
            <div className="shop-grid" style={{ marginBottom: '3.5rem' }}>
              {pageServices.map(service => (
                <div key={service.id} onClick={() => handleNavigate(service)} className="card-hover" style={{ 
                  background: '#fff', 
                  border: '1px solid #f0f0f0', 
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  cursor: 'pointer', 
                  position: 'relative', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Image Section */}
                  <div style={{ width: '100%', height: '180px', overflow: 'hidden', background: '#f8fafc' }}>
                    <img src={service.image} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  {/* Content Section */}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#111', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      <Star size={10} fill="#f59e0b" color="#f59e0b" /> 4.9 <span style={{ color: '#71717a', fontWeight: 500 }}>(120+)</span>
                    </div>
                    
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111', marginBottom: 'auto', lineHeight: '1.4', height: '2.8em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {service.title}
                    </h3>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.25rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 800, color: '#111', fontSize: '1.1rem' }}>₹{service.discountPrice.toFixed(0)}</span>
                        <span style={{ color: '#a1a1aa', textDecoration: 'line-through', fontSize: '0.75rem' }}>₹{service.originalPrice.toFixed(0)}</span>
                      </div>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); addToCart(service); }}
                        style={{ 
                          padding: '0.5rem 1rem', 
                          background: '#fff', 
                          color: '#1c6bbb', 
                          border: '1px solid #1c6bbb', 
                          borderRadius: '8px', 
                          fontSize: '0.85rem', 
                          fontWeight: 700, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f0f7ff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                      >
                        Add <Plus size={14} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', padding: '1rem', borderTop: '1px solid var(--border)' }}>
                <button onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={currentPage === 1}
                  style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === 1 ? 'default' : 'pointer', opacity: currentPage === 1 ? 0.3 : 1, boxShadow: 'var(--shadow-sm)' }}>
                  <ChevronLeft size={18} color="#1c6bbb" />
                </button>

                <div style={{ display: 'flex', gap: '0.5rem', background: '#f4f8ff', padding: '0.3rem', borderRadius: '14px' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      style={{ width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer', border: 'none', background: p === currentPage ? '#1c6bbb' : 'transparent', color: p === currentPage ? '#fff' : '#64748b', transition: 'all 0.2s' }}>
                      {p}
                    </button>
                  ))}
                </div>

                <button onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={currentPage === totalPages}
                  style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === totalPages ? 'default' : 'pointer', opacity: currentPage === totalPages ? 0.3 : 1, boxShadow: 'var(--shadow-sm)' }}>
                  <ChevronRight size={18} color="#1c6bbb" />
                </button>
              </div>
            )}
          </>
        );
      })()}
    </>
  );

  return (
    <div className="mobile-stack mobile-p-0 shop-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 5%', display: 'flex', gap: '3rem' }}>

      {/* Sidebar */}
      <div style={{ flexShrink: 0 }} className="mobile-p-0 responsive-sidebar">
        <style>{`
          @media (min-width: 769px) { .responsive-sidebar { width: 250px; } }
          @media (max-width: 768px) { 
            .responsive-sidebar { width: 100%; margin-bottom: 2rem; }
            .subcat-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 0.5rem !important; }
            .shop-container { gap: 1.5rem !important; padding: 1.5rem 5% !important; }
          }
          @media (max-width: 480px) {
            .subcat-grid { grid-template-columns: repeat(3, 1fr) !important; }
          }
        `}</style>

        {/* Electrician Subcategories Card */}
        {category === 'electrician' && (
          <div style={{ padding: '1.5rem', background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', marginBottom: '2rem' }}>
            <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111', marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>What are you looking for?</h4>
            <div className="subcat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
               {ELECTRICIAN_SUBCATS.map(sc => (
                 <div key={sc.id} onClick={() => { setElecSubcat(sc.id); setPage(1); }} style={{
                   display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', cursor: 'pointer',
                   padding: '0.75rem 0.25rem', borderRadius: '12px',
                   background: elecSubcat === sc.id ? '#fff' : '#f5f5f5',
                   border: elecSubcat === sc.id ? '1px solid #1c6bbb' : '1px solid transparent',
                   boxShadow: elecSubcat === sc.id ? '0 4px 12px rgba(28,107,187,0.15)' : 'none',
                   transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                 }}>
                   <div style={{ 
                     width: '48px', height: '48px', 
                     borderRadius: '12px', 
                     overflow: 'hidden',
                     display: 'flex', alignItems: 'center', justifyContent: 'center', 
                     fontSize: '1.5rem',
                     background: 'transparent'
                   }}>
                     {sc.emoji}
                   </div>
                   <span style={{ 
                     fontSize: '0.7rem', 
                     textAlign: 'center', 
                     lineHeight: 1.2, 
                     color: elecSubcat === sc.id ? '#1c6bbb' : '#444', 
                     fontWeight: 700, 
                     maxWidth: '90%' 
                   }}>{sc.label}</span>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* Technician Subcategories Card */}
        {category === 'technician' && (
          <div style={{ padding: '1.5rem', background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', marginBottom: '2rem' }}>
            <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111', marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>What are you looking for?</h4>
            <div className="subcat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
               {TECHNICIAN_SUBCATS.map(sc => (
                 <div key={sc.id} onClick={() => { setTechSubcat(sc.id); setPage(1); }} style={{
                   display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', cursor: 'pointer',
                   padding: '0.75rem 0.25rem', borderRadius: '12px',
                   background: techSubcat === sc.id ? '#fff' : '#f5f5f5',
                   border: techSubcat === sc.id ? '1px solid #1c6bbb' : '1px solid transparent',
                   boxShadow: techSubcat === sc.id ? '0 4px 12px rgba(28,107,187,0.15)' : 'none',
                   transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                 }}>
                   <div style={{ 
                     width: '48px', height: '48px', 
                     borderRadius: '12px', 
                     overflow: 'hidden',
                     display: 'flex', alignItems: 'center', justifyContent: 'center', 
                     fontSize: '1.5rem',
                     background: 'transparent'
                   }}>
                     {sc.emoji}
                   </div>
                   <span style={{ 
                     fontSize: '0.7rem', 
                     textAlign: 'center', 
                     lineHeight: 1.2, 
                     color: techSubcat === sc.id ? '#1c6bbb' : '#444', 
                     fontWeight: 700, 
                     maxWidth: '90%' 
                   }}>{sc.label}</span>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* Price Range Filter Card */}
        <div style={{ padding: '1.5rem', background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111', letterSpacing: '-0.01em' }}>Price Range</h4>
            <ChevronDown size={16} color="#666" />
          </div>

          {/* Min / Max labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#555', marginBottom: '1.25rem', fontWeight: 600 }}>
            <span>₹ {priceRange[0].toLocaleString()}</span>
            <span>₹ {priceRange[1].toLocaleString()}</span>
          </div>

          {/* Dual-range slider track */}
          <div style={{ position: 'relative', height: '20px', marginTop: '0.5rem' }}>
            {/* Base track */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '4px',
              background: '#e2e8f0',
              transform: 'translateY(-50%)',
              borderRadius: '2px',
            }} />
            {/* Filled track */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: `${priceMax > 0 ? ((priceRange[0] - PRICE_MIN) / (priceMax - PRICE_MIN)) * 100 : 0}%`,
              right: `${priceMax > 0 ? 100 - ((priceRange[1] - PRICE_MIN) / (priceMax - PRICE_MIN)) * 100 : 0}%`,
              height: '4px',
              background: '#1c6bbb',
              transform: 'translateY(-50%)',
              borderRadius: '2px',
              pointerEvents: 'none',
            }} />

            {/* Min thumb — transparent range input */}
            <input
              type="range"
              min={PRICE_MIN}
              max={priceMax || 1}
              step={50}
              value={priceRange[0]}
              onChange={e => {
                const val = Math.min(Number(e.target.value), priceRange[1] - 50);
                setPriceRange([val, priceRange[1]]);
              }}
              style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 2, margin: 0, padding: 0 }}
            />
            {/* Max thumb — transparent range input */}
            <input
              type="range"
              min={PRICE_MIN}
              max={priceMax || 1}
              step={50}
              value={priceRange[1]}
              onChange={e => {
                const val = Math.max(Number(e.target.value), priceRange[0] + 50);
                setPriceRange([priceRange[0], val]);
              }}
              style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 3, margin: 0, padding: 0 }}
            />

            {/* Visual min thumb */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: `calc(${priceMax > 0 ? ((priceRange[0] - PRICE_MIN) / (priceMax - PRICE_MIN)) * 100 : 0}% - 7px)`,
              transform: 'translateY(-50%)',
              width: '14px', height: '14px', borderRadius: '50%',
              background: '#fff', border: '2.5px solid #1c6bbb',
              boxShadow: '0 1px 4px rgba(28,107,187,0.3)',
              pointerEvents: 'none', zIndex: 4,
            }} />
            {/* Visual max thumb */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: `calc(${priceMax > 0 ? ((priceRange[1] - PRICE_MIN) / (priceMax - PRICE_MIN)) * 100 : 0}% - 7px)`,
              transform: 'translateY(-50%)',
              width: '14px', height: '14px', borderRadius: '50%',
              background: '#fff', border: '2.5px solid #1c6bbb',
              boxShadow: '0 1px 4px rgba(28,107,187,0.3)',
              pointerEvents: 'none', zIndex: 4,
            }} />
          </div>

          {/* Reset link */}
          {(priceRange[0] !== PRICE_MIN || priceRange[1] !== priceMax) && (
            <button
              onClick={() => setPriceRange([PRICE_MIN, priceMax])}
              style={{ marginTop: '1.25rem', background: 'none', border: 'none', color: '#1c6bbb', fontSize: '0.75rem', cursor: 'pointer', padding: 0, fontWeight: 700 }}
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, marginBottom: '1.5rem', color: '#111' }}>
          {paintingView === 'few-rooms' ? '🖌️ Few Rooms & Walls Painting' : paintingView === 'full-home' ? '🏠 Full Home Painting' :
            (category === 'electrician' && elecSubcat !== 'all') ? ELECTRICIAN_SUBCATS.find(sc => sc.id === elecSubcat)?.label :
              (category === 'technician' && techSubcat !== 'all') ? TECHNICIAN_SUBCATS.find(sc => sc.id === techSubcat)?.label :
                'All products'
          }
        </h1>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <Pill label="Electrician" emoji={<img src="/services/Control Panel Electrician.png" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt="" />} bg="#e0f2fe" active={category === 'electrician'} onClick={() => handleCategoryClick('electrician')} />
          <Pill label="Technician" emoji={<img src="/services/Appliance Technician.png" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt="" />} bg="#e0f2fe" active={category === 'technician'} onClick={() => handleCategoryClick('technician')} />
          <Pill label="Plumber" emoji="💧" bg="#bfdbfe" active={category === 'plumber'} onClick={() => handleCategoryClick('plumber')} />
          <Pill label="Painting" emoji="🎨" bg="#fde68a" active={category === 'painter'} onClick={handlePainterClick} />
          <Pill label="Clear Filters" emoji="✦" bg="#e2e8f0" active={category === 'all'} onClick={() => handleCategoryClick('all')} />
        </div>

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
    </div>
  );
};

export default Shop;
