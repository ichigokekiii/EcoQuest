import { Link } from 'react-router-dom';
import { useState } from 'react';

function AuthBrandPanel() {
  return (
    <aside className="auth-brand-panel">
      <div className="auth-brand-content">
        <img alt="Eco Quest" className="auth-brand-logo" src="/eco-logo.svg" />
        <p className="auth-brand-name">Eco Quest</p>
        <p className="auth-brand-tagline">Clean the world. Manage missions, routes, and rewards.</p>
      </div>
    </aside>
  );
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setInfoMessage(
      'Registration UI is ready. Backend account creation will be connected in a later pass.'
    );
  }

  return (
    <main className="auth-shell">
      <AuthBrandPanel />

      <section className="auth-form-panel">
        <div className="auth-card">
          <p className="auth-card-welcome">Join Eco Quest</p>
          <h1>Create your Account</h1>

          <form className="stack" onSubmit={handleSubmit}>
            <label className="field">
              <span>Full Name</span>
              <input
                autoComplete="name"
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Jamie Santos"
                required
                type="text"
                value={fullName}
              />
            </label>

            <label className="field">
              <span>Email</span>
              <input
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@ecoquest.app"
                required
                type="email"
                value={email}
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                autoComplete="new-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a password"
                required
                type="password"
                value={password}
              />
            </label>

            <label className="field">
              <span>Confirm Password</span>
              <input
                autoComplete="new-password"
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm your password"
                required
                type="password"
                value={confirmPassword}
              />
            </label>

            {errorMessage ? <p className="error">{errorMessage}</p> : null}
            {infoMessage ? <p className="success">{infoMessage}</p> : null}

            <button className="auth-submit" type="submit">
              Create Account
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>

        <footer className="auth-footer">
          <span>© 2026 Eco Quest</span>
          <span>Admin Console</span>
        </footer>
      </section>
    </main>
  );
}
