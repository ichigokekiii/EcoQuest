import React from "react";

function Header({
  title,
  subtitle,
  searchPlaceholder,
  onSearchChange, // Connected to parent state setter
  searchValue, // Binds state value
  actions,
}) {
  return (
    <header className="topbar">
      {/* Upper Utility Row */}
      <div className={`topbar-row${searchPlaceholder ? "" : " compact"}`}>
        {searchPlaceholder ? (
          <label
            className="search-shell search-shell-inline"
            aria-label="Search"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="search-icon">
              <path d="M10.5 4a6.5 6.5 0 1 0 3.97 11.65l4.44 4.44 1.42-1.42-4.44-4.44A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z" />
            </svg>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={onSearchChange}
            />
          </label>
        ) : null}

        <div className="topbar-actions">
          {actions ? <div className="header-actions">{actions}</div> : null}

          <button
            type="button"
            className="icon-button"
            aria-label="Notifications"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22ZM18 16v-5a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Zm-2 1H8v-6a4 4 0 1 1 8 0v6Z" />
            </svg>
          </button>

          <button type="button" className="icon-button" aria-label="Theme">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3a9 9 0 1 0 9 9c0-.37-.03-.73-.08-1.09A7 7 0 0 1 12 3Z" />
            </svg>
          </button>

          <div className="profile-chip">
            <span className="profile-avatar">A</span>
            <div>
              <p className="profile-label">Admin Profile</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Page Title Section */}
      <div className="page-heading">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </header>
  );
}

export default Header;
