import React, { useState } from 'react';
import { X, CheckCircle, ChevronRight, AlertTriangle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const PAINT_BRANDS = [
  { name: 'Asian Paints', tagline: 'Har Ghar Kuch Kehta Hai', color: '#e63329', logo: '🏠' },
  { name: 'Berger Paints', tagline: 'Express Yourself', color: '#0057a8', logo: '🎨' },
  { name: 'Dulux (AkzoNobel)', tagline: 'Let\'s Colour', color: '#e31837', logo: '✨' },
  { name: 'Nippon Paint', tagline: 'Coat of Happiness', color: '#cc0000', logo: '🌟' },
  { name: 'Kansai Nerolac', tagline: 'Healthy Home Paints', color: '#f7b500', logo: '🌿' },
  { name: 'Indigo Paints', tagline: 'Top Coat Technology', color: '#4b0082', logo: '💜' },
];

const DAMAGE_OPTIONS = [
  { id: 'seepage', label: 'Seepage / Water leakage', icon: '💧' },
  { id: 'cracks', label: 'Cracks on walls', icon: '🧱' },
  { id: 'peeling', label: 'Paint peeling off', icon: '⚠️' },
  { id: 'dampness', label: 'Dampness / Moisture', icon: '🌧️' },
  { id: 'none', label: 'No issues — fresh paint only', icon: '✅' },
];

const CONSULTATION_FEE = 49; // Standardized across all marketing and lists

const PaintingBookingModal = ({ service, onClose }) => {
  const [step, setStep] = useState(1); // 1 = paint, 2 = damage, 3 = confirm
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedDamages, setSelectedDamages] = useState([]);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { openComingSoon } = useUI();

  React.useEffect(() => {
    if (window.fbq && service) {
      window.fbq('track', 'ViewContent', {
        content_name: service.title,
        content_category: 'Painting',
        content_ids: [service.id],
        content_type: 'product',
        value: Number(service.discountPrice || CONSULTATION_FEE),
        currency: 'INR'
      });
    }
  }, [service]);

  const toggleDamage = (id) => {
    if (id === 'none') {
      setSelectedDamages(['none']);
      return;
    }
    setSelectedDamages(prev =>
      prev.includes(id)
        ? prev.filter(d => d !== d && d !== 'none')
        : [...prev.filter(d => d !== 'none'), id]
    );
  };

  const handleBook = () => {
    const consultItem = {
      id: service.id,  // Use the real numeric DB ID so the backend can look it up
      title: `Painting Consultation — ${selectedBrand || service.title}`,
      description: `Brand: ${selectedBrand} | Wall Condition: ${selectedDamages.join(', ')}`,
      discountPrice: service.discountPrice ?? CONSULTATION_FEE,
      originalPrice: service.originalPrice ?? 499,
      image: service.image || '/website_ui.webp',
      category: service.category || 'painter',
      quantity: 1
    };
    addToCart(consultItem);
    navigate('/shop/cart');
    onClose();
  };

  const hasIssues = selectedDamages.length > 0 && !selectedDamages.includes('none');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', zIndex: 3500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: 'Inter, sans-serif' }} onClick={onClose}>
      <div 
        style={{ 
          background: '#fff', borderRadius: '32px', width: '100%', maxWidth: '580px', maxHeight: '90vh', 
          overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
          position: 'relative', display: 'flex', flexDirection: 'column'
        }} 
        onClick={e => e.stopPropagation()}
      >

        {/* Header */}
        <div style={{ padding: '2rem 2rem 1.25rem', borderBottom: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#fff' }}>
          <div>
            <h2 style={{ fontWeight: 900, fontSize: '1.5rem', color: '#0f172a', margin: '0 0 0.4rem 0', letterSpacing: '-0.02em' }}>{service.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3].map(s => (
                  <div key={s} style={{ width: '20px', height: '6px', borderRadius: '10px', background: s <= step ? '#2563eb' : '#e2e8f0', transition: 'all 0.4s ease' }} />
                ))}
              </div>
              <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>
                {step === 1 ? 'Choose Brand' : step === 2 ? 'Wall Condition' : 'Booking Summary'}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
            <X size={22} color="#475569" />
          </button>
        </div>

        <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>

          {/* ── Step 1: Paint Brand ── */}
          {step === 1 && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#1e293b', marginBottom: '0.5rem' }}>🎨 Which brand do you prefer?</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 500 }}>Direct sourcing from top brands for the best quality.</p>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                gap: '1rem', 
                marginBottom: '2rem' 
              }}>
                {PAINT_BRANDS.map(brand => (
                  <div key={brand.name} onClick={() => setSelectedBrand(brand.name)} style={{ 
                    border: selectedBrand === brand.name ? `2.5px solid ${brand.color}` : '1.5px solid #f1f5f9', 
                    borderRadius: '20px', 
                    padding: '1.25rem', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem', 
                    transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
                    background: selectedBrand === brand.name ? `${brand.color}05` : '#fff',
                    transform: selectedBrand === brand.name ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: selectedBrand === brand.name ? `0 12px 24px ${brand.color}15` : 'none'
                  }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: brand.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>{brand.logo}</div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', margin: 0, lineHeight: 1.2 }}>{brand.name}</p>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, lineHeight: 1.3, fontWeight: 500 }}>{brand.tagline}</p>
                    </div>
                    {selectedBrand === brand.name && <CheckCircle2 size={20} color={brand.color} style={{ flexShrink: 0 }} />}
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setStep(2)} 
                disabled={!selectedBrand} 
                style={{ width: '100%', background: selectedBrand ? '#2563eb' : '#cbd5e1', color: '#fff', border: 'none', padding: '1.1rem', borderRadius: '16px', fontWeight: 900, fontSize: '1.1rem', cursor: selectedBrand ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: selectedBrand ? '0 10px 30px rgba(37,99,235,0.3)' : 'none', transition: 'all 0.3s' }}
              >
                Continue <ArrowRight size={20} />
              </button>
            </div>
          )}

          {/* ── Step 2: Wall Condition ── */}
          {step === 2 && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#1e293b', marginBottom: '0.5rem' }}>🔍 Wall Condition Check</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 500 }}>This helps our expert carry the right inspection tools.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem', marginBottom: '2rem' }}>
                {DAMAGE_OPTIONS.map(opt => {
                  const isActive = selectedDamages.includes(opt.id);
                  return (
                    <div key={opt.id} onClick={() => toggleDamage(opt.id)} style={{ border: isActive ? '2.5px solid #2563eb' : '1.5px solid #f1f5f9', borderRadius: '18px', padding: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', background: isActive ? '#eff6ff' : '#fff', transition: 'all 0.15s' }}>
                      <span style={{ fontSize: '1.5rem' }}>{opt.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>{opt.label}</span>
                      {isActive && <CheckCircle2 size={20} color="#2563eb" style={{ marginLeft: 'auto' }} />}
                    </div>
                  );
                })}
              </div>

              {hasIssues && (
                <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '16px', padding: '1rem 1.25rem', marginBottom: '2rem', display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '0.85rem', color: '#92400e', margin: 0, fontWeight: 600, lineHeight: 1.5 }}>
                    Our expert uses digital dampness meters. Seepage issues will be assessed for deep-waterproofing before painting.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '1.1rem', borderRadius: '16px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}>Back</button>
                <button onClick={() => setStep(3)} disabled={selectedDamages.length === 0} style={{ flex: 2, background: selectedDamages.length > 0 ? '#2563eb' : '#cbd5e1', color: '#fff', border: 'none', padding: '1.1rem', borderRadius: '16px', fontWeight: 900, fontSize: '1rem', cursor: selectedDamages.length > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: selectedDamages.length > 0 ? '0 10px 30px rgba(37,99,235,0.3)' : 'none' }}>
                  Continue Summary <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Confirm ── */}
          {step === 3 && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <div style={{ 
                background: '#f8fafc', borderRadius: '24px', padding: '1.75rem', 
                marginBottom: '1.5rem', border: '1.5px solid #f1f5f9' 
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>Selected Brand</label>
                    <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>{selectedBrand}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>Service Type</label>
                    <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Consultation</p>
                  </div>
                </div>
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1.5px solid #e2e8f0' }}>
                  <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.6rem' }}>Identified Conditions</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    {selectedDamages.map(d => {
                      const opt = DAMAGE_OPTIONS.find(o => o.id === d);
                      return <span key={d} style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#1e293b', padding: '0.4rem 0.9rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>{opt?.icon} {opt?.label}</span>;
                    })}
                  </div>
                </div>
              </div>

              {/* Price Banner */}
              <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '24px', padding: '1.75rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 20px 48px rgba(0,0,0,0.15)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 0.35rem 0', fontWeight: 700 }}>Total Booking Fee</p>
                  <p style={{ color: '#fff', fontSize: '0.95rem', margin: 0, fontWeight: 500, maxWidth: '240px', lineHeight: 1.4 }}>Full expert inspection & digital measurement</p>
                </div>
                <div style={{ textAlign: 'right', position: 'relative', zIndex: 1 }}>
                  <div style={{ background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 900, padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginBottom: '4px' }}>SAVE 80%</div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ color: '#64748b', textDecoration: 'line-through', fontSize: '0.9rem', fontWeight: 600 }}>₹499</span>
                    <span style={{ color: '#fff', fontWeight: 900, fontSize: '2.2rem', lineHeight: 1 }}>₹{CONSULTATION_FEE}</span>
                  </div>
                </div>
                {/* Decorative glow */}
                <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '150px', height: '150px', background: 'rgba(37, 99, 235, 0.2)', filter: 'blur(40px)', borderRadius: '50%' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '1.1rem', borderRadius: '16px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}>Back</button>
                <button onClick={handleBook} style={{ flex: 2, background: '#2563eb', color: '#fff', border: 'none', padding: '1.1rem', borderRadius: '16px', fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 12px 30px rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                  Secure My Visit <ArrowRight size={20} />
                </button>
              </div>
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', marginTop: '1.25rem', fontWeight: 600 }}>
                100% Secure Payment • Instant Confirmation
              </p>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default PaintingBookingModal;
