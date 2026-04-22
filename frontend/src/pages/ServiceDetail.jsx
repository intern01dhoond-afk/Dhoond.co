import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Zap, Star, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    fetch(`${apiUrl}/api/V1/services/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => setService(data))
      .catch(err => {
         console.error(err);
         setService({ error: true });
      });
  }, [id, apiUrl]);

  const handleAddToCart = () => {
    addToCart({ ...service, quantity });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handlePayNow = () => {
    addToCart({ ...service, quantity });
    navigate('/shop/cart');
  };

  if (!service) return <div style={{ padding: '5rem', textAlign: 'center' }}>Loading...</div>;

  if (service.error) {
    return (
      <div style={{ padding: '5rem', textAlign: 'center', minHeight: '60vh' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Service Not Found</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>We couldn't locate the service you're looking for (ID: {id}). It may have been relocated or removed.</p>
        <Link to="/shop" style={{ background: '#3076b4', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '99px', textDecoration: 'none', fontWeight: 600 }}>Return to Services</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 5%', minHeight: '60vh' }}>
      
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#666', marginBottom: '2rem' }}>
        <Link to="/shop" style={{ color: '#2a70b2', textDecoration: 'none' }}>All products</Link> <span>/</span>
        <span style={{ color: '#2a70b2', textTransform: 'capitalize' }}>{service.category}</span> <span>/</span>
        <span style={{ color: '#555' }}>{service.title}</span>
      </div>

      <div className="mobile-stack" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* Left: Image */}
        <div style={{ flex: '1 1 320px' }}>
          <div style={{ width: '100%', aspectRatio: '1/1', background: '#f5f5f5', borderRadius: '12px', overflow: 'hidden' }}>
            <img src={service.image || '/ac_tech.png'} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

        {/* Right: Details */}
        <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, color: '#111', margin: '0 0 0.5rem 0' }}>{service.title}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', color: '#2a70b2' }}>
              <Star size={16} />
              <Star size={16} />
              <Star size={16} />
              <Star size={16} />
              <Star size={16} />
            </div>
            <span style={{ color: '#666', fontSize: '0.9rem' }}>(0 review)</span>
          </div>

          <p style={{ color: '#555', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            {service.description} Ensure smooth and reliable operation with our premium verified professionals bringing specialized equipment right to your doorstep.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontWeight: 600, fontSize: '1.5rem', color: '#111' }}>₹ {service.discountPrice.toFixed(2)}</span>
            <span style={{ color: '#888', textDecoration: 'line-through', fontSize: '1rem' }}>₹ {service.originalPrice.toFixed(2)}</span>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #eaeaea', marginBottom: '1.5rem' }} />

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {/* Quantity Pill */}
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '99px', padding: '0.1rem 0.4rem', background: '#fff' }}>
              <button 
                style={{ background: 'transparent', border: 'none', padding: '0.4rem 0.6rem', cursor: 'pointer', color: '#333', fontSize: '1rem' }} 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >-</button>
              <span style={{ minWidth: '24px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 500, color: '#333' }}>{quantity}</span>
              <button 
                style={{ background: 'transparent', border: 'none', padding: '0.4rem 0.6rem', cursor: 'pointer', color: '#333', fontSize: '1rem' }} 
                onClick={() => setQuantity(quantity + 1)}
              >+</button>
            </div>

            {/* Add to Cart */}
            <button 
              onClick={handleAddToCart}
              style={{ flex: '1', background: added ? '#22c55e' : '#3076b4', color: '#fff', border: 'none', padding: '0.75rem 1rem', borderRadius: '99px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', minWidth: '140px', transition: 'background 0.3s' }}
            >
              {added ? (
                <>Added ✓</>
              ) : (
                <><ShoppingCart size={16} fill="currentColor" /> Add</>
              )}
            </button>

            {/* Pay Now */}
            <button 
              onClick={handlePayNow}
              style={{ flex: '1', background: 'transparent', color: '#3076b4', border: '1px solid #3076b4', padding: '0.75rem 1rem', borderRadius: '99px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', minWidth: '140px' }}
            >
              <Zap size={16} fill="currentColor" /> Pay Now
            </button>
          </div>

          <Link to="#" style={{ color: '#555', textDecoration: 'underline', fontSize: '0.9rem' }}>Terms and Conditions</Link>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #eaeaea', marginBottom: '2rem' }} />

      {/* Customer Reviews Accordion */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', paddingBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111', margin: 0 }}>Customer Reviews</h2>
        <Plus size={24} color="#111" />
      </div>

    </div>
  );
};

export default ServiceDetail;
