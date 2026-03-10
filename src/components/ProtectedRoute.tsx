import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '@/lib/auth';

export default function StudentSidebar() {
  return null; // Student uses only MobileNav + simple header
}

export function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'admin' | 'student' }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
  return <>{children}</>;
}
