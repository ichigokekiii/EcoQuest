import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import { auth } from './services/firebase';

function LoadingScreen() {
  return (
    <main className="shell shell--centered">
      <section className="panel panel--narrow">
        <p className="eyebrow">Eco Quest Admin</p>
        <h1>Checking your session</h1>
        <p className="muted">Connecting to Firebase authentication and the shared backend.</p>
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
          path="/"
          element={
            <ProtectedRoute currentUser={currentUser}>
              <DashboardPage currentUser={currentUser} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate replace to={currentUser ? '/' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  );
}
