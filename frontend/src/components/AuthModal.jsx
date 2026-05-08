import React, { useState, useEffect } from 'react';
import { X, Smartphone, ChevronRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const { login } = useAuth();
  
  const [authStep, setAuthStep] = useState('phone'); // 'phone' | 'otp'
  const [tempPhone, setTempPhone] = useState('');
  const [otpValue, setOtpValue] = useState(['', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setAuthStep('phone');
      setTempPhone('');
      setOtpValue(['', '', '', '']);
      setOtpError('');
    }
  }, [isOpen]);

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (tempPhone.length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    const apiUrl = import.meta.env.VITE_API_URL || '';
    try {
      const res = await fetch(`${apiUrl}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: tempPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setOtpValue(['', '', '', '']);
      setAuthStep('otp');
      startResendTimer();
    } catch (err) {
      setOtpError(err.message || 'Could not send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otp = otpValue.join('');
    if (otp.length < 4) return;
    setOtpLoading(true);
    setOtpError('');
    const apiUrl = import.meta.env.VITE_API_URL || '';
    try {
      const res = await fetch(`${apiUrl}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: tempPhone, otp, name: 'Customer' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      
      // Success — log user in
      login(data.user?.name || 'Customer', tempPhone, {
        id: data.user?.id,
        email: data.user?.email || '',
        role: data.user?.role || 'user',
        created_at: data.user?.created_at || new Date().toISOString(),
      }, data.token);

      setOtpError('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setOtpError(err.message || 'Incorrect OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, animation: 'fadeIn 0.3s' }}>
      <div style={{ background: '#fff', width: '90%', maxWidth: '420px', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #eee', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f8fafc', border: 'none', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer' }}><X size={18} /></button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: '#f5f3ff', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <Smartphone size={32} color="#6e42e5" />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem' }}>{authStep === 'phone' ? 'Phone Verification' : 'Enter OTP'}</h3>
          <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.5 }}>
            {authStep === 'phone'
              ? 'We need to verify your phone number to proceed.'
              : `Enter the 4-digit code sent to +91 ${tempPhone}`}
          </p>
        </div>

        {authStep === 'phone' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: '#111', fontSize: '1rem' }}>+91</span>
              <input
                type="tel"
                placeholder="Enter mobile number"
                value={tempPhone}
                onChange={e => setTempPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                style={{ width: '100%', padding: '1rem 1rem 1rem 3.5rem', borderRadius: '12px', border: '2px solid #eee', fontSize: '1.1rem', fontWeight: 600, outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#6e42e5'}
                onBlur={e => e.target.style.borderColor = '#eee'}
              />
            </div>
            {otpError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem 1rem', color: '#991b1b', fontSize: '0.85rem', fontWeight: 600 }}>
                {otpError}
              </div>
            )}
            <button
              onClick={handleSendOtp}
              disabled={otpLoading}
              style={{ width: '100%', background: otpLoading ? '#94a3b8' : '#111', color: '#fff', padding: '1.1rem', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: otpLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'background 0.2s' }}
            >
              {otpLoading ? 'Sending...' : <><span>Send OTP</span><ChevronRight size={18} /></>}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              {otpValue.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={e => {
                    const val = e.target.value.slice(-1);
                    const newOtp = [...otpValue];
                    newOtp[idx] = val;
                    setOtpValue(newOtp);
                    if (val && idx < 3) document.getElementById(`otp-${idx + 1}`).focus();
                  }}
                  style={{ width: '50px', height: '60px', textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, borderRadius: '12px', border: '2px solid #eee', outline: 'none', transition: 'border-color 0.2s', background: digit ? '#fdfaff' : '#fff' }}
                />
              ))}
            </div>
            {otpError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem 1rem', color: '#991b1b', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>
                {otpError}
              </div>
            )}
            <button
              onClick={handleVerifyOtp}
              disabled={otpLoading || otpValue.join('').length < 4}
              style={{ width: '100%', background: otpLoading ? '#94a3b8' : '#6e42e5', color: '#fff', padding: '1.1rem', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: (otpLoading || otpValue.join('').length < 4) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(110,66,229,0.3)' }}
            >
              {otpLoading ? 'Verifying...' : 'Verify & Proceed'}
            </button>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {resendTimer > 0 ? (
                <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Resend OTP in {resendTimer}s</span>
              ) : (
                <button onClick={handleSendOtp} disabled={otpLoading} style={{ background: 'none', border: 'none', color: '#6e42e5', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>Resend OTP</button>
              )}
              <button onClick={() => { setAuthStep('phone'); setOtpError(''); setOtpValue(['', '', '', '']); }} style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Change Phone Number</button>
            </div>
          </div>
        )}

        <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#999' }}>
          <ShieldCheck size={14} /> 100% Secure Verification
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
