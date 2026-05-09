import React from 'react';
import { Link } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { useUI } from '../context/UIContext';
import { isInsideGeofence } from '../utils/location';

const Footer = () => {
  const { openComingSoon, locationLabel, locationSubtext, userLat, userLng } = useUI();

  const isBengaluru = (locationLabel || '').toLowerCase().includes('bengaluru') ||
    (locationLabel || '').toLowerCase().includes('bangalore') ||
    (locationSubtext || '').toLowerCase().includes('bengaluru') ||
    (locationSubtext || '').toLowerCase().includes('bangalore');

  const isNagpur = isInsideGeofence(userLat, userLng, 21.1497877, 79.0806859, 8000) ||
    (locationLabel || '').toLowerCase().includes('nagpur') ||
    (locationSubtext || '').toLowerCase().includes('nagpur');

  // Safe icon renderer to prevent runtime crashes if an icon is missing in this version
  const Icon = ({ name, size = 18 }) => {
    const LucideIcon = Lucide[name];
    return LucideIcon ? <LucideIcon size={size} /> : <span>{name[0]}</span>;
  };

  return (
    <footer style={{ background: '#0f172a', color: '#f8fafc' }}>
      {/* Top contact bar */}
      <div style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: 'var(--footer-contact-pad, 3.5rem 5%)' }}>
        <style>{`
          @media (max-width: 768px) {
            :root { --footer-contact-pad: 2.5rem 1.5rem; --footer-main-pad: 3rem 1.5rem 2rem; --footer-main-gap: 3.5rem 2rem; }
            .mobile-centered-col { align-items: center !important; text-align: center !important; }
            .mobile-bottom-links { flex-direction: column !important; gap: 1rem !important; }
          }
        `}</style>
        <div className="mobile-stack" style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
          <div className="mobile-text-center">
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Need Assistance?</p>
            <h3 style={{ fontSize: 'clamp(1.5rem, 4vw, 1.75rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>We're here to help.</h3>
          </div>
          <div className="mobile-stack mobile-text-center" style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Call us</p>
              <a href="tel:+919102740274" style={{ fontWeight: 800, color: '#facc15', fontSize: '1.15rem' }}>+91 9102740274</a>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Support</p>
              <a href="mailto:support@dhoond.co" style={{ fontWeight: 800, color: '#facc15', fontSize: '1.15rem' }}>support@dhoond.co</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'inherit' }}>
              <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem' }}>Follow us</p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'inherit' }}>
                {[
                  { name: 'Facebook', url: 'https://www.facebook.com/dhoond.co', color: '#1877f2', path: 'M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z' },
                  { name: 'Instagram', url: 'https://www.instagram.com/dhoond.co/', color: '#e1306c', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
                  { name: 'X', url: 'https://x.com/DhoondCo', color: '#fff', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                  { name: 'Linkedin', url: 'https://www.linkedin.com/company/dhoond-co/', color: '#0077b5', path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' },
                  { name: 'Youtube', url: 'https://www.youtube.com/@Dhoond/shorts', color: '#ff0000', path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
                ].map((s, idx) => (
                  <a key={idx} href={s.url} target="_blank" rel="noopener noreferrer" style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', textDecoration: 'none' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = s.color;
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 8px 20px ${s.color}44`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" style={{ transition: 'all 0.3s ease' }}>
                      <path d={s.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main links section */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--footer-main-pad, 4.5rem 5% 3rem)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--footer-main-gap, 4rem)' }}>

          {/* Brand Column */}
          <div style={{ flex: '1 1 300px', maxWidth: '400px' }} className="mobile-text-center">
            <Link to="/" style={{ display: 'inline-block', marginBottom: '0.75rem' }}>
              <img src="/images/cart%20nav.png" alt="Dhoond" style={{ height: 'auto', maxHeight: '80px', width: 'auto', objectFit: 'contain', transition: 'transform 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            </Link>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.7, fontWeight: 500, margin: '0 0 1.5rem 0' }}>
              India's fastest growing premium Commercial and home services marketplace. Quality craftsmanship delivered to your doorstep.
            </p>
          </div>

          {/* Links Columns - Responsive Grid */}
          <div style={{
            flex: '2 1 500px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 'var(--footer-main-gap, 3.5rem 2.5rem)'
          }} className="mobile-text-center">
            {[
              { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Press'] },
              { title: 'Services', links: ['Painting', 'AC Tech', 'RO Tech', 'Electrician', 'Washing Mach.', 'Refrigerator'] },
              { title: 'Partners', links: ['Join as Expert', 'Partner with Us', 'Training Center'] },
              { title: 'Support', links: ['Help Center', 'Privacy Policy', 'Terms of Service', 'Refund Policy'] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {col.title}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  {col.links.map(l => {
                    const isPainting = l.toLowerCase() === 'painting' && col.title === 'Services';
                    const isOtherService = col.title === 'Services' && !isPainting;
                    return (
                      <Link
                        key={l}
                        to={(() => {
                          const lower = l.toLowerCase();
                          if (lower === 'painting') return "/painting";
                          if (lower === 'ac tech') return "/shop?cat=technician&subcat=ac";
                          if (lower === 'ro tech') return "/shop?cat=technician&subcat=ro";
                          if (lower === 'electrician') return "/shop?cat=electrician";
                          if (lower === 'washing mach.') return "/shop?cat=technician&subcat=washing";
                          if (lower === 'refrigerator') return "/shop?cat=technician&subcat=fridge";
                          return "#";
                        })()}
                        onClick={(e) => {
                          const lower = l.toLowerCase();
                          // Painting only in Bengaluru
                          if (lower === 'painting' && !isBengaluru) {
                            e.preventDefault();
                            openComingSoon();
                            return;
                          }
                          // Other services in Nagpur or Bengaluru
                          const isOtherService = ['ac tech', 'ro tech', 'electrician', 'washing mach.', 'refrigerator'].includes(lower);
                          if (isOtherService && !isNagpur && !isBengaluru) {
                            e.preventDefault();
                            openComingSoon();
                            return;
                          }
                          
                          // Handle coming soon for specific subcategories if needed in Shop.jsx
                          if (lower === 'refrigerator') {
                             e.preventDefault();
                             openComingSoon();
                          }
                        }}
                        style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.2s', textDecoration: 'none' }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = '#facc15';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = '#94a3b8';
                        }}
                      >
                        {l}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid #1e293b', padding: '2rem 5%' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '1rem' }} className="mobile-stack mobile-text-center">
          <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>© 2023 DhoondApp. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
