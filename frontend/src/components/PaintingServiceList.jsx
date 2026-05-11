import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  X, Star, Clock, ChevronRight, ShieldCheck,
  Share2, CircleHelp, CheckCircle2,
  ArrowRight, Plus, Check, ArrowLeft, ChevronDown,
  Paintbrush, Home, Building2, Sparkles, Droplets, TreePine, Layers,
  ShoppingCart, CheckCheck
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

// Category groupings for display
const SERVICE_GROUPS = [
  {
    key: 'consultation',
    label: 'Consultations',
    keywords: ['consultation'],
  },
  {
    key: 'interior',
    label: 'Interior Painting',
    keywords: ['interior', '1 bhk', '2 bhk', '3 bhk', '4 bhk', 'villa'],
  },
  {
    key: 'exterior',
    label: 'Exterior Painting',
    keywords: ['exterior'],
  },
  {
    key: 'commercial',
    label: 'Commercial Painting',
    keywords: ['office', 'school', 'warehouse', 'industrial', 'commercial'],
  },
  {
    key: 'specialty',
    label: 'Specialty & Designer',
    keywords: ['texture', 'designer', 'wallpaper', 'stencil', 'pattern'],
  },
  {
    key: 'coatings',
    label: 'Coatings & Wood',
    keywords: ['specialty coatings', 'wood polishing', 'waterproofing', 'grill', 'gate', 'varnish', 'damp'],
  },
  {
    key: 'touchup',
    label: 'Touch-ups & Repairs',
    keywords: ['touch', 'spot fix'],
  },
];

function groupServices(services) {
  const grouped = [];
  const used = new Set();

  for (const group of SERVICE_GROUPS) {
    const matches = services.filter(
      (s) =>
        !used.has(s.id) &&
        group.keywords.some((kw) => s.title.toLowerCase().includes(kw))
    );
    if (matches.length > 0) {
      matches.forEach((m) => used.add(m.id));
      grouped.push({ ...group, services: matches });
    }
  }

  // Catch-all for anything not grouped
  const remaining = services.filter((s) => !used.has(s.id));
  if (remaining.length > 0) {
    grouped.push({ key: 'other', label: 'Other Services', services: remaining });
  }

  return grouped;
}

// Maps each filter key -> keywords to match service titles from DB
const FILTER_MAP = {
  consultation: ['consultation'],
  interior: ['interior', '1 bhk', '2 bhk', '3 bhk', '4 bhk', 'villa'],
  exterior: ['exterior'],
  commercial: ['office', 'school', 'college', 'warehouse', 'industrial', 'commercial'],
  coatings: ['specialty coatings', 'wood polishing', 'waterproofing', 'grill', 'gate', 'varnish', 'damp', 'stencil', 'wallpaper', 'texture', 'designer'],
};

const FILTER_TITLES = {
  consultation: 'Consultation Services',
  interior: 'Interior Painting',
  exterior: 'Exterior Painting',
  commercial: 'Commercial Painting',
  coatings: 'Specialty & Coatings',
};

// Map service titles to distinct local images by keyword
const pickImage = (title = '') => {
  const t = title.toLowerCase();
  if (t.includes('consultation') || t.includes('expert')) return '/consultation.png';
  if (t.includes('single')) return '/images/single%20wall.jpg';
  if (t.includes('exterior') || t.includes('weather')) return '/images/exterior_painting.webp';
  if (t.includes('texture') || t.includes('stencil')) return '/texture.png';
  if (t.includes('commercial') || t.includes('office') || t.includes('school')) return '/images/office%20space.jpg';
  if (t.includes('warehouse') || t.includes('industrial')) return '/images/ware%20house.jpg';
  if (t.includes('kitchen') || t.includes('bathroom')) return '/wall2.jpg';
  if (t.includes('1bhk') || t.includes('1 bhk')) return '/bedroom.jpg';
  if (t.includes('2bhk') || t.includes('2 bhk')) return '/space.jpg';
  if (t.includes('3bhk') || t.includes('3 bhk')) return '/interior.jpg';
  if (t.includes('4bhk') || t.includes('4 bhk') || t.includes('villa')) return '/images/vila.jpg';
  if (t.includes('primer') || t.includes('priming')) return '/priming_specialist_painter.png';
  if (t.includes('ceiling')) return '/interior.jpg';
  if (t.includes('touch') || t.includes('repair')) return '/touch_up_painter.png';
  if (t.includes('spray')) return '/spray_painter.png';
  if (t.includes('full') || t.includes('home')) return '/wall1.jpg';
  return '/images/exterior_painting.webp'; // generic fallback — a real painting photo
};

