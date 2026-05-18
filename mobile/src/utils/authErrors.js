/**
 * Maps Firebase Auth error codes to user-friendly messages.
 * @param {unknown} error
 * @param {string} fallback
 */
export function getFirebaseAuthErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const code = error?.code;

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password. Try again or sign up.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled for this app. Contact support.';
    default:
      break;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (typeof error?.message === 'string' && !error.message.includes('Firebase:')) {
    return error.message;
  }

  return fallback;
}
