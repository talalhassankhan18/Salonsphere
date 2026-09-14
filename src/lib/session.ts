// src/lib/session.ts

// Prefix for session keys to avoid conflicts with other localStorage keys
const SESSION_PREFIX = "salon_sphere_";

// Type for valid session keys (extended to include salonId)
type SessionKey = "salon_registration_email" | "selectedPlan" | "salonId";

// Utility to prepend prefix to keys
const getPrefixedKey = (key: SessionKey): string => `${SESSION_PREFIX}${key}`;

/**
 * Sets a value in localStorage with the given key.
 * @param key - The session key (e.g., 'salon_registration_email', 'salonId').
 * @param value - The value to store.
 * @returns True if successful, false if an error occurs.
 */
export const setSession = (key: SessionKey, value: string): boolean => {
  if (typeof window === "undefined") {
    console.warn(
      `setSession: localStorage is not available in this environment for key: ${key}`
    );
    return false;
  }

  try {
    localStorage.setItem(getPrefixedKey(key), value);
    return true;
  } catch (error) {
    console.error(`setSession: Error setting ${key} in localStorage:`, error);
    return false;
  }
};

/**
 * Retrieves a value from localStorage by key.
 * @param key - The session key (e.g., 'salon_registration_email', 'salonId').
 * @returns The stored value or null if not found or on error.
 */
export const getSession = (key: SessionKey): string | null => {
  if (typeof window === "undefined") {
    console.warn(
      `getSession: localStorage is not available in this environment for key: ${key}`
    );
    return null;
  }

  try {
    return localStorage.getItem(getPrefixedKey(key));
  } catch (error) {
    console.error(
      `getSession: Error retrieving ${key} from localStorage:`,
      error
    );
    return null;
  }
};

/**
 * Checks if a session key exists in localStorage.
 * @param key - The session key to check.
 * @returns True if the key exists, false otherwise.
 */
export const hasSession = (key: SessionKey): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return localStorage.getItem(getPrefixedKey(key)) !== null;
  } catch (error) {
    console.error(`hasSession: Error checking ${key} in localStorage:`, error);
    return false;
  }
};

/**
 * Removes a specific key from localStorage.
 * @param key - The session key to remove.
 * @returns True if successful, false if an error occurs.
 */
export const clearSession = (key: SessionKey): boolean => {
  if (typeof window === "undefined") {
    console.warn(
      `clearSession: localStorage is not available in this environment for key: ${key}`
    );
    return false;
  }

  try {
    localStorage.removeItem(getPrefixedKey(key));
    return true;
  } catch (error) {
    console.error(
      `clearSession: Error removing ${key} from localStorage:`,
      error
    );
    return false;
  }
};

/**
 * Clears all registration-related session keys from localStorage.
 * @returns True if successful, false if an error occurs.
 */
export const clearAllRegistrationSessions = (): boolean => {
  if (typeof window === "undefined") {
    console.warn(
      "clearAllRegistrationSessions: localStorage is not available in this environment."
    );
    return false;
  }

  try {
    const keys: SessionKey[] = [
      "salon_registration_email",
      "selectedPlan",
      "salonId",
    ];
    keys.forEach((key) => localStorage.removeItem(getPrefixedKey(key)));
    return true;
  } catch (error) {
    console.error(
      "clearAllRegistrationSessions: Error clearing registration sessions:",
      error
    );
    return false;
  }
};

/**
 * Clears all session keys except specified ones.
 * @param excludeKeys - Array of keys to exclude from clearing.
 * @returns True if successful, false if an error occurs.
 */
export const clearAllSessionsExcept = (excludeKeys: SessionKey[]): boolean => {
  if (typeof window === "undefined") {
    console.warn(
      "clearAllSessionsExcept: localStorage is not available in this environment."
    );
    return false;
  }

  try {
    const allKeys: SessionKey[] = [
      "salon_registration_email",
      "selectedPlan",
      "salonId",
    ];
    const keysToClear = allKeys.filter((key) => !excludeKeys.includes(key));
    keysToClear.forEach((key) => localStorage.removeItem(getPrefixedKey(key)));
    return true;
  } catch (error) {
    console.error("clearAllSessionsExcept: Error clearing sessions:", error);
    return false;
  }
};
