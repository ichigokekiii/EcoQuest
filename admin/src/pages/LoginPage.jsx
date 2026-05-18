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
      } else if (error.code === 'auth/operation-not-allowed') {
        setErrorMessage('Google sign-in is not enabled in Firebase Authentication console.');
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
          <div className="mb-6 flex items-center gap-3.5">
            <img
              alt=""
              aria-hidden="true"
              className="h-12 w-12 shrink-0 rounded-[14px] shadow-sm"
              src="/eco-logo-mint.svg"
            />
            <div>
              <p className="mb-0.5 text-sm font-semibold text-gray-500">Welcome back</p>
              <h1 className="m-0 text-[1.65rem] font-extrabold leading-tight tracking-tight text-gray-900">
                Sign in to Admin
              </h1>
            </div>
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="auth-field">
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

            <label className="auth-field">
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

            {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}

            <button className="auth-submit" disabled={submitting} type="submit">
              {submitting ? 'Signing in...' : 'Log In'}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
            <span className="h-px flex-1 bg-gray-200" />
            <span>or</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <GoogleSignInButton disabled={submitting} onClick={handleGoogleSignIn} />

          <p className="mt-4 text-center text-sm text-gray-500">
            Need an account?{' '}
            <Link className="font-bold text-mint" to="/register">
              Create one
            </Link>
          </p>
        </div>

        <footer className="absolute bottom-5 left-0 right-0 flex justify-between px-8 text-xs text-gray-400">
          <span>© 2026 Eco Quest</span>
          <span>Admin Console</span>
        </footer>
      </section>
    </main>
  );
}
