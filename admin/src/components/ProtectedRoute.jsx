import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ currentUser, children }) {
  if (!currentUser) {
    return <Navigate replace to="/login" />;
  }

  return children;
}
