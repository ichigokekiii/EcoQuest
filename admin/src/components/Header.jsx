export default function Header({
  title,
  subtitle,
  searchPlaceholder,
  searchValue = '',
  onSearchChange,
  actions,
}) {
  const searchInput = (
    <label className="search-shell">
      <svg viewBox="0 0 24 24" className="search-icon" aria-hidden="true">
        <path d="M10.5 4a6.5 6.5 0 1 0 4 11.6l4.4 4.5 1.4-1.4-4.4-4.5A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z" />
      </svg>
      <input
        onChange={onSearchChange}
        placeholder={searchPlaceholder || 'Search anything...'}
        type="text"
        value={searchValue}
      />
    </label>
  );

  return (
    <header className="topbar">
      <div className="page-header-row">
        <div className="page-heading">
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>

        <div className="topbar-utilities">
          {actions ? <div className="header-actions">{actions}</div> : null}
          {searchInput}
          <div className="topbar-actions">
            <button type="button" className="icon-button" aria-label="Notifications">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 22a2.5 2.5 0 0 0 2.5-2h-5a2.5 2.5 0 0 0 2.5 2ZM18 16v-5a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Zm-2 1H8v-6a4 4 0 1 1 8 0v6Z" />
              </svg>
              <span className="icon-button-badge">5</span>
            </button>
            <div className="profile-chip">
              <span className="profile-avatar">A</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
