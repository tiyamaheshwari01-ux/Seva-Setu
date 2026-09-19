import { useState } from "react";

/**
 * SevaSetu – Login Page
 *
 * Mocked authentication for prototype.
 * Any non-empty email + password combination logs in successfully.
 * Replace the `handleSubmit` function with a real API call for production.
 */
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = "Email or username is required.";
    } else if (email.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 4) {
      errors.password = "Password must be at least 4 characters.";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setIsLoading(true);

    // ── MOCK AUTH DELAY ────────────────────────────────────────────────────
    // Replace this with a real API call:
    // const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Simulate a wrong-password demo (optional: remove for cleaner demo)
    // if (password === "wrong") { setError("Invalid credentials. Please try again."); setIsLoading(false); return; }

    if (rememberMe) {
      localStorage.setItem("sv_remember_email", email);
    }

    setIsLoading(false);
    onLogin({ email });
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand-area">
          <div className="login-logo-large">
            <span>SV</span>
          </div>
          <h2>SevaSetu</h2>
          <p>AI Merchant Teammate</p>
        </div>
        <div className="login-tagline">
          <h3>Your business data,<br />understood by AI.</h3>
          <p>Get sales insights, tax estimates, and actionable advice — all in one place.</p>
          <div className="login-features">
            <div className="login-feature-pill">📊 Sales Analytics</div>
            <div className="login-feature-pill">🧾 Tax Insights</div>
            <div className="login-feature-pill">🎙️ Voice Assistant</div>
            <div className="login-feature-pill">🤖 AI Teammate</div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo-small">SV</div>
            <div>
              <h1>Welcome to SevaSetu</h1>
              <p>Sign in to your merchant account</p>
            </div>
          </div>

          {error && (
            <div className="login-error-banner">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="login-form">
            <div className={`login-field ${fieldErrors.email ? "has-error" : ""}`}>
              <label htmlFor="sv-email">Email or Username</label>
              <input
                id="sv-email"
                type="text"
                placeholder="merchant@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((prev) => ({ ...prev, email: "" })); }}
                autoComplete="username"
                disabled={isLoading}
              />
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </div>

            <div className={`login-field ${fieldErrors.password ? "has-error" : ""}`}>
              <label htmlFor="sv-password">Password</label>
              <div className="password-input-wrapper">
                <input
                  id="sv-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, password: "" })); }}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            </div>

            <div className="login-options-row">
              <label className="remember-me-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                Remember me
              </label>
              <button type="button" className="forgot-password-link">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className={`login-btn ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="login-spinner"></span>
                  Signing in…
                </>
              ) : (
                "Sign In to SevaSetu"
              )}
            </button>
          </form>

          <div className="login-demo-hint">
            <span>🔐</span>
            <p>
              <strong>Demo mode:</strong> Enter any email and password (4+ characters) to log in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
