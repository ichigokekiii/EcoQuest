import { Link } from 'react-router-dom';
import { useState } from 'react';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

import AuthBrandPanel from '../components/AuthBrandPanel';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { syncAdminUserProfile } from '../services/adminAuth';
import { auth } from '../services/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      await syncAdminUserProfile(credential.user);
    } catch (error) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        setErrorMessage('Invalid email or password.');
      } else if (error.response?.status === 403) {
        setErrorMessage('This account does not have admin access.');
      } else {
        setErrorMessage(error.response?.data?.message || error.message || 'Unable to sign in.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setSubmitting(true);
    setErrorMessage('');

    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      await syncAdminUserProfile(credential.user);
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Google sign-in was cancelled.');
      } else {
        setErrorMessage(error.response?.data?.message || error.message || 'Unable to sign in with Google.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <AuthBrandPanel />

      <section className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-intro">
            <img alt="" aria-hidden="true" className="auth-card-mark" src="/eco-logo-mint.svg" />
            <div>
              <p className="auth-card-welcome">Welcome back</p>
              <h1>Sign in to Admin</h1>
            </div>
          </div>

          <form className="stack auth-form" onSubmit={handleSubmit}>
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
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                type="password"
                value={password}
              />
            </label>

            {errorMessage ? <p className="error">{errorMessage}</p> : null}

            <button className="auth-submit" disabled={submitting} type="submit">
              {submitting ? 'Signing in...' : 'Log In'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <GoogleSignInButton disabled={submitting} onClick={handleGoogleSignIn} />

          <p className="auth-switch">
            Need an account? <Link to="/register">Create one</Link>
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
