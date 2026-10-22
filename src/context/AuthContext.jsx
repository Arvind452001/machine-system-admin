import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on first render
  useEffect(() => {
    try {
      const storedUser = authService.getCurrentUser();
      const storedToken = authService.getToken();

      if (storedUser && storedToken) {
        setUser(storedUser);
        setToken(storedToken);
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

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    loading,
    login,
    logout,
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
