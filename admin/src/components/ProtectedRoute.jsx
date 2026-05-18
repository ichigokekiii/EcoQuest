import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import AuthBrandPanel from './AuthBrandPanel';
import { ensureAdminAccess, signOutAdmin } from '../services/adminAuth';

function AuthCardIntro({ title, welcome }) {
  return (
    <div className="mb-6 flex items-center gap-3.5">
      <img
        alt=""
        aria-hidden="true"
        className="h-12 w-12 shrink-0 rounded-[14px] shadow-sm"
        src="/eco-logo-mint.svg"
      />
      <div>
        <p className="mb-0.5 text-sm font-semibold text-gray-500">{welcome}</p>
        <h1 className="m-0 text-[1.65rem] font-extrabold leading-tight tracking-tight text-gray-900">
          {title}
        </h1>
      </div>
    </div>
  );
}

function AccessDeniedScreen({ profile, onSignOut }) {
  return (
    <main className="auth-shell">
      <AuthBrandPanel />
      <section className="auth-form-panel">
        <div className="auth-card">
          <AuthCardIntro title="Access denied" welcome="Signed in" />
          <p className="mb-3 text-sm leading-relaxed text-gray-500">
            {profile?.email
              ? `${profile.email} does not have admin access yet.`
              : 'This account does not have admin access.'}
          </p>
          <p className="mb-4 text-sm leading-relaxed text-gray-500">
            Ask an existing admin to promote your Firestore user role to <strong>admin</strong>, or
            set <code className="text-xs">users/&#123;uid&#125;.role</code> during initial setup.
          </p>
          <button className="auth-submit" onClick={onSignOut} type="button">
            Sign out
          </button>
        </div>
      </section>
    </main>
  );
}

function AdminLoadingScreen({ title, message }) {
  return (
    <main className="auth-shell">
      <AuthBrandPanel />
      <section className="auth-form-panel">
        <div className="auth-card px-6 py-10 text-center">
          <div
            aria-hidden="true"
            className="mx-auto h-[42px] w-[42px] animate-auth-spin rounded-full border-[3px] border-mint/20 border-t-mint"
          />
          <h1 className="mb-2 mt-4 text-xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">{message}</p>
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
    return (
      <AdminLoadingScreen
        message="Checking your Firestore role through the Express API..."
        title="Verifying admin access"
      />
    );
  }

  if (accessDenied) {
    return <AccessDeniedScreen onSignOut={signOutAdmin} profile={profile} />;
  }

  if (errorMessage) {
    return (
      <main className="auth-shell">
        <AuthBrandPanel />
        <section className="auth-form-panel">
          <div className="auth-card">
            <h1 className="mb-3 text-xl font-bold text-gray-900">Unable to connect</h1>
            <p className="mb-4 text-sm text-red-500">{errorMessage}</p>
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
