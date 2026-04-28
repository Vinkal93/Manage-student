import { auth } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { fbIsAdmin, fbSetAdmin, fbLogSession, fbUpdateSession } from './firebaseStore';

export type UserRole = 'admin' | 'student';

export interface AuthUser {
  id: string;
  email?: string;
  studentId?: string;
  name: string;
  role: UserRole;
}

const AUTH_KEY = 'sbci_auth';

// In-memory admin credentials for re-auth after student creation
// NEVER persisted to storage — only lives in RAM
let _adminEmail: string | null = null;
let _adminPassword: string | null = null;

// Current session Firebase key for live updates
let _currentSessionKey: string | null = null;

// Heartbeat interval reference
let _heartbeatInterval: ReturnType<typeof setInterval> | null = null;

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
      // Store admin credentials in memory for re-auth after student creation
      _adminEmail = identifier;
      _adminPassword = password;

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
      startHeartbeat();
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
      startHeartbeat();
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
 * Returns the Firebase UID of the created student
 */
export async function createStudentFirebaseAccount(studentId: string, password: string): Promise<{ success: boolean; uid?: string }> {
  try {
    const email = studentIdToEmail(studentId);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const studentUid = cred.user.uid;

    // Creating a user auto-signs in as that user — re-auth as admin
    await reAuthenticateAdmin();

    return { success: true, uid: studentUid };
  } catch (err: any) {
    console.error('Create student account error:', err.code, err.message);
    if (err.code === 'auth/email-already-in-use') {
      // Account already exists, that's fine
      // Try to re-auth as admin in case we got signed out
      await reAuthenticateAdmin();
      return { success: true };
    }
    return { success: false };
  }
}

/**
 * Re-authenticate as admin after student creation
 * Uses in-memory cached credentials (never persisted)
 */
async function reAuthenticateAdmin(): Promise<boolean> {
  if (!_adminEmail || !_adminPassword) {
    console.warn('No admin credentials cached for re-auth');
    return false;
  }
  try {
    await signInWithEmailAndPassword(auth, _adminEmail, _adminPassword);
    return true;
  } catch (e) {
    console.error('Admin re-auth failed:', e);
    return false;
  }
}

/**
 * Logout from Firebase
 */
export async function logoutFirebase() {
  // Mark session as ended
  if (_currentSessionKey) {
    await fbUpdateSession(_currentSessionKey, {
      isActive: false,
      logoutTime: new Date().toISOString(),
    });
  }
  stopHeartbeat();
  _currentSessionKey = null;
  _adminEmail = null;
  _adminPassword = null;

  try {
    await signOut(auth);
  } catch (e) {
    console.error('Logout error:', e);
  }
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem('sbci_current_session');
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
    currentPage: window.location.pathname || '/',
  };

  // Save to localStorage
  const sessions = JSON.parse(localStorage.getItem('sbci_sessions') || '[]');
  sessions.push(session);
  if (sessions.length > 500) sessions.splice(0, sessions.length - 500);
  localStorage.setItem('sbci_sessions', JSON.stringify(sessions));
  localStorage.setItem('sbci_current_session', JSON.stringify(session));

  // Save to Firebase and get the key
  _currentSessionKey = await fbLogSession(session);
}

/**
 * Update session activity — both localStorage and Firebase
 */
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

    // Sync to Firebase
    if (_currentSessionKey) {
      fbUpdateSession(_currentSessionKey, {
        lastActivity: session.lastActivity,
        currentPage: page,
        isActive: true,
      }).catch(() => {});
    }
  }
}

/**
 * Heartbeat — sends activity ping every 30s to Firebase
 * This enables live user tracking in admin analytics
 */
function startHeartbeat() {
  stopHeartbeat();
  _heartbeatInterval = setInterval(() => {
    if (_currentSessionKey) {
      fbUpdateSession(_currentSessionKey, {
        lastActivity: new Date().toISOString(),
        isActive: true,
        currentPage: window.location.pathname,
      }).catch(() => {});
    }
  }, 30000); // every 30 seconds
}

function stopHeartbeat() {
  if (_heartbeatInterval) {
    clearInterval(_heartbeatInterval);
    _heartbeatInterval = null;
  }
}

export function getSessions() {
  return JSON.parse(localStorage.getItem('sbci_sessions') || '[]');
}
