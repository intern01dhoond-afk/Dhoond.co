import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  const [locationLabel, setLocationLabel] = useState(() => localStorage.getItem('dhoond_location') || 'Fetching location…');
  const [locationSubtext, setLocationSubtext] = useState(() => localStorage.getItem('dhoond_location_sub') || '');
  const [userLat, setUserLat] = useState(() => parseFloat(localStorage.getItem('dhoond_lat')) || null);
  const [userLng, setUserLng] = useState(() => parseFloat(localStorage.getItem('dhoond_lng')) || null);

  const updateLocation = (label, sub, lat = null, lng = null) => {
    setLocationLabel(label);
    setLocationSubtext(sub);
    setUserLat(lat);
    setUserLng(lng);
    localStorage.setItem('dhoond_location', label);
    localStorage.setItem('dhoond_location_sub', sub);
    if (lat) localStorage.setItem('dhoond_lat', lat);
    if (lng) localStorage.setItem('dhoond_lng', lng);
  };

  const openComingSoon = () => setShowComingSoon(true);
  const closeComingSoon = () => setShowComingSoon(false);

  const openLocation = () => setShowLocationModal(true);
  const closeLocation = () => setShowLocationModal(false);

  return (
    <UIContext.Provider value={{ 
      showComingSoon, openComingSoon, closeComingSoon,
      showLocationModal, openLocation, closeLocation,
      locationLabel, locationSubtext, updateLocation,
      userLat, userLng
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within a UIProvider');
  return context;
};
