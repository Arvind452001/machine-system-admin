import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DUMMY_CREDENTIALS } from "../services/authService";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick helper for easy demo testing
  const handleUseDemo = (demoAccount) => {
    setEmail(demoAccount.email);
    setPassword(demoAccount.password);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both work email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password, remember });
      // Redirect to original attempted page, or default to dashboard
      const destination = location.state?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid work email or password. Access denied.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <Link aria-label="MACHINE Systems home" className="brand" to="/login">
          <span className="brand-icon">
            <i className="bi bi-asterisk"></i>
          </span>
          <span className="brand-type">
            MACHINE<small>SYSTEMS</small>
          </span>
        </Link>
        <div className="login-story">
          <div className="eyebrow">
            <span className="eyebrow-line"></span>INDUSTRIAL CONFIGURATION
          </div>
          <h1>
            Build better, <span>together.</span>
          </h1>
          <p>
            One workspace for machine configuration, customer enquiries, and
            your global sales team.
          </p>
          <div className="login-machine-image">
            <img
              alt="Industrial engineer inspecting precision machinery"
              src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&amp;fit=crop&amp;w=1000&amp;q=85"
            />
          </div>
        </div>
        <footer>© 2026 Machine Systems</footer>
      </section>

      <section className="login-form-side">
        <div className="login-form-wrap">
          <div className="eyebrow">
            <span className="eyebrow-line"></span>ADMIN &amp; SALES PORTAL
          </div>
          <h2>Welcome back</h2>
          <p>Sign in to manage your configurator workspace.</p>

          {/* Access Denied / Validation Error Alert */}
          {error && (
            <div className="login-error-alert" role="alert">
              <i className="bi bi-shield-x"></i>
              <div className="login-error-content">
                <strong>Access Denied</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email">Work email</label>
              <input
                autoComplete="username"
                id="email"
                name="email"
                placeholder="name@company.com"
                type="email"
                value={email}
                className={error ? "input-has-error" : ""}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                autoComplete="current-password"
                id="password"
                name="password"
                placeholder="Enter your password"
                type="password"
                value={password}
                className={error ? "input-has-error" : ""}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                disabled={isSubmitting}
              />
            </div>
            <div className="login-form-row">
              <label className="remember-option">
                <input
                  name="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  disabled={isSubmitting}
                />{" "}
                Remember me
              </label>
            </div>
            <button className="login-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner-inline"></span> Verifying...
                </>
              ) : (
                <>
                  Sign in <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>
          </form>

       

          <div className="login-support">
            Having trouble signing in?{" "}
            <a href="mailto:support@forgeworks.example">Contact support</a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SignIn;
