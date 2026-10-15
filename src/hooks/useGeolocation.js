import { useState, useCallback } from "react";

/**
 * Custom hook to manage GPS device location fetching,
 * loading states, and coordinate updates.
 */
export function useGeolocation(defaultCoords = { lat: 15.2894, lng: 120.5718 }) {
  const [coords, setCoords] = useState(defaultCoords);
  const [isLoading, setIsLoading] = useState(false);
  const [geoError, setGeoError] = useState("");

  const requestLocation = useCallback(
    (onSuccess, onError) => {
      if (!navigator.geolocation) {
        setGeoError("Geolocation is not supported by your browser.");
        if (onError) onError();
        return;
      }

      setIsLoading(true);
      setGeoError("");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords = {
            lat: Number(position.coords.latitude.toFixed(5)),
            lng: Number(position.coords.longitude.toFixed(5)),
          };
          setCoords(newCoords);
          setIsLoading(false);
          if (onSuccess) onSuccess(newCoords);
        },
        (error) => {
          setIsLoading(false);
          setGeoError(error.message || "Failed to retrieve location.");
          if (onError) onError(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    },
    []
  );

  return {
    coords,
    setCoords,
    isLoading,
    geoError,
    requestLocation,
  };
}
