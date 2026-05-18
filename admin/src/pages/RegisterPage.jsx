import { Link } from 'react-router-dom';
import { useState } from 'react';

import AuthBrandPanel from '../components/AuthBrandPanel';

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
          <div className="mb-6 flex items-center gap-3.5">
            <img
              alt=""
              aria-hidden="true"
              className="h-12 w-12 shrink-0 rounded-[14px] shadow-sm"
              src="/eco-logo-mint.svg"
            />
            <div>
              <p className="mb-0.5 text-sm font-semibold text-gray-500">Join Eco Quest</p>
              <h1 className="m-0 text-[1.65rem] font-extrabold leading-tight tracking-tight text-gray-900">
                Create your account
              </h1>
            </div>
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="auth-field">
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
                autoComplete="new-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a password"
                required
                type="password"
                value={password}
              />
            </label>

            <label className="auth-field">
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

            {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}
            {infoMessage ? <p className="text-sm text-mint-deep">{infoMessage}</p> : null}

            <button className="auth-submit" type="submit">
              Create Account
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link className="font-bold text-mint" to="/login">
              Log in
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
