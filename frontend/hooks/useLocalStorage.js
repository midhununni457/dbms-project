import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(initialValue);
  // Flag to check if the initial load from localStorage has completed
  const [firstLoadDone, setFirstLoadDone] = useState(false);

  /**
   * Effect hook to load the value from `localStorage` when the component mounts.
   * This hook avoids SSR inconsistencies by loading the value only in the browser environment.
   */
  useEffect(() => {
    const fromLocal = () => {
      if (typeof window === "undefined") {
        return initialValue;
      }
      try {
        // Retrieve the stored value from localStorage using the specified key
        const item = window.localStorage.getItem(key);
        // Parse and return the value if found, otherwise return the initial value
        return item ? JSON.parse(item) : initialValue;
      } catch (error) {
        console.error("Error reading localStorage:", error);
        return initialValue;
      }
    };

    // Update the state with the value from localStorage
    setStoredValue(fromLocal());
    // Mark that the first load from localStorage is complete
    setFirstLoadDone(true);
  }, [initialValue, key]);

  /**
   * Effect hook to update `localStorage` whenever the `storedValue` changes.
   * This ensures that any changes to the state are reflected in `localStorage`.
   */
  useEffect(() => {
    // Skip saving to localStorage on the initial load
    if (!firstLoadDone) {
      return;
    }

    try {
      // Store the updated value in localStorage as a string
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
      console.log("Error writing to localStorage:", error);
    }
  }, [storedValue, firstLoadDone, key]);

  // Return the current stored value and the function to update it
  return [storedValue, setStoredValue];
}
