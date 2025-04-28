// Simple session management using localStorage
export const setSession = (key: string, value: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
};

export const getSession = (key: string): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
};

export const clearSession = (key: string) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
};

export const clearAllRegistrationSessions = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("salon_registration_email");
    localStorage.removeItem("selectedPlan");
  }
};