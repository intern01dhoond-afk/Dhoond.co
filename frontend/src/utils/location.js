/**
 * Helper to wait for window.google.maps to be ready
 */
export const waitForGoogleMaps = (cb, retries = 20) => {
  if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.Geocoder) {
    cb();
  } else if (retries > 0) {
    setTimeout(() => waitForGoogleMaps(cb, retries - 1), 300);
  }
};

/**
 * Detect current location and geocode it using Google Maps
 */
export const detectCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return reject(new Error('Geolocation not supported'));
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
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

              const label = result.formatted_address || 'My Location';
              const city = find(['locality', 'administrative_area_level_2']) || '';
              const state = find(['administrative_area_level_1']) || '';
              const sub = [city, state].filter(Boolean).join(', ');

              resolve({
                label,
                city,
                state,
                sub,
                lat: latitude,
                lng: longitude
              });
            } else {
              reject(new Error('Geocoding failed: ' + status));
            }
          });
        });
      },
      (err) => {
        reject(err);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
};
