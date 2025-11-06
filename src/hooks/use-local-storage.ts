'use client';

import { useState, useEffect, useCallback } from 'react';

// A custom hook to synchronize state with localStorage, designed to be safe for Server-Side Rendering (SSR).
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Use a state to determine if the component is mounted on the client.
  const [isClient, setIsClient] = useState(false);

  // When the component mounts on the client, set isClient to true.
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize the state. On the server or before hydration, it will be the initialValue.
  // After hydration on the client, it will read from localStorage.
  const [storedValue, setStoredValue] = useState<T>(() => {
    // This part will not run on the server because isClient will be false.
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
  });

  // This effect synchronizes the hook's state with localStorage when the key or isClient status changes.
  useEffect(() => {
    if (isClient) {
        try {
            const item = window.localStorage.getItem(key);
            setStoredValue(item ? JSON.parse(item) : initialValue);
        } catch (error) {
            console.warn(`Error reading localStorage key “${key}”:`, error);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, isClient]);


  // Wrapper for setStoredValue that also persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    // This will only run on the client.
    if (typeof window === 'undefined' || !isClient) {
        console.warn(`Attempted to set localStorage key “${key}” on the server.`);
        return;
    }

    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      // Dispatch a custom event to notify other browser tabs.
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
       console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  };

  const handleStorageChange = useCallback(
    (event: StorageEvent | CustomEvent) => {
      if (!isClient) return;
      if ((event as StorageEvent).key && (event as StorageEvent).key !== key) {
        return;
      }
      try {
        const item = window.localStorage.getItem(key);
        setStoredValue(item ? JSON.parse(item) : initialValue);
      } catch (error) {
        console.warn(`Error handling storage change for key “${key}”:`, error);
      }
    },
    [key, initialValue, isClient]
  );

  useEffect(() => {
    if (isClient) {
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('local-storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('local-storage', handleStorageChange);
        };
    }
  }, [handleStorageChange, isClient]);


  // Return the current value and the setter function.
  // On the server, this will always be the initialValue.
  return [storedValue, setValue];
}
