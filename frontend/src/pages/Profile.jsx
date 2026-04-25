import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User, Phone, Mail, LogOut, Package, Calendar, Clock,
  MapPin, ShieldCheck, Star, Edit2, Check, X, ChevronRight,
  CreditCard, Loader
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const statusColors = {
  Pending:   { bg: '#fefce8', color: '#854d0e', label: 'Pending' },
  Confirmed: { bg: '#eff6ff', color: '#1d4ed8', label: 'Confirmed' },
  Completed: { bg: '#f0fdf4', color: '#15803d', label: 'Completed' },
  Cancelled: { bg: '#fef2f2', color: '#991b1b', label: 'Cancelled' },
};

const Profile = () => {
  const { user, logout, updateUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { navigate('/'); }
  }, [isAuthenticated, navigate]);

  // Fetch real user data + bookings from backend
  useEffect(() => {
    if (!user?.id && !user?.mobile) {
      setProfileData(user);
      setLoading(false);
      return;
    }
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const id = user.id || 'undefined';
        const rawPhone = user.mobile || '';
        const cleanPhone = String(rawPhone).replace(/\D/g, '').slice(-10);
        
        console.log(`[Profile] Logic Start. ID: ${id}, CleanPhone: ${cleanPhone}`);
        
        // Try Primary Path
        let res = await fetch(`${API_URL}/api/user/profile/${id}?phone=${cleanPhone}`);
        
        // If 404, try V1 path as fallback
        if (!res.ok) {
          console.warn("[Profile] Primary path failed, trying V1 fallback...");
          res = await fetch(`${API_URL}/api/V1/users/profile/${id}?phone=${cleanPhone}`);
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Server error (${res.status})`);
        }
        
        const data = await res.json();
        console.log("[Profile] Success! Received data:", data);
        
        setProfileData(data.user);
        setBookings(data.bookings || []);
        
        if (data.user) {
          updateUser({ id: data.user.id, name: data.user.name, email: data.user.email });
        }
      } catch (err) {
        console.error("[Profile Fetch Fail]", err.message);
        setSaveError("Couldn't sync bookings. Please try again later."); // Using an existing error state for visibility
        setProfileData(user); 
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.id]);

  const handleEditSave = async () => {
    if (!user?.id) return;
    if (!editForm.name?.trim()) {
      setSaveError('Name cannot be empty.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch(`${API_URL}/api/user/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editForm.name.trim(), email: editForm.email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to save');
      if (!data.user) throw new Error('No user data returned from server');
      setProfileData(data.user);
      updateUser({ name: data.user.name, email: data.user.email });
      setEditMode(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = () => {
    setEditForm({ name: profileData?.name || '', email: profileData?.email || '' });
    setSaveError('');
    setEditMode(true);
  };

  if (!user) return null;

  const displayName = profileData?.name || user?.name || 'Dhoond User';
  const displayPhone = profileData?.phone || user?.mobile || '';
  const displayEmail = profileData?.email || user?.email || '';
  const memberSince = profileData?.created_at
    ? new Date(profileData.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '5rem' }}>
      <style>{`
        .profile-stack { display: grid; grid-template-columns: 300px 1fr; gap: 2rem; }
        .booking-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 900px) {
          .profile-stack { grid-template-columns: 1fr; }
          .booking-info-grid { grid-template-columns: 1fr; }
          .profile-header-inner { flex-direction: column !important; text-align: center; gap: 1.5rem !important; }
          .header-actions { justify-content: center !important; }
        }
        @media (max-width: 480px) {
          .booking-actions { flex-direction: column; }
        }
        .tab-btn { width: 100%; display: flex; align-items: center; gap: 0.85rem; padding: 1rem 1.1rem; border-radius: 14px; border: none; font-weight: 700; font-size: 0.92rem; cursor: pointer; transition: all 0.2s; }
        .tab-btn.active { background: #eff6ff; color: #2563eb; }
        .tab-btn.inactive { background: transparent; color: #64748b; }
        .tab-btn.inactive:hover { background: #f8fafc; }
        .edit-input { width: 100%; padding: 0.75rem 1rem; border-radius: 10px; border: 2px solid #e2e8f0; font-size: 0.95rem; font-weight: 600; outline: none; font-family: inherit; box-sizing: border-box; }
        .edit-input:focus { border-color: #2563eb; }
      `}</style>

      {/* ─── PROFILE HEADER ─── */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', padding: '4rem 5% 7rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }} className="profile-header-inner">
          {/* Avatar */}
          <div style={{ width: '100px', height: '100px', borderRadius: '28px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.25)', flexShrink: 0 }}>
            <User size={48} color="#fff" />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {editMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxWidth: '360px' }}>
                <input className="edit-input" placeholder="Full name" value={editForm.name}
                  onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
                <input className="edit-input" placeholder="Email address" type="email" value={editForm.email}
                  onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
                {saveError && <div style={{ color: '#fca5a5', fontSize: '0.8rem', fontWeight: 600 }}>{saveError}</div>}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <button onClick={handleEditSave} disabled={saving}
                    style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.6rem 1.25rem', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {saving ? <Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={14} />}
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditMode(false)}
                    style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.6rem 1.25rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: '#fff', margin: '0 0 0.6rem', letterSpacing: '-0.03em' }}>{displayName}</h1>
                <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', fontWeight: 600 }}>
                    <Phone size={16} color="#facc15" /> +91 {displayPhone}
                  </span>
                  {displayEmail && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', fontWeight: 600 }}>
                      <Mail size={16} color="#facc15" /> {displayEmail}
                    </span>
                  )}
                  {memberSince && (
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, background: 'rgba(255,255,255,0.15)', padding: '0.35rem 0.85rem', borderRadius: '8px', color: 'rgba(255,255,255,0.8)' }}>
                      Member since {memberSince}
                    </span>
                  )}
                </div>
                <button onClick={startEdit} style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '10px', padding: '0.5rem 1.1rem', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Edit2 size={13} /> Edit Profile
                </button>
              </>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '1rem', flexShrink: 0, flexWrap: 'wrap' }}>
            {[
              { icon: <Package size={20} color="#facc15" />, value: bookings.length, label: 'Bookings' },
              { icon: <Star size={20} color="#facc15" fill="#facc15" />, value: 'Elite', label: 'Member' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', padding: '1rem 1.5rem', textAlign: 'center', color: '#fff' }}>
                <div style={{ marginBottom: '4px' }}>{s.icon}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div style={{ maxWidth: '1100px', margin: '-4rem auto 0', padding: '0 5%' }}>
        <div className="profile-stack">

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#fff', borderRadius: '24px', padding: '0.75rem', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
              <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : 'inactive'}`} onClick={() => setActiveTab('bookings')}>
                <Package size={20} /> My Bookings
              </button>
              <button className={`tab-btn ${activeTab === 'support' ? 'active' : 'inactive'}`} onClick={() => setActiveTab('support')}>
                <ShieldCheck size={20} /> Help & Support
              </button>
              <div style={{ height: '1px', background: '#f1f5f9', margin: '0.5rem 0' }} />
              <button className="tab-btn inactive" style={{ color: '#ef4444' }} onClick={logout}>
                <LogOut size={20} /> Logout
              </button>
            </div>

            {/* Quick info card */}
            <div style={{ background: '#fff', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
              <h4 style={{ fontWeight: 800, color: '#111', margin: '0 0 1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Info</h4>
              {[
                { icon: <Phone size={15} />, label: 'Mobile', value: displayPhone ? `+91 ${displayPhone}` : '—' },
                { icon: <Mail size={15} />, label: 'Email', value: displayEmail || '—' },
                { icon: <ShieldCheck size={15} />, label: 'Verified', value: '✅ Phone Verified' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.85rem', alignItems: 'flex-start' }}>
                  <div style={{ color: '#2563eb', marginTop: '2px' }}>{r.icon}</div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>{r.label}</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111' }}>{r.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main */}
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '0 0 1.5rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {activeTab === 'bookings' ? 'My Bookings' : 'Help & Support'}
              {activeTab === 'bookings' && (
                <span style={{ fontSize: '0.85rem', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '8px', color: '#64748b' }}>
                  {bookings.length}
                </span>
              )}
            </h2>

            {activeTab === 'bookings' && (
              <>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                    Loading your bookings...
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                ) : bookings.length === 0 ? (
                  <div style={{ background: '#fff', borderRadius: '28px', padding: '5rem 2rem', textAlign: 'center', border: '1px solid #f1f5f9', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
                    <div style={{ width: '72px', height: '72px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                      <Package size={36} color="#94a3b8" />
                    </div>
                    <h3 style={{ fontWeight: 800, color: '#111', marginBottom: '0.5rem' }}>No bookings yet</h3>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>Your confirmed bookings will appear here.</p>
                    <button onClick={() => navigate('/')} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.85rem 2rem', borderRadius: '14px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}>
                      Browse Services
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {bookings.map(booking => {
                      const sc = statusColors[booking.status] || statusColors['Pending'];
                      const date = new Date(booking.created_at);
                      const services = (booking.items || []).filter(i => i.title);
                      return (
                        <div key={booking.id} style={{ background: '#fff', borderRadius: '24px', padding: '1.75rem', border: '1px solid #f1f5f9', boxShadow: '0 6px 24px rgba(0,0,0,0.03)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', gap: '1rem' }}>
                            <div>
                              <span style={{ background: sc.bg, color: sc.color, padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.03em', display: 'inline-block', marginBottom: '0.6rem' }}>
                                {sc.label}
                              </span>
                              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#111', margin: 0 }}>
                                {services.length > 0 ? services[0].title : 'Booking'}
                                {services.length > 1 && <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}> +{services.length - 1} more</span>}
                              </h3>
                              <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, margin: '0.3rem 0 0' }}>#{String(booking.id).padStart(6, '0')}</p>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#111' }}>₹{Number(booking.total_amount).toLocaleString('en-IN')}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginTop: '2px' }}>
                                {booking.payment_status === 'Paid' ? '✅ Paid' : '⏳ Pay after service'}
                              </div>
                            </div>
                          </div>

                          <div className="booking-info-grid" style={{ borderTop: '2px solid #f8fafc', paddingTop: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569' }}>
                              <div style={{ background: '#f1f5f9', padding: '0.5rem', borderRadius: '8px' }}><Calendar size={16} /></div>
                              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                                {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569' }}>
                              <div style={{ background: '#f1f5f9', padding: '0.5rem', borderRadius: '8px' }}><Clock size={16} /></div>
                              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                                {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {booking.address && (
                              <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
                                <div style={{ background: '#f1f5f9', padding: '0.5rem', borderRadius: '8px', flexShrink: 0 }}><MapPin size={16} /></div>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.5 }}>{booking.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {activeTab === 'support' && (
              <div style={{ background: '#fff', borderRadius: '28px', padding: '3rem 2rem', textAlign: 'center', border: '1px solid #f1f5f9', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
                <ShieldCheck size={48} color="#2563eb" style={{ opacity: 0.7, marginBottom: '1rem' }} />
                <h3 style={{ fontWeight: 800, color: '#111', marginBottom: '0.5rem' }}>Help & Support</h3>
                <p style={{ color: '#64748b', marginBottom: '2rem' }}>Need help? Call or WhatsApp us anytime.</p>
                <a href="tel:+919102740274" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#2563eb', color: '#fff', padding: '0.9rem 2rem', borderRadius: '14px', fontWeight: 800, fontSize: '1rem', textDecoration: 'none' }}>
                  <Phone size={18} /> +91 91027 40274
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
