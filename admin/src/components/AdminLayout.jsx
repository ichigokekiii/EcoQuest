import { Outlet } from 'react-router-dom';
import { signOut } from 'firebase/auth';

import Sidebar from './Sidebar';
import { auth } from '../services/firebase';

export default function AdminLayout({ adminProfile, currentUser }) {
  async function handleLogout() {
    await signOut(auth);
  }

  return (
    <div className="flex min-h-screen bg-page">
      <Sidebar adminProfile={adminProfile} currentUser={currentUser} onLogout={handleLogout} />
      <main className="flex min-w-0 flex-1 flex-col px-8 pb-8 pt-8">
        <Outlet />
      </main>
    </div>
  );
}
