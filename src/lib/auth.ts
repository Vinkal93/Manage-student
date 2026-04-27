import { auth } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { fbIsAdmin, fbSetAdmin, fbLogSession } from './firebaseStore';

export type UserRole = 'admin' | 'student';

export interface AuthUser {
  id: string;
  email?: string;
  studentId?: string;
  name: string;
  role: UserRole;
}

const AUTH_KEY = 'sbci_auth';

// Convert student ID to Firebase Auth email
export function studentIdToEmail(studentId: string): string {
  return `${studentId.toLowerCase()}@student.insuite.app`;
}

/**
 * Login with Firebase Auth
 * Admin: email + password (created in Firebase Auth console)
 * Student: studentId → converted to email → login
 */
export async function loginWithFirebase(identifier: string, password: string): Promise<AuthUser | null> {
  try {
    const isAdmin = identifier.includes('@');
    const email = isAdmin ? identifier : studentIdToEmail(identifier);

    const cred = await signInWithEmailAndPassword(auth, email, password);

    if (isAdmin) {
      // Check if this user is an admin in Realtime DB
      const isAdminUser = await fbIsAdmin(cred.user.uid);
      
      if (!isAdminUser) {
        // First admin login — auto-register as admin
        await fbSetAdmin(cred.user.uid, identifier);
      }

      const user: AuthUser = {
        id: cred.user.uid,
        email: identifier,
        name: cred.user.displayName || 'Admin',
        role: 'admin',
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      await logSessionToFirebase(user);
      return user;
    } else {
      // Student login
      const user: AuthUser = {
        id: cred.user.uid,
        studentId: identifier.toUpperCase(),
        name: identifier.toUpperCase(),
        role: 'student',
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      await logSessionToFirebase(user);
      return user;
    }
  } catch (err: any) {
    console.error('Firebase login error:', err.code, err.message);
    return null;
  }
}

/**
 * Create Firebase Auth account for student
 * Called when admin adds a new student
 */
export async function createStudentFirebaseAccount(studentId: string, password: string): Promise<boolean> {
  try {
    const email = studentIdToEmail(studentId);
    await createUserWithEmailAndPassword(auth, email, password);
    // Sign back in as admin (creating user signs in as the new user)
    // We'll handle re-auth in the calling code
    return true;
  } catch (err: any) {
    console.error('Create student account error:', err.code, err.message);
    if (err.code === 'auth/email-already-in-use') return true;
    return false;
  }
}

/**
 * Logout from Firebase
 */
export async function logoutFirebase() {
  try {
    await signOut(auth);
  } catch (e) {
    console.error('Logout error:', e);
  }
  localStorage.removeItem(AUTH_KEY);
}

export function logout() {
  logoutFirebase();
}

/**
 * Get current user from localStorage cache
 */
export function getCurrentUser(): AuthUser | null {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * Listen to Firebase Auth state changes
 * Returns unsubscribe function
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get current Firebase user
 */
export function getFirebaseUser(): FirebaseUser | null {
  return auth.currentUser;
}

// Session logging — saves to both localStorage and Firebase
async function logSessionToFirebase(user: AuthUser) {
  const session = {
    id: crypto.randomUUID(),
    userId: user.id,
    userName: user.name,
    studentId: user.studentId || null,
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

  // Save to localStorage
  const sessions = JSON.parse(localStorage.getItem('sbci_sessions') || '[]');
  sessions.push(session);
  if (sessions.length > 500) sessions.splice(0, sessions.length - 500);
  localStorage.setItem('sbci_sessions', JSON.stringify(sessions));
  localStorage.setItem('sbci_current_session', JSON.stringify(session));

  // Save to Firebase
  await fbLogSession(session);
}

export function updateSessionActivity(page: string) {
  const session = JSON.parse(localStorage.getItem('sbci_current_session') || 'null');
  if (session) {
    session.lastActivity = new Date().toISOString();
    session.currentPage = page;
    localStorage.setItem('sbci_current_session', JSON.stringify(session));
    const sessions = JSON.parse(localStorage.getItem('sbci_sessions') || '[]');
    const idx = sessions.findIndex((s: any) => s.id === session.id);
    if (idx >= 0) sessions[idx] = session;
    localStorage.setItem('sbci_sessions', JSON.stringify(sessions));
  }
}

export function getSessions() {
  return JSON.parse(localStorage.getItem('sbci_sessions') || '[]');
}
