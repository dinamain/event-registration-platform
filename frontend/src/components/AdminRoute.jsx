import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user || !user.is_staff) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default AdminRoute;