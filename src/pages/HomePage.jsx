// pages/HomePage.jsx
import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

function HomePage({ onLoginSuccess }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
      console.error("Backend communication error:", err);
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
    console.error("Google Login Initialization Failed");
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

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            margin: "4px 0",
          }}
        >
          <div
            style={{ flex: 1, height: 1, background: "rgba(120,150,120,0.15)" }}
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
            style={{ flex: 1, height: 1, background: "rgba(120,150,120,0.15)" }}
          />
        </div>

        {/* Google Login button */}
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "10px 0",
              color: "#4d7a5a",
              fontSize: "0.9rem",
            }}
          >
            <svg
              style={{
                width: 18,
                height: 18,
                animation: "spin 0.7s linear infinite",
              }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            Verifying your account…
          </div>
        ) : (
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
        )}

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

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default HomePage;
