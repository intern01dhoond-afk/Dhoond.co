import React, { useState, useEffect } from 'react';
import { Package, Search, ChevronDown, UserCheck, X, CheckCircle2, MapPin, Clock, CheckCircle } from 'lucide-react';
import { formatOrderId } from '../utils/formatOrderId';

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

const STATUS_STYLES = {
  Pending:     { bg: '#fff7ed', color: '#ea580c' },
  Confirmed:   { bg: '#eff6ff', color: '#2563eb' },
  'In Progress': { bg: '#faf5ff', color: '#7c3aed' },
  Completed:   { bg: '#f0fdf4', color: '#16a34a' },
  Cancelled:   { bg: '#fef2f2', color: '#dc2626' },
};

const PAYMENT_STYLES = {
  Paid:    { bg: '#f0fdf4', color: '#16a34a' },
  Success: { bg: '#f0fdf4', color: '#16a34a' },
  Unpaid:  { bg: '#fef2f2', color: '#dc2626' },
  Pending:   { bg: '#fff7ed', color: '#ea580c' },
  Cancelled: { bg: '#f1f5f9', color: '#64748b' },
};

const getStatusStyle  = (s) => STATUS_STYLES[s]  || { bg: '#f1f5f9', color: '#64748b' };

const formatDate = (iso) => iso
  ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—';

const getCity = (address = '') => {
  if (!address) return 'Nagpur';
  const addr = address.toLowerCase();
  const blrKeywords = [
    'bengaluru', 'bangalore', 'hsr', 'karnataka', 'main rd', 'main road', 
    'bluru', 'sarjapur', 'bellandur', 'koramangala', 'indiranagar', 
    'whitefield', 'jayanagar', 'jp nagar', 'electronic city', 'hebbal', 
    'yelahanka', 'banaswadi', 'btm', 'marathahalli', 'kamataka'
  ];
  if (blrKeywords.some(key => addr.includes(key))) return 'Bengaluru';
  const ngpKeywords = ['nagpur', 'maharashtra', 'dharampeth', 'itwari', 'sitabuldi', 'sadar', 'manish nagar'];
  if (ngpKeywords.some(key => addr.includes(key))) return 'Nagpur';
  return 'Nagpur';
};

const GLOBAL_STYLES = `
  @keyframes spin-anim { to { transform: rotate(360deg); } }
  .spin-anim { animation: spin-anim 1s linear infinite; }
`;

