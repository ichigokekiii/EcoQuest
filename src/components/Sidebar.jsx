const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "grid" },
  { id: "users", label: "Users", icon: "users" },
  { id: "routes", label: "Routes", icon: "route" },
  { id: "missions", label: "Missions", icon: "mission" },
  { id: "verification", label: "Verification", icon: "check" },
  { id: "rewards", label: "Rewards", icon: "award" },
];

function Icon({ name }) {
  switch (name) {
    case "grid":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 11a4 4 0 1 0-0.001-8.001A4 4 0 0 0 8 11Zm8 1a3 3 0 1 0-.001-6.001A3 3 0 0 0 16 12Zm-8 2c-3.866 0-7 2.239-7 5v1h14v-1c0-2.761-3.134-5-7-5Zm8 0c-.53 0-1.035.07-1.51.19A6.97 6.97 0 0 1 19 18v1h5v-1c0-2.209-1.79-4-4-4Z" />
        </svg>
      );
    case "route":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm3.5-9c.8 0 1.5-.7 1.5-1.5S16.3 8 15.5 8 14 8.7 14 9.5s.7 1.5 1.5 1.5zm-7 0c.8 0 1.5-.7 1.5-1.5S9.3 8 8.5 8 7 8.7 7 9.5 7.7 11 8.5 11zm3.5 6c-2.2 0-4-1.8-4-4h2c0 1.1.9 2 2 2s2-.9 2-2h2c0 2.2-1.8 4-4 4z" />
        </svg>
      );
    case "mission":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75-3.54-2.16 1.66 4 5.2 6-6.02-1.41-1.41z" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm-8 13-4-4 1.4-1.4L11 13.2l5.6-5.6L18 9l-7 7Z" />
        </svg>
      );
    case "award":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2a7 7 0 0 0-4.3 12.5L6.5 22 12 19l5.5 3-1.2-7.5A7 7 0 0 0 12 2Zm0 10.5A3.5 3.5 0 1 1 12 5a3.5 3.5 0 0 1 0 7.5Z" />
        </svg>
      );
    default:
      return null;
  }
}

function Sidebar({ activeSection, onNavigate, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">◔</div>
        <div>
          <p className="brand-name">EcoQuest</p>
          <p className="brand-role">Admin Portal</p>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Primary">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item${activeSection === item.id ? " active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">
              <Icon name={item.icon} />
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          className="utility-link"
          onClick={() => onLogout && onLogout()}
        >
          <span className="nav-icon small">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10 17.25 15.25 12 10 6.75l1.41-1.41L18.06 12l-6.65 6.66L10 17.25ZM6 5h2v14H6z" />
            </svg>
          </span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
