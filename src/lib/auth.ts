import { auth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { findInstituteByEmail, setCurrentInstitute, clearCurrentInstitute, getInstitute } from './tenant';

export type UserRole = 'admin' | 'student';

export interface AuthUser {
  id: string;
  email?: string;
  studentId?: string;
  name: string;
  role: UserRole;
  instituteId?: string;
}

const AUTH_KEY = 'sbci_auth';

export function studentIdToEmail(studentId: string): string {
  return `${studentId.toLowerCase()}@sbci.institute`;
}

export async function loginWithFirebase(identifier: string, password: string): Promise<AuthUser | null> {
  // Firebase path is unreliable in multi-tenant local mode; fall through to local resolver.
  return null;
}

// Tenant-aware local login
export function login(identifier: string, password: string): AuthUser | null {
  // ADMIN: email + institute admin password
  if (identifier.includes('@')) {
    const inst = findInstituteByEmail(identifier);
    if (!inst) return null;
    if (inst.status === 'suspended' || inst.status === 'deactivated') {
      throw new Error('Your institute account is suspended. Please contact support.');
    }
    if (inst.status !== 'approved') {
      throw new Error('Your institute is awaiting Super Admin approval.');
    }
    if (password !== inst.adminPassword) return null;
    setCurrentInstitute(inst.id);
    const user: AuthUser = {
      id: 'admin-' + inst.id, email: inst.email,
      name: inst.ownerName || 'Admin', role: 'admin', instituteId: inst.id,
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    logSession(user);
    return user;
  }

  // STUDENT: search across all tenants for the studentId, then validate suspension
  const sid = identifier.toUpperCase();
  const { getInstitutes } = require('./tenant') as typeof import('./tenant');
  for (const inst of getInstitutes()) {
    const list = JSON.parse(localStorage.getItem(`sbci_students::${inst.id}`) || '[]');
    const student = list.find((s: any) => s.studentId === sid);
    if (student && password === (student.password || 'sbci123')) {
      if (inst.status !== 'approved') {
        throw new Error('Your institute account is currently inactive.');
      }
      setCurrentInstitute(inst.id);
      const user: AuthUser = {
        id: student.id, studentId: student.studentId,
        name: student.name, role: 'student', instituteId: inst.id,
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      logSession(user);
      return user;
    }
  }
  return null;
}

export async function createStudentFirebaseAccount(studentId: string, password: string): Promise<boolean> {
  try {
    const email = studentIdToEmail(studentId);
    await createUserWithEmailAndPassword(auth, email, password);
    return true;
  } catch (err: any) {
    console.error('Create student account error:', err.code, err.message);
    // If account already exists, that's fine
    if (err.code === 'auth/email-already-in-use') return true;
    return false;
  }
}

export async function logoutFirebase() {
  try {
    await signOut(auth);
  } catch (e) {
    // ignore
  }
  localStorage.removeItem(AUTH_KEY);
  clearCurrentInstitute();
}

export function logout() {
  logoutFirebase();
}

export function getCurrentUser(): AuthUser | null {
  const data = localStorage.getItem(AUTH_KEY);
  if (!data) return null;
  const user = JSON.parse(data) as AuthUser;
  // Re-hydrate tenant context on refresh
  if (user.instituteId) {
    const inst = getInstitute(user.instituteId);
    if (!inst || inst.status === 'suspended' || inst.status === 'deactivated') {
      localStorage.removeItem(AUTH_KEY);
      clearCurrentInstitute();
      return null;
    }
    setCurrentInstitute(user.instituteId);
  }
  return user;
}

// Session logging for analytics
function logSession(user: AuthUser) {
  const sessions = JSON.parse(localStorage.getItem('sbci_sessions') || '[]');
  const session = {
    id: crypto.randomUUID(),
    userId: user.id,
    userName: user.name,
    studentId: user.studentId,
    role: user.role,
    loginTime: new Date().toISOString(),
    device: navigator.userAgent,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
    platform: navigator.platform,
    language: navigator.language,
    isActive: true,
    lastActivity: new Date().toISOString(),
    currentPage: '/',
  };
  sessions.push(session);
  // Keep last 500 sessions
  if (sessions.length > 500) sessions.splice(0, sessions.length - 500);
  localStorage.setItem('sbci_sessions', JSON.stringify(sessions));
  localStorage.setItem('sbci_current_session', JSON.stringify(session));
}

export function updateSessionActivity(page: string) {
  const session = JSON.parse(localStorage.getItem('sbci_current_session') || 'null');
  if (session) {
    session.lastActivity = new Date().toISOString();
    session.currentPage = page;
    localStorage.setItem('sbci_current_session', JSON.stringify(session));
    // Update in sessions array
    const sessions = JSON.parse(localStorage.getItem('sbci_sessions') || '[]');
    const idx = sessions.findIndex((s: any) => s.id === session.id);
    if (idx >= 0) sessions[idx] = session;
    localStorage.setItem('sbci_sessions', JSON.stringify(sessions));
  }
}

export function getSessions() {
  return JSON.parse(localStorage.getItem('sbci_sessions') || '[]');
}
