import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import { authApi } from "../api/authApi";
import { STORAGE_KEY_USER, STORAGE_KEY_TOKEN } from "../api/axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on first render & sync latest getMe
  useEffect(() => {
    try {
      const storedUser = authService.getCurrentUser();
      const storedToken = authService.getToken();

      if (storedUser && storedToken) {
        setUser(storedUser);
        setToken(storedToken);

        // Fetch fresh profile from backend
        authApi
          .getMe()
          .then((res) => {
            const fresh = res?.user || res?.data?.user || res?.data;
            if (fresh) {
              const name = fresh.name || storedUser.name;
              const initials = name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              const merged = {
                ...storedUser,
                ...fresh,
                initials,
              };
              setUser(merged);
              localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(merged));
            }
          })
          .catch((err) => {
            console.warn("Could not sync getMe in Admin AuthContext:", err.message);
          });
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error("Failed to restore auth session:", err);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async ({ email, password, remember = true }) => {
    const result = await authService.login({ email, password, remember });
    setUser(result.user);
    setToken(result.token);
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await authApi.updateProfile(profileData);
      const updated = res?.user || res?.data?.user || res?.data || profileData;
      const merged = {
        ...user,
        ...updated,
      };
      if (merged.name) {
        merged.initials = merged.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
      }
      setUser(merged);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(merged));
      return { success: true, user: merged };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    loading,
    login,
    logout,
    updateProfile,
    getMe: () => authApi.getMe(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
