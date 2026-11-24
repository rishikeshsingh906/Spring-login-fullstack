import { createContext, useContext, useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { authApi } from "./api";

const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  async function refreshUser() {
    try {
      const current = await authApi.me();
      setUser({ name: current.name, email: current.email });
      return current;
    } catch {
      setUser(null);
      return null;
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  const value = {
    user,
    checking,
    setUser,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function AppShell() {
  const { user, checking } = useAuth();
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark">S</span>
          <span>Session<span className="brand-light">Auth</span></span>
        </Link>
        <div className="topbar-right">
          {checking ? (
            <span className="muted small">Checking session…</span>
          ) : user ? (
            <>
              <span className="signed-in">Signed in as {user.name}</span>
              <Link className="nav-link" to="/dashboard">Dashboard</Link>
            </>
          ) : (
            <>
              <Link className="nav-link" to="/login">Login</Link>
              <Link className="nav-cta" to="/signup">Create account</Link>
            </>
          )}
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<GuestOnly><SignupPage /></GuestOnly>} />
          <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="footer">
        <span>Spring Boot · Spring Security · React</span>
        <span>Session-based authentication demo</span>
      </footer>
    </div>
  );
}

function HomePage() {
  const { user, checking } = useAuth();
  if (checking) return <Loading />;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><span className="pulse-dot" /> SESSION-BASED AUTHENTICATION</div>
        <h1>Your account.<br /><span>Your session.</span></h1>
        <p className="hero-description">
          A full-stack authentication app powered by Spring Security and HTTP sessions.
          Create an account, sign in, and access your protected dashboard.
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" to="/signup">Get started <span>→</span></Link>
          <Link className="button button-secondary" to="/login">I already have an account</Link>
        </div>
        <div className="feature-row">
          <div><span className="feature-icon">✓</span><span>BCrypt passwords</span></div>
          <div><span className="feature-icon">✓</span><span>HTTP session</span></div>
          <div><span className="feature-icon">✓</span><span>CSRF protection</span></div>
        </div>
      </div>
      <div className="hero-visual">
        <div className="visual-glow" />
        <div className="code-card">
          <div className="code-top"><span /><span /><span /><small>authentication flow</small></div>
          <div className="code-content">
            <div className="code-line"><i>01</i><span className="code-purple">POST</span> <span>/api/auth/login</span></div>
            <div className="code-line indent"><i>02</i><span className="code-muted">email + password</span></div>
            <div className="code-line"><i>03</i><span className="code-green">AuthenticationManager</span></div>
            <div className="code-line"><i>04</i><span className="code-green">SecurityContext</span></div>
            <div className="code-line"><i>05</i><span className="code-yellow">HTTP Session</span></div>
            <div className="code-line"><i>06</i><span className="code-blue">JSESSIONID</span></div>
            <div className="code-line code-success"><i>07</i>✓ Authenticated</div>
          </div>
          <div className="session-pill"><span className="pulse-dot" /> SESSION ACTIVE</div>
        </div>
      </div>
    </section>
  );
}

function AuthCard({ title, subtitle, children, bottom }) {
  return (
    <section className="auth-layout">
      <div className="auth-aside">
        <div className="eyebrow"><span className="pulse-dot" /> SECURE ACCESS</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <div className="aside-note">
          <span className="lock-symbol">⌑</span>
          <div><strong>Your session stays protected</strong><small>Spring Security manages authentication on the server.</small></div>
        </div>
      </div>
      <div className="form-card">
        {children}
        {bottom}
      </div>
    </section>
  );
}

function PasswordField({ label = "Password", value, onChange, autoComplete = "current-password" }) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="field">
      <span>{label}</span>
      <div className="password-wrap">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your password"
          autoComplete={autoComplete}
          required
        />
        <button type="button" className="show-password" onClick={() => setVisible((v) => !v)}>
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </label>
  );
}

function SignupPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      const result = await authApi.signup(form);
      setSuccess(result.message || "Registration successful. Please sign in.");
      setUser(null);
      setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="A few details and you're ready to go."
      bottom={<p className="form-bottom">Already registered? <Link to="/login">Sign in</Link></p>}
    >
      <div className="form-heading"><span className="form-kicker">GET STARTED</span><h2>Sign up</h2><p>Enter your details to create an account.</p></div>
      <form onSubmit={submit} className="auth-form">
        <label className="field"><span>Full name</span><input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" autoComplete="name" required /></label>
        <label className="field"><span>Email address</span><input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
        <PasswordField label="Password" value={form.password} onChange={(v) => update("password", v)} autoComplete="new-password" />
        <p className="field-hint">Use at least 8 characters.</p>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        {success && <div className="alert alert-success" role="status">{success}</div>}
        <button className="button button-primary button-full" disabled={busy}>{busy ? "Creating account…" : "Create account"} <span>→</span></button>
      </form>
    </AuthCard>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await authApi.login(form);
      setUser({ name: result.name, email: result.email });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue to your secure dashboard."
      bottom={<p className="form-bottom">New here? <Link to="/signup">Create an account</Link></p>}
    >
      <div className="form-heading"><span className="form-kicker">YOUR ACCOUNT</span><h2>Sign in</h2><p>Use your registered email and password.</p></div>
      <form onSubmit={submit} className="auth-form">
        <label className="field"><span>Email address</span><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" autoComplete="email" required /></label>
        <PasswordField value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <button className="button button-primary button-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"} <span>→</span></button>
      </form>
    </AuthCard>
  );
}

function ProtectedRoute({ children }) {
  const { user, checking } = useAuth();
  if (checking) return <Loading />;
  return user ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { user, checking } = useAuth();
  if (checking) return <Loading />;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function DashboardPage() {
  const { user, setUser } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function logout() {
    setBusy(true);
    setError("");
    try {
      await authApi.logout();
      setUser(null);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <section className="dashboard">
      <div className="dashboard-head">
        <div><div className="eyebrow"><span className="pulse-dot" /> PRIVATE AREA</div><h1>Your dashboard</h1><p>You are signed in. This route is protected by your server-side session.</p></div>
        <button className="button button-secondary logout-button" onClick={logout} disabled={busy}>{busy ? "Signing out…" : "Log out"} <span>↗</span></button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="dashboard-grid">
        <article className="profile-card">
          <div className="avatar">{(user?.name || "U").charAt(0).toUpperCase()}</div>
          <span className="profile-label">SIGNED-IN USER</span>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <div className="status-chip"><span className="pulse-dot" /> Authenticated</div>
        </article>
        <article className="info-card">
          <span className="card-overline">SESSION DETAILS</span>
          <h3>You're securely connected.</h3>
          <p>Spring Security has authenticated your credentials and saved the SecurityContext in an HTTP session.</p>
          <div className="detail-row"><span>Authentication</span><strong>Session-based</strong></div>
          <div className="detail-row"><span>Server</span><strong>Spring Boot</strong></div>
          <div className="detail-row"><span>Protected API</span><strong>/api/auth/me</strong></div>
        </article>
      </div>
      <div className="dashboard-footnote"><span>✓</span> Refresh this page: your browser sends the session cookie and the backend checks your authentication again.</div>
    </section>
  );
}

function Loading() {
  return <div className="loading"><span className="spinner" /> Checking your session…</div>;
}

function NotFound() {
  return <section className="not-found"><h1>Page not found</h1><Link to="/">Back to home</Link></section>;
}

export default function App() {
  return <AuthProvider><AppShell /></AuthProvider>;
}
