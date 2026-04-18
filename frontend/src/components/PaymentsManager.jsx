import React, { useState, useEffect } from 'react';
import { CreditCard, Search, TrendingUp } from 'lucide-react';
import { formatOrderId } from '../utils/formatOrderId';

const PAYMENT_STATUS_STYLES = {
  success: { bg: '#f0fdf4', color: '#16a34a', label: 'Success' },
  paid:    { bg: '#f0fdf4', color: '#16a34a', label: 'Paid' },
  pending:   { bg: '#fff7ed', color: '#ea580c', label: 'Pending' },
  failed:    { bg: '#fef2f2', color: '#dc2626', label: 'Failed' },
  cancelled: { bg: '#f1f5f9', color: '#64748b', label: 'Cancelled' },
};

const getPayStyle = (s) => PAYMENT_STATUS_STYLES[s?.toLowerCase()] || { bg: '#f1f5f9', color: '#64748b', label: s || '—' };

const formatDate = (iso) => iso
  ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—';

const PaymentsManager = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');

  const API_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('dhoond_user') || '{}');
        const res  = await fetch(`${API_URL}/api/V1/payments/all`, {
          headers: { 'x-user-id': user?.id || '' }
        });
        if (!res.ok) throw new Error(`Server Error (${res.status})`);
        const data = await res.json();
        setPayments(Array.isArray(data.data) ? data.data : []);
      } catch (e) { 
        setError(e.message === 'Failed to fetch' ? 'Connection Error: Backend unreachable' : e.message); 
      }
      finally { setLoading(false); }
    };
    fetchPayments();
  }, []);

  const totalRevenue = payments
    .filter(p => ['success', 'paid'].includes(p.payment_status?.toLowerCase()))
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const filtered = payments.filter(p => {
    const matchSearch = String(p.id).includes(search) ||
      String(p.order_id).includes(search) ||
      p.transaction_id?.toLowerCase().includes(search.toLowerCase()) ||
      p.payment_method?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.payment_status?.toLowerCase() === filter;
    return matchSearch && matchFilter;
  });

  const statusCounts = { success: 0, pending: 0, failed: 0, cancelled: 0 };
  payments.forEach(p => {
    const s = p.payment_status?.toLowerCase();
    if (s === 'success' || s === 'paid') statusCounts.success++;
    else if (s === 'cancelled') statusCounts.cancelled++;
    else if (s === 'pending') statusCounts.pending++;
    else statusCounts.failed++;
  });

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px', color: '#64748b' }}>
      <div style={{ width: '24px', height: '24px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      Loading payments…
    </div>
  );

  if (error) return <div style={{ padding: '20px', background: '#fef2f2', borderRadius: '12px', color: '#dc2626', fontWeight: 600 }}>⚠️ {error}</div>;

  return (
    <div>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#0f172a' }}>Payments</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>{payments.length} total transactions</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            placeholder="Search ID, transaction, method…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '32px', paddingRight: '12px', paddingTop: '9px', paddingBottom: '9px', border: '1px solid #e2e8f0', borderRadius: '9px', fontSize: '14px', outline: 'none', background: '#f8fafc', width: '240px' }}
          />
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Collected', value: `₹${totalRevenue.toLocaleString()}`, icon: <TrendingUp size={20} />, bg: '#eff6ff', color: '#2563eb' },
          { label: 'Successful', value: statusCounts.success, icon: <CreditCard size={20} />, bg: '#f0fdf4', color: '#16a34a' },
          { label: 'Pending / Failed', value: statusCounts.pending + statusCounts.failed, icon: <CreditCard size={20} />, bg: '#fff7ed', color: '#ea580c' },
        ].map(card => (
          <div key={card.label} style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{card.icon}</div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</p>
              <p style={{ margin: '2px 0 0', fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FILTER PILLS */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { k: 'all', label: 'All', count: payments.length },
          { k: 'success',   label: 'Successful', count: statusCounts.success },
          { k: 'pending',   label: 'Pending',    count: statusCounts.pending },
          { k: 'failed',    label: 'Failed',     count: statusCounts.failed },
          { k: 'cancelled', label: 'Cancelled',  count: statusCounts.cancelled || 0 },
        ].map(({ k, label, count }) => {
          const active = filter === k;
          const style  = getPayStyle(k === 'all' ? '' : k);
          return (
            <button key={k} onClick={() => setFilter(k)} style={{
              padding: '6px 14px', borderRadius: '99px', border: active ? `1.5px solid ${style.color}` : '1.5px solid #e2e8f0',
              background: active ? style.bg : '#fff', color: active ? style.color : '#64748b',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              {label}
              <span style={{ background: active ? `${style.color}22` : '#f1f5f9', color: active ? style.color : '#64748b', fontSize: '11px', fontWeight: 800, padding: '1px 6px', borderRadius: '99px' }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* TABLE */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
          <CreditCard size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <p style={{ fontWeight: 600 }}>No payments found</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Payment ID', 'Order ID', 'Amount', 'Method', 'Status', 'Transaction ID', 'Date'].map(h => (
                  <th key={h} style={{ padding: '13px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => {
                const ps = getPayStyle(p.payment_status);
                return (
                  <tr key={p.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#1e40af', fontSize: '14px' }}>#{p.id}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                      {p.order_id ? formatOrderId(p.order_id, p.created_at, p.daily_sequence) : '—'}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>
                      ₹{Number(p.amount || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, background: '#f8fafc', color: '#475569', textTransform: 'capitalize', border: '1px solid #e2e8f0' }}>
                        {p.payment_method || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 700, background: ps.bg, color: ps.color, textTransform: 'capitalize' }}>
                        {ps.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.transaction_id}>
                      {p.transaction_id || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b' }}>
                      {formatDate(p.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentsManager;
