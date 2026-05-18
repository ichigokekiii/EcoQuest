import { signOut } from 'firebase/auth';

import api from './api';
import { auth } from './firebase';

export async function syncAdminUserProfile(firebaseUser) {
  try {
    const response = await api.get('/users/me');
    return response.data.user;
  } catch (error) {
    if (error.response?.status !== 404) {
      throw error;
    }

    const syncResponse = await api.post('/auth/sync-user', {
      fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Admin User',
      email: firebaseUser.email,
    });

    return syncResponse.data.user;
  }
}

export async function ensureAdminAccess() {
  const profile = await syncAdminUserProfile(auth.currentUser);

  if (profile.role !== 'admin') {
    const accessError = new Error('Admin access required');
    accessError.code = 'admin/access-denied';
    accessError.profile = profile;
    throw accessError;
  }

  return profile;
}

export async function signOutAdmin() {
  await signOut(auth);
}
