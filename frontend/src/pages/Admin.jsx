import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Package, Settings, 
  TrendingUp, Clock, CheckCircle2, XCircle,
  MoreVertical, Search, Filter, Plus,
  LayoutDashboard, LogOut, ChevronRight, Lock, Briefcase, CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PartnersManager from '../components/PartnersManager';
import ServicesManager from '../components/ServicesManager';
import UsersManager from '../components/UsersManager';
import OrdersManager from '../components/OrdersManager';
import PaymentsManager from '../components/PaymentsManager';
import { formatOrderId } from '../utils/formatOrderId';

const Admin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [authStep, setAuthStep] = useState('none');
  const [adminId, setAdminId] = useState('');
  const [pin, setPin] = useState('');
  const [authError, setAuthError] = useState('');

  const fetchStats = async () => {
    try {
      const userStr = localStorage.getItem('dhoond_user');
      if (!userStr) {
        setAuthStep('pin');
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);
      if (user.role !== 'admin') {
        setError(`Access Denied: You are logged in as "${user.role || 'user'}", but admin role is required.`);
        return;
      }

      // Use relative path by default in production to leverage Vercel rewrites
      const API_URL = import.meta.env.VITE_API_URL || '';
      
      const res = await fetch(`${API_URL}/api/admin/stats`, {
        headers: { 'x-user-id': user.id }
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server Error (${res.status})`);
      }
      
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('[Admin] Fetch error:', err);
      setError(err.message === 'Failed to fetch' 
        ? 'Could not connect to the backend server. Please check if the services are live.'
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleVerifyAdmin = () => {
    if (adminId.toUpperCase() === 'AMEC01' && pin === '1369') {
      login('AMEC Admin', '0000000000', {
        id: 'AMEC01', role: 'admin'
      });
      window.location.reload(); 
    } else {
      setAuthError('Invalid Admin ID or PIN');
    }
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%' }} />
    </div>
  );

  if (authStep === 'pin') return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', background: '#eff6ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#2563eb' }}><Lock size={32}/></div>
        <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Admin Portal</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>Enter your credentials to access</p>
        
        {authError && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', fontWeight: 600 }}>{authError}</div>}
        
        <input 
          type="text" 
          placeholder="Admin ID" 
          value={adminId} 
          onChange={e => setAdminId(e.target.value)} 
          autoFocus 
          style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '16px', boxSizing: 'border-box', marginBottom: '12px', outline: 'none', textAlign: 'center' }}
        />

        <input 
          type="password" 
          placeholder="Admin PIN" 
          value={pin} 
          onChange={e => setPin(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleVerifyAdmin()} 
          style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '16px', boxSizing: 'border-box', marginBottom: '24px', outline: 'none', letterSpacing: '4px', textAlign: 'center' }}
        />
        
        <button onClick={handleVerifyAdmin} style={{ width: '100%', background: '#0f172a', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}>
          Access Admin Panel
        </button>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <h2 style={{ color: '#ef4444' }}>{error.includes('Denied') ? 'Access Denied' : 'Service Unavailable'}</h2>
      <p style={{ color: '#64748b', maxWidth: '500px', margin: '0.5rem auto' }}>{error}</p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '1.5rem' }}>
        <button onClick={() => navigate('/')} style={{ padding: '0.6rem 1.5rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Go Home</button>
        <button onClick={() => { setError(null); setAuthStep('pin'); }} style={{ padding: '0.6rem 1.5rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Use Admin PIN</button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <style>{`
        .sidebar-item { display: flex; alignItems: center; gap: 12px; padding: 12px 16px; border-radius: 12px; cursor: pointer; color: #64748b; transition: all 0.2s; font-weight: 600; text-decoration: none; }
        .sidebar-item:hover { background: #f8fafc; color: #2563eb; }
        .sidebar-item.active { background: #eff6ff; color: #2563eb; }
        .stat-card { background: #fff; padding: 24px; border-radius: 20px; border: 1px solid #e2e8f0; }
        .data-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
        .data-table th { background: #f8fafc; padding: 16px; text-align: left; font-size: 13px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0; }
        .data-table td { padding: 16px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
        .status-badge { padding: 4px 10px; border-radius: 99px; fontSize: 12px; font-weight: 700; }
      `}</style>

      {/* Sidebar */}
      <aside style={{ width: '280px', background: '#fff', borderRight: '1px solid #e2e8f0', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '40px' }}>
          <img src="/logo.png" style={{ height: '40px' }} alt="Logo" />
          <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '8px' }}>Admin Dashboard</p>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={20} /> Overview
          </div>
          <div className={`sidebar-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <Package size={20} /> Orders
          </div>
          <div className={`sidebar-item ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
            <CreditCard size={20} /> Payments
          </div>
          <div className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <Users size={20} /> Users
          </div>
          <div className={`sidebar-item ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
            <Settings size={20} /> Services
          </div>
          <div className={`sidebar-item ${activeTab === 'partners' ? 'active' : ''}`} onClick={() => setActiveTab('partners')}>
            <Briefcase size={20} /> Partners
          </div>
        </nav>

        <button onClick={() => navigate('/')} className="sidebar-item" style={{ marginTop: 'auto', border: 'none', background: 'none', width: '100%' }}>
          <LogOut size={20} /> Back to Site
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111', margin: 0 }}>
              {activeTab === 'overview' ? 'Dhoond Insights' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Managing live platform data</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
             <button style={{ padding: '10px 20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: 700, fontSize: '14px' }}>Export PDF</button>
          </div>
        </header>

        {activeTab === 'overview' && stats && (
          <div>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={24}/></div>
                  <span style={{ color: '#22c55e', fontSize: '12px', fontWeight: 700, background: '#f0fdf4', padding: '4px 8px', borderRadius: '6px' }}>+12%</span>
                </div>
                <p style={{ color: '#64748b', fontWeight: 600, fontSize: '14px', margin: 0 }}>Total Revenue</p>
                <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 0' }}>₹{(stats.summary?.totalRevenue ?? 0).toLocaleString()}</h2>
              </div>
              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={24}/></div>
                </div>
                <p style={{ color: '#64748b', fontWeight: 600, fontSize: '14px', margin: 0 }}>Active Orders</p>
                <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 0' }}>{stats.summary?.totalBookings ?? 0}</h2>
              </div>
              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={24}/></div>
                </div>
                <p style={{ color: '#64748b', fontWeight: 600, fontSize: '14px', margin: 0 }}>Registered Users</p>
                <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 0' }}>{stats.summary?.totalUsers ?? 0}</h2>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                 <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><Clock size={20} color="#6366f1" /> Recent Activities</h3>
                 <button onClick={() => setActiveTab('orders')} style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                   View All Orders →
                 </button>
               </div>
               <table className="data-table">
                 <thead>
                   <tr>
                     <th>Order ID</th>
                     <th>Product</th>
                     <th>Customer</th>
                     <th>Location</th>
                     <th>Status</th>
                     <th>Payment</th>
                     <th>Method</th>
                     <th>Amount</th>
                     <th>Date</th>
                   </tr>
                 </thead>
                 <tbody>
                   {(stats.recentBookings ?? []).map(b => {
                     const isPaid = ['paid','success'].includes((b.payment_status || '').toLowerCase());
                     const statusColors = {
                       Completed:   { bg: '#f0fdf4', color: '#16a34a' },
                       Confirmed:   { bg: '#eff6ff', color: '#2563eb' },
                       'In Progress': { bg: '#faf5ff', color: '#7c3aed' },
                       Cancelled:   { bg: '#fef2f2', color: '#dc2626' },
                     };
                     const sc = statusColors[b.status] || { bg: '#fff7ed', color: '#ea580c' };
                     const items = Array.isArray(b.items) ? b.items : (() => { try { return JSON.parse(b.items || '[]'); } catch(e) { return []; } })();
                     return (
                       <tr key={b.id}>
                         <td style={{ fontWeight: 800, color: '#1e40af', fontSize: '13px', whiteSpace: 'nowrap' }}>{formatOrderId(b.id, b.created_at, b.daily_sequence)}</td>
                         <td>
                           <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px', lineHeight: '1.4', minWidth: '150px' }}>
                             {items?.length > 0 ? items.map(i => i.title).join(', ') : '—'}
                           </div>
                         </td>
                         <td>
                           <div style={{ fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>{b.customer_name}</div>
                           <div style={{ fontSize: '12px', color: '#64748b' }}>{b.phone}</div>
                         </td>
                         <td>
                           <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4', minWidth: '180px' }}>
                             {b.address || '—'}
                           </div>
                         </td>
                         <td>
                           <span className="status-badge" style={{ background: sc.bg, color: sc.color }}>
                             {b.status}
                           </span>
                         </td>
                         <td>
                           <span className="status-badge" style={{ background: isPaid ? '#f0fdf4' : '#fef2f2', color: isPaid ? '#16a34a' : '#ef4444' }}>
                             {isPaid ? 'Paid' : (b.payment_status || 'Unpaid')}
                           </span>
                         </td>
                         <td>
                           {b.payment_method
                             ? <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', textTransform: 'capitalize' }}>{b.payment_method}</span>
                             : <span style={{ color: '#cbd5e1', fontSize: '12px' }}>—</span>
                           }
                         </td>
                         <td style={{ fontWeight: 800, color: '#0f172a' }}>₹{Number(b.paid_amount ?? b.total_amount).toLocaleString()}</td>
                         <td style={{ fontSize: '12px', color: '#94a3b8' }}>
                           {b.created_at ? new Date(b.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'partners' && <PartnersManager />}
        {activeTab === 'services' && <ServicesManager />}
        {activeTab === 'users' && <UsersManager />}
        {activeTab === 'orders' && <OrdersManager />}
        {activeTab === 'payments' && <PaymentsManager />}

        {activeTab !== 'overview' && activeTab !== 'partners' && activeTab !== 'services' && activeTab !== 'users' && activeTab !== 'orders' && activeTab !== 'payments' && (
          <div style={{ background: '#fff', borderRadius: '24px', padding: '100px', textAlign: 'center', color: '#94a3b8', border: '1px dashed #e2e8f0' }}>
            <BarChart3 size={48} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontWeight: 700, margin: 0 }}>Section Coming Soon</h3>
            <p style={{ fontSize: '14px' }}>CRUD management for {activeTab} is being connected to the new routes.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
