// App.jsx
import { useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import RoutePage from "./pages/RoutePage";
import MissionPage from "./pages/MissionPage";
import VerificationPage from "./pages/VerificationPage";
import RewardsPage from "./pages/RewardsPage";
import HomePage from "./pages/HomePage";
import "./App.css";

// ─── Google OAuth Client ID here ───────────────────────────────────
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setLoggedIn(true);
    setActiveSection("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setLoggedIn(false);
    localStorage.removeItem("authToken");
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {!loggedIn ? (
        <HomePage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="app-shell">
          <Sidebar
            activeSection={activeSection}
            onNavigate={setActiveSection}
            onLogout={handleLogout}
            user={user}
          />
          <main className="main-panel">
            {activeSection === "users" ? (
              <UsersPage />
            ) : activeSection === "routes" ? (
              <RoutePage />
            ) : activeSection === "missions" ? (
              <MissionPage />
            ) : activeSection === "verification" ? (
              <VerificationPage />
            ) : activeSection === "rewards" ? (
              <RewardsPage />
            ) : (
              <DashboardPage user={user} />
            )}
          </main>
        </div>
      )}
    </GoogleOAuthProvider>
  );
}

export default App;