const PaintingServiceList = ({ service, onClose }) => {
  const navigate = useNavigate();
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/V1/services?category=painter`);
        if (!res.ok) throw new Error('Failed to fetch services');
        const result = await res.json();

        // Handle different possible response structures
        const data = Array.isArray(result) ? result : (result.services || result.data || []);

        // Filter services based on the clicked category
        const filterKey = service?.filter;
        const keywords = filterKey ? FILTER_MAP[filterKey] : null;

        const filtered = keywords
          ? data.filter(s =>
            keywords.some(kw => s.title.toLowerCase().includes(kw))
          )
          : data; // no filter = show all

        const filteredWithImages = filtered.map(s => ({
          ...s,
          image: pickImage(s.title)
        }));

        setServices(filteredWithImages);

        // Expand all groups by default
        const defaults = {};
        SERVICE_GROUPS.forEach(g => { defaults[g.key] = true; });
        defaults['other'] = true;
        setExpandedGroups(defaults);
      } catch (err) {
        console.error('Service list fetch error:', err);
        setError('Could not load services. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [service?.filter]);

  const isConsultation = service?.filter === 'consultation' || !service?.filter;

  const getCartQty = (id) => cartItems.find((i) => i.id === id)?.quantity || 0;

  const handleAdd = (svc) => {
    const finalPrice = svc.title.toLowerCase().includes('consultation') ? 49 : Number(svc.discount_price);
    
    addToCart({
      id: svc.id,
      title: svc.title,
      discountPrice: finalPrice,
      originalPrice: Number(svc.original_price),
      image: svc.image,
      category: 'painter',
      quantity: 1,
    });
    setAddedId(svc.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  // For non-consult categories: find & add the base consultation service
  const handleBookConsultation = async () => {
    try {
      const res = await fetch(`${API_URL}/api/V1/services?category=painter`);
      if (!res.ok) throw new Error('Fetch failed');
      const result = await res.json();

      // Handle the same response structures as fetchServices
      const data = Array.isArray(result) ? result : (result.services || result.data || []);

      // If we are in commercial category, look for commercial consultation first
      const isCommercial = service?.filter === 'commercial';
      const targetTerm = isCommercial ? 'commercial painting' : 'painting expert';

      let consult = data.find(s => s.title.toLowerCase().includes(targetTerm));

      // Final fallback search
      if (!consult) {
        consult = data.find(s => s.title.toLowerCase().includes('consultation'));
      }

      if (consult) {
        addToCart({
          id: consult.id,
          title: consult.title,
          discountPrice: 49, // Forced consistency
          originalPrice: Number(consult.original_price),
          image: pickImage(consult.title),
          category: 'painter',
          quantity: 1,
        });
      }
      navigate('/cart');
    } catch (err) {
      console.error('Manual consultation add error:', err);
      navigate('/cart');
    }
  };

  const grouped = groupServices(services);
  const toggleGroup = (key) => setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  const totalInCart = cartItems.filter((i) => i.category === 'painter').length;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: '#f8fafc',
        zIndex: 2000, overflowY: 'auto', overscrollBehavior: 'contain',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* HEADER */}
      <header
        style={{
          position: 'sticky', top: 0, left: 0, right: 0, height: '64px',
          background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 4%', zIndex: 110, borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 10px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0 }}>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9', border: 'none', borderRadius: '50%',
              width: '36px', height: '36px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', flexShrink: 0
            }}
          >
            <ArrowLeft size={18} color="#1e293b" />
          </button>
          <span style={{ fontWeight: 800, color: '#111', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {FILTER_TITLES[service?.filter] || 'Painting Services'}
          </span>
        </div>

        {totalInCart > 0 && (
          <button
            onClick={() => navigate('/cart')}
            className="header-cart-btn"
            style={{
              background: '#2563eb', color: '#fff', border: 'none',
              borderRadius: '10px', padding: '0.5rem 0.8rem',
              fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0
            }}
          >
            <ShoppingCart size={15} />
            <span className="cart-text">Cart ({totalInCart})</span>
          </button>
        )}
        <style>{`
          @media (max-width: 400px) {
            .header-cart-btn .cart-text { display: none; }
            .header-cart-btn { padding: 0.5rem !important; border-radius: 50% !important; }
          }
        `}</style>
      </header>

      {/* HERO BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          padding: '2rem 5%',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <style>{`
          .psl-hero-img { position: absolute; right: 2%; top: 50%; transform: translateY(-50%); height: 90%; width: auto; object-fit: contain; pointer-events: none; user-select: none; }
          @media (max-width: 600px) { .psl-hero-img { height: 55px; opacity: 0.6; } }
        `}</style>
        {/* Decorative image — visible on right */}
        <img src="/images/cart nav.png" alt="" aria-hidden="true" className="psl-hero-img" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: '100px',
              padding: '4px 12px', fontSize: '11px', fontWeight: 700,
              color: '#fff', marginBottom: '0.75rem', letterSpacing: '0.5px',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#facc15', display: 'inline-block' }} />
            Professional Painting
          </div>
          <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(1.5rem, 5vw, 2rem)', margin: '0 0 0.5rem', lineHeight: 1.1 }}>
            {service?.title || 'Painting Services'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', fontWeight: 500, margin: '0 0 1rem' }}>
            {services.length > 0 ? `${services.length} service${services.length !== 1 ? 's' : ''} available` : 'Loading...'}
            {' \u00b7 '}Starting {'\u20b9'}{services.length > 0 ? Math.min(...services.map(s => Number(s.discount_price || 49))) : 49}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={14} fill="#facc15" color="#facc15" />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>4.9/5 &middot; 1,200+ reviews</span>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1.5rem 5% 120px' }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
            <div style={{
              width: '40px', height: '40px', border: '3px solid #e2e8f0',
              borderTopColor: '#2563eb', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem',
            }} />
            Loading services...
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px',
            padding: '1.5rem', textAlign: 'center', color: '#991b1b', fontWeight: 600,
            marginTop: '2rem',
          }}>
            {error}
          </div>
        )}

        {!loading && !error && grouped.map((group) => (
          <div key={group.key} style={{ marginBottom: '1.5rem' }}>
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(group.key)}
              style={{
                width: '100%', background: 'none', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 0', cursor: 'pointer', marginBottom: '0.5rem',
              }}
            >
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#111' }}>
                {group.label}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                  {group.services.length} service{group.services.length !== 1 ? 's' : ''}
                </span>
                <ChevronDown
                  size={18}
                  color="#94a3b8"
                  style={{
                    transform: expandedGroups[group.key] ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.25s',
                  }}
                />
              </div>
            </button>

            {/* Service Cards */}
            {expandedGroups[group.key] && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {group.services.map((svc) => {
                  const qty = getCartQty(svc.id);
                  const justAdded = addedId === svc.id;
                  const discount = Math.round(
                    ((svc.original_price - svc.discount_price) / svc.original_price) * 100
                  );

                  return (
                    <div
                      key={svc.id}
                      style={{
                        background: '#fff', borderRadius: '18px',
                        border: qty > 0 && isConsultation && group.key === 'consultation' ? '2px solid #2563eb' : '1px solid #f1f5f9',
                        padding: '1.1rem 1.25rem',
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {/* Image */}
                      <div style={{ width: '72px', height: '72px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: '#f1f5f9' }}>
                        <img src={svc.image} alt={svc.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.src = '/interior.jpg'; }} />
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111', marginBottom: '0.2rem', lineHeight: 1.3 }}>
                          {svc.title}
                        </div>
                        <div style={{
                          fontSize: '0.78rem', color: '#64748b', fontWeight: 500, marginBottom: '0.4rem', lineHeight: 1.4,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                        }}>
                          {svc.description}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 900, fontSize: '1rem', color: '#111' }}>
                            {'\u20b9'}{svc.title.toLowerCase().includes('consultation') ? 49 : Number(svc.discount_price).toLocaleString('en-IN')}
                          </span>
                          {svc.original_price > svc.discount_price && (
                            <>
                              <span style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>
                                {'\u20b9'}{Number(svc.original_price).toLocaleString('en-IN')}
                              </span>
                              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.7rem', fontWeight: 800, padding: '2px 7px', borderRadius: '100px' }}>
                                {discount}% OFF
                              </span>
                            </>
                          )}
                          {(!isConsultation || group.key !== 'consultation') && (
                            <span style={{ background: '#fef9c3', color: '#854d0e', fontSize: '0.7rem', fontWeight: 800, padding: '2px 7px', borderRadius: '100px' }}>
                              Final price after consultation
                            </span>
                          )}
                        </div>
                      </div>

                      {isConsultation && group.key === 'consultation' && (
                        <div style={{ flexShrink: 0 }}>
                          {qty > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', background: '#f0fdf4', border: '1.5px solid #22c55e', borderRadius: '10px', overflow: 'hidden' }}>
                                <button onClick={() => qty === 1 ? removeFromCart(svc.id) : updateQuantity(svc.id, -1)}
                                  style={{ width: '32px', height: '32px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: qty === 1 ? '#ef4444' : '#16a34a', fontWeight: 900 }}>{'\u2212'}</button>
                                <span style={{ width: '24px', textAlign: 'center', fontWeight: 800, fontSize: '0.95rem', color: '#111' }}>{qty}</span>
                                <button onClick={() => updateQuantity(svc.id, 1)}
                                  disabled={qty >= 1}
                                  style={{
                                    width: '32px', height: '32px', background: 'none', border: 'none',
                                    cursor: qty >= 1 ? 'not-allowed' : 'pointer', fontSize: '1.1rem',
                                    color: qty >= 1 ? '#cbd5e1' : '#16a34a', fontWeight: 900
                                  }}>+</button>
                              </div>
                              <span style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 800 }}>In Cart</span>
                            </div>
                          ) : (
                            <button onClick={() => handleAdd(svc)}
                              style={{ background: justAdded ? '#22c55e' : '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.55rem 1rem', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '4px', transform: justAdded ? 'scale(0.96)' : 'scale(1)' }}>
                              {justAdded ? <><CheckCheck size={15} /> Added!</> : <><Plus size={15} /> Add</>}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {!loading && !error && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1.5rem' }}>
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '0.75rem', textAlign: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>
              <CheckCircle2 size={22} color="#22c55e" style={{ marginBottom: 4 }} />
              Verified Pros
            </div>
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '0.75rem', textAlign: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>
              <ShieldCheck size={22} color="#2563eb" style={{ marginBottom: 4 }} />
              Insured Work
            </div>
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '0.75rem', textAlign: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>
              <Star size={22} color="#f59e0b" fill="#f59e0b" style={{ marginBottom: 4 }} />
              4.9 Rated
            </div>
          </div>
        )}
      </div>

      {!isConsultation && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          padding: '1rem 5%', zIndex: 120,
          display: 'flex', alignItems: 'center', gap: '1rem',
          boxShadow: '0 -4px 24px rgba(37,99,235,0.25)',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
              Prices shown are indicative
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
              Our expert will give you exact pricing on visit
            </div>
          </div>
          <button
            onClick={handleBookConsultation}
            style={{
              background: '#facc15', color: '#1e3a8a', border: 'none',
              borderRadius: '14px', padding: '0.9rem 1.5rem',
              fontWeight: 900, fontSize: '0.95rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              flexShrink: 0, whiteSpace: 'nowrap',
            }}
          >
            Book Consultation now <ArrowRight size={17} />
          </button>
        </div>
      )}

      {isConsultation && totalInCart > 0 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(24px)',
          padding: '1rem 5%', borderTop: '1px solid #f1f5f9', zIndex: 120,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '1rem', boxShadow: '0 -8px 24px rgba(0,0,0,0.04)'
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '2px' }}>
              {totalInCart} Item{totalInCart !== 1 ? 's' : ''} Added
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {'\u20b9'}{cartItems
                .filter((i) => i.category === 'painter')
                .reduce((sum, i) => sum + i.discountPrice * (i.quantity || 1), 0)
                .toLocaleString('en-IN')}
            </div>
          </div>
          <button
            onClick={() => navigate('/cart')}
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', color: '#fff', border: 'none',
              borderRadius: '16px', padding: '0.9rem 1.75rem',
              fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(37,99,235,0.3)',
              display: 'flex', alignItems: 'center', gap: '0.6rem',
            }}
          >
            View Cart <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PaintingServiceList;
