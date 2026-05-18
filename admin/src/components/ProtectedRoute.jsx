import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import AuthBrandPanel from './AuthBrandPanel';
import { ensureAdminAccess, signOutAdmin } from '../services/adminAuth';

function AccessDeniedScreen({ profile, onSignOut }) {
  return (
    <main className="auth-shell">
      <AuthBrandPanel />
      <section className="auth-form-panel">
        <div className="auth-card auth-access-card">
          <div className="auth-card-intro">
            <img alt="" aria-hidden="true" className="auth-card-mark" src="/eco-logo-mint.svg" />
            <div>
              <p className="auth-card-welcome">Signed in</p>
              <h1>Access denied</h1>
            </div>
          </div>
          <p className="muted auth-access-copy">
            {profile?.email
              ? `${profile.email} does not have admin access yet.`
              : 'This account does not have admin access.'}
          </p>
          <p className="muted auth-access-copy">
            Ask an existing admin to promote your Firestore user role to <strong>admin</strong>, or
            set <code>users/&#123;uid&#125;.role</code> during initial setup.
          </p>
          <button className="auth-submit" onClick={onSignOut} type="button">
            Sign out
          </button>
        </div>
      </section>
    </main>
  );
}

function AdminLoadingScreen() {
  return (
    <main className="auth-shell auth-shell-loading">
      <AuthBrandPanel />
      <section className="auth-form-panel">
        <div className="auth-card auth-loading">
          <div aria-hidden="true" className="auth-loading-spinner" />
          <h1>Verifying admin access</h1>
          <p className="muted">Checking your Firestore role through the Express API...</p>
        </div>
      </section>
    </main>
  );
}

export default function ProtectedRoute({ currentUser, onProfileReady, children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(currentUser));
  const [accessDenied, setAccessDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function verifyAdmin() {
      if (!currentUser) {
        setProfile(null);
        setAccessDenied(false);
        setLoading(false);
        onProfileReady?.(null);
        return;
      }

      setLoading(true);
      setErrorMessage('');
      setAccessDenied(false);

      try {
        const adminProfile = await ensureAdminAccess();

        if (!isMounted) {
          return;
        }

        setProfile(adminProfile);
        onProfileReady?.(adminProfile);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error.code === 'admin/access-denied') {
          setAccessDenied(true);
          setProfile(error.profile || null);
          onProfileReady?.(null);
          return;
        }

        setErrorMessage(
          error.response?.data?.message || error.message || 'Unable to verify admin access.'
        );
        onProfileReady?.(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    verifyAdmin();

    return () => {
      isMounted = false;
    };
  }, [currentUser, onProfileReady]);

  if (!currentUser) {
    return <Navigate replace to="/login" />;
  }

  if (loading) {
    return <AdminLoadingScreen />;
  }

  if (accessDenied) {
    return <AccessDeniedScreen onSignOut={signOutAdmin} profile={profile} />;
  }

  if (errorMessage) {
    return (
      <main className="auth-shell">
        <AuthBrandPanel />
        <section className="auth-form-panel">
          <div className="auth-card auth-access-card">
            <h1>Unable to connect</h1>
            <p className="error">{errorMessage}</p>
            <button className="auth-submit" onClick={signOutAdmin} type="button">
              Sign out
            </button>
          </div>
        </section>
      </main>
    );
  }

  return children;
}
