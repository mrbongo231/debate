'use client';

import { useState, useEffect, useCallback } from 'react';

// This function will only run on the client
function getStoredValue<T>(key: string, initialValue: T): T {
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

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // The `useState` function is now passed a function, which will only be executed on the client during the initial render.
  // This prevents `localStorage` access on the server.
  const [storedValue, setStoredValue] = useState(() => getStoredValue(key, initialValue));
  
  // This effect will run whenever the key changes, and it will re-sync the state with localStorage.
  useEffect(() => {
    setStoredValue(getStoredValue(key, initialValue));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Dispatch a custom event to notify other tabs/windows of the change.
        window.dispatchEvent(new Event('local-storage'));
      }
    } catch (error) {
       console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  };
  
  const handleStorageChange = useCallback(
    (event: StorageEvent | CustomEvent) => {
      // Check for our custom event, or a storage event from another tab.
      if ((event as StorageEvent).key && (event as StorageEvent).key !== key) {
        return;
      }
      setStoredValue(getStoredValue(key, initialValue));
    },
    [key, initialValue]
  );

  useEffect(() => {
    // Listen for storage changes from other tabs.
    window.addEventListener('storage', handleStorageChange);
    // Listen for storage changes from the same tab (our custom event).
    window.addEventListener('local-storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
  }, [handleStorageChange]);


  return [storedValue, setValue];
}
