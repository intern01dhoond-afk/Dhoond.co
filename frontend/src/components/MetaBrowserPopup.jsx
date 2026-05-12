import React, { useState, useEffect } from 'react';
import { X, MapPin, Loader2, Zap, ShieldCheck } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { detectCurrentLocation } from '../utils/location';

const MetaBrowserPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [preloadedIP, setPreloadedIP] = useState(null);
  const { updateLocation } = useUI();

  useEffect(() => {
    // 4. Preload IP location with a slight delay to prioritize first paint
    const preloadTimer = setTimeout(() => {
      // Check cache first
      try {
        const cached = localStorage.getItem('dhoond_ip_location');
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const ONE_HOUR = 60 * 60 * 1000;
          if (Date.now() - timestamp < ONE_HOUR && data.lat && data.lng) {
            setPreloadedIP({ city: data.city, region: data.state, latitude: data.lat, longitude: data.lng });
            return;
          }
        }
      } catch (e) { /* ignore */ }

      // 1. Try own backend proxy (no rate limits)
      const API_BASE = import.meta.env.VITE_API_URL || '';
      fetch(`${API_BASE}/api/ip-location`)
        .then(res => {
          if (!res.ok) throw new Error('Backend proxy failed');
          return res.json();
        })
        .then(data => {
          if (data.latitude && data.longitude) {
            localStorage.setItem('dhoond_ip_location', JSON.stringify({
              data: { label: `${data.city}, ${data.region}`, city: data.city, state: data.region, sub: `${data.city}, ${data.region}`, lat: data.latitude, lng: data.longitude, isApproximate: true },
              timestamp: Date.now()
            }));
            setPreloadedIP(data);
          }
        })
        .catch(() => {
          // 2. Fallback: ipapi.co (direct)
          fetch("https://ipapi.co/json/")
            .then(res => {
              if (!res.ok) throw new Error('rate limited');
              return res.json();
            })
            .then(data => {
              if (data.latitude && data.longitude) {
                const result = { city: data.city, region: data.region, latitude: data.latitude, longitude: data.longitude };
                localStorage.setItem('dhoond_ip_location', JSON.stringify({
                  data: { label: `${data.city}, ${data.region}`, city: data.city, state: data.region, sub: `${data.city}, ${data.region}`, lat: data.latitude, lng: data.longitude, isApproximate: true },
                  timestamp: Date.now()
                }));
                setPreloadedIP(result);
              }
            })
            .catch(() => {});
        });
    }, 1200);

    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isInstagram = ua.includes("Instagram");
    const isFacebook = ua.includes("FBAN") || ua.includes("FBAV");
    const isMetaBrowser = isInstagram || isFacebook;

    // 1. Check if we've already shown this (persist across sessions)
    const hasSeenPopup = localStorage.getItem('dhoond_meta_browser_popup_seen');

    if (isMetaBrowser && !hasSeenPopup) {
      // 1. Delay the popup for better trust and context
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1800);
      return () => {
        clearTimeout(timer);
        clearTimeout(preloadTimer);
      };
    }
    
    return () => clearTimeout(preloadTimer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('dhoond_meta_browser_popup_seen', 'true');
  };

  const handleUseLocation = async () => {
    setIsLocating(true);
    try {
      const loc = await detectCurrentLocation();
      updateLocation(loc.label, loc.sub, loc.lat, loc.lng);
      handleClose();
    } catch (err) {
      console.error("Location detection failed:", err);

      // 4. Use preloaded IP data for instant results
      if (preloadedIP) {
        updateLocation(
          preloadedIP.city || "Your Area",
          preloadedIP.region || "",
          preloadedIP.latitude,
          preloadedIP.longitude
        );
        console.log("Using preloaded IP location");
      } else {
        // Last resort manual fetch if preload failed
        try {
          const res = await fetch("https://ipapi.co/json/");
          const data = await res.json();
          updateLocation(data.city || "Your Area", data.region || "", data.latitude, data.longitude);
        } catch (ipErr) {
          console.error("IP fallback failed:", ipErr);
        }
      }
      handleClose();
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'flex-end', // Aligns to bottom
      justifyContent: 'center',
      backgroundColor: isOpen ? 'rgba(0, 0, 0, 0.6)' : 'transparent',
      backdropFilter: isOpen ? 'blur(4px)' : 'none',
      WebkitBackdropFilter: isOpen ? 'blur(4px)' : 'none',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: isOpen ? 'auto' : 'none',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes slideUpSheet {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .bottom-sheet {
          background: white;
          border-radius: 32px 32px 0 0;
          width: 100%;
          max-width: 500px;
          padding: 20px 24px 40px;
          box-shadow: 0 -10px 40px rgba(0,0,0,0.15);
          position: relative;
          transform: translateY(${isOpen ? '0' : '100%'});
          transition: transform 0.5s cubic-bezier(0.32, 0.72, 0, 1);
          text-align: center;
        }
        
        .sheet-handle {
          width: 40px;
          height: 5px;
          background: #e2e8f0;
          border-radius: 99px;
          margin: 0 auto 24px;
        }
        
        .meta-btn-primary {
          background: #111827; /* Darker, more premium feel */
          color: white;
          border: none;
          padding: 18px;
          border-radius: 18px;
          font-weight: 800;
          font-size: 16px;
          cursor: pointer;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .meta-btn-primary:active { transform: scale(0.98); }
        .meta-btn-primary:disabled { opacity: 0.8; }
        
        .meta-btn-ghost {
          background: transparent;
          color: #64748b;
          border: none;
          padding: 12px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          margin-top: 16px;
        }
        
        .animate-spin { animation: spin 1s linear infinite; }
        
        .service-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f0fdf4;
          color: #16a34a;
          padding: 6px 12px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 16px;
        }
      `}</style>

      <div className="bottom-sheet">
        <div className="sheet-handle" />
        
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '24px',
            background: '#f8fafc',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={18} color="#94a3b8" />
        </button>

        <div className="service-badge">
          <ShieldCheck size={14} />
          Verified Professionals in your area
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          Services at your Doorstep
        </h2>
        
        <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.5', marginBottom: '28px', fontWeight: 500, padding: '0 10px' }}>
          Find reliable AC technicians, painters, and more. We just need to check your area.
        </p>

        <button 
          className="meta-btn-primary" 
          onClick={handleUseLocation}
          disabled={isLocating}
        >
          {isLocating ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Zap size={18} fill="currentColor" />
              Find Nearby Services
            </>
          )}
        </button>

        <button className="meta-btn-ghost" onClick={handleClose}>
          Not now, let me browse
        </button>

        <div style={{
          marginTop: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '40px', height: '40px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="#2563eb" />
            </div>
            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>Super Fast</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '40px', height: '40px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} color="#16a34a" />
            </div>
            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>100% Safe</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '40px', height: '40px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={18} color="#ef4444" />
            </div>
            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>Local Experts</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaBrowserPopup;
