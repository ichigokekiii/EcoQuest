// pages/HomePage.jsx
import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

function HomePage({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Regular username/password login ──────────────────────────────
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost/ecoquest/api/index.php?endpoint=login",
        { username: username.trim(), password },
        { headers: { "Content-Type": "application/json" } },
      );

      if (response.data.success) {
        if (response.data.token) {
          localStorage.setItem("authToken", response.data.token);
        }
        onLoginSuccess(response.data.user);
      } else {
        setError(response.data.message || "Invalid username or password.");
      }
    } catch (err) {
      if (err.response) {
        setError(
          err.response.data?.message || "Login failed. Please try again.",
        );
      } else if (err.request) {
        setError("Could not reach the server. Is XAMPP running?");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth login ────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    setError(null);
    setLoading(true);

    try {
      const idToken = credentialResponse.credential;

      const response = await axios.post(
        "http://localhost/ecoquest/api/google-login.php",
        { token: idToken },
        { headers: { "Content-Type": "application/json" } },
      );

      if (response.data.success) {
        if (response.data.token) {
          localStorage.setItem("authToken", response.data.token);
        }
        onLoginSuccess(response.data.user);
      } else {
        setError(
          "Authentication failed: " +
            (response.data.message || "Unknown error"),
        );
      }
    } catch (err) {
      if (err.response) {
        setError(
          `Server error ${err.response.status}: ${err.response.data?.message || "Authentication failed."}`,
        );
      } else if (err.request) {
        setError(
          "Could not reach the authentication server. Is XAMPP running?",
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in failed to initialize. Check your Client ID.");
  };

  return (
    <div className="home-shell">
      <div className="login-card">
        {/* Brand mark */}
        <div
          className="brand-mark"
          style={{
            width: 54,
            height: 54,
            margin: "0 auto",
            fontSize: "1rem",
            fontWeight: 800,
          }}
        >
          EQ
        </div>

        {/* Title */}
        <h2
          style={{
            margin: 0,
            fontSize: "1.45rem",
            fontWeight: 700,
            color: "#1e3a2a",
            fontFamily: "Georgia, serif",
          }}
        >
          EcoQuest Admin
        </h2>

        {/* Subtitle */}
        <p style={{ margin: 0, fontSize: "0.88rem", color: "#7a9485" }}>
          Sign in to access the dashboard
        </p>

        {/* Username / Password form */}
        <form className="login-form" onSubmit={handleSignIn}>
          <input
            className="login-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            disabled={loading}
          />
          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "11px",
              borderRadius: 10,
              border: "none",
              background: loading ? "#8aab8e" : "#5a8a64",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 180ms ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <svg
                  style={{
                    width: 16,
                    height: 16,
                    animation: "eq-spin 0.7s linear infinite",
                  }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                </svg>
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{ flex: 1, height: 1, background: "rgba(120,150,120,0.18)" }}
          />
          <span
            style={{
              fontSize: "0.78rem",
              color: "#a0b4a8",
              letterSpacing: "0.06em",
            }}
          >
            OR
          </span>
          <div
            style={{ flex: 1, height: 1, background: "rgba(120,150,120,0.18)" }}
          />
        </div>

        {/* Google Login */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="outline"
            shape="rectangular"
            size="large"
            text="signin_with"
            width="260"
          />
        </div>

        {/* Error message */}
        {error && (
          <p
            style={{
              margin: 0,
              fontSize: "0.84rem",
              color: "#9b2b2b",
              background: "#fff0f0",
              border: "1px solid #f5c6c6",
              borderRadius: 8,
              padding: "10px 14px",
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}
      </div>

      <style>{`
        @keyframes eq-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default HomePage;
