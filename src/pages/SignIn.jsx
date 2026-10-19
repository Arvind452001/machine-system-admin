import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <Link aria-label="MACHINE Systems home" className="brand" to="/dashboard">
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
                onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="login-form-row">
              <label className="remember-option">
                <input
                  name="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />{" "}
                Remember me
              </label>
            </div>
            <button className="login-submit" type="submit">
              Sign in <i className="bi bi-arrow-right"></i>
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