const OrdersManager = () => {
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updating, setUpdating]   = useState(null);
  const [cityFilter, setCityFilter] = useState('all');
  const [partners, setPartners]         = useState([]);
  const [assignModal, setAssignModal]   = useState(null);
  const [assigning, setAssigning]       = useState(false);
  const [assignError, setAssignError]   = useState('');

  const API_URL = import.meta.env.VITE_API_URL || '';

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('dhoond_user') || '{}');
      const res  = await fetch(`${API_URL}/api/admin/bookings`, {
        headers: { 'x-user-id': user?.id || '' }
      });
      const data = await res.json();
      setBookings(Array.isArray(data.data) ? data.data : []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const fetchPartners = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('dhoond_user') || '{}');
      const res  = await fetch(`${API_URL}/api/V1/partners`, {
        headers: { 'x-user-id': user?.id || '' }
      });
      const data = await res.json();
      setPartners(Array.isArray(data.data) ? data.data : []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchBookings(); fetchPartners(); }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id);
    try {
      const user = JSON.parse(localStorage.getItem('dhoond_user') || '{}');
      await fetch(`${API_URL}/api/admin/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
        body: JSON.stringify({ status: newStatus })
      });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    } catch (e) { console.error(e); }
    finally { setUpdating(null); }
  };

  const handleAssignPartner = async (orderId, partnerId) => {
    setAssigning(true); setAssignError('');
    try {
      const user = JSON.parse(localStorage.getItem('dhoond_user') || '{}');
      const res  = await fetch(`${API_URL}/api/admin/bookings/${orderId}/partner`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
        body: JSON.stringify({ partner_id: partnerId })
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === orderId ? { ...b, partner_id: partnerId, status: 'Confirmed' } : b));
        setAssignModal(null);
      } else {
        const data = await res.json();
        setAssignError(data.error || 'Failed to assign');
      }
    } catch (e) { setAssignError(e.message); }
    finally { setAssigning(false); }
  };

  const filteredByCity = bookings.filter(b => {
    const isCityMatch = cityFilter === 'all' || getCity(b.address) === cityFilter;
    const orderId = formatOrderId(b.id, b.created_at, b.daily_sequence);
    const isJunk = ['DHD-22.04-0005', 'DHD-22.04-0004', 'DHD-22.04-0003'].includes(orderId);
    return isCityMatch && !isJunk;
  });

  const filtered = filteredByCity.filter(b => {
    const orderId = formatOrderId(b.id, b.created_at, b.daily_sequence);
    const matchSearch = (b.customer_name || '').toLowerCase().includes(search.toLowerCase()) || (b.phone || '').includes(search) || orderId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const summary = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = filteredByCity.filter(b => b.status === s).length;
    return acc;
  }, {});

  const totalRevenue = filteredByCity.reduce((acc, b) => {
    const isPaid = ['paid','success'].includes((b.payment_status||'').toLowerCase());
    if (!isPaid) return acc;
    const val = parseFloat(b.price) || parseFloat(b.total_amount) || 0;
    return acc + (val > 1000000 ? 0 : val);
  }, 0);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading orders...</div>;

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', padding: '20px', borderRadius: '18px', color: '#fff' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.8 }}>REVENUE ({cityFilter.toUpperCase()})</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '4px' }}>₹{totalRevenue.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '0.75rem', marginTop: '8px', opacity: 0.9 }}>From {filteredByCity.filter(b => ['paid','success'].includes((b.payment_status||'').toLowerCase())).length} paid orders</div>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>ACTIVE ORDERS</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '4px' }}>{summary['In Progress'] || 0}</div>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>PENDING ACTION</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '4px', color: '#ea580c' }}>{summary['Pending'] || 0}</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', gap: '4px' }}>
            {['all', 'Bengaluru', 'Nagpur'].map(city => (
              <button key={city} onClick={() => setCityFilter(city)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: cityFilter === city ? '#fff' : 'transparent', fontWeight: 700, cursor: 'pointer' }}>{city === 'all' ? 'All Cities' : city}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
             <button onClick={fetchBookings} style={{ padding: '8px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '9px', cursor: 'pointer', fontWeight: 700 }}><Clock size={16} /> Refresh</button>
             <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '9px' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {[{ k: 'all', label: 'All', count: filteredByCity.length }, ...STATUS_OPTIONS.map(s => ({ k: s, label: s, count: summary[s] }))].map(({ k, label, count }) => (
            <button key={k} onClick={() => setStatusFilter(k)} style={{ padding: '6px 14px', borderRadius: '99px', border: statusFilter === k ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0', background: statusFilter === k ? '#eff6ff' : '#fff', color: statusFilter === k ? '#2563eb' : '#64748b', fontWeight: 700, cursor: 'pointer' }}>{label} {count}</button>
          ))}
        </div>

        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['ID', 'Product', 'Customer', 'Location', 'Amount', 'Status', 'Actions'].map(h => <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, idx) => {
                const ss = getStatusStyle(b.status);
                const items = Array.isArray(b.items) ? b.items : (() => { try { return JSON.parse(b.items || '[]'); } catch(e) { return []; } })();
                return (
                  <tr key={`${b.id}-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 800, color: '#1e40af' }}>{formatOrderId(b.id, b.created_at, b.daily_sequence)}</td>
                    <td style={{ padding: '12px' }}>{items?.length > 0 ? items.map(i => i.title).join(', ') : 'Service'}</td>
                    <td style={{ padding: '12px' }}>{b.customer_name || 'Guest'}<br/><small>{b.phone}</small></td>
                    <td style={{ padding: '12px' }}><div style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' }}>{getCity(b.address)}</div><br/><small>{b.address}</small></td>
                    <td style={{ padding: '12px', fontWeight: 900 }}>₹{Number(b.price || b.total_amount || 0).toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>
                      <select value={b.status} onChange={e => handleStatusChange(b.id, e.target.value)} style={{ background: ss.bg, color: ss.color, border: 'none', padding: '4px 8px', borderRadius: '99px', fontWeight: 700 }}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {b.status === 'Pending' && <button onClick={() => setAssignModal(b)} style={{ padding: '6px 12px', background: '#eff6ff', color: '#2563eb', border: '1.5px solid #2563eb', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>Assign</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {assignModal && (
        <div onClick={e => e.target === e.currentTarget && setAssignModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Assign Partner</h3>
              <button onClick={() => setAssignModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24}/></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {partners.filter(p => cityFilter === 'all' || (p.current_location || '').toLowerCase().includes(cityFilter.toLowerCase())).map(p => (
                <div key={p.id} onClick={() => handleAssignPartner(assignModal.id, p.id)} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                  <div><strong>{p.name}</strong><br/><small>{p.profession} · {p.current_location}</small></div>
                  {assigning ? '...' : <UserCheck size={20} color="#2563eb" />}
                </div>
              ))}
            </div>
            {assignError && <div style={{ color: 'red', marginTop: '10px' }}>{assignError}</div>}
          </div>
        </div>
      )}
    </>
  );
};

export default OrdersManager;
