import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../utils/firebase';
import { signInWithCustomToken, signOut } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('dhoond_user');
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch {}
    }
    setLoading(false);
  }, []);

  // Call after OTP verify — pass full user object from backend
  const login = async (name, mobileNumber, extras = {}, token = null) => {
    const newUser = { name, mobile: mobileNumber, ...extras };
    
    // If a Firebase Custom Token is provided, sign in to Firebase
    if (token) {
      try {
        await signInWithCustomToken(auth, token);
        console.log('[Auth] Signed into Firebase with custom token');
      } catch (err) {
        console.error('[Auth] Firebase custom token login failed:', err.message);
      }
    }

    setUser(newUser);
    localStorage.setItem('dhoond_user', JSON.stringify(newUser));
  };

  // Update user profile fields without full re-login
  const updateUser = (fields) => {
    setUser(prev => {
      const updated = { ...prev, ...fields };
      localStorage.setItem('dhoond_user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = async () => {
    try { await signOut(auth); } catch {}
    setUser(null);
    localStorage.removeItem('dhoond_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
