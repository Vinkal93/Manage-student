import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser, onAuthChange } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'admin' | 'student' }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check localStorage first for quick response
    const cachedUser = getCurrentUser();
    if (cachedUser) {
      setAuthenticated(true);
      setLoading(false);
      return;
    }

    // Listen to Firebase auth state
    const unsub = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        const user = getCurrentUser();
        setAuthenticated(!!user);
      } else {
        setAuthenticated(false);
      }
      setLoading(false);
    });

    // Timeout fallback
    const timeout = setTimeout(() => setLoading(false), 2000);

    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="animate-spin text-primary mx-auto" size={32} />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const user = getCurrentUser();
  if (!user || !authenticated) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
  return <>{children}</>;
}