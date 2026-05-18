import React, { useState, useEffect } from "react";

function Header({
  title,
  subtitle,
  searchPlaceholder,
  onSearchChange,
  searchValue,
  actions,
  onNotificationClick, // Switches view when bell is clicked
}) {
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch count directly from your new index.php endpoint matching your layout routing
  const fetchNotifications = () => {
    fetch(
      "http://localhost/EcoQuest/api/index.php?endpoint=notifications-count",
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.count === "number") {
          setNotificationCount(data.count);
        }
      })
      .catch((err) => console.error("Error fetching notifications:", err));
  };

  useEffect(() => {
    fetchNotifications();

    // Automatically check for new pending data entries every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="topbar"
      style={{
        borderBottom: "1px solid #e2e8f0",
        padding: "16px 24px",
        background: "#fff",
      }}
    >
      <div
        className="topbar-row"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {searchPlaceholder ? (
          <label
            className="search-shell"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <svg viewBox="0 0 24 24" style={{ width: "18px", fill: "#718096" }}>
              <path d="M10.5 4a6.5 6.5 0 1 0 3.97 11.65l4.44 4.44 1.42-1.42-4.44-4.44A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z" />
            </svg>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={onSearchChange}
              style={{
                border: "1px solid #cbd5e1",
                padding: "6px 12px",
                borderRadius: "4px",
              }}
            />
          </label>
        ) : (
          <div />
        )}

        <div
          className="topbar-actions"
          style={{ display: "flex", alignItems: "center", gap: "20px" }}
        >
          {actions ? <div className="header-actions">{actions}</div> : null}

          {/* BELL ICON BUTTON */}
          <button
            type="button"
            className="icon-button"
            aria-label="Notifications"
            onClick={onNotificationClick}
            style={{
              position: "relative",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              style={{
                width: "24px",
                height: "24px",
                fill: notificationCount > 0 ? "#FF9800" : "#4a5568",
                transition: "fill 0.2s ease",
              }}
            >
              <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22ZM18 16v-5a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Zm-2 1H8v-6a4 4 0 1 1 8 0v6Z" />
            </svg>

            {/* Notification Count Badge */}
            {notificationCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "#e53e3e",
                  color: "#ffffff",
                  borderRadius: "9999px",
                  padding: "2px 6px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  minWidth: "14px",
                  textAlign: "center",
                  boxShadow: "0 0 0 2px #ffffff",
                }}
              >
                {notificationCount}
              </span>
            )}
          </button>

          <div
            className="profile-chip"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <span
              className="profile-avatar"
              style={{
                background: "#4CAF50",
                color: "#fff",
                padding: "4px 10px",
                borderRadius: "50%",
              }}
            >
              A
            </span>
            <p
              className="profile-label"
              style={{ margin: 0, fontSize: "14px", fontWeight: 500 }}
            >
              Admin Profile
            </p>
          </div>
        </div>
      </div>

      <div className="page-heading" style={{ marginTop: "16px" }}>
        <h1 style={{ margin: "0 0 4px 0", fontSize: "1.75rem" }}>{title}</h1>
        {subtitle && (
          <p style={{ margin: 0, color: "#718096", fontSize: "0.95rem" }}>
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}

export default Header;
