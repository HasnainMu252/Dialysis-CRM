export const storage = {
  get: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error("Storage get error:", error);
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error("Storage set error:", error);
    }
  },
  del: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Storage delete error:", error);
    }
  },
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Storage clear error:", error);
    }
  },
};

export const TOKENS = {
  staff: "token",
  patient: "patientToken",
};

// Helper to check if user is authenticated
export const isAuthenticated = (userType = "staff") => {
  const tokenKey = userType === "patient" ? TOKENS.patient : TOKENS.staff;
  return !!storage.get(tokenKey);
};

// Clear all auth tokens
export const clearAllTokens = () => {
  storage.del(TOKENS.staff);
  storage.del(TOKENS.patient);
};
