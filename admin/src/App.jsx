import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import MissionPage from './pages/MissionPage';
import RegisterPage from './pages/RegisterPage';
import RewardsPage from './pages/RewardsPage';
import RoutePage from './pages/RoutePage';
import UsersPage from './pages/UsersPage';
import VerificationPage from './pages/VerificationPage';
import { auth } from './services/firebase';

function LoadingScreen() {
  return (
    <main className="auth-shell">
      <aside className="auth-brand-panel">
        <div className="auth-brand-content">
          <img alt="Eco Quest" className="auth-brand-logo" src="/eco-logo.svg" />
          <p className="auth-brand-name">Eco Quest</p>
        </div>
      </aside>
      <section className="auth-form-panel">
        <div className="auth-card auth-loading">
          <h1>Checking your session</h1>
          <p className="muted">Connecting to Firebase authentication...</p>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

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
          element={
            currentUser ? <Navigate replace to="/" /> : <RegisterPage />
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute currentUser={currentUser}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage currentUser={currentUser} />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="routes" element={<RoutePage />} />
          <Route path="missions" element={<MissionPage />} />
          <Route path="verification" element={<VerificationPage />} />
          <Route path="rewards" element={<RewardsPage />} />
        </Route>
        <Route path="*" element={<Navigate replace to={currentUser ? '/' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  );
}
