import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Map, 
  Target, 
  Trash2, 
  CheckSquare, 
  Gift, 
  LogOut 
} from "lucide-react";

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/routes', label: 'Routes', icon: Map },
  { to: '/missions', label: 'Missions', icon: Target },
  { to: '/categories', label: 'Trash Categories', icon: Trash2 },
  { to: '/verification', label: 'Trash Reviews', icon: CheckSquare },
  { to: '/rewards', label: 'Rewards', icon: Gift },
];

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

  const baseClass =
    "flex items-center gap-3 px-6 py-3.5 text-[0.85rem] font-medium text-gray-500 border-l-4 border-transparent transition-all duration-200 hover:bg-[#dcfce7]/50 hover:text-[#15803d]";

  const activeClass =
    "flex items-center gap-3 px-6 py-3.5 text-[0.85rem] font-bold bg-[#dcfce7] text-[#15803d] border-l-4 border-[#22c55e]";

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col bg-white border-r border-gray-100 transition-all duration-300 shrink-0">
      {/* Logo Area */}
      <div className="flex h-[72px] items-center gap-3 border-b border-gray-100 px-6">
        <img alt="Eco Quest" className="h-9 w-9" src="/eco-logo-mint.svg" />
        <div>
          <p className="text-[0.95rem] font-bold text-gray-900 leading-tight">Eco Quest</p>
          <p className="text-xs text-gray-500 font-medium">Admin Console</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="flex flex-col">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink 
                key={item.to} 
                end={item.end} 
                to={item.to}
                className={({ isActive }) => (isActive ? activeClass : baseClass)}
              >
                <IconComponent className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Footer */}
      <div className="mt-auto border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 px-6 py-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dcfce7] text-xs font-bold text-[#15803d]">
            {getInitials(displayName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.85rem] font-semibold text-gray-900">{displayName}</p>
            <p className="text-xs text-gray-500">{formatRole(adminProfile)}</p>
          </div>
          <button
            aria-label="Logout"
            className="ml-auto rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500"
            onClick={onLogout}
            title="Logout"
            type="button"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
