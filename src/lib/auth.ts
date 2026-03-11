import { auth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

export type UserRole = 'admin' | 'student';

export interface AuthUser {
  id: string;
  email?: string;
  studentId?: string;
  name: string;
  role: UserRole;
}

const AUTH_KEY = 'sbci_auth';

export function studentIdToEmail(studentId: string): string {
  return `${studentId.toLowerCase()}@sbci.institute`;
}

export async function loginWithFirebase(identifier: string, password: string): Promise<AuthUser | null> {
  try {
    // Determine if admin (email) or student (student ID)
    const isAdmin = identifier.includes('@');
    const email = isAdmin ? identifier : studentIdToEmail(identifier);
    
    const cred = await signInWithEmailAndPassword(auth, email, password);
    
    if (isAdmin) {
      const user: AuthUser = { id: cred.user.uid, email: identifier, name: 'Admin', role: 'admin' };
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      logSession(user);
      return user;
    } else {
      // Get student data from localStorage
      const students = JSON.parse(localStorage.getItem('sbci_students') || '[]');
      const student = students.find((s: any) => s.studentId === identifier.toUpperCase());
      const user: AuthUser = {
        id: cred.user.uid,
        studentId: identifier.toUpperCase(),
        name: student?.name || identifier.toUpperCase(),
        role: 'student'
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      logSession(user);
      return user;
    }
  } catch (err: any) {
    console.error('Firebase login error:', err.code, err.message);
    return null;
  }
}

// Fallback local login (if Firebase is unreachable)
export function login(identifier: string, password: string): AuthUser | null {
  const ADMIN_EMAIL = 'admin@sbci.com';
  const ADMIN_PASS = 'admin123';
  
  if (identifier === ADMIN_EMAIL && password === ADMIN_PASS) {
    const user: AuthUser = { id: 'admin-1', email: ADMIN_EMAIL, name: 'Admin', role: 'admin' };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    logSession(user);
    return user;
  }

  const students = JSON.parse(localStorage.getItem('sbci_students') || '[]');
  const student = students.find((s: any) => s.studentId === identifier.toUpperCase());
  if (student && password === (student.password || 'sbci123')) {
    const user: AuthUser = { id: student.id, studentId: student.studentId, name: student.name, role: 'student' };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    logSession(user);
    return user;
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
}

export function logout() {
  logoutFirebase();
}

export function getCurrentUser(): AuthUser | null {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
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
