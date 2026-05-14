import React, { useEffect } from 'react';
import { useSEO } from '../hooks/useSEO';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Building2, School, Home as House, Sparkles, ShieldCheck, ArrowRight, Palette } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUI } from '../context/UIContext';

const CommercialPainting = () => {
  useSEO({
    title: 'Commercial Painting Services — Offices, Schools & Warehouses | Dhoond.co',
    description: 'Expert commercial painting for offices, schools, colleges & warehouses in Bengaluru. Industrial-grade coatings, fixed timelines, certified professionals. Book a consultation at ₹49.',
    canonical: '/commercial-painting',
    ogImage: 'https://dhoond.co/commercial_painting.jpg',
  });

  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  const consultationItem = {
    id: 'comm-paint-consult',
    title: 'Commercial Painting Expert Consultation',
    category: 'Commercial',
    price: 499,
    discountPrice: 49,
    image: '/commercial_painting.jpg'
  };

  const isAdded = cartItems.some(item => item.id === consultationItem.id);

  const { openComingSoon, locationLabel, locationSubtext } = useUI();
  
  useEffect(() => {
    const isBengaluru = (locationLabel || '').toLowerCase().includes('bengaluru') || 
                         (locationLabel || '').toLowerCase().includes('bangalore') ||
                         (locationSubtext || '').toLowerCase().includes('bengaluru') ||
                         (locationSubtext || '').toLowerCase().includes('bangalore');
    
    if (locationLabel && locationLabel !== 'Fetching location…' && locationLabel !== 'Detecting…' && !isBengaluru) {
      openComingSoon();
      navigate('/');
      return;
    }

    window.scrollTo(0, 0);
  }, [navigate, openComingSoon, locationLabel, locationSubtext]);

  const handleBooking = () => {
    if (!isAdded) {
      addToCart(consultationItem);
    }
    navigate('/cart');
  };

  const projects = [
    {
      title: 'Modern Office Spaces',
      desc: 'Premium finishes for corporate environments, focusing on productivity and brand identity.',
      image: '/commercial_painting.jpg',
      icon: <Building2 size={24} />
    },
    {
      title: 'Educational Institutions',
      desc: 'Durable, safe, and vibrant painting solutions for schools, colleges, and training centers.',
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop',
      icon: <School size={24} />
    },
    {
      title: 'Luxury Bungalows & Estates',
      desc: 'Exquisite exterior and interior transformations for large-scale residential properties.',
      image: '/exterior_painting.webp',
      icon: <House size={24} />
    }
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '10rem' }}>
      {/* Editorial Header */}
      <div style={{ height: '60vh', position: 'relative', overflow: 'hidden', background: '#0f172a' }}>
        <img 
          src="/commercial_painting.jpg" 
          alt="Commercial Painting" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} 
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,23,42,0.4), rgba(15,23,42,0.9))' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', right: '5%', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '0.5rem 1rem', borderRadius: '99px', color: '#fff', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Sparkles size={16} color="#facc15" /> Specialized Painting Services
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', color: '#fff', fontWeight: 900, margin: '0 0 1rem 0', lineHeight: 1, letterSpacing: '-0.03em' }}>
            Commercial <br />
            <span style={{ color: '#3b82f6' }}>Excellence.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', maxWidth: '600px', lineHeight: 1.6, fontWeight: 500 }}>
            Transforming large-scale spaces with industrial precision and artistic craftsmanship.
          </p>
        </div>
      </div>

      {/* Project Showcase */}
      <div style={{ maxWidth: '1200px', margin: '4rem auto', padding: '0 5%' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>Sectors We Transform</h2>
          <div style={{ width: '60px', height: '4px', background: '#3b82f6', margin: '0 auto' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {projects.map((p, idx) => (
            <div key={idx} style={{ background: '#fff', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', transition: 'transform 0.3s' }}>
              <div style={{ height: '240px', overflow: 'hidden' }}>
                <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '2rem' }}>
                <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', marginBottom: '1.5rem' }}>
                  {p.icon}
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>{p.title}</h3>
                <p style={{ color: '#64748b', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '0' }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Signals */}
      <div style={{ background: '#fff', padding: '5rem 5%', borderY: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', textAlign: 'center' }}>
          <div>
             <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Industrial Grade</h4>
             <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Heavy-duty coatings for durability</p>
          </div>
          <div>
             <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Fixed Timelines</h4>
             <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Minimal disruption to operations</p>
          </div>
          <div>
             <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Certified Pros</h4>
             <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Background checked & insured</p>
          </div>
        </div>
      </div>

      {/* Final Inline CTA - Matched to User Request */}
      <div style={{ padding: '6rem 5%', textAlign: 'center', background: '#f1f5f9' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '1.5rem' }}>Ready to start your project?</h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '3rem', lineHeight: 1.6 }}>
            Our commercial experts provide on-site assessments, material cost estimation, and fixed timelines for your peace of mind.
          </p>
          <div style={{ 
            display: 'inline-flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', 
            background: '#fff', padding: '2.5rem 4rem', borderRadius: '32px', boxShadow: '0 30px 60px rgba(0,0,0,0.06)' 
          }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#64748b' }}>Consultation Fee</div>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#111' }}>₹49</div>
            <button 
              onClick={handleBooking}
              style={{ 
                background: '#3b82f6', color: '#fff', border: 'none', padding: '1.25rem 3rem', 
                borderRadius: '16px', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(59,130,246,0.3)'
              }}
            >
              {isAdded ? 'Manage in Cart' : 'Book Consultation now'}
            </button>
          </div>
        </div>
      </div>


    </div>
  );
};

export default CommercialPainting;
