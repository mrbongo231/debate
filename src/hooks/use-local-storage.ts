'use client';

import { useState, useEffect, useCallback } from 'react';

function getInitialValue<T>(key: string, initialValue: T): T {
    // This function should only run on the client.
    if (typeof window === 'undefined') {
        return initialValue;
    }
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
    } catch (error) {
        console.warn(`Error reading localStorage key “${key}”:`, error);
        return initialValue;
    }
}


// A server-safe implementation of useLocalStorage.
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  
  // We only want to access localStorage on the client side, and only after the component has mounted.
  useEffect(() => {
    setStoredValue(getInitialValue(key, initialValue));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    // The actual update logic
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);

    // This should only run on the client.
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Dispatch event so other instances of the hook are updated
        window.dispatchEvent(new Event("local-storage"));
      } catch (error) {
         console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    }
  };
  
  const handleStorageChange = useCallback(() => {
    if (typeof window !== 'undefined') {
       setStoredValue(getInitialValue(key, initialValue));
    }
  }, [key, initialValue]);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener("storage", handleStorageChange);
      window.addEventListener("local-storage", handleStorageChange);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("local-storage", handleStorageChange);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleStorageChange]);


  return [storedValue, setValue];
}
