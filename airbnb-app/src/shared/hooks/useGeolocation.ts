import { useState, useEffect } from 'react';
import { ENV } from '../../config/env';

interface LocationData {
  city: string;
  country: string;
  formatted: string;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use Mapbox Reverse Geocoding API
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${ENV.MAPBOX_TOKEN}&types=place,country`
          );
          const data = await response.json();
          
          if (data.features && data.features.length > 0) {
            const cityFeature = data.features.find((f: any) => f.place_type.includes('place'));
            const countryFeature = data.features.find((f: any) => f.place_type.includes('country'));
            
            setLocation({
              city: cityFeature ? cityFeature.text : '',
              country: countryFeature ? countryFeature.text : '',
              formatted: data.features[0].place_name
            });
          }
        } catch (err) {
          console.error('Failed to reverse geocode:', err);
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );
  }, []);

  return { location, error, isLoading };
};
