/**
 * Authentication Service
 * 
 * Handles login, logout, and user session storage.
 * 
 * ---------------------------------------------------------------------------
 * HOW TO SWITCH FROM DUMMY CREDENTIALS TO REAL BACKEND API:
 * ---------------------------------------------------------------------------
 * 1. In the `login` function below, replace the dummy credential check with
 *    your real API call (e.g., using fetch or axios):
 * 
 *    const response = await fetch("https://api.yourbackend.com/api/v1/auth/login", {
 *      method: "POST",
 *      headers: { "Content-Type": "application/json" },
 *      body: JSON.stringify({ email, password }),
 *    });
 *    const data = await response.json();
 *    if (!response.ok) {
 *      throw new Error(data.message || "Invalid credentials");
 *    }
 *    // save data.user and data.token to localStorage
 * ---------------------------------------------------------------------------
 */

const STORAGE_KEYS = {
  USER: "machine_system_auth_user",
  TOKEN: "machine_system_auth_token",
};

// Dummy allowed credentials
export const DUMMY_CREDENTIALS = [
  {
    email: "admin@machinesystems.com",
    password: "admin123",
    user: {
      id: "usr_01",
      name: "Jordan Miller",
      email: "admin@machinesystems.com",
      role: "Administrator",
      initials: "JM",
    },
  },
  {
    email: "admin@company.com",
    password: "admin123",
    user: {
      id: "usr_02",
      name: "Jordan Miller",
      email: "admin@company.com",
      role: "Administrator",
      initials: "JM",
    },
  },
];

export const authService = {
  /**
   * Login with email and password.
   * Compares against dummy credentials and saves session to localStorage.
   * When integrating real backend, replace this logic with your API request.
   */
  login: async ({ email, password, remember = true }) => {
    // Simulate brief network latency for realistic UX feel
    await new Promise((resolve) => setTimeout(resolve, 350));

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    const matchedAccount = DUMMY_CREDENTIALS.find(
      (cred) =>
        cred.email.toLowerCase() === cleanEmail && cred.password === cleanPassword
    );

    if (!matchedAccount) {
      throw new Error("Invalid work email or password. Access denied.");
    }

    const dummyToken = `dummy_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const userData = {
      ...matchedAccount.user,
      loginAt: new Date().toISOString(),
      remember,
    };

    // Save dummy auth data into localStorage
    localStorage.setItem(STORAGE_KEYS.TOKEN, dummyToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

    return {
      success: true,
      token: dummyToken,
      user: userData,
    };
  },

  /**
   * Log out the current user and clear stored auth data.
   */
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  /**
   * Get the current authenticated user from localStorage.
   */
  getCurrentUser: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Get the current auth token from localStorage.
   */
  getToken: () => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) || null;
  },

  /**
   * Check if a valid session exists in localStorage.
   */
  isAuthenticated: () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return Boolean(token && user);
  },
};
