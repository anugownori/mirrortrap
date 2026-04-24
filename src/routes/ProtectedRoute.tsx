import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '@/lib/useApp';

export function ProtectedRoute() {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
