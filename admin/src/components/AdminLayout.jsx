import { Outlet } from 'react-router-dom';
import { signOut } from 'firebase/auth';

import Sidebar from './Sidebar';
import { auth } from '../services/firebase';

export default function AdminLayout({ adminProfile, currentUser }) {
  async function handleLogout() {
    await signOut(auth);
  }

  return (
    <div className="app-shell">
      <Sidebar adminProfile={adminProfile} currentUser={currentUser} onLogout={handleLogout} />
      <main className="main-panel">
        <Outlet />
      </main>
    </div>
  );
}
