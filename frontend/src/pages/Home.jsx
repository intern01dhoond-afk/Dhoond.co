import React, { useEffect, useState, useRef } from 'react';
import { ArrowUpRight, Clock, ShieldCheck, Star, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUI } from '../context/UIContext';
import { useSEO } from '../hooks/useSEO';
import { detectCurrentLocation, isInsideGeofence } from '../utils/location';
import ComingSoonModal from '../components/ComingSoonModal';
import heroVideo from '../assets/hero_video.mp4';
import heroPoster from '../assets/main-banner.webp';
import acIcon from '../assets/icons/ac_technician.png';
import electricianIcon from '../assets/icons/electrician.png';
import painterIcon from '../assets/icons/painter.png';
import refrigeratorIcon from '../assets/icons/refrigerator.png';
import roIcon from '../assets/icons/ro_technician.png';
import washingIcon from '../assets/icons/washing_machine.png';
import hemanthImg from '../assets/Kuruba Hemanth Kishore.png';
import rahulImg from '../assets/rahul_avatar.png';
import sunitaImg from '../assets/sunita_avatar.png';

const Home = () => {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const [featuredServices, setFeaturedServices] = useState([]);
  const { openComingSoon, closeComingSoon, showComingSoon, locationLabel, locationSubtext, userLat, userLng } = useUI();
  const [shakingId, setShakingId] = useState(null);
  
  // SEO Integration
  useSEO({
    title: "Dhoond.co — Home Services & Professional Painting in 15 Min",
    description: "Book professional painters, electricians, AC technicians, and more in Bengaluru and Nagpur. Reliable home services delivered to your doorstep in just 15 minutes.",
    canonicalPath: "/"
  });

  const scrollContainerRef = useRef(null);
  const servicesRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };
  const handleGeneralBooking = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/V1/services?category=painter`);
      const data = await res.json();
      const services = Array.isArray(data) ? data : (data.services || data.data || []);
      const consult = services.find(s => s.title.toLowerCase().includes('painting expert'));
      if (consult) {
        addToCart({
          id: consult.id,
          title: consult.title,
          discountPrice: Number(consult.discount_price),
          originalPrice: Number(consult.original_price),
          image: consult.image,
          category: 'painter',
          quantity: 1,
        });
      }
      navigate('/cart');
    } catch (e) {
      navigate('/cart');
    }
  };
  const isBengaluru = (locationLabel || '').toLowerCase().includes('bengaluru') ||
    (locationLabel || '').toLowerCase().includes('bangalore') ||
    (locationSubtext || '').toLowerCase().includes('bengaluru') ||
    (locationSubtext || '').toLowerCase().includes('bangalore');

  const isNagpur = isInsideGeofence(userLat, userLng, 21.1497877, 79.0806859, 8000) ||
    (locationLabel || '').toLowerCase().includes('nagpur') ||
    (locationSubtext || '').toLowerCase().includes('nagpur');

  useEffect(() => {
    // Map service titles to distinct local images by keyword
    const pickImage = (title = '') => {
      const t = title.toLowerCase();
      if (t === 'ac gas top-up') return '/services/ac_gas_top_up.webp';
      if (t === 'geyser installation') return '/services/geyser.webp';
      if (t === 'ceiling fan installation') return '/services/electrician_ceiling_fan_install.webp';
      if (t.includes('washing machine installation')) return '/services/washing_machine_inspection_fully_automatic_front_load_.webp';
      if (t === 'water purifier installation') return '/services/water_purifier.webp';
      if (t === 'electrician visit') return '/services/electrician_visit.webp';

      if (t.includes('consultation') || t.includes('expert')) return '/painting_banner.png';
      if (t.includes('single')) return '/images/single%20wall.jpg';
      if (t.includes('exterior') || t.includes('weather')) return '/images/exterior_painting.webp';
      if (t.includes('texture') || t.includes('stencil')) return '/texture.png';
      if (t.includes('commercial') || t.includes('office') || t.includes('school')) return '/images/office%20space.jpg';
      if (t.includes('warehouse') || t.includes('industrial')) return '/images/ware%20house.jpg';
      if (t.includes('kitchen') || t.includes('bathroom')) return '/wall2.jpg';
      if (t.includes('1bhk') || t.includes('1 bhk')) return '/wall2.jpg';
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

    const nagpurFallback = [
      { id: 'n1', title: 'AC Gas Top-up', discountPrice: 1999, originalPrice: 2999, image: '/services/ac_gas_top_up.webp' },
      { id: 'n2', title: 'Geyser installation', discountPrice: 449, originalPrice: 600, image: '/services/geyser.webp' },
      { id: 'n3', title: 'Ceiling Fan Installation', discountPrice: 199, originalPrice: 300, image: '/services/electrician_ceiling_fan_install.webp' },
      { id: 'n4', title: "Washing Machine Installation 'Fully-automatic front load'", discountPrice: 549, originalPrice: 950, image: '/services/washing_machine_inspection_fully_automatic_front_load_.webp' },
      { id: 'n5', title: 'Water Purifier Installation', discountPrice: 449, originalPrice: 600, image: '/services/water_purifier.webp' },
      { id: 'n6', title: 'Electrician Visit', discountPrice: 199, originalPrice: 300, image: '/services/electrician_visit.webp' },
    ];

    const paintingFallback = [
      { id: 'f1', title: 'Full Home Painting (2BHK)', discountPrice: 5999, originalPrice: 8999, image: '/wall1.jpg' },
      { id: 'f2', title: 'Full Home Painting (3BHK)', discountPrice: 7999, originalPrice: 11999, image: '/interior.jpg' },
      { id: 'f3', title: 'Exterior Weatherproof Coating', discountPrice: 12999, originalPrice: 18999, image: '/images/exterior_painting.webp' },
      { id: 'f4', title: 'Specialty Texture Wall', discountPrice: 2499, originalPrice: 3999, image: '/texture.png' },
      { id: 'f5', title: 'Kitchen & Bathroom Painting', discountPrice: 1999, originalPrice: 2999, image: '/wall2.jpg' },
      { id: 'f6', title: 'Commercial Office Painting', discountPrice: 9999, originalPrice: 14999, image: '/exterior_painter.png' },
    ];

    const mixedFallback = [
      nagpurFallback[0],
      paintingFallback[0],
      nagpurFallback[1],
      paintingFallback[1],
      nagpurFallback[2],
      paintingFallback[2]
    ];

    const apiUrl = import.meta.env.VITE_API_URL || '';
    fetch(`${apiUrl}/api/V1/services`)
      .then(res => res.json())
      .then(result => {
        // Handle wrapped vs direct response
        const data = Array.isArray(result) ? result : (result.services || result.data || []);

        const nagpurTitles = [
          "AC Gas Top-up",
          "Geyser installation",
          "Ceiling Fan Installation",
          "Washing Machine Installation 'Fully-automatic front load'",
          "Water Purifier Installation",
          "Electrician Visit"
        ];

        const nagpurFiltered = nagpurTitles.map(title => {
          const s = data.find(x => x.title === title);
          if (s) {
            return {
              ...s,
              discountPrice: s.discount_price,
              originalPrice: s.original_price,
              image: pickImage(s.title)
            };
          }
          return nagpurFallback.find(x => x.title === title);
        }).filter(Boolean);

        const paintingServices = data.filter(s => s.title && s.title.toLowerCase().includes('paint'));
        const bengaluruFiltered = paintingServices.length > 0 ? paintingServices.slice(0, 6).map(s => ({
            ...s,
            discountPrice: s.discount_price,
            originalPrice: s.original_price,
            image: pickImage(s.title)
          })) : paintingFallback;

        if (isNagpur && !isBengaluru) {
          setFeaturedServices(nagpurFiltered.length > 0 ? nagpurFiltered : nagpurFallback);
        } else if (isBengaluru && !isNagpur) {
          setFeaturedServices(bengaluruFiltered);
        } else {
          // Mixed
          const nFiltered = nagpurFiltered.length > 0 ? nagpurFiltered : nagpurFallback;
          const bFiltered = bengaluruFiltered.length > 0 ? bengaluruFiltered : paintingFallback;
          
          setFeaturedServices([
            nFiltered[0],
            bFiltered[0],
            nFiltered[1],
            bFiltered[1],
            nFiltered[2],
            bFiltered[2]
          ].filter(Boolean));
        }
      })
      .catch(() => {
        // Fallback on error
        if (isNagpur && !isBengaluru) {
          setFeaturedServices(nagpurFallback);
        } else if (isBengaluru && !isNagpur) {
          setFeaturedServices(paintingFallback);
        } else {
          setFeaturedServices(mixedFallback);
        }
      });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-up');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    // Use a slightly longer delay and requestAnimationFrame to ensure DOM is ready
    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
      });
    }, 300);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [isNagpur, isBengaluru]);

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', overflowX: 'hidden', maxWidth: '100vw', background: '#f9fafb', fontFamily: 'Inter, sans-serif', color: '#1a1a1a' }}>

      <style>{`
        .card-hover-lift { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, margin 0.3s ease; }
        .card-hover-lift:hover { transform: translateY(-10px); box-shadow: 0 16px 40px rgba(0,0,0,0.12) !important; }
        .card-hover-lift:active { transform: scale(0.98) !important; box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important; }
        
        .btn-hover { transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .btn-hover:hover { transform: scale(1.05); box-shadow: 0 12px 30px rgba(0,0,0,0.15) !important; }
        .btn-hover:active { transform: scale(0.97); }

        .fade-up { opacity: 0; transform: translateY(40px); transition: opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .animate-up { opacity: 1; transform: translateY(0); }
        
        .parallax-bg { background-image: url('data:image/svg+xml;utf8,<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M0,50 Q25,25 50,50 T100,50" stroke="rgba(217, 119, 6, 0.05)" stroke-width="2" fill="none"/></svg>'); }

        .service-scroll::-webkit-scrollbar, .testi-scroll::-webkit-scrollbar { display: none; }
        .desktop-flex { display: flex; gap: 4rem; align-items: center; }
        .mobile-only { display: none; }
        .hero-text { flex: 1 1 460px; order: 1; }
        .hero-video { flex: 1 1 460px; order: 2; }
        
        .floating-rating { bottom: -30px; left: -30px; padding: 1.5rem; border-radius: 24px; gap: 0.25rem; }
        .floating-rating .rating-row { font-size: 1.5rem; gap: 0.5rem; }
        .floating-rating .rating-text { font-size: 1rem; }
        
        .video-container { border-radius: 32px; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.15); }

        @media(max-width: 768px) {
           .desktop-flex { flex-direction: column; gap: 1rem !important; }
           .mobile-only { display: block; }
           .desktop-only { display: none !important; }
           .hero-section { padding-left: 0 !important; padding-right: 0 !important; }
           .hero-text { order: 1; flex: none; width: 100%; text-align: center; padding: 0 5% !important; }
           #services-section { padding: 0 5% !important; }
           .hero-text p { margin-left: auto; margin-right: auto; }
           .hero-video { order: 2; flex: none; width: 100% !important; margin-left: 0 !important; position: relative; display: block; overflow: visible !important; margin-top: 1.5rem !important; }
           .video-container { border-radius: 0 !important; box-shadow: none !important; margin-bottom: 0 !important; }
           .floating-rating { display: none !important; }
           .hero-cta-row { flex-direction: column !important; width: 100%; }
           .hero-cta-row button { width: 100% !important; justify-content: center !important; margin-bottom: 0.5rem; }
           .hero-trust { justify-content: center !important; width: 100%; margin-top: 1rem; }
           
           .service-grid-mobile { display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 0.75rem !important; padding: 0 !important; }
           .service-grid-mobile > div { width: 100% !important; background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; border-radius: 0 !important; overflow: visible !important; }
           .service-grid-mobile .svc-icon-box { width: 100% !important; aspect-ratio: 1 / 1 !important; height: auto !important; border-radius: 12px !important; background: #ffffff !important; }
           .service-grid-mobile .svc-icon-box img { width: 100% !important; height: 100% !important; object-fit: contain !important; object-position: center !important; padding: 4px !important; }
           .service-grid-mobile .svc-label { font-size: 0.65rem !important; font-weight: 700 !important; }
           .service-grid-mobile .svc-tag { font-size: 6px !important; padding: 1px 4px !important; }
           
           .availability-tag { font-size: 6px !important; padding: 1px 3px !important; border-radius: 3px !important; margin-top: 2px !important; }
           .painting-highlight { border: 2.5px solid #facc15 !important; background: #fffcf0 !important; }
           
           .section-pad { padding: 1.5rem 5% 3rem !important; }
           .section-pad h2 { font-size: 1.75rem !important; line-height: 1.2 !important; }
           .section-pad p { font-size: 0.85rem !important; }
           .pop-scroll-mobile { padding-left: 5% !important; padding-right: 5% !important; scroll-snap-type: x mandatory; }
           .pop-scroll-mobile > div { flex: 0 0 240px !important; scroll-snap-align: start; }
            .svc-img-container { height: 180px !important; }
            .svc-card-body { padding: 0.85rem 0.9rem 0.9rem !important; }
            .svc-card-btn { padding: 0.65rem 0.5rem !important; font-size: 0.72rem !important; white-space: nowrap !important; }
           
           .stat-number { font-size: 1.75rem !important; }
           .stat-label { font-size: 0.65rem !important; }
           .feature-title { font-size: 0.95rem !important; }
           .feature-desc { font-size: 0.8rem !important; }

           .phone-mockup-col { margin-top: 2rem !important; }
           
           .why-dhoond-content { padding: 1rem 0 !important; }
           .why-dhoond-content h2 { margin-bottom: 0.75rem !important; font-size: 1.85rem !important; }
           .why-dhoond-content .description { margin-bottom: 1.5rem !important; font-size: 0.9rem !important; }
           .why-dhoond-content .features-list { margin-bottom: 1.5rem !important; gap: 1rem !important; }
           .why-dhoond-content .pills-list { margin-bottom: 1.5rem !important; }
           .why-dhoond-gap { gap: 1.5rem !important; }
        }

        .phone-mockup-col { transition: transform 0.3s ease; }
        .phone-mockup-col:hover { transform: translateY(-5px); }

        @media(min-width: 769px) {
           .service-grid { display: flex !important; flex-wrap: wrap; justify-content: center; gap: 2rem !important; }
           .pop-grid { display: grid !important; grid-template-columns: repeat(4, 1fr) !important; }
           .testi-grid { display: grid !important; grid-template-columns: repeat(3, 1fr) !important; }
           .stagger-card:nth-child(even) { margin-top: 32px; }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-4px); }
        }
        .shake-anim { animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both; }

        .service-card-unavailable { opacity: 0.7; filter: grayscale(0.65); }
        .availability-tag { font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.02em; }
        .tag-available { background: #fefce8; color: #854d0e; border: 1px solid #fef08a; display: flex; align-items: center; gap: 3px; }
        .tag-unavailable { background: #f8fafc; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; border: 1px solid #f1f5f9; }
        
        .painting-highlight { border: 2px solid #facc15 !important; box-shadow: 0 0 20px rgba(250, 204, 21, 0.2) !important; transform: scale(1.03); z-index: 5; }
        .painting-highlight:hover { transform: scale(1.08) translateY(-5px) !important; }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <section className="hero-section" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)', borderBottom: '1px solid #f1f5f9', padding: '2.5rem 5% 3rem' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div className="desktop-flex">
              <div className="hero-text">
                <span style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', color: '#92400e', borderRadius: '99px', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.75rem', boxShadow: '0 2px 8px rgba(250,204,21,0.15)' }}>
                  #1 Rated Commercial &amp; Home Services
                </span>
                <h1 style={{ fontSize: 'clamp(2.6rem, 5.5vw, 4.5rem)', fontWeight: 900, color: '#0f172a', lineHeight: 1.06, marginBottom: '1.25rem', letterSpacing: '-0.045em', maxWidth: '560px' }}>
                  Home &amp; Commercial<br />
                  <span style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>Services At Your</span><br />
                  <span style={{ color: '#0f172a' }}>Doorstep</span>
                </h1>
                <p style={{ fontSize: '1.05rem', fontWeight: 400, color: '#64748b', marginBottom: '2rem', lineHeight: 1.7, maxWidth: '440px', letterSpacing: '0.005em' }}>
                  Trusted professionals for your commercial &amp; household needs — delivered instantly, from routine fixes to major updates.
                </p>

                <div className="hero-cta-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.75rem' }}>
                  <button
                    onClick={() => servicesRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', color: '#fff', padding: '1rem 2rem', borderRadius: '14px', fontWeight: 800, fontSize: '1rem', border: 'none', cursor: 'pointer', boxShadow: '0 8px 30px rgba(37,99,235,0.3)', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease' }}
                    className="btn-hover"
                  >
                    Book a Service <ArrowUpRight size={18} strokeWidth={3} />
                  </button>
                  <button
                    onClick={() => {
                      if (isBengaluru) {
                        navigate('/painting');
                      } else {
                        openComingSoon();
                      }
                    }}
                    style={{ background: '#f0f5ff', color: '#1e40af', padding: '1rem 2rem', borderRadius: '14px', fontWeight: 700, fontSize: '1rem', border: '1.5px solid #bfdbfe', cursor: 'pointer', transition: 'all 0.3s ease' }}
                    className="btn-hover"
                  >
                    Explore Painting
                  </button>
                </div>

                <div className="hero-trust" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ display: 'flex' }}>
                    {['#6366f1', '#2563eb', '#0891b2', '#059669'].map((c, i) => (
                      <div key={i} style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, border: '2px solid #fff', marginLeft: i > 0 ? '-8px' : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#fff', fontWeight: 700 }}>
                        {['A', 'R', 'S', 'P'][i]}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill="#facc15" color="#facc15" />)}
                      <span style={{ fontWeight: 800, fontSize: '0.78rem', color: '#0f172a', marginLeft: '2px' }}>4.9</span>
                    </div>
                    <span style={{ fontWeight: 500, fontSize: '0.75rem', color: '#94a3b8' }}>from 100+ verified reviews</span>
                  </div>
                </div>
              </div>

              <div className="hero-video" style={{ position: 'relative' }}>
                <div className="video-container" style={{ background: '#f8fafc', minHeight: '260px' }}>
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    poster={heroPoster}
                    style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                  >
                    <source src={heroVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className="floating-rating" style={{ position: 'absolute', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 20px 50px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
                  <div className="rating-row" style={{ display: 'flex', alignItems: 'center', fontWeight: 900, color: '#111' }}>
                    <Star size={24} fill="#facc15" color="#facc15" /> 4.9 Rating
                  </div>
                  <span className="rating-text" style={{ color: '#4b5563', fontWeight: 600 }}>1 Lakh+ active bookings</span>
                </div>
              </div>
            </div>

            <div id="services-section" ref={servicesRef} style={{ marginTop: '2rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: '99px', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Our Services</span>
                <h3 style={{ fontSize: 'clamp(1.15rem, 2.5vw, 1.4rem)', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Trusted Commercial &amp; Home Services</h3>
              </div>
              <div className="service-scroll service-grid service-grid-mobile" style={{ display: 'flex', gap: '1.25rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                {[
                  { label: 'Painting', img: painterIcon, cat: 'painter', accent: '#d97706' },
                  { label: 'AC Tech', img: acIcon, cat: 'technician', subcat: 'ac', accent: '#0284c7' },
                  { label: 'RO Tech', img: roIcon, cat: 'technician', subcat: 'ro', accent: '#0891b2' },
                  { label: 'Electrician', img: electricianIcon, cat: 'electrician', accent: '#ca8a04' },
                  { label: 'Washing Mach.', img: washingIcon, cat: 'technician', subcat: 'washing', accent: '#4f46e5' },
                  { label: 'Refrigerator', img: refrigeratorIcon, cat: 'technician', subcat: 'fridge', accent: '#059669' }
                ].map((item) => {
                  const isAvailable = (item.label === 'Painting' && isBengaluru) ||
                    (item.label !== 'Painting' && item.label !== 'Refrigerator' && isNagpur);
                  const isHighlight = item.label === 'Painting' && isAvailable;
                  return (
                    <div
                      key={item.label}
                      onClick={() => {
                        if (isAvailable) {
                          if (item.label === 'Painting') {
                            navigate('/painting');
                          } else {
                            const url = item.subcat
                              ? `/shop?cat=${item.cat}&subcat=${item.subcat}`
                              : `/shop?cat=${item.cat}`;
                            navigate(url);
                          }
                        } else {
                          setShakingId(item.label);
                          setTimeout(() => {
                            setShakingId(null);
                            openComingSoon();
                          }, 400);
                        }
                      }}
                      style={{
                        flex: '0 0 auto', width: '150px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem',
                        cursor: 'pointer', background: 'transparent', border: 'none', padding: 0,
                        transition: 'transform 0.2s ease',
                      }}
                      className={`${shakingId === item.label ? 'shake-anim' : ''}`}
                    >
                      {/* Standalone icon box */}
                      <div className="svc-icon-box" style={{
                        width: '135px', height: '135px', borderRadius: '28px',
                        background: '#ffffff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', position: 'relative',
                        border: isHighlight ? `2.5px solid ${item.accent}` : '2.5px solid transparent',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                        transition: 'border 0.2s, box-shadow 0.2s',
                      }}>
                        <img
                          src={item.img}
                          alt={item.label}
                          style={{
                            width: '100%', height: '100%',
                            objectFit: 'cover', objectPosition: 'top center',
                            display: 'block',
                            filter: isAvailable ? 'none' : 'grayscale(0.85) opacity(0.65)',
                          }}
                        />
                        {!isAvailable && (
                          <div style={{ position: 'absolute', top: 10, right: 10, width: '22px', height: '22px', background: 'rgba(255,255,255,0.95)', border: '1.5px solid #e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>🔒</div>
                        )}
                      </div>
                      {/* Label + tag below the box */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', width: '100%' }}>
                        <span className="svc-label" style={{ fontSize: '1.05rem', fontWeight: 800, color: isAvailable ? '#0f172a' : '#94a3b8', textAlign: 'center', lineHeight: 1.25 }}>{item.label}</span>
                        {isAvailable ? (
                          <span className="svc-tag" style={{ fontSize: '10px', fontWeight: 800, color: item.accent, background: `${item.accent}12`, border: `1.5px solid ${item.accent}25`, padding: '3px 10px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🔥 Available</span>
                        ) : (
                          <span className="svc-tag" style={{ fontSize: '10px', fontWeight: 700, color: '#cbd5e1', textAlign: 'center', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Coming Soon</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="section-pad fade-up parallax-bg" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #fff 100%)', padding: '5rem 5% 8rem' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
              <div>
                <span style={{ display: 'inline-block', background: '#dbeafe', color: '#1d4ed8', fontSize: '0.65rem', fontWeight: 800, padding: '4px 14px', borderRadius: '99px', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '1rem' }}>Popular Choices</span>
                <h2 style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 0.75rem', lineHeight: 1.08, letterSpacing: '-0.03em' }}>Top Demanding Services</h2>
                <p style={{ color: '#94a3b8', fontWeight: 300, fontSize: '1.05rem', margin: 0, letterSpacing: '0.01em', lineHeight: 1.65 }}>
                  {isNagpur && !isBengaluru ? 'Reliable home and commercial services at transparent pricing' : isBengaluru && !isNagpur ? 'Book a consultation — our expert visits and gives exact pricing' : 'Explore our top-rated services across India'}
                </p>
              </div>
              <div className="desktop-only" style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={scrollLeft} style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', border: '1.5px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}><ChevronLeft size={22} /></button>
                <button onClick={scrollRight} style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', border: '1.5px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}><ChevronRight size={22} /></button>
              </div>
            </div>

            <div ref={scrollContainerRef} className="service-scroll pop-scroll-mobile" style={{ display: 'flex', gap: '1.25rem', overflowX: 'auto', paddingBottom: '2rem' }}>
              {featuredServices.map((s, idx) => {
                const discountPrice = s.discount_price ?? s.discountPrice;
                const originalPrice = s.original_price ?? s.originalPrice;
                const isConsult = isBengaluru || s.title?.toLowerCase().includes('consultation');
                const discount = originalPrice > 0 ? Math.round((1 - discountPrice / originalPrice) * 100) : 0;
                const ratings = [4.8, 4.6, 4.9, 4.5, 4.7, 4.8];
                const rating = ratings[idx % ratings.length];
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      if (isNagpur && !isConsult) {
                        addToCart(s);
                        navigate('/cart');
                        return;
                      }
                      if (!isBengaluru) {
                        openComingSoon();
                        return;
                      }
                      const title = s.title?.toLowerCase() || '';
                      if (title.includes('commercial') || title.includes('office') || title.includes('school') || title.includes('warehouse')) {
                        navigate(`/painting?service=${encodeURIComponent('Commercial Painting')}&sub=${encodeURIComponent('Offices, Colleges/Schools & warehouses')}&filter=commercial`);
                      } else if (title.includes('exterior') || title.includes('weather')) {
                        navigate(`/painting?service=${encodeURIComponent('Exterior Painting')}&sub=${encodeURIComponent('Weather-resistant finishes')}&filter=exterior`);
                      } else {
                        navigate(`/painting?service=${encodeURIComponent('Interior Painting')}&sub=${encodeURIComponent('Walls, ceilings & trims')}&filter=interior`);
                      }
                    }}
                    style={{
                      flex: '0 0 auto', width: '260px',
                      background: '#fff',
                      borderRadius: '24px',
                      overflow: 'hidden',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                    }}
                    className="card-hover-lift"
                  >
                    {/* Image */}
                    <div className="svc-img-container" style={{ position: 'relative', width: '100%', height: '145px', overflow: 'hidden', background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)' }}>
                      <img
                        loading="lazy"
                        src={s.image}
                        alt={s.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: isNagpur ? 'top' : 'center center', display: 'block' }}
                        onError={e => {
                          e.target.style.display = 'none';
                          e.target.parentElement.style.background = 'linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%)';
                        }}
                      />
                      {/* Star badge */}
                      <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(6px)', padding: '4px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                        <Star size={12} fill="#facc15" color="#facc15" /> {rating}
                      </div>
                      {/* Discount badge */}
                      {discount > 0 && (
                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#22c55e', color: '#fff', padding: '4px 8px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 800 }}>
                          {discount}% OFF
                        </div>
                      )}

                    </div>

                    {/* Body */}
                    <div className="svc-card-body" style={{ padding: '0.75rem 1rem 0.85rem' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {s.title}
                      </h3>

                      <div style={{ marginBottom: '0.9rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.05rem' }}>{'₹'}{Number(discountPrice).toLocaleString('en-IN')}</span>
                          {originalPrice > discountPrice && (
                            <span style={{ color: '#94a3b8', textDecoration: 'line-through', fontSize: '0.85rem', fontWeight: 600 }}>{'₹'}{Number(originalPrice).toLocaleString('en-IN')}</span>
                          )}
                        </div>
                        {isConsult && (
                          <span style={{ color: '#6366f1', fontSize: '0.7rem', fontWeight: 700, marginTop: '2px', display: 'inline-block' }}>Final Price After Consultation</span>
                        )}
                      </div>

                      <button
                        className="card-hover-lift svc-card-btn"
                        style={{
                          width: '100%',
                          background: isConsult ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : '#0f172a',
                          color: '#fff', border: 'none',
                          padding: '0.7rem 1rem',
                          borderRadius: '12px', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          transition: 'opacity 0.2s',
                        }}
                      onClick={(e) => {
                        e.stopPropagation();
                        
                        // Track ViewContent
                        if (window.fbq) {
                          window.fbq('track', 'ViewContent', {
                            content_name: s.title,
                            content_ids: [s.id],
                            content_type: 'product',
                            value: Number(discountPrice),
                            currency: 'INR'
                          });
                        }

                        if (isNagpur && !isConsult) {
                          addToCart(s);
                          navigate('/cart'); // Navigate directly to cart page
                          return;
                        }
                        if (!isBengaluru) {
                          openComingSoon();
                          return;
                        }
                        const title = s.title?.toLowerCase() || '';
                        if (title.includes('commercial') || title.includes('office') || title.includes('school') || title.includes('warehouse')) {
                          navigate(`/painting?service=${encodeURIComponent('Commercial Painting')}&sub=${encodeURIComponent('Offices, Colleges/Schools & warehouses')}&filter=commercial`);
                        } else if (title.includes('exterior') || title.includes('weather')) {
                          navigate(`/painting?service=${encodeURIComponent('Exterior Painting')}&sub=${encodeURIComponent('Weather-resistant finishes')}&filter=exterior`);
                        } else {
                          navigate(`/painting?service=${encodeURIComponent('Interior Painting')}&sub=${encodeURIComponent('Walls, ceilings & trims')}&filter=interior`);
                        }
                      }}
                      >
                        {isNagpur && !isConsult ? 'Book Now' : 'Book Consultation'}
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section-pad fade-up" style={{
          background: '#0f172a',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative glow orbs */}
          <div style={{ position: 'absolute', top: '-120px', left: '-80px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-120px', right: '-80px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
          {/* Grid texture */}
          <div style={{ position: 'absolute', inset: 0, background: '#0f172a', pointerEvents: 'none' }} />

          <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
            {/* Two-column layout */}
          <div className="why-dhoond-gap" style={{ display: 'flex', gap: '5rem', alignItems: 'center', flexWrap: 'wrap' }}>

              {/* ── LEFT COLUMN ── */}
              <div className="why-dhoond-content" style={{ flex: '1 1 480px', minWidth: 0, padding: '2rem 0' }}>
                {/* Label */}
                <span style={{ display: 'inline-block', background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd', fontSize: '0.72rem', fontWeight: 800, padding: '5px 16px', borderRadius: '99px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem', boxShadow: '0 0 15px rgba(139,92,246,0.1)' }}>
                  Why Dhoond?
                </span>
                <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontWeight: 900, color: '#fff', margin: '0 0 1rem', lineHeight: 1.1 }}>
                  Join{' '}
                  <span style={{ background: 'linear-gradient(90deg, #c084fc 0%, #60a5fa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 30px rgba(192,132,252,0.3)' }}>
                    1 Lakh+
                  </span>{' '}Happy Customers
                </h2>
                <p className="description" style={{ color: '#cbd5e1', fontSize: '1.05rem', fontWeight: 500, maxWidth: '480px', margin: '0 0 3.5rem', lineHeight: 1.65 }}>
                  India's most trusted home &amp; commercial services platform — professional, verified, on-demand.
                </p>

                {/* Features List */}
                <div className="features-list" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2.5rem' }}>
                  {[
                    { icon: <Clock size={22} />, title: '15 Min Response Time', desc: 'Experts assigned instantly after booking — no waiting, no delays.', color: '#818cf8' },
                    { icon: <ShieldCheck size={22} />, title: 'Verified & Insured Experts', desc: 'Every pro is background-checked, trained, and insured.', color: '#38bdf8' },
                    { icon: <Star size={22} />, title: '4.9/5 Consistent Rating', desc: 'Quality guaranteed — or we redo the job, free of charge.', color: '#fbbf24' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1.35rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `radial-gradient(circle at top left, rgba(${item.color === '#818cf8' ? '99,102,241' : item.color === '#38bdf8' ? '56,189,248' : '251,191,36'},0.25), transparent)`, border: `1px solid rgba(255,255,255,0.08)`, boxShadow: `inset 0 0 12px rgba(255,255,255,0.05), 0 8px 16px rgba(${item.color === '#818cf8' ? '99,102,241' : item.color === '#38bdf8' ? '56,189,248' : '251,191,36'},0.1)`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="feature-title" style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', marginBottom: '0.3rem', letterSpacing: '-0.01em' }}>{item.title}</div>
                        <div className="feature-desc" style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pills */}
                <div className="pills-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '2.5rem' }}>
                  {['No Hidden Charges', 'On-Time Guarantee', 'Easy Rescheduling'].map(b => (
                    <span key={b} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, padding: '7px 15px', borderRadius: '99px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 900 }}>✓</span> {b}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => servicesRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)', color: '#fff', border: 'none', padding: '1.15rem 2.75rem', borderRadius: '16px', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 10px 30px -10px rgba(139,92,246,0.6)', display: 'inline-flex', alignItems: 'center', gap: '0.6rem', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  className="btn-hover"
                >
                  Book a Service Now <ChevronRight size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* ── RIGHT COLUMN — Phone mockup ── */}
              <div className="phone-mockup-col desktop-only" style={{ flex: '1 1 500px', minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                  {/* Glow behind image */}
                  <div style={{ position: 'absolute', inset: '-60px', background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)', filter: 'blur(30px)', borderRadius: '50%', pointerEvents: 'none' }} />
                  <img
                    src="/images/hero_tech.png"
                    alt="Dhoond Service Excellence"
                    style={{
                      width: '100%',
                      maxWidth: '650px',
                      height: 'auto',
                      display: 'block',
                      margin: '0 auto',
                      position: 'relative',
                      zIndex: 1,
                      filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))',
                      maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                    }}
                  />
                </div>
              </div>

            </div>
          </div>
        </section>


        <section className="section-pad fade-up" style={{ background: '#f9fafb', padding: '5rem 5% 2.5rem' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span style={{ display: 'inline-block', background: '#fef3c7', color: '#d97706', fontSize: '0.7rem', fontWeight: 800, padding: '3px 12px', borderRadius: '99px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Reviews</span>
              <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.75rem)', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Loved by Thousands</h2>
              <p style={{ color: '#64748b', fontWeight: 500, fontSize: '0.95rem', marginTop: '0.5rem', marginBottom: 0 }}>Real feedback from real customers across India</p>
            </div>
            <div className="testi-scroll testi-grid fade-up" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1.5rem', WebkitOverflowScrolling: 'touch' }}>
              {[
                { name: 'Hemanth', role: 'HSR Layout, Bengaluru', stars: 5, avatar: hemanthImg, text: 'Absolutely brilliant service! The technician arrived on time, diagnosed the issue within minutes, and was done in under 30 mins. Will definitely book again.' },
                { name: 'Rahul Mehta', role: 'Business Owner, Bengaluru', stars: 4, avatar: rahulImg, text: 'Good experience overall. The painting team was professional and the work quality was solid. Took a bit longer than expected, but the result was worth it.' },
                { name: 'Sunita Kapoor', role: 'House Owner, Nagpur', stars: 3, avatar: sunitaImg, text: 'Service was okay. The plumber did fix the leak but left without cleaning up. Could improve on punctuality and communication.' },
              ].map(r => (
                <div key={r.name} style={{ flex: '0 0 300px', minWidth: '260px', background: '#fff', padding: '1.5rem', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }} className="card-hover-lift stagger-card">
                  <div style={{ display: 'flex', gap: '3px', marginBottom: '0.85rem' }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i <= r.stars ? '#f59e0b' : 'none'} stroke={i <= r.stars ? '#f59e0b' : '#d1d5db'} strokeWidth="2">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                      </svg>
                    ))}
                  </div>
                  <p style={{ color: '#374151', fontSize: '0.95rem', lineHeight: 1.65, marginBottom: '1.5rem', fontStyle: 'italic', fontWeight: 500 }}>"{r.text}"</p>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, #dbeafe, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem', color: '#2563eb', flexShrink: 0, border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                      {r.avatar ? (
                        <img src={r.avatar} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        r.name[0]
                      )}
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 800, color: '#111', margin: 0, fontSize: '0.9rem' }}>{r.name}</h4>
                      <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.78rem', fontWeight: 600 }}>{r.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>





        {/* Global modal handled by MainLayout, but keeping this for legacy routes if any */}
      </div>
    </div>
  );
};

export default Home;
