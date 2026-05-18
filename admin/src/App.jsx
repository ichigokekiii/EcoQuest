import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

import AdminLayout from './components/AdminLayout';
import AuthBrandPanel from './components/AuthBrandPanel';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import MissionPage from './pages/MissionPage';
import RegisterPage from './pages/RegisterPage';
import RewardsPage from './pages/RewardsPage';
import RoutePage from './pages/RoutePage';
import UsersPage from './pages/UsersPage';
import TrashCategoriesPage from './pages/TrashCategoriesPage';
import VerificationPage from './pages/VerificationPage';
import { auth } from './services/firebase';

function LoadingScreen() {
  return (
    <main className="auth-shell">
      <AuthBrandPanel />
      <section className="auth-form-panel">
        <div className="auth-card px-6 py-10 text-center">
          <div
            aria-hidden="true"
            className="mx-auto h-[42px] w-[42px] animate-auth-spin rounded-full border-[3px] border-mint/20 border-t-mint"
          />
          <h1 className="mb-2 mt-4 text-xl font-bold text-gray-900">Checking your session</h1>
          <p className="text-sm text-gray-500">Connecting to Firebase authentication...</p>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const handleProfileReady = useCallback((profile) => {
    setAdminProfile(profile);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });

    return unsubscribe;
  }, []);

  if (!authReady) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            currentUser ? <Navigate replace to="/" /> : <LoginPage currentUser={currentUser} />
          }
        />
        <Route
          path="/register"
          element={currentUser ? <Navigate replace to="/" /> : <RegisterPage />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute currentUser={currentUser} onProfileReady={handleProfileReady}>
              <AdminLayout adminProfile={adminProfile} currentUser={currentUser} />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage adminProfile={adminProfile} />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="routes" element={<RoutePage />} />
          <Route path="missions" element={<MissionPage />} />
          <Route path="categories" element={<TrashCategoriesPage />} />
          <Route path="verification" element={<VerificationPage />} />
          <Route path="rewards" element={<RewardsPage />} />
        </Route>
        <Route path="*" element={<Navigate replace to={currentUser ? '/' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  );
}
