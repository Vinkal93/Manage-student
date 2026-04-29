import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithFirebase, login } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Lock, User, GraduationCap, Shield, ArrowLeft } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const settings = getSettings();
  const [mode, setMode] = useState<'admin' | 'student'>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!identifier.trim()) {
      newErrors.identifier = mode === 'admin' ? 'Email is required' : 'Student ID is required';
    } else if (mode === 'admin' && !identifier.includes('@')) {
      newErrors.identifier = 'Please enter a valid email';
    } else if (mode === 'student' && identifier.trim().length < 4) {
      newErrors.identifier = 'Please enter a valid Student ID';
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const user = login(identifier, password);
      if (user) {
        toast.success(`Welcome ${user.name}!`);
        navigate(user.role === 'admin' ? '/admin' : '/student');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Button variant="ghost" size="sm" className="mb-4 gap-1 text-muted-foreground" onClick={() => navigate('/')}>
          <ArrowLeft size={14} /> Back to Home
        </Button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="text-primary-foreground" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{settings.instituteName}</h1>
          <p className="text-muted-foreground text-sm mt-1">{settings.tagline}</p>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-lg p-6 space-y-6">
          <div className="flex rounded-lg bg-muted p-1 gap-1">
            <button
              onClick={() => { setMode('admin'); setIdentifier(''); setPassword(''); setErrors({}); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                mode === 'admin' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Shield size={16} /> Admin
            </button>
            <button
              onClick={() => { setMode('student'); setIdentifier(''); setPassword(''); setErrors({}); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                mode === 'student' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <User size={16} /> Student
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{mode === 'admin' ? 'Email' : 'Student ID'}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder={mode === 'admin' ? 'admin@sbci.com' : 'e.g. SBCI0001'}
                  value={identifier}
                  onChange={e => { setIdentifier(e.target.value); if (errors.identifier) setErrors(er => ({ ...er, identifier: undefined })); }}
                  className={`pl-9 ${errors.identifier ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.identifier && <p className="text-xs text-destructive">{errors.identifier}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(er => ({ ...er, password: undefined })); }}
                  className={`pl-9 ${errors.password ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            Login credentials are provided by the institute administrator
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">© 2026 InSuite Manage</p>
      </motion.div>
    </div>
  );
}
