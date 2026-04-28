import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser, onAuthChange, updateSessionActivity } from '@/lib/auth';
import { getStudents, loadStudentsFromFirebase } from '@/lib/store';
import { getSettings } from '@/lib/settings';
import { Loader2, AlertTriangle, Phone } from 'lucide-react';

export function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'admin' | 'student' }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [stopped, setStopped] = useState<{ reason?: string } | null>(null);
  const location = useLocation();

  useEffect(() => {
    let resolved = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    // Check localStorage first for quick response
    const cachedUser = getCurrentUser();
    if (cachedUser) {
      setAuthenticated(true);
      resolved = true;

      // Check if student account is stopped
      if (cachedUser.role === 'student') {
        checkStudentStatus(cachedUser);
      }

      updateSessionActivity(location.pathname);
      setLoading(false);
    }

    // Listen to Firebase auth state for verification
    const unsub = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        const user = getCurrentUser();
        if (user) {
          setAuthenticated(true);
          if (!resolved) {
            setLoading(false);
            resolved = true;
          }
        }
      } else {
        // Firebase says no user — but trust localStorage if resolved
        if (!resolved) {
          setAuthenticated(false);
          setLoading(false);
          resolved = true;
        }
      }
    });

    // Timeout fallback
    timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        const user = getCurrentUser();
        setAuthenticated(!!user);
        setLoading(false);
      }
    }, 3000);

    return () => {
      unsub();
      clearTimeout(timeoutId);
    };
  }, [location.pathname]);

  // Track page changes for analytics
  useEffect(() => {
    if (authenticated) {
      updateSessionActivity(location.pathname);
    }
  }, [location.pathname, authenticated]);

  async function checkStudentStatus(user: any) {
    try {
      const students = await loadStudentsFromFirebase();
      const student = students.find(s =>
        s.studentId === user.studentId || s.firebaseUid === user.id || s.id === user.id
      );
      if (student && student.status === 'stopped') {
        setStopped({ reason: student.stopReason });
      }
    } catch { /* ignore */ }
  }

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

  // Show stopped account warning for students
  if (stopped && role === 'student') {
    const settings = getSettings();
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card rounded-2xl border-2 border-destructive/30 shadow-lg p-8 text-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="text-destructive" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-destructive">Account Suspended</h2>
          <p className="text-muted-foreground text-sm">
            आपका अकाउंट रोक दिया गया है। कृपया अपने संस्थान से संपर्क करें।
          </p>
          {stopped.reason && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 text-left">
              <p className="text-xs font-semibold text-destructive mb-1">Reason / कारण:</p>
              <p className="text-sm text-foreground">{stopped.reason}</p>
            </div>
          )}
          <div className="bg-muted rounded-xl p-4 flex items-center gap-3">
            <Phone size={18} className="text-primary flex-shrink-0" />
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Contact your institute</p>
              <p className="text-sm font-semibold text-foreground">
                {settings.instituteContactNumber || settings.phone || 'Contact Admin'}
              </p>
            </div>
          </div>
          <button
            onClick={() => { import('@/lib/auth').then(m => { m.logout(); window.location.href = '/login'; }); }}
            className="text-sm text-primary hover:underline"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}