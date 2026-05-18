import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'grid', end: true },
  { to: '/users', label: 'Users', icon: 'users' },
  { to: '/routes', label: 'Routes', icon: 'route' },
  { to: '/missions', label: 'Missions', icon: 'mission' },
  { to: '/categories', label: 'Trash Categories', icon: 'category' },
  { to: '/verification', label: 'Trash Reviews', icon: 'check' },
  { to: '/rewards', label: 'Rewards', icon: 'award' },
];

function Icon({ name }) {
  switch (name) {
    case 'grid':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
        </svg>
      );
    case 'users':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-8 2c-3.9 0-7 2.2-7 5v1h14v-1c0-2.8-3.1-5-7-5Zm8 0c-.5 0-1 .1-1.5.2A7 7 0 0 1 19 18v1h5v-1c0-2.2-1.8-4-4-4Z" />
        </svg>
      );
    case 'route':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 18a3 3 0 1 1 0-6c1.1 0 2.1.6 2.6 1.5h3.8A6 6 0 0 0 18 7a3 3 0 1 1 0-3 6 6 0 0 0-5.6 4.5H8.6A3 3 0 1 0 6 12h12a3 3 0 1 1 0 6H6Z" />
        </svg>
      );
    case 'mission':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 16H5V5h14v14Zm-5-6.7-2.8-3.6-2.1 1.7 4 5.2 6-6-1.4-1.4-3.7 4.1Z" />
        </svg>
      );
    case 'check':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-8 13-4-4 1.4-1.4 2.6 2.6 5.6-5.6L18 9l-7 7Z" />
        </svg>
      );
    case 'category':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 3h7v4h-7v-4Z" />
        </svg>
      );
    case 'award':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2a7 7 0 0 0-4.3 12.5L6.5 22l5.5-3 5.5 3-1.2-7.5A7 7 0 0 0 12 2Zm0 10.5A3.5 3.5 0 1 1 12 5a3.5 3.5 0 0 1 0 7.5Z" />
        </svg>
      );
    default:
      return null;
  }
}

function getDisplayName(profile, firebaseUser) {
  return profile?.fullName || firebaseUser?.displayName || firebaseUser?.email || 'Admin User';
}

function getInitials(value) {
  return (value || 'A')
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatRole(profile) {
  if (profile?.role === 'admin') {
    return 'Administrator';
  }

  return profile?.role || 'User';
}

export default function Sidebar({ adminProfile, currentUser, onLogout }) {
  const displayName = getDisplayName(adminProfile, currentUser);
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <img alt="Eco Quest" className="brand-mark-img" src="/eco-logo-mint.svg" />
        <div>
          <p className="brand-name">Eco Quest</p>
          <p className="brand-role">Admin Console</p>
        </div>
      </div>

      <p className="sidebar-menu-label">Menu</p>

      <nav className="sidebar-nav" aria-label="Admin navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            end={item.end}
            to={item.to}
          >
            <span className="nav-icon">
              <Icon name={item.icon} />
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="profile-avatar">{getInitials(displayName)}</span>
          <div>
            <p className="sidebar-user-name">{displayName}</p>
            <p className="sidebar-user-role">{formatRole(adminProfile)}</p>
          </div>
          <button
            aria-label="Logout"
            className="sidebar-logout"
            onClick={onLogout}
            title="Logout"
            type="button"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="m10 17.3 5.3-5.3L10 6.8l1.4-1.4 6.7 6.6-6.7 6.7L10 17.3ZM6 5h2v14H6z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
