import React, { useEffect, useState } from 'react';
import { X, MapPin, Bell, CheckCircle2 } from 'lucide-react';
import { detectCurrentLocation } from '../utils/location';
import { useUI } from '../context/UIContext';

const ComingSoonModal = ({ onClose }) => {
  const [location, setLocation] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { openLocation } = useUI();

  useEffect(() => {
    detectCurrentLocation()
      .then(loc => setLocation(loc.city || ''))
      .catch(() => setLocation(''));
  }, []);

  const handleNotifyMe = () => {
    setIsSubmitted(true);
    setTimeout(onClose, 2200);
  };

  const handleChangeLocation = () => {
    onClose();
    openLocation();
  };

  return (
    <>
      <style>{`
        @keyframes csOverlay { from { opacity: 0; } to { opacity: 1; } }
        @keyframes csSheet {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes csPop {
          0%   { transform: scale(0.7); opacity: 0; }
          60%  { transform: scale(1.1); }
          100% { transform: scale(1);   opacity: 1; }
        }
        .cs-modal-card { animation: csSheet 0.38s cubic-bezier(0.16,1,0.3,1) forwards; }
        .cs-notify-btn:hover { background: #1d4ed8 !important; transform: translateY(-1px); }
        .cs-notify-btn:active { transform: translateY(0); }
        .cs-close-btn:hover { background: #f1f5f9 !important; }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 3000,
          background: 'rgba(10,15,28,0.55)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
          animation: 'csOverlay 0.25s ease forwards',
        }}
      >
        {/* Card */}
        <div
          className="cs-modal-card"
          onClick={e => e.stopPropagation()}
          style={{
            background: '#fff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '320px',
            padding: '2rem 1.5rem 1.5rem',
            position: 'relative',
            textAlign: 'center',
            boxShadow: '0 24px 60px -12px rgba(0,0,0,0.35)',
          }}
        >
          {/* Close */}
          <button
            className="cs-close-btn"
            onClick={onClose}
            style={{
              position: 'absolute', top: '1rem', right: '1rem',
              background: '#f8fafc', border: 'none',
              borderRadius: '50%', width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#94a3b8', transition: 'background .15s',
            }}
          >
            <X size={15} strokeWidth={2.5} />
          </button>

          {!isSubmitted ? (
            <>
              {/* Icon */}
              <div style={{
                width: '52px', height: '52px', margin: '0 auto 1.25rem',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 16px -2px rgba(245,158,11,0.35)',
                animation: 'csPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.15s both',
              }}>
                <MapPin size={24} color="#fff" strokeWidth={2.5} />
              </div>

              {/* Heading */}
              <h2 style={{
                fontSize: '1.2rem', fontWeight: 800, color: '#0f172a',
                lineHeight: 1.3, letterSpacing: '-0.02em',
                margin: '0 0 0.4rem',
              }}>
                Not available in your area yet
              </h2>
              <p style={{
                color: '#94a3b8', fontSize: '0.83rem',
                fontWeight: 500, lineHeight: 1.5,
                margin: '0 0 1.25rem',
              }}>
                We'll let you know the moment we launch{location ? ` in ${location}` : ' near you'}.
              </p>

              {/* Location chip */}
              {location && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  background: '#eff6ff', color: '#2563eb',
                  padding: '0.35rem 0.9rem', borderRadius: '99px',
                  fontSize: '0.8rem', fontWeight: 700,
                  marginBottom: '1.25rem',
                  border: '1px solid #dbeafe',
                }}>
                  <MapPin size={12} strokeWidth={2.5} />
                  {location}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <button
                  className="cs-notify-btn"
                  onClick={handleNotifyMe}
                  style={{
                    width: '100%',
                    background: '#2563eb', color: '#fff',
                    border: 'none', padding: '0.85rem',
                    borderRadius: '14px', fontWeight: 700, fontSize: '0.92rem',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    boxShadow: '0 6px 18px -4px rgba(37,99,235,0.45)',
                    transition: 'all 0.2s',
                  }}
                >
                  <Bell size={15} strokeWidth={2.5} /> Notify me when available
                </button>
                <button
                  onClick={handleChangeLocation}
                  style={{
                    width: '100%', background: 'transparent',
                    color: '#94a3b8', border: 'none',
                    padding: '0.6rem', fontSize: '0.82rem',
                    fontWeight: 600, cursor: 'pointer',
                    transition: 'color .15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#475569'}
                  onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                >
                  Change location
                </button>
              </div>
            </>
          ) : (
            <div style={{ padding: '0.5rem 0 0.25rem' }}>
              <div style={{
                width: '52px', height: '52px', background: '#f0fdf4',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.1rem',
                animation: 'csPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
              }}>
                <CheckCircle2 size={26} color="#16a34a" strokeWidth={2} />
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
                You're on the list!
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.5, fontWeight: 500, margin: 0 }}>
                We'll ping you when we're live{location ? ` in ${location}` : ' near you'}.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ComingSoonModal;
