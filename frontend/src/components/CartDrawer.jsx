import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'flex-end'
    }}>
      <div style={{
        background: 'var(--bg-main)', width: '400px', maxWidth: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 25px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag /> Your Cart
          </h2>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem' }}>
              <ShoppingBag size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
              <p>Your cart is empty.</p>
              <button className="btn-outline" style={{ marginTop: '1rem' }} onClick={() => { setIsCartOpen(false); navigate('/shop'); }}>
                Browse Services
              </button>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '60px', height: '60px', background: 'var(--bg-card)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <ShoppingBag size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.title}</h4>
                  <div style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '0.5rem' }}>₹{item.discountPrice}</div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-card)', borderRadius: '99px', padding: '0.25rem 0.5rem' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', display: 'flex' }} onClick={() => updateQuantity(item.id, -1)}>
                        <Minus size={16} />
                      </button>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.quantity}</span>
                      <button 
                        style={{ 
                          background: 'none', border: 'none', 
                          cursor: item.title?.toLowerCase().includes('consultation') ? 'not-allowed' : 'pointer', 
                          color: item.title?.toLowerCase().includes('consultation') ? 'var(--text-muted)' : 'var(--text-main)', 
                          display: 'flex', opacity: item.title?.toLowerCase().includes('consultation') ? 0.5 : 1
                        }} 
                        onClick={() => updateQuantity(item.id, 1)}
                        disabled={item.title?.toLowerCase().includes('consultation')}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.875rem', cursor: 'pointer' }} onClick={() => removeFromCart(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 700 }}>
              <span>Total:</span>
              <span style={{ color: 'var(--primary)' }}>₹{totalAmount}</span>
            </div>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }} onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
