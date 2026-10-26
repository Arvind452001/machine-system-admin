import { authApi } from "../api/authApi";
import { STORAGE_KEY_TOKEN, STORAGE_KEY_USER } from "../api/axiosInstance";

export const DUMMY_CREDENTIALS = [
  {
    email: "admin@machinesystems.com",
    password: "admin123",
    user: {
      id: "6ad9fc20e39daefd54e568db",
      name: "System Administrator",
      email: "admin@machinesystems.com",
      role: "admin",
      company: "MACHINE Systems Headquarters",
      phone: "+1 (555) 019-2831",
      initials: "SA",
    },
  },
  {
    email: "admin@company.com",
    password: "admin123",
    user: {
      id: "usr_02",
      name: "Jordan Miller",
      email: "admin@company.com",
      role: "admin",
      initials: "JM",
    },
  },
];

export const authService = {
  login: async ({ email, password, remember = true }) => {
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    // 1. Try real backend API
    try {
      const response = await authApi.login({
        email: cleanEmail,
        password: cleanPassword,
      });

      const token =
        response?.token ||
        response?.data?.token ||
        response?.accessToken ||
        response?.data?.accessToken;

      if (token || response?.success) {
        if (token) {
          localStorage.setItem(STORAGE_KEY_TOKEN, token);
        }

        let userProfile = response?.user || response?.data?.user;
        if (!userProfile && token) {
          try {
            const meRes = await authApi.getMe();
            userProfile = meRes?.data?.user || meRes?.user || meRes?.data;
          } catch (e) {
            console.warn("Could not fetch getMe profile after admin login:", e);
          }
        }

        const name = userProfile?.name || "Administrator";
        const initials = name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        const userData = {
          ...(userProfile || {}),
          id: userProfile?._id || userProfile?.id || "admin_usr",
          name,
          email: userProfile?.email || cleanEmail,
          role: userProfile?.role || "admin",
          company: userProfile?.company || "MACHINE Systems Headquarters",
          phone: userProfile?.phone || "",
          initials,
          loginAt: new Date().toISOString(),
          remember,
        };

        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
        return {
          success: true,
          token,
          user: userData,
        };
      }
    } catch (apiError) {
      console.warn("Backend admin login failed, checking fallback credentials:", apiError.message);
    }

    // 2. Demo fallback
    const matchedAccount = DUMMY_CREDENTIALS.find(
      (cred) =>
        cred.email.toLowerCase() === cleanEmail && cred.password === cleanPassword
    );

    if (!matchedAccount) {
      throw new Error("Invalid work email or password. Access denied.");
    }

    const dummyToken = `dummy_token_${Date.now()}`;
    const userData = {
      ...matchedAccount.user,
      loginAt: new Date().toISOString(),
      remember,
    };

    localStorage.setItem(STORAGE_KEY_TOKEN, dummyToken);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));

    return {
      success: true,
      token: dummyToken,
      user: userData,
    };
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
  },

  getCurrentUser: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem(STORAGE_KEY_TOKEN) || null;
  },

  isAuthenticated: () => {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const user = localStorage.getItem(STORAGE_KEY_USER);
    return Boolean(token && user);
  },
};

export default authService;
