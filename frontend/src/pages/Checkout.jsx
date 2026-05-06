import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { MapPin, Clock, CreditCard, Tag, Percent, Phone, SquareCheck, Info, X, Calendar, Edit2, CheckCircle2, ShieldCheck, Lock, Smartphone, Building2, ChevronRight, CheckCircle, ChevronLeft } from 'lucide-react';
import { formatOrderId } from '../utils/formatOrderId';
import { detectCurrentLocation } from '../utils/location';
import AuthModal from '../components/AuthModal';

const Checkout = () => {
  const { cartItems: allCartItems, clearCart, clearCategoryFromCart, updateQuantity } = useCart();
  const { user, login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Read which category this checkout is for
  const searchParams = new URLSearchParams(location.search);
  const checkoutCategory = searchParams.get('category');

  // Only show items for this category (or all if no category param)
  const cartItems = checkoutCategory
    ? allCartItems.filter(item => (item.category || 'other') === checkoutCategory)
    : allCartItems;

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Data States
  const [formData, setFormData] = useState({
    phone: user?.mobile || '',
    address: 'Home - 78, 25th Main Rd, near Kamataka Ban...'
  });

  // Keep phone in sync when user changes (e.g. after auth modal)
  useEffect(() => {
    if (user?.mobile && !formData.phone) {
      setFormData(prev => ({ ...prev, phone: user.mobile }));
    }
  }, [user]);

  // Flow Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [arrivalPref, setArrivalPref] = React.useState('direct'); // 'call' | 'direct'
  const [arrivalNote, setArrivalNote] = React.useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Edit States
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Slot States
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [tempDate, setTempDate] = useState('');
  const [tempTime, setTempTime] = useState('');

  // Payment State
  const [status, setStatus] = useState('idle'); // idle, booking, payment, success
  const [selectedPayment, setSelectedPayment] = useState('upi'); // upi, card, netbanking
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [avoidCalling, setAvoidCalling] = useState(true);
  const [paymentError, setPaymentError] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [locating, setLocating] = useState(false);

  const handleFetchLocation = async () => {
    setLocating(true);
    try {
      const loc = await detectCurrentLocation();
      setFormData(prev => ({ ...prev, address: loc.label }));
    } catch (err) {
      alert("Could not fetch location: " + err.message);
    } finally {
      setLocating(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    setIsInitializing(false);
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      setIsAuthModalOpen(false);
    }
  }, [isAuthenticated, authLoading]);

  // Tip State
  const [tipAmount, setTipAmount] = useState(0);
  const [customTip, setCustomTip] = useState('');
  const [isCustomTipping, setIsCustomTipping] = useState(false);

  // Dynamic Date Generation
  const dates = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(now.getDate() + i);
    let dayLabel = "";
    if (i === 0) dayLabel = "Today";
    else if (i === 1) dayLabel = "Tomorrow";
    else dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

    dates.push({
      id: d.toDateString(),
      label: dayLabel,
      date: `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`,
      display: `${dayLabel}, ${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`
    });
  }

  // Dynamic Time Slots
  const allTimeSlots = [
    { label: 'Morning', time: '09:00 AM', hour: 9 },
    { label: 'Midday', time: '11:30 AM', hour: 11.5 },
    { label: 'Afternoon', time: '02:00 PM', hour: 14 },
    { label: 'Evening', time: '04:30 PM', hour: 16.5 },
    { label: 'Late', time: '07:00 PM', hour: 19 }
  ];

  const getAvailableSlots = (dateDisplay) => {
    if (!dateDisplay.startsWith("Today")) return allTimeSlots;
    const currentHour = now.getHours() + (now.getMinutes() / 60);
    return allTimeSlots.filter(slot => slot.hour > (currentHour + 2)); // 2 hour buffer
  };

  // Financial Math
  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.originalPrice || item.discountPrice || 0) * (item.quantity || 1)), 0);
  const totalDiscount = cartItems.reduce((acc, item) => acc + ((Number(item.originalPrice || item.discountPrice || 0) - Number(item.discountPrice || 0)) * (item.quantity || 1)), 0);
  const itemTotal = subtotal - totalDiscount;
  const total = itemTotal; // Alias for JSX consistency
  const inclusiveTax = total - (total / 1.18);
  const netPrice = total - inclusiveTax;
  const finalAmountToPay = total + tipAmount;

  // ─── SUCCESS SCREEN ────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div style={{ padding: '6rem 5%', textAlign: 'center', background: '#f9f9f9', minHeight: '80vh' }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '2rem' }}>
          <div style={{ position: 'absolute', inset: -20, background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', filter: 'blur(10px)' }}></div>
          <CheckCircle2 size={84} color="#10b981" style={{ position: 'relative' }} />
        </div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: '#111' }}>Booking Confirmed!</h2>
        <p style={{ color: '#555', fontSize: '1.2rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>Great! Your professional arrives on <b>{selectedDate}</b> at <b>{selectedTime}</b>.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', maxWidth: '650px', margin: '0 auto 3rem' }}>
          <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Booking ID</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111', margin: 0, letterSpacing: '2px' }}>
              {formatOrderId(confirmedOrder?.id, confirmedOrder?.created_at, confirmedOrder?.daily_sequence)}
            </p>
          </div>
          <div style={{ background: '#111', border: '1px solid #111', borderRadius: '16px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', color: '#fff' }}>
            <h3 style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Service Start OTP</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '8px' }}>{startOtp}</p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Share this with your professional at the door</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => navigate('/')} style={{ background: '#6e42e5', color: '#fff', padding: '1rem 2.5rem', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(110,66,229,0.3)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>Track Booking</button>
          <button onClick={() => navigate('/')} style={{ background: '#fff', color: '#111', padding: '1rem 2.5rem', borderRadius: '12px', border: '1px solid #ddd', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer' }}>Back to Home</button>
        </div>
      </div>
    );
  }

  // ─── RAZORPAY CHECKOUT ─────────────────────────────────────────────────────
  const processFinalBooking = async (dhoondOrderId, paymentId) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';

      console.log("[Checkout] Finalizing booking for Order:", dhoondOrderId, "Payment:", paymentId);

      // 1. Update Order Status to Confirmed
      await fetch(`${apiUrl}/api/V1/orders/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: dhoondOrderId,
          status: 'Confirmed'
        })
      });

      // 2. Create Payment Record (Success)
      const paymentResponse = await fetch(`${apiUrl}/api/V1/payments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: dhoondOrderId,
          amount: finalAmountToPay,
          payment_method: selectedPayment,
          payment_status: 'success',
          transaction_id: paymentId
        })
      });

      const paymentResult = await paymentResponse.json();
      if (!paymentResult.success) {
        console.warn("[Checkout] Payment record failed but order exists:", paymentResult.message);
      }

      // 3. Update UI
      const mockOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setStartOtp(mockOtp);
      setStatus('success');

      if (checkoutCategory) {
        clearCategoryFromCart(checkoutCategory);
      } else {
        clearCart();
      }

      console.log("[Checkout] Sync complete. Success screen triggered.");

    } catch (err) {
      console.error("[Checkout Finalization Error]", err);
      setPaymentError('Payment was successful but we couldn\'t update your order. Please contact support.');
      setStatus('idle');
    }
  };

  const handlePaymentCancellation = async (dhoondOrderId, reason = "Payment Cancelled") => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      console.log("[Checkout] Handling Cancellation for Order:", dhoondOrderId, "Reason:", reason);

      // 1. Update Order to Cancelled
      await fetch(`${apiUrl}/api/V1/orders/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dhoondOrderId, status: 'Cancelled' })
      });

      // 2. Create Failed Payment Record
      await fetch(`${apiUrl}/api/V1/payments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: dhoondOrderId,
          amount: finalAmountToPay,
          payment_method: selectedPayment,
          payment_status: 'cancelled',
          transaction_id: `CANCELLED_${Date.now()}`
        })
      });

      setPaymentError(`Booking request cancelled. No amount was charged.`);
      setStatus('idle');
      setIsPaymentModalOpen(false);
    } catch (err) {
      console.error("[Cancellation Handler Error]", err);
      setStatus('idle');
    }
  };

  const openRazorpayCheckout = async () => {
    if (!window.Razorpay) {
      setPaymentError('Razorpay SDK failed to load. Please check your connection.');
      setStatus('idle');
      return;
    }

    if (finalAmountToPay <= 0) {
      setPaymentError('Invalid payment amount. Please add items to your cart.');
      setStatus('idle');
      return;
    }

    setStatus('booking'); // Show loading state
    const apiUrl = import.meta.env.VITE_API_URL || '';

    try {
      // 1. Create Dhoond Order FIRST (Status: Pending)
      console.log("[Checkout] Creating Dhoond Order record...");
      const dhoondOrderRes = await fetch(`${apiUrl}/api/V1/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || null,
          address: formData.address,
          price: finalAmountToPay,
          platform_fee: 0,
          category_id: null,
          partner_id: null,
          items: cartItems.map(i => ({
            id: i.id,
            title: i.title,
            quantity: i.quantity,
            price: i.discountPrice
          }))
        })
      });
      const dhoondOrderData = await dhoondOrderRes.json();
      if (!dhoondOrderRes.ok || !dhoondOrderData.success) {
        throw new Error(dhoondOrderData.message || 'Failed to initiate order in system');
      }
      const dhoondOrderId = dhoondOrderData.data.id;
      setConfirmedOrder(dhoondOrderData.data);
      console.log("[Checkout] Dhoond Order Created (Pending):", dhoondOrderId);

      // 2. Create Razorpay Order
      console.log("[Checkout] Creating Razorpay matching order...");
      const orderRes = await fetch(`${apiUrl}/api/V1/payments/razorpay-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmountToPay }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.order_id) {
        throw new Error(orderData.message || 'Failed to create payment order');
      }

      console.log("[Checkout] Razorpay Order ID:", orderData.order_id);

      // 3. Open Razorpay with both IDs
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_Sdh2WaT4aYxo9E",
        amount: Math.round(finalAmountToPay * 100),
        currency: "INR",
        name: "Dhoond Services",
        description: "Service Booking Transaction",
        image: "https://dhoond.vercel.app/vite.svg",
        order_id: orderData.order_id,
        handler: function (response) {
          processFinalBooking(dhoondOrderId, response.razorpay_payment_id);
        },
        modal: {
          ondismiss: function () {
            handlePaymentCancellation(dhoondOrderId, "User closed the payment modal");
          }
        },
        prefill: {
          name: user?.name || "Customer",
          email: user?.email || "customer@example.com",
          contact: String(user?.mobile || formData.phone || tempPhone).replace(/\D/g, '').slice(-10)
        },
        theme: {
          color: "#6e42e5"
        },
        notes: {
          dhoond_order_id: String(dhoondOrderId),
          category: checkoutCategory || 'general'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error("[Razorpay] Payment Failed Callback:", response.error);
        handlePaymentCancellation(dhoondOrderId, response.error.description || 'Payment failed at gateway');
      });
      rzp.open();
    } catch (err) {
      console.error("[Razorpay Initialization Error]", err);
      setPaymentError(err.message || "Could not initialize payment gateway.");
      setStatus('idle');
    }
  };

  const handleBook = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select a date and time slot first.');
      return;
    }

    // If user is not logged in, we should handle that too, but assuming they are for now
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    setStatus('payment');
    setPaymentError('');
    console.log("Launching Razorpay for amount:", finalAmountToPay);

    // Ensure modal is closed if it was open
    setIsPaymentModalOpen(false);

    // Open Razorpay immediately
    openRazorpayCheckout();
  };
  const handleVerifyOtp = async () => {
    // Logic moved to AuthModal.jsx
  };

  const handleApplyCustomTip = () => {
    const val = Number(customTip);
    if (val > 0) {
      setTipAmount(val);
      setIsCustomTipping(false);
    }
  };

  const handleConfirmSlot = () => {
    if (tempDate && tempTime) {
      setSelectedDate(tempDate);
      setSelectedTime(tempTime);
      setIsSlotModalOpen(false);
    }
  };

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', paddingBottom: '4rem', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <style>{`
        .checkout-header-img { position: absolute; right: 2%; top: 50%; transform: translateY(-50%); height: 90%; width: auto; object-fit: contain; pointer-events: none; user-select: none; }
        @media (max-width: 600px) { .checkout-header-img { height: 50px; opacity: 0.6; } }
      `}</style>
      {/* Header — dark background + image pinned to the right */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100, overflow: 'hidden',
        padding: '1.25rem 5%',
        background: 'linear-gradient(135deg,#0f172a 0%,#1e3a8a 60%,#2563eb 100%)',
      }}>
        <img
          src="/images/cart nav.png"
          alt=""
          aria-hidden="true"
          className="checkout-header-img"
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.2rem', color: '#fff', maxWidth: '1200px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          Checkout
        </div>
      </div>

      {/* Payment Error Banner */}
      {paymentError && (
        <div style={{
          maxWidth: '1100px', margin: '1rem auto 0', padding: '0 5%'
        }}>
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px',
            padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: '#fee2e2', padding: '0.4rem', borderRadius: '8px', display: 'flex' }}>
                <Info size={18} color="#ef4444" />
              </div>
              <span style={{ color: '#991b1b', fontWeight: 600, fontSize: '0.9rem' }}>{paymentError}</span>
            </div>
            <button onClick={() => setPaymentError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
              <X size={16} color="#991b1b" />
            </button>
          </div>
        </div>
      )}

      <div className="checkout-grid" style={{
        maxWidth: '1100px', margin: '2rem auto', padding: '0 5%', display: 'flex',
        flexDirection: isMobile ? 'column' : 'row', gap: '2rem', alignItems: 'start',
        opacity: (!isAuthenticated || isInitializing) ? 0.3 : 1,
        pointerEvents: (!isAuthenticated || isInitializing) ? 'none' : 'auto',
        filter: (!isAuthenticated || isInitializing) ? 'blur(4px)' : 'none',
        transition: 'all 0.4s ease'
      }}>

        {(!isAuthenticated && !isInitializing) && (
          <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 50, textAlign: 'center', background: '#fff', padding: '2rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '90%', maxWidth: '400px' }}>
            <div style={{ background: '#f5f3ff', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Lock size={28} color="#6e42e5" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111', marginBottom: '0.5rem' }}>Login Required</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Please verify your phone number to view checkout details and proceed with booking.</p>
            <button onClick={() => setIsAuthModalOpen(true)} style={{ width: '100%', background: '#111', color: '#fff', border: 'none', padding: '1rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Verify Now</button>
          </div>
        )}

        {/* FIRST SECTION (ON MOBILE: Summary & Cart) */}
        <div style={{ order: isMobile ? 1 : 2, display: 'flex', flexDirection: 'column', gap: '1rem', width: isMobile ? '100%' : '40%' }}>


          {/* Cart Block - Matched to Image 1 */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #eaeaea', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111', margin: '0 0 1.25rem 0' }}>Painting</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.95rem', color: '#111', fontWeight: 600, lineHeight: 1.4 }}>{item.title}</div>

           
            {/* Cart Block - Matched to Image 1 */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #eaeaea', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111', margin: '0 0 1.25rem 0' }}>Painting</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
                 {cartItems.map((item) => (
                   <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                     <div style={{ flex: 1 }}>
                       <div style={{ fontSize: '0.95rem', color: '#111', fontWeight: 600, lineHeight: 1.4 }}>{item.title}</div>
                     </div>
                     
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                       {/* Counter - Clean style from Image 1 */}
                       <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.15rem' }}>
                          <button style={{ background: 'transparent', border: 'none', width: '24px', height: '24px', cursor: 'pointer', color: '#6e42e5', fontSize: '1rem', fontWeight: 700 }} onClick={() => updateQuantity(item.id, -1)}>-</button>
                          <span style={{ width: '20px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 700, color: '#6e42e5' }}>{item.quantity}</span>
                          <button 
                            style={{ 
                              background: 'transparent', border: 'none', width: '24px', height: '24px', 
                              cursor: item.title?.toLowerCase().includes('consultation') ? 'not-allowed' : 'pointer', 
                              color: item.title?.toLowerCase().includes('consultation') ? '#cbd5e1' : '#6e42e5', 
                              fontSize: '1rem', fontWeight: 700 
                            }} 
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={item.title?.toLowerCase().includes('consultation')}
                          >+</button>
                       </div>
                       
                       {/* Price */}
                       <div style={{ textAlign: 'right', minWidth: '60px' }}>
                         <div style={{ fontSize: '1rem', fontWeight: 800, color: '#111' }}>₹{Number(item.discountPrice || 0).toFixed(0)}</div>
                         {item.originalPrice > item.discountPrice && (
                           <div style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>₹{Number(item.originalPrice || 0).toFixed(0)}</div>
                         )}
                       </div>
                     </div>
                   </div>
                 ))}
              </div>
  
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderTop: '1px solid #f8fafc' }}>
                <div style={{ width: '22px', height: '22px', background: '#111', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <SquareCheck size={14} color="#fff" strokeWidth={3} />
                </div>
                <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>Avoid calling before reaching the location</span>
              </div>
            </div>
  

  
            {/* Detailed Payment Summary - Matched to Image 1 */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
               <div style={{ padding: '1.5rem' }}>
                 <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111', margin: '0 0 1.5rem 0' }}>Payment summary</h3>
                 
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: '#475569', fontWeight: 600, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <span>Item total (Net)</span>
                     <span style={{ color: '#111', fontWeight: 700 }}>₹{netPrice.toFixed(2)}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <span>Taxes (18% GST)</span>
                     <span style={{ color: '#111', fontWeight: 700 }}>₹{inclusiveTax.toFixed(2)}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                     <span style={{ color: '#111', fontWeight: 700 }}>Total amount (Inclusive)</span>
                     <span style={{ color: '#111', fontWeight: 800 }}>₹{total.toFixed(0)}</span>
                   </div>
                   {tipAmount > 0 && (
                     <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6e42e5' }}>
                       <span>Tip for the Professional</span>
                       <span style={{ fontWeight: 700 }}>₹{tipAmount}</span>
                     </div>
                   )}
                   <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #f8fafc', paddingTop: '1rem' }}>
                     <span style={{ color: '#111', fontWeight: 800 }}>Amount to pay</span>
                     <span style={{ color: '#111', fontWeight: 900, fontSize: '1.1rem' }}>₹{finalAmountToPay.toFixed(0)}</span>
                   </div>
                 </div>
  
                 {/* Tip Selector */}
                 <div style={{ marginBottom: '0.5rem' }}>
                   <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111', marginBottom: '1.25rem' }}>Add a tip to thank the Professional</div>
                   <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
                     {[50, 75, 100].map(amt => (
                       <button key={amt} onClick={() => setTipAmount(amt === tipAmount ? 0 : amt)} style={{ padding: '0.75rem 1.5rem', borderRadius: '99px', border: tipAmount === amt ? '2px solid #6e42e5' : '1px solid #e2e8f0', background: tipAmount === amt ? '#f5f3ff' : '#fff', color: tipAmount === amt ? '#6e42e5' : '#111', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
                         ₹{amt}
                       </button>
                     ))}
                     
                     <div style={{ flexShrink: 0 }}>
                       {isCustomTipping ? (
                         <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '2px solid #6e42e5', borderRadius: '99px', padding: '0.2rem 0.5rem 0.2rem 1rem' }}>
                           <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>₹</span>
                           <input type="number" value={customTip} onChange={e => setCustomTip(e.target.value)} autoFocus style={{ width: '40px', border: 'none', outline: 'none', padding: '0.5rem 0.25rem', fontSize: '0.9rem', fontWeight: 700 }} />
                           <button onClick={handleApplyCustomTip} style={{ background: '#6e42e5', color: '#fff', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '99px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>OK</button>
                         </div>
                       ) : (
                         <button onClick={() => setIsCustomTipping(true)} style={{ padding: '0.75rem 1.5rem', borderRadius: '99px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>Custom</button>
                       )}
                     </div>
                   </div>
                 </div>
               </div>
  
               {/* Mobile Sticky Summary Preview */}
               {isMobile && (
                 <div style={{ padding: '1.25rem 1.5rem', background: '#f9fafb', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                     <div style={{ fontSize: '1rem', fontWeight: 900, color: '#111' }}>₹{finalAmountToPay.toFixed(0)}</div>
                     <span onClick={() => window.scrollTo({ bottom: 0, behavior: 'smooth' })} style={{ fontSize: '0.75rem', color: '#6e42e5', fontWeight: 700, cursor: 'pointer' }}>View Breakup</span>
                   </div>
                   <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111' }}>Amount to pay</div>
                 </div>
               )}
            </div>
        </div>
        
        {/* SECOND SECTION (ON MOBILE: Details & Payment) */}
        <div style={{ order: isMobile ? 2 : 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', width: isMobile ? '100% ' : '60%' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            <Tag size={16} fill="currentColor" /> Saving ₹{totalDiscount.toFixed(0)} on this order
          </div>
  
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
             
             {/* 1. Contact Details */}
             <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
               {isEditingPhone ? (
                 <div>
                   <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Phone Number</label>
                   <div style={{ display: 'flex', gap: '1rem' }}>
                     <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }} autoFocus />
                     <button onClick={() => setIsEditingPhone(false)} style={{ background: '#111', color: '#fff', border: 'none', padding: '0 1.5rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Save</button>
                   </div>
                 </div>
               ) : (
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                   <div style={{ display: 'flex', alignItems: 'center' }}>
                     <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '12px', marginRight: '1.25rem', color: '#64748b' }}>
                        <Phone size={22} strokeWidth={2.5} />
                     </div>
                     <div>
                       <div style={{ fontWeight: 800, fontSize: '1rem', color: '#111', marginBottom: '0.1rem' }}>Send booking details to</div>
                       <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>{formData.phone}</div>
                     </div>
                   </div>
                   <button onClick={() => setIsEditingPhone(true)} style={{ background: 'transparent', border: 'none', color: '#6e42e5', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Edit2 size={14}/> Edit</button>
                 </div>
               )}
             </div>
  
              {/* 2. Address Details */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                {isEditingAddress ? (
                  <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                       <label style={{ fontSize: '1.1rem', fontWeight: 900, color: '#111' }}>Address</label>
                       <button onClick={() => setIsEditingAddress(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}><X size={20} /></button>
                    </div>
  
                    {/* THE MAP MOCKUP */}
                    <div style={{ 
                      width: '100%', height: '220px', background: '#f8fafc', borderRadius: '16px', marginBottom: '1.25rem', overflow: 'hidden', position: 'relative',
                      border: '1px solid #e2e8f0'
                    }}>
                       {/* Simplified map look */}
                       <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                          <MapPin size={40} color="#6e42e5" fill="#6e42e533" />
                       </div>
                       <div 
                          onClick={handleFetchLocation}
                          style={{ 
                            position: 'absolute', bottom: '1rem', left: '1rem', background: '#fff', 
                            padding: '0.6rem 1rem', borderRadius: '10px', fontSize: '0.8rem', 
                            fontWeight: 800, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            cursor: locating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                          }}>
                           {locating ? '📍 Locating...' : '📍 Use Current Location'}
                        </div>
                    </div>
  
                    <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows={2} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.95rem', marginBottom: '1.25rem', resize: 'none', outline: 'none' }} placeholder="Door No, Street name..." autoFocus />
                    
                    <button onClick={() => setIsEditingAddress(false)} style={{ width: '100%', background: '#111', color: '#fff', border: 'none', padding: '1.1rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '1rem' }}>Confirm Location</button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {/* Counter - Clean style from Image 1 */}
                    <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.15rem' }}>
                      <button style={{ background: 'transparent', border: 'none', width: '24px', height: '24px', cursor: 'pointer', color: '#6e42e5', fontSize: '1rem', fontWeight: 700 }} onClick={() => updateQuantity(item.id, -1)}>-</button>
                      <span style={{ width: '20px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 700, color: '#6e42e5' }}>{item.quantity}</span>
                      <button
                        style={{
                          background: 'transparent', border: 'none', width: '24px', height: '24px',
                          cursor: item.title?.toLowerCase().includes('consultation') ? 'not-allowed' : 'pointer',
                          color: item.title?.toLowerCase().includes('consultation') ? '#cbd5e1' : '#6e42e5',
                          fontSize: '1rem', fontWeight: 700
                        }}
                        onClick={() => updateQuantity(item.id, 1)}
                        disabled={item.title?.toLowerCase().includes('consultation')}
                      >+</button>
                    </div>

                    {/* Price */}
                    <div style={{ textAlign: 'right', minWidth: '60px' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#111' }}>₹{Number(item.discountPrice || 0).toFixed(0)}</div>
                      {item.originalPrice > item.discountPrice && (
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>₹{Number(item.originalPrice || 0).toFixed(0)}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Expert arrival instruction */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '0.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>Expert Arrival Preference</div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                {[
                  { id: 'direct', label: 'Arrive directly', sub: "Don't call" },
                  { id: 'call', label: 'Call me first', sub: 'Before coming' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setArrivalPref(opt.id)}
                    style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                      padding: '0.65rem 0.5rem',
                      borderRadius: '12px',
                      border: arrivalPref === opt.id ? '2px solid #6e42e5' : '1.5px solid #e2e8f0',
                      background: arrivalPref === opt.id ? '#f5f3ff' : '#fafafa',
                      cursor: 'pointer',
                      transition: 'all 0.18s',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{opt.icon}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: arrivalPref === opt.id ? '#6e42e5' : '#334155' }}>{opt.label}</span>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>{opt.sub}</span>
                  </button>
                ))}
              </div>
              {arrivalPref === 'call' && (
                <div style={{ marginTop: '0.65rem', animation: 'fadeIn 0.2s' }}>
                  <input
                    type="tel"
                    value={arrivalNote}
                    onChange={e => setArrivalNote(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Best number to call (+91 XXXXX)"
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem', fontWeight: 600, outline: 'none', color: '#334155', background: '#fafafa' }}
                    onFocus={e => e.target.style.borderColor = '#6e42e5'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
              )}
              {arrivalPref === 'direct' && (
                <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>
                  <span style={{ fontSize: '0.7rem' }}>✓</span> Expert will head straight to your address
                </div>
              )}
            </div>
          </div>



          {/* Detailed Payment Summary - Matched to Image 1 */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111', margin: '0 0 1.5rem 0' }}>Payment summary</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#475569', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>

                {/* Row 1: MRP strikethrough */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8' }}>Item total</span>
                  <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontWeight: 600 }}>₹{subtotal.toFixed(0)}</span>
                </div>

                {/* Row 2: Promo discount */}
                {totalDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      🏷️ Promotional Discount
                    </span>
                    <span style={{ color: '#059669', fontWeight: 700 }}>− ₹{totalDiscount.toFixed(0)}</span>
                  </div>
                )}

                {/* Divider */}
                <div style={{ borderTop: '1px dashed #e2e8f0' }} />

                {/* Row 3: Base price (excl. GST) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Price (excl. GST)</span>
                  <span style={{ color: '#111', fontWeight: 700 }}>₹{netPrice.toFixed(2)}</span>
                </div>

                {/* Row 4: GST */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    GST <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#64748b', padding: '1px 6px', borderRadius: '6px', fontWeight: 700 }}>18%</span>
                  </span>
                  <span style={{ color: '#111', fontWeight: 700 }}>+ ₹{inclusiveTax.toFixed(2)}</span>
                </div>

                {/* Row 5: Total (inclusive) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1.5px solid #f1f5f9', paddingTop: '0.9rem' }}>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>Total</span>
                  <span style={{ color: '#0f172a', fontWeight: 800 }}>₹{total.toFixed(0)}</span>
                </div>

                {/* Row 6: Tip (optional) */}
                {tipAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#6e42e5' }}>Tip for Professional</span>
                    <span style={{ color: '#6e42e5', fontWeight: 700 }}>+ ₹{tipAmount}</span>
                  </div>
                )}

                {/* Row 7: Amount to pay */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', borderRadius: '12px', padding: '0.9rem 1rem', marginTop: '0.25rem' }}>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}>Amount to Pay</span>
                  <span style={{ color: '#facc15', fontWeight: 900, fontSize: '1.15rem' }}>₹{finalAmountToPay.toFixed(0)}</span>
                </div>
              </div>

              {/* Tip Selector */}
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111', marginBottom: '1rem' }}>Add a tip to thank the Professional</div>

                {/* Preset tip buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: isCustomTipping ? '0.75rem' : 0 }}>
                  {[50, 75, 100].map(amt => (
                    <button
                      key={amt}
                      onClick={() => { setTipAmount(amt === tipAmount ? 0 : amt); setIsCustomTipping(false); }}
                      style={{
                        flex: 1, padding: '0.65rem 0', borderRadius: '10px',
                        border: tipAmount === amt ? '2px solid #6e42e5' : '1px solid #e2e8f0',
                        background: tipAmount === amt ? '#f5f3ff' : '#fff',
                        color: tipAmount === amt ? '#6e42e5' : '#475569',
                        fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      ₹{amt}
                    </button>
                  ))}
                  <button
                    onClick={() => { setIsCustomTipping(v => !v); setCustomTip(''); }}
                    style={{
                      flex: 1, padding: '0.65rem 0', borderRadius: '10px',
                      border: isCustomTipping ? '2px solid #6e42e5' : '1px solid #e2e8f0',
                      background: isCustomTipping ? '#f5f3ff' : '#fff',
                      color: isCustomTipping ? '#6e42e5' : '#475569',
                      fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {isCustomTipping ? 'Cancel' : 'Custom'}
                  </button>
                </div>

                {/* Custom tip input — full width below */}
                {isCustomTipping && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <style>{`
                      .tip-input { -webkit-appearance: none; -moz-appearance: textfield; appearance: none; }
                      .tip-input::-webkit-outer-spin-button, .tip-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                    `}</style>
                    <div id="tip-input-row" style={{ display: 'flex', alignItems: 'center', background: '#fafafa', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '0.3rem 0.3rem 0.3rem 0.9rem', gap: '6px' }}>
                      <span style={{ fontWeight: 700, color: '#475569', flexShrink: 0, fontSize: '0.95rem' }}>₹</span>
                      <input
                        className="tip-input"
                        type="number"
                        min="1"
                        max="500"
                        autoFocus
                        value={customTip}
                        onChange={e => {
                          const raw = e.target.value.replace(/[^0-9]/g, '');
                          const num = Math.min(Number(raw), 500);
                          setCustomTip(num === 0 ? '' : String(num));
                        }}
                        placeholder="Enter amount (max ₹500)"
                        style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', minWidth: 0, padding: '0.45rem 0', boxShadow: 'none' }}
                        onFocus={() => { document.getElementById('tip-input-row').style.borderColor = '#6e42e5'; }}
                        onBlur={() =>  { document.getElementById('tip-input-row').style.borderColor = '#e2e8f0'; }}
                        onKeyDown={e => e.key === 'Enter' && (() => {
                          const val = Math.min(Number(customTip), 500);
                          if (val > 0) { setTipAmount(val); setIsCustomTipping(false); }
                        })()}
                      />
                      <button
                        disabled={!customTip || Number(customTip) <= 0}
                        onClick={() => {
                          const val = Math.min(Number(customTip), 500);
                          if (val > 0) { setTipAmount(val); setIsCustomTipping(false); setCustomTip(''); }
                        }}
                        style={{
                          padding: '0.55rem 1rem', borderRadius: '8px', border: 'none', flexShrink: 0,
                          background: (!customTip || Number(customTip) <= 0) ? '#e2e8f0' : '#6e42e5',
                          color: (!customTip || Number(customTip) <= 0) ? '#94a3b8' : '#fff',
                          fontWeight: 800, fontSize: '0.85rem',
                          cursor: (!customTip || Number(customTip) <= 0) ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s', whiteSpace: 'nowrap'
                        }}
                      >
                        Add Tip
                      </button>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginTop: '0.35rem', paddingLeft: '2px' }}>Max tip: ₹500</div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Sticky Summary Preview */}
            {isMobile && (
              <div style={{ padding: '1.25rem 1.5rem', background: '#f9fafb', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#111' }}>₹{finalAmountToPay.toFixed(0)}</div>
                  <span onClick={() => window.scrollTo({ bottom: 0, behavior: 'smooth' })} style={{ fontSize: '0.75rem', color: '#6e42e5', fontWeight: 700, cursor: 'pointer' }}>View Breakup</span>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111' }}>Amount to pay</div>
              </div>
            )}
          </div>
        </div>

        {/* SECOND SECTION (ON MOBILE: Details & Payment) */}
        <div style={{ order: isMobile ? 2 : 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', width: isMobile ? '100% ' : '60%' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            <Tag size={16} fill="currentColor" /> Saving ₹{totalDiscount.toFixed(0)} on this order
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #eaeaea', overflow: 'hidden' }}>

            {/* 1. Contact Details */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
              {isEditingPhone ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Phone Number</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }} autoFocus />
                    <button onClick={() => setIsEditingPhone(false)} style={{ background: '#111', color: '#fff', border: 'none', padding: '0 1.5rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Save</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '12px', marginRight: '1.25rem', color: '#64748b' }}>
                      <Phone size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#111', marginBottom: '0.1rem' }}>Send booking details to</div>
                      <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>{formData.phone}</div>
                    </div>
                  </div>
                  <button onClick={() => setIsEditingPhone(true)} style={{ background: 'transparent', border: 'none', color: '#6e42e5', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Edit2 size={14} /> Edit</button>
                </div>
              )}
            </div>

            {/* 2. Address Details */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
              {isEditingAddress ? (
                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '1.1rem', fontWeight: 900, color: '#111' }}>Address</label>
                    <button onClick={() => setIsEditingAddress(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}><X size={20} /></button>
                  </div>

                  {/* THE MAP MOCKUP */}
                  <div style={{
                    width: '100%', height: '220px', background: '#f8fafc', borderRadius: '16px', marginBottom: '1.25rem', overflow: 'hidden', position: 'relative',
                    border: '1px solid #e2e8f0'
                  }}>
                    {/* Simplified map look */}
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                      <MapPin size={40} color="#6e42e5" fill="#6e42e533" />
                    </div>
                    <div
                      onClick={handleFetchLocation}
                      style={{
                        position: 'absolute', bottom: '1rem', left: '1rem', background: '#fff',
                        padding: '0.6rem 1rem', borderRadius: '10px', fontSize: '0.8rem',
                        fontWeight: 800, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        cursor: locating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                      }}>
                      {locating ? '📍 Locating...' : '📍 Use Current Location'}
                    </div>
                  </div>

                  <textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} rows={2} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.95rem', marginBottom: '1.25rem', resize: 'none', outline: 'none' }} placeholder="Door No, Street name..." autoFocus />

                  <button onClick={() => setIsEditingAddress(false)} style={{ width: '100%', background: '#111', color: '#fff', border: 'none', padding: '1.1rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '1rem' }}>Confirm Location</button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '12px', marginRight: '1.25rem', color: '#64748b' }}>
                      <MapPin size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#111', marginBottom: '0.1rem' }}>Address</div>
                      <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formData.address}</div>
                    </div>
                  </div>
                  <button onClick={() => setIsEditingAddress(true)} style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', color: '#111' }}>Edit</button>
                </div>
              )}
            </div>

            {/* 3. Slot Selection */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '12px', marginRight: '1.25rem', color: '#64748b' }}>
                    <Clock size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#111', marginBottom: '0.1rem' }}>Slot</div>
                    <div style={{ fontSize: '0.9rem', color: selectedDate ? '#059669' : '#64748b', fontWeight: 700 }}>{selectedDate ? `${selectedDate} at ${selectedTime}` : 'Select a time slot'}</div>
                  </div>
                </div>
                <button onClick={() => setIsSlotModalOpen(true)} style={{ background: 'transparent', border: 'none', color: '#6e42e5', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}>{selectedDate ? 'Change' : 'Select'}</button>
              </div>
            </div>

            {/* 4. Proceed to Pay CTA */}
            <div style={{ padding: '1.5rem', background: '#f8fafc' }}>
              <button
                id="proceed-to-pay-btn"
                onClick={() => {
                  if (status === 'booking' || status === 'payment') return;
                  if (!selectedDate || !selectedTime) {
                    alert('Please select a date and time slot first.');
                    return;
                  }
                  handleBook();
                }}
                disabled={status === 'booking' || status === 'payment'}
                style={{
                  width: '100%', background: (status === 'booking' || status === 'payment') ? '#cbd5e1' : 'linear-gradient(135deg, #6e42e5 0%, #4f29c8 100%)',
                  color: '#fff', padding: '1.25rem', borderRadius: '14px', border: 'none',
                  fontWeight: 800, fontSize: '1.1rem', cursor: (status === 'booking' || status === 'payment') ? 'not-allowed' : 'pointer',
                  boxShadow: (status === 'booking' || status === 'payment') ? 'none' : '0 8px 25px rgba(110,66,229,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                  transition: 'all 0.2s', position: 'relative'
                }}
              >
                {(status === 'booking' || status === 'payment') ? (
                  <>
                    <div className="spinner-small" style={{
                      width: '18px', height: '18px', border: '3px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite'
                    }}></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} /> Proceed to Pay • ₹{finalAmountToPay.toFixed(0)}
                  </>
                )}
              </button>

              <style>{`
                 @keyframes spin { to { transform: rotate(360deg); } }
               `}</style>

              {paymentError && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#b91c1c', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>
                  {paymentError}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600 }}>
                <ShieldCheck size={13} /> Secured by Razorpay
              </div>
            </div>
          </div>

          <div style={{ padding: '0 0.5rem' }}>
            <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#111', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cancellation policy</div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1rem 0', fontWeight: 600 }}>Free cancellations if done more than 12 hrs before the service. A fee will be charged otherwise.</p>
            <span onClick={() => alert("Full policy details stub")} style={{ fontWeight: 800, fontSize: '0.9rem', color: '#6e42e5', cursor: 'pointer' }}>Read full policy</span>
          </div>

        </div>

      </div>

      {/* Date/Time Modal */}
      {isSlotModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s' }}>
          <div className="slot-modal-panel" style={{ background: '#fff', width: '100%', maxWidth: '600px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '2rem', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={20} /> Select Slot</h3>
              <button onClick={() => setIsSlotModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}><X size={18} /></button>
            </div>

            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#555', marginBottom: '0.75rem' }}>Select Date</h4>
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1rem', borderBottom: '1px solid #eee', marginBottom: '1.5rem', scrollbarWidth: 'none' }}>
              {dates.map(d => (
                <button key={d.id} onClick={() => { setTempDate(d.display); setTempTime(''); }} style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', flexShrink: 0, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', background: tempDate === d.display ? '#f5f3ff' : '#fff', border: tempDate === d.display ? '2px solid #6e42e5' : '1px solid #ddd', color: tempDate === d.display ? '#6e42e5' : '#111', transition: 'all 0.2s', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{d.label}</div>
                  <div>{d.date}</div>
                </button>
              ))}
            </div>

            {tempDate && (
              <>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#555', marginBottom: '0.75rem', animation: 'fadeIn 0.3s' }}>Select Time Slot</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '2rem', animation: 'fadeIn 0.3s' }}>
                  {getAvailableSlots(tempDate).length > 0 ? (
                    getAvailableSlots(tempDate).map(slot => (
                      <button key={slot.time} onClick={() => setTempTime(slot.time)} style={{ padding: '1rem', borderRadius: '12px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', background: tempTime === slot.time ? '#f5f3ff' : '#fff', border: tempTime === slot.time ? '2px solid #6e42e5' : '1px solid #ddd', color: tempTime === slot.time ? '#6e42e5' : '#111', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                        <span style={{ fontSize: '1rem' }}>{slot.time}</span>
                        <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{slot.label}</span>
                      </button>
                    ))
                  ) : (
                    <div style={{ gridColumn: '1 / span 2', textAlign: 'center', padding: '1rem', color: '#ef4444', fontWeight: 600, background: '#fef2f2', borderRadius: '12px' }}>
                      No slots available for today. Please select tomorrow.
                    </div>
                  )}
                </div>
              </>
            )}

            <button onClick={handleConfirmSlot} disabled={!tempDate || !tempTime} style={{ width: '100%', padding: '1.25rem', borderRadius: '12px', border: 'none', background: (tempDate && tempTime) ? '#111' : '#e2e8f0', color: (tempDate && tempTime) ? '#fff' : '#94a3b8', fontSize: '1rem', fontWeight: 700, cursor: (tempDate && tempTime) ? 'pointer' : 'not-allowed', transition: 'background 0.3s' }}>
              Proceed to payment
            </button>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={() => {
          setTimeout(() => {
            openRazorpayCheckout();
          }, 500);
        }}
      />

      {/* ─── PAYMENT METHOD POPUP MODAL ─────────────────────────────── */}
      {isPaymentModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1200,
          background: 'rgba(10, 10, 20, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* Backdrop close */}
          <div style={{ position: 'absolute', inset: 0 }} onClick={() => !status.includes('booking') && setIsPaymentModalOpen(false)} />

          <div style={{
            position: 'relative',
            width: '100%', maxWidth: '520px',
            background: '#fff',
            borderTopLeftRadius: '28px', borderTopRightRadius: '28px',
            padding: '2rem 2rem 2.5rem',
            boxShadow: '0 -20px 60px rgba(0,0,0,0.15)',
            animation: 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1)'
          }}>
            {/* Drag handle */}
            <div style={{ width: '40px', height: '4px', background: '#e2e8f0', borderRadius: '99px', margin: '0 auto 1.75rem' }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Choose Payment Method</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, margin: '0.25rem 0 0' }}>Amount: <span style={{ color: '#6e42e5', fontWeight: 800 }}>{'₹'}{finalAmountToPay.toFixed(0)}</span></p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            {/* Payment Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '1.5rem 0' }}>
              {[
                { id: 'upi', Icon: Smartphone, label: 'UPI', sub: 'Google Pay · PhonePe · Paytm · BHIM' },
                { id: 'card', Icon: CreditCard, label: 'Debit / Credit Card', sub: 'Visa · Mastercard · RuPay' },
                { id: 'netbanking', Icon: Building2, label: 'Net Banking', sub: 'All major banks supported' },
              ].map(opt => (
                <div key={opt.id}>
                  <button
                    onClick={() => setSelectedPayment(opt.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '1rem 1.25rem',
                      borderRadius: selectedPayment === opt.id && opt.id === 'upi' ? '16px 16px 0 0' : '16px',
                      border: selectedPayment === opt.id ? '2px solid #6e42e5' : '1.5px solid #e8edf5',
                      borderBottom: selectedPayment === opt.id && opt.id === 'upi' ? '1px solid #e8edf5' : undefined,
                      background: selectedPayment === opt.id ? '#f5f3ff' : '#fafbfc',
                      cursor: 'pointer', transition: 'all 0.18s',
                      textAlign: 'left', width: '100%'
                    }}
                  >
                    <div style={{ width: '44px', height: '44px', background: selectedPayment === opt.id ? '#ede9fe' : '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <opt.Icon size={22} color={selectedPayment === opt.id ? '#6e42e5' : '#64748b'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginTop: '0.1rem' }}>{opt.sub}</div>
                    </div>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                      border: selectedPayment === opt.id ? '6px solid #6e42e5' : '2px solid #e2e8f0',
                      background: '#fff', transition: 'all 0.15s'
                    }} />
                  </button>

                  {/* UPI App Grid - expands when UPI is selected */}
                  {opt.id === 'upi' && selectedPayment === 'upi' && (
                    <div style={{
                      border: '2px solid #6e42e5', borderTop: 'none',
                      borderRadius: '0 0 16px 16px',
                      background: '#faf8ff',
                      padding: '1rem 1.25rem 0.75rem',
                    }}>
                      <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, margin: '0 0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Razorpay will show apps available on your device
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                        {[
                          { name: 'PhonePe', color: '#5F259F', letter: 'Pe', bg: '#f3ebff' },
                          { name: 'Google Pay', color: '#1a73e8', letter: 'G', bg: '#e8f0fe' },
                          { name: 'Paytm', color: '#00BAF2', letter: 'P', bg: '#e6f7ff' },
                          { name: 'BHIM', color: '#1B5E20', letter: 'B', bg: '#e8f5e9' },
                        ].map(app => (
                          <div key={app.name} style={{ textAlign: 'center' }}>
                            <div style={{
                              width: '48px', height: '48px', borderRadius: '14px',
                              background: app.bg, border: `1.5px solid ${app.color}22`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              margin: '0 auto 0.35rem',
                              fontSize: '1rem', fontWeight: 900, color: app.color,
                              letterSpacing: '-0.02em',
                            }}>
                              {app.letter}
                            </div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569', lineHeight: 1.2 }}>{app.name}</div>
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: '0.7rem', color: '#6e42e5', fontWeight: 700, margin: '0.75rem 0 0', textAlign: 'center' }}>
                        + Any other UPI app installed on your phone
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Payment Error Banner */}
            {paymentError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1rem', color: '#991b1b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', textAlign: 'center' }}>
                {paymentError}
              </div>
            )}

            {/* Pay Now button */}
            <button
              id="pay-now-btn"
              onClick={handleBook}
              disabled={status === 'booking' || status === 'payment'}
              style={{
                width: '100%',
                background: (status === 'booking' || status === 'payment')
                  ? '#94a3b8'
                  : 'linear-gradient(135deg, #6e42e5 0%, #4f29c8 100%)',
                color: '#fff', padding: '1.2rem', borderRadius: '16px', border: 'none',
                fontWeight: 800, fontSize: '1.05rem',
                cursor: (status === 'booking' || status === 'payment') ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 25px rgba(110,66,229,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                transition: 'all 0.2s'
              }}
            >
              {(status === 'booking' || status === 'payment') && (
                <div style={{ width: '18px', height: '18px', border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              )}
              {status === 'booking'
                ? 'Creating Booking...'
                : status === 'payment'
                  ? 'Opening Razorpay...'
                  : `Pay Now · ${'₹'}${finalAmountToPay.toFixed(0)}`
              }
            </button>

            {/* Secure note */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem', color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600 }}>
              <ShieldCheck size={13} /> 100% Secured by Razorpay
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        .payment-spinner { border-radius: 50%; }

        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
            padding: 0 4% !important;
            margin-top: 1rem !important;
          }
          .slot-modal-panel {
            padding: 1.5rem !important;
            max-width: 100% !important;
          }
        }

        @media (max-width: 480px) {
          .checkout-grid {
            padding: 0 3% !important;
            gap: 1rem !important;
          }
          .slot-modal-panel {
            padding: 1.25rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
