import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook to synchronize state with localStorage,
 * with error handling and multi-tab synchronization support.
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item);
      }
      return typeof initialValue === "function" ? initialValue() : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return typeof initialValue === "function" ? initialValue() : initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = typeof value === "function" ? value(prev) : value;
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          window.dispatchEvent(new Event("storage"));
          return valueToStore;
        });
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing updated storage for "${key}":`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}
