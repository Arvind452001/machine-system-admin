import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute
 * 
 * Guards dashboard and administrative pages.
 * If user is not authenticated, redirects to /login and saves current location
 * so user can be returned back upon successful login.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-splash-loader" style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "14px",
        background: "#111210",
        color: "#fff",
        fontFamily: "var(--font-sans, inherit)",
      }}>
        <div style={{
          width: "36px",
          height: "36px",
          border: "3px solid rgba(255, 255, 255, 0.15)",
          borderTopColor: "var(--accent, #e47756)",
          borderRadius: "50%",
          animation: "authSpin 0.75s linear infinite",
        }}></div>
        <span style={{ fontSize: "13px", color: "#a5a69f", letterSpacing: "0.04em" }}>
          VERIFYING SESSION...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
