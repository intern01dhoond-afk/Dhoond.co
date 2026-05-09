import React, { useState, useEffect } from 'react';
import { Package, Search, ChevronDown, UserCheck, X, CheckCircle2 } from 'lucide-react';
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

const getPaymentStyle = (s) => PAYMENT_STYLES[s] || { bg: '#f1f5f9', color: '#64748b' };
const getStatusStyle  = (s) => STATUS_STYLES[s]  || { bg: '#f1f5f9', color: '#64748b' };

const formatDate = (iso) => iso
  ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—';

const OrdersManager = () => {
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updating, setUpdating]   = useState(null);

  // Assign Partner modal
  const [partners, setPartners]         = useState([]);
  const [assignModal, setAssignModal]   = useState(null); // order object being assigned
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
      if (!res.ok) throw new Error(`Server Error (${res.status})`);
      const data = await res.json();
      setBookings(Array.isArray(data.data) ? data.data : []);
    } catch (e) { 
      setError(e.message === 'Failed to fetch' ? 'Connection Error: Could not reach backend' : e.message); 
    }
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
    } catch (e) { console.error('Failed to load partners', e); }
  };

  useEffect(() => { fetchBookings(); fetchPartners(); }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id);
    try {
      const user = JSON.parse(localStorage.getItem('dhoond_user') || '{}');
      const res  = await fetch(`${API_URL}/api/admin/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
      }
    } catch (e) { console.error(e); }
    finally { setUpdating(null); }
  };

  const handleAssignPartner = async (orderId, partnerId) => {
    setAssigning(true);
    setAssignError('');
    try {
      const user = JSON.parse(localStorage.getItem('dhoond_user') || '{}');
      const res  = await fetch(`${API_URL}/api/admin/bookings/${orderId}/partner`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
        body: JSON.stringify({ partner_id: partnerId })
      });
      const data = await res.json();
      if (res.ok) {
        setBookings(prev => prev.map(b =>
          b.id === orderId ? { ...b, partner_id: partnerId, status: 'Confirmed' } : b
        ));
        setAssignModal(null);
      } else {
        setAssignError(data.error || 'Failed to assign partner');
      }
    } catch (e) { setAssignError(e.message); }
    finally { setAssigning(false); }
  };

  const filtered = bookings.filter(b => {
    const orderId = formatOrderId(b.id, b.created_at, b.daily_sequence).toLowerCase();
    const matchSearch = b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.phone?.includes(search) ||
      String(b.id).includes(search) ||
      orderId.includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Summary counts
  const summary = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = bookings.filter(b => b.status === s).length;
    return acc;
  }, {});

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px', color: '#64748b' }}>
      <div style={{ width: '24px', height: '24px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      Loading orders…
    </div>
  );

  if (error) return <div style={{ padding: '20px', background: '#fef2f2', borderRadius: '12px', color: '#dc2626', fontWeight: 600 }}>⚠️ {error}</div>;

  return (
    <div>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#0f172a' }}>All Orders</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>{bookings.length} total orders</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              placeholder="Search name, phone, ID…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '32px', paddingRight: '12px', paddingTop: '9px', paddingBottom: '9px', border: '1px solid #e2e8f0', borderRadius: '9px', fontSize: '14px', outline: 'none', background: '#f8fafc', width: '220px' }}
            />
          </div>
        </div>
      </div>

      {/* STATUS SUMMARY PILLS */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {[{ k: 'all', label: 'All', count: bookings.length }, ...STATUS_OPTIONS.map(s => ({ k: s, label: s, count: summary[s] }))].map(({ k, label, count }) => {
          const active = statusFilter === k;
          const style  = getStatusStyle(k);
          return (
            <button key={k} onClick={() => setStatusFilter(k)} style={{
              padding: '6px 14px', borderRadius: '99px', border: active ? `1.5px solid ${style.color}` : '1.5px solid #e2e8f0',
              background: active ? style.bg : '#fff', color: active ? style.color : '#64748b',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              {label}
              <span style={{ background: active ? `${style.color}22` : '#f1f5f9', color: active ? style.color : '#64748b', fontSize: '11px', fontWeight: 800, padding: '1px 6px', borderRadius: '99px', minWidth: '20px', textAlign: 'center' }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* TABLE */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
          <Package size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <p style={{ fontWeight: 600 }}>No orders found</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '880px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Order ID', 'Product', 'Customer', 'Location', 'Amount', 'Method', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '13px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, idx) => {
                const ss = getStatusStyle(b.status);
                const ps = getPaymentStyle(b.payment_status);
                return (
                  <tr key={b.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#1e40af', fontSize: '14px' }}>
                      {formatOrderId(b.id, b.created_at, b.daily_sequence)}
                    </td>
                    <td style={{ padding: '14px 16px', maxWidth: '200px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={b.items?.map(i => i.title).join(', ')}>
                        {b.items?.length > 0 ? b.items.map(i => i.title).join(', ') : '—'}
                      </div>
                      {b.items?.length > 1 && <div style={{ fontSize: '10px', color: '#2563eb', fontWeight: 700 }}>+{b.items.length - 1} more items</div>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{b.customer_name || '—'}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{b.phone}</div>
                    </td>
                    <td style={{ padding: '14px 16px', maxWidth: '180px' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={b.address}>
                        {b.address || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>
                      ₹{Number(b.paid_amount ?? b.total_amount).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {b.payment_method
                        ? <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', textTransform: 'capitalize', border: '1px solid #e2e8f0' }}>{b.payment_method}</span>
                        : <span style={{ color: '#cbd5e1', fontSize: '12px' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {(() => { const isPaid = ['paid','success'].includes((b.payment_status||'').toLowerCase()); return (
                        <span style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 700, background: isPaid ? '#f0fdf4' : '#fef2f2', color: isPaid ? '#16a34a' : '#ef4444' }}>
                          {isPaid ? 'Paid' : (b.payment_status || 'Unpaid')}
                        </span>
                      ); })()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {/* Editable status dropdown */}
                      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                        <select
                          value={b.status || 'Pending'}
                          disabled={updating === b.id}
                          onChange={e => handleStatusChange(b.id, e.target.value)}
                          style={{
                            padding: '5px 28px 5px 10px', borderRadius: '99px', border: `1.5px solid ${ss.color}44`,
                            background: ss.bg, color: ss.color, fontWeight: 700, fontSize: '12px',
                            cursor: 'pointer', appearance: 'none', outline: 'none',
                            opacity: updating === b.id ? 0.5 : 1
                          }}
                        >
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={12} style={{ position: 'absolute', right: '8px', pointerEvents: 'none', color: ss.color }} />
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b' }}>
                      {formatDate(b.created_at)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {b.status === 'Pending' ? (
                        <button
                          onClick={() => { setAssignModal(b); setAssignError(''); }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '7px 14px', borderRadius: '8px', border: '1.5px solid #2563eb',
                            background: '#eff6ff', color: '#2563eb', fontWeight: 700,
                            fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background='#2563eb'; e.currentTarget.style.color='#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#2563eb'; }}
                        >
                          <UserCheck size={14} /> Assign Partner
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#cbd5e1' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ASSIGN PARTNER MODAL */}
      {assignModal && (
        <div onClick={e => e.target === e.currentTarget && setAssignModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '560px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 64px rgba(0,0,0,0.2)' }}>

            {/* Modal Header */}
            <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={20} color="#2563eb" /> Assign Partner
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                  Order: <strong>{formatOrderId(assignModal.id, assignModal.created_at, assignModal.daily_sequence)}</strong> — {assignModal.customer_name}
                </p>
              </div>
              <button onClick={() => setAssignModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}>
                <X size={22} />
              </button>
            </div>

            {/* Partner List */}
            <div style={{ overflowY: 'auto', padding: '20px 28px 28px' }}>
              {partners.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                  <UserCheck size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p style={{ fontWeight: 600 }}>No partners available</p>
                  <p style={{ fontSize: '13px' }}>Add partners first from the Partners tab</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {partners.map(p => (
                    <div key={p.id}
                      onClick={() => !assigning && handleAssignPartner(assignModal.id, p.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '16px 20px', borderRadius: '14px', border: '1.5px solid #e2e8f0',
                        cursor: assigning ? 'not-allowed' : 'pointer', background: '#fff',
                        transition: 'all 0.15s', opacity: assigning ? 0.6 : 1
                      }}
                      onMouseEnter={e => { if (!assigning) { e.currentTarget.style.borderColor='#2563eb'; e.currentTarget.style.background='#eff6ff'; }}}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.background='#fff'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {/* Avatar */}
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', flexShrink: 0 }}>
                          {(p.name || 'P').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>{p.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', textTransform: 'capitalize' }}>
                            {p.profession || 'General'} · {p.current_location || 'Location N/A'}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700,
                          background: p.work_status === 'idle' ? '#f0fdf4' : '#fff7ed',
                          color: p.work_status === 'idle' ? '#16a34a' : '#ea580c'
                        }}>
                          {p.work_status === 'idle' ? 'Available' : p.work_status || 'Unknown'}
                        </span>
                        <CheckCircle2 size={18} color="#2563eb" style={{ opacity: 0.4 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {assignError && (
                <div style={{ marginTop: '16px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', fontWeight: 600 }}>
                  ⚠️ {assignError}
                </div>
              )}

              {assigning && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '16px', color: '#2563eb', fontWeight: 600, fontSize: '14px' }}>
                  <div style={{ width: '18px', height: '18px', border: '2px solid #bfdbfe', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  Assigning partner…
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;
