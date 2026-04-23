import { X, MapPin, Bell, Globe, CheckCircle2 } from 'lucide-react';
import { detectCurrentLocation } from '../utils/location';

const ComingSoonModal = ({ onClose }) => {
  const [location, setLocation] = useState('Detecting...');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const defaultCity = 'your current area';
    detectCurrentLocation()
      .then(loc => setLocation(loc.city || defaultCity))
      .catch(() => setLocation(defaultCity));
  }, []);

  const handleNotifyMe = () => {
    setIsSubmitted(true);
    setTimeout(onClose, 2500);
  };

  return (
    <div 
      style={{ 
        position: 'fixed', inset: 0, 
        background: 'rgba(15, 23, 42, 0.45)', 
        backdropFilter: 'blur(16px)', 
        zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' 
      }} 
      onClick={onClose}
    >
      <div 
        style={{ 
          background: '#fff', borderRadius: '32px', width: '92%', maxWidth: '400px', 
          padding: '2.5rem 1.75rem', position: 'relative', textAlign: 'center', 
          boxShadow: '0 40px 100px -20px rgba(0,0,0,0.4)',
          animation: 'modalEntrance 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          overflow: 'hidden',
          maxHeight: '90vh'
        }} 
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
          <X size={18} color="#64748b" />
        </button>

        {!isSubmitted ? (
          <>
            <div style={{ position: 'relative', width: '72px', height: '72px', margin: '0 auto 1.5rem' }}>
              <div style={{ position: 'absolute', inset: -6, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', opacity: 0.15, filter: 'blur(10px)', borderRadius: '50%' }} />
              <div style={{ 
                width: '100%', height: '100%', 
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', 
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 20px -4px rgba(245, 158, 11, 0.4)',
                position: 'relative', zIndex: 1
              }}>
                <Globe size={32} color="#fff" strokeWidth={2.5} />
              </div>
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.6rem', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              This service isn’t available <br/> in your area yet.
            </h2>
            <p style={{ color: '#64748b', lineHeight: 1.5, margin: '0 0 1.5rem 0', fontSize: '0.9rem', fontWeight: 500 }}>
              We'll notify you as soon as we launch here!
            </p>
            
            <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '20px', padding: '1rem', marginBottom: '2rem', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <MapPin size={16} color="#3b82f6" fill="#dbeafe" />
                <span style={{ fontWeight: 800, color: '#334155', fontSize: '0.95rem' }}>{location}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                onClick={handleNotifyMe}
                style={{ 
                  width: '100%', background: '#2563eb', color: '#fff', border: 'none', 
                  padding: '1.1rem', borderRadius: '16px', fontWeight: 800, fontSize: '1rem', 
                  cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                  transition: 'all 0.2s'
                }}
              >
                <Bell size={18} /> Notify Me
              </button>
              <button 
                onClick={onClose}
                style={{ 
                  width: '100%', background: 'transparent', color: '#64748b', 
                  border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '16px', 
                  fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer'
                }}
              >
                Change Location
              </button>
            </div>
          </>
        ) : (
          <div style={{ padding: '1rem 0' }}>
            <div style={{ width: '72px', height: '72px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle2 size={36} color="#15803d" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>You're on the list!</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.4, fontWeight: 500 }}>
              We'll reach out when we're live in <strong>{location}</strong>.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalEntrance {
          0% { opacity: 0; transform: scale(0.92) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ComingSoonModal;
