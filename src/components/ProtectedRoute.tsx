import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser, onAuthChange, updateSessionActivity } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'admin' | 'student' }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let resolved = false;

    // Check localStorage first for quick response
    const cachedUser = getCurrentUser();
    if (cachedUser) {
      setAuthenticated(true);
      setLoading(false);
      resolved = true;
      // Track page activity
      updateSessionActivity(location.pathname);
    }

    // Listen to Firebase auth state for verification
    const unsub = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        // Firebase confirms we're authenticated
        const user = getCurrentUser();
        if (user) {
          setAuthenticated(true);
        } else {
          // Firebase says authenticated but no localStorage cache
          // This can happen on refresh — wait a bit
          setAuthenticated(false);
        }
      } else {
        // Only set unauthenticated if we didn't have a cached user
        if (!resolved) {
          setAuthenticated(false);
        }
      }
      if (!resolved) {
        setLoading(false);
        resolved = true;
      }
    });

    // Timeout fallback — don't block the user forever
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        // If we have cached user, trust it
        const user = getCurrentUser();
        setAuthenticated(!!user);
        setLoading(false);
      }
    }, 3000);

    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, [location.pathname]);

  // Track page changes for analytics
  useEffect(() => {
    if (authenticated) {
      updateSessionActivity(location.pathname);
    }
  }, [location.pathname, authenticated]);

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