import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('dhoond_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Tracks which category group the user chose to checkout
  const [checkoutCategory, setCheckoutCategory] = useState(null);

  React.useEffect(() => {
    localStorage.setItem('dhoond_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (service) => {
    const isConsultation = service.title?.toLowerCase().includes('consultation');
    const qtyToAdd = service.quantity ? Number(service.quantity) : 1;
    setCartItems(prev => {
      const existing = prev.find(item => item.id === service.id);
      if (existing) {
        if (isConsultation) return prev; // Don't add more for consultations
        return prev.map(item => item.id === service.id ? { ...item, quantity: item.quantity + qtyToAdd } : item);
      }
      return [...prev, { ...service, quantity: isConsultation ? 1 : qtyToAdd }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const isConsultation = item.title?.toLowerCase().includes('consultation');
        if (isConsultation && delta > 0) return item; // Block increment
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const clearCart = () => setCartItems([]);

  // Clear only items belonging to a specific category
  const clearCategoryFromCart = (category) => {
    setCartItems(prev => prev.filter(item => item.category !== category));
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.discountPrice * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart, clearCategoryFromCart,
      isCartOpen, setIsCartOpen, totalAmount,
      checkoutCategory, setCheckoutCategory
    }}>
      {children}
    </CartContext.Provider>
  );
};
