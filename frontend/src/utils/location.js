/**
 * Helper to wait for window.google.maps to be ready
 */
export const waitForGoogleMaps = (cb, onFail = () => {}, retries = 30) => {
  if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.Geocoder) {
    cb();
  } else if (retries > 0) {
    setTimeout(() => waitForGoogleMaps(cb, onFail, retries - 1), 300);
  } else {
    console.warn('Google Maps failed to load after retries.');
    onFail();
  }
};

/**
 * Fallback to IP-based location if GPS fails.
 * Priority: localStorage cache → Own backend proxy → ipapi.co (direct)
 */
const detectLocationByIP = async () => {
  // Check cache first
  try {
    const cached = localStorage.getItem('dhoond_ip_location');
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const ONE_HOUR = 60 * 60 * 1000;
      if (Date.now() - timestamp < ONE_HOUR && data.lat && data.lng) {
        return data;
      }
    }
  } catch (e) { /* ignore parse errors */ }

  const buildResult = (city, region, lat, lng) => ({
    label: `${city || 'Unknown City'}, ${region || 'India'}`,
    city: city || 'Unknown City',
    state: region || '',
    sub: `${city || 'Unknown City'}, ${region || 'India'}`,
    lat,
    lng,
    isApproximate: true
  });

  const cacheAndReturn = (result) => {
    localStorage.setItem('dhoond_ip_location', JSON.stringify({ data: result, timestamp: Date.now() }));
    return result;
  };

  // 1. Try own backend proxy (no rate limits, works on HTTPS)
  try {
    const API_BASE = import.meta.env.VITE_API_URL || '';
    const response = await fetch(`${API_BASE}/api/ip-location`);
    if (response.ok) {
      const data = await response.json();
      if (data.latitude && data.longitude) {
        return cacheAndReturn(buildResult(data.city, data.region, data.latitude, data.longitude));
      }
    }
  } catch (e) { console.warn('Backend IP proxy failed:', e.message); }

  // 2. Fallback: ipapi.co (direct, 1000 req/day free)
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (response.ok) {
      const data = await response.json();
      if (data.latitude && data.longitude) {
        return cacheAndReturn(buildResult(data.city, data.region, data.latitude, data.longitude));
      }
    }
  } catch (e) { console.warn('ipapi.co failed:', e.message); }

  throw new Error('All IP location providers failed');
};

/**
 * Detect current location and geocode it using Google Maps
 */
export const detectCurrentLocation = () => {
  const getGPS = (highAccuracy = true) => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        { 
          enableHighAccuracy: highAccuracy, 
          timeout: highAccuracy ? 6000 : 4000, 
          maximumAge: 0 
        }
      );
    });
  };

  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      detectLocationByIP().then(resolve).catch(() => reject(new Error('Geolocation not supported')));
      return;
    }

    // Try High Accuracy first
    getGPS(true)
      .catch((err) => {
        console.warn('High accuracy failed, retrying with low accuracy...', err.message);
        // Retry with lower accuracy - much higher success rate in Meta browsers
        return getGPS(false);
      })
      .then((pos) => {
        const { latitude, longitude } = pos.coords;
        const latLng = { lat: latitude, lng: longitude };

        waitForGoogleMaps(() => {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: latLng }, (results, status) => {
            if (status === 'OK' && results && results.length > 0) {
              const result = results[0];
              const comps = result.address_components || [];
              const find = (types) => {
                const c = comps.find(c => types.some(t => c.types.includes(t)));
                return c ? c.long_name : null;
              };

              resolve({
                label: result.formatted_address || 'My Location',
                city: find(['locality', 'sublocality_level_1', 'administrative_area_level_2']) || '',
                state: find(['administrative_area_level_1']) || '',
                sub: [find(['locality']), find(['administrative_area_level_1'])].filter(Boolean).join(', '),
                lat: latitude,
                lng: longitude,
                isApproximate: false
              });
            } else {
              resolve({
                label: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
                city: 'Unknown City',
                state: '',
                sub: 'Coordinates available',
                lat: latitude,
                lng: longitude,
                isApproximate: false
              });
            }
          });
        }, () => {
          // onFail: If Google Maps geocoder fails to load, fallback to IP detection
          console.warn('Google Maps Geocoder unavailable, using IP fallback.');
          detectLocationByIP().then(resolve).catch(() => reject(new Error('Google Maps failed and IP fallback failed')));
        });
      })
      .catch((err) => {
        console.warn('All GPS attempts failed, using IP fallback:', err.message);
        detectLocationByIP().then(resolve).catch(() => reject(err));
      });
  });
};
export const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const isInsideGeofence = (userLat, userLng, centerLat, centerLng, radius) => {
  if (!userLat || !userLng) return false;
  return getDistance(userLat, userLng, centerLat, centerLng) <= radius;
};
