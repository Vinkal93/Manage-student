import { auth } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updatePassword,
} from 'firebase/auth';
import { fbIsAdmin, fbSetAdmin, fbLogSession, fbUpdateSession, fbGetActiveSessionsForUser, fbForceLogoutOtherSessions, fbSaveStudentPassword } from './firebaseStore';

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
 * Check if another device has active sessions for this user
 * Returns the count of active sessions
 */
export async function checkActiveSessions(userId: string): Promise<number> {
  const sessions = await fbGetActiveSessionsForUser(userId);
  return sessions.length;
}

/**
 * Login with Firebase Auth
 * Admin: email + password
 * Student: studentId → converted to email → login
 */
export async function loginWithFirebase(
  identifier: string,
  password: string
): Promise<{ user: AuthUser | null; hasOtherSessions: boolean }> {
  try {
    const isAdmin = identifier.includes('@');
    const email = isAdmin ? identifier : studentIdToEmail(identifier);

    const cred = await signInWithEmailAndPassword(auth, email, password);

    if (isAdmin) {
      _adminEmail = identifier;
      _adminPassword = password;

      const isAdminUser = await fbIsAdmin(cred.user.uid);
      if (!isAdminUser) {
        await fbSetAdmin(cred.user.uid, identifier);
      }

      const user: AuthUser = {
        id: cred.user.uid,
        email: identifier,
        name: cred.user.displayName || 'Admin',
        role: 'admin',
      };

      // Admin can login on multiple devices — just log session
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      await logSessionToFirebase(user);
      startHeartbeat();
      return { user, hasOtherSessions: false };
    } else {
      // Student login — enforce single session
      const user: AuthUser = {
        id: cred.user.uid,
        studentId: identifier.toUpperCase(),
        name: identifier.toUpperCase(),
        role: 'student',
      };

      // Check for existing active sessions
      const activeSessions = await fbGetActiveSessionsForUser(cred.user.uid);
      const hasOther = activeSessions.length > 0;

      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      await logSessionToFirebase(user);

      // Force logout other student sessions (single session enforcement)
      if (hasOther && _currentSessionKey) {
        await fbForceLogoutOtherSessions(cred.user.uid, _currentSessionKey);
      }

      startHeartbeat();
      return { user, hasOtherSessions: hasOther };
    }
  } catch (err: any) {
    console.error('Firebase login error:', err.code, err.message);
    return { user: null, hasOtherSessions: false };
  }
}

/**
 * Create Firebase Auth account for student
 * Called when admin adds a new student
 */
export async function createStudentFirebaseAccount(
  studentId: string,
  password: string
): Promise<{ success: boolean; uid?: string }> {
  try {
    const email = studentIdToEmail(studentId);

    // Try to create new account
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const studentUid = cred.user.uid;

    // Save password to Firebase RTDB for cross-device reference
    await fbSaveStudentPassword(studentId.toUpperCase(), password);

    // Re-auth as admin
    await reAuthenticateAdmin();

    return { success: true, uid: studentUid };
  } catch (err: any) {
    console.error('Create student account error:', err.code, err.message);
    if (err.code === 'auth/email-already-in-use') {
      // Account exists — try to update password by signing in and updating
      try {
        const email = studentIdToEmail(studentId);
        // Sign in as student to update password
        const cred = await signInWithEmailAndPassword(auth, email, password);
        // Save updated password to RTDB
        await fbSaveStudentPassword(studentId.toUpperCase(), password);
        await reAuthenticateAdmin();
        return { success: true, uid: cred.user.uid };
      } catch (innerErr: any) {
        // If login fails with old password, try with default
        try {
          const email = studentIdToEmail(studentId);
          const cred = await signInWithEmailAndPassword(auth, email, 'sbci123');
          // Update to new password
          await updatePassword(cred.user, password);
          await fbSaveStudentPassword(studentId.toUpperCase(), password);
          await reAuthenticateAdmin();
          return { success: true, uid: cred.user.uid };
        } catch {
          await reAuthenticateAdmin();
          // Still save the password to RTDB
          await fbSaveStudentPassword(studentId.toUpperCase(), password);
          return { success: true };
        }
      }
    }
    return { success: false };
  }
}

/**
 * Re-authenticate as admin after student creation
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

  try { await signOut(auth); } catch (e) { console.error('Logout error:', e); }
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

// Session logging
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

  const sessions = JSON.parse(localStorage.getItem('sbci_sessions') || '[]');
  sessions.push(session);
  if (sessions.length > 500) sessions.splice(0, sessions.length - 500);
  localStorage.setItem('sbci_sessions', JSON.stringify(sessions));
  localStorage.setItem('sbci_current_session', JSON.stringify(session));

  _currentSessionKey = await fbLogSession(session);
}

/**
 * Update session activity
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
 * Heartbeat — sends activity ping every 30s
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
  }, 30000);
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

/**
 * Open Gmail compose with pre-filled message
 */
export function openGmailCompose(to: string, subject: string, body: string) {
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(gmailUrl, '_blank', 'noopener,noreferrer');
}
