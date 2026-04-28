/**
 * Firebase Realtime Database Store
 * All CRUD operations for students, settings, sessions, etc.
 */
import { rtdb } from './firebase';
import { ref, get, set, push, update, remove, onValue, off, DataSnapshot, query, orderByChild, limitToLast } from 'firebase/database';
import type { Student, FeeRecord, AttendanceRecord, MessageRecord } from './store';

// ─── STUDENTS ────────────────────────────────────────────

export async function fbGetStudents(): Promise<Student[]> {
  try {
    const snap = await get(ref(rtdb, 'students'));
    if (!snap.exists()) return [];
    const data = snap.val();
    return Object.keys(data).map(key => ({ ...data[key], _fbKey: key }));
  } catch (e) {
    console.error('fbGetStudents error:', e);
    return [];
  }
}

export async function fbSaveStudent(student: Student): Promise<void> {
  try {
    await set(ref(rtdb, `students/${student.id}`), student);
  } catch (e) {
    console.error('fbSaveStudent error:', e);
  }
}

export async function fbSaveAllStudents(students: Student[]): Promise<void> {
  try {
    const data: Record<string, Student> = {};
    students.forEach(s => { data[s.id] = s; });
    await set(ref(rtdb, 'students'), data);
  } catch (e) {
    console.error('fbSaveAllStudents error:', e);
  }
}

export async function fbUpdateStudent(studentId: string, updates: Partial<Student>): Promise<void> {
  try {
    await update(ref(rtdb, `students/${studentId}`), updates);
  } catch (e) {
    console.error('fbUpdateStudent error:', e);
  }
}

export async function fbDeleteStudent(studentId: string): Promise<void> {
  try {
    await remove(ref(rtdb, `students/${studentId}`));
  } catch (e) {
    console.error('fbDeleteStudent error:', e);
  }
}

// Subscribe to realtime student updates
export function fbOnStudentsChange(callback: (students: Student[]) => void): () => void {
  const studentsRef = ref(rtdb, 'students');
  const handler = (snap: DataSnapshot) => {
    if (!snap.exists()) { callback([]); return; }
    const data = snap.val();
    const students = Object.keys(data).map(key => ({ ...data[key] }));
    callback(students);
  };
  onValue(studentsRef, handler);
  return () => off(studentsRef, 'value', handler);
}

// ─── SETTINGS ────────────────────────────────────────────

export async function fbGetSettings(): Promise<any | null> {
  try {
    const snap = await get(ref(rtdb, 'settings'));
    return snap.exists() ? snap.val() : null;
  } catch (e) {
    console.error('fbGetSettings error:', e);
    return null;
  }
}

export async function fbSaveSettings(settings: any): Promise<void> {
  try {
    await set(ref(rtdb, 'settings'), settings);
  } catch (e) {
    console.error('fbSaveSettings error:', e);
  }
}

// ─── ADMINS ──────────────────────────────────────────────

export async function fbIsAdmin(uid: string): Promise<boolean> {
  try {
    const snap = await get(ref(rtdb, `admins/${uid}`));
    return snap.exists();
  } catch (e) {
    console.error('fbIsAdmin error:', e);
    return false;
  }
}

export async function fbSetAdmin(uid: string, email: string): Promise<void> {
  try {
    await set(ref(rtdb, `admins/${uid}`), { email, role: 'admin', createdAt: new Date().toISOString() });
  } catch (e) {
    console.error('fbSetAdmin error:', e);
  }
}

// ─── SESSIONS ────────────────────────────────────────────

export async function fbLogSession(session: any): Promise<string | null> {
  try {
    const newRef = push(ref(rtdb, 'sessions'));
    await set(newRef, { ...session, _key: newRef.key });
    return newRef.key;
  } catch (e) {
    console.error('fbLogSession error:', e);
    return null;
  }
}

export async function fbUpdateSession(sessionKey: string, updates: any): Promise<void> {
  try {
    if (!sessionKey) return;
    await update(ref(rtdb, `sessions/${sessionKey}`), updates);
  } catch (e) {
    console.error('fbUpdateSession error:', e);
  }
}

export async function fbGetSessions(): Promise<any[]> {
  try {
    const snap = await get(ref(rtdb, 'sessions'));
    if (!snap.exists()) return [];
    const data = snap.val();
    return Object.values(data);
  } catch (e) {
    console.error('fbGetSessions error:', e);
    return [];
  }
}

// Realtime sessions listener
export function fbOnSessionsChange(callback: (sessions: any[]) => void): () => void {
  const sessionsRef = ref(rtdb, 'sessions');
  const handler = (snap: DataSnapshot) => {
    if (!snap.exists()) { callback([]); return; }
    const data = snap.val();
    callback(Object.values(data));
  };
  onValue(sessionsRef, handler);
  return () => off(sessionsRef, 'value', handler);
}

// ─── FCM TOKENS ──────────────────────────────────────────

export async function fbSaveFCMToken(uid: string, token: string): Promise<void> {
  try {
    await set(ref(rtdb, `fcmTokens/${uid}`), { token, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.error('fbSaveFCMToken error:', e);
  }
}

export async function fbGetAllFCMTokens(): Promise<Record<string, string>> {
  try {
    const snap = await get(ref(rtdb, 'fcmTokens'));
    if (!snap.exists()) return {};
    const data = snap.val();
    const tokens: Record<string, string> = {};
    Object.keys(data).forEach(uid => { tokens[uid] = data[uid].token; });
    return tokens;
  } catch (e) {
    console.error('fbGetAllFCMTokens error:', e);
    return {};
  }
}

// ─── TIMETABLE ───────────────────────────────────────────

export async function fbGetTimetable(): Promise<any | null> {
  try {
    const snap = await get(ref(rtdb, 'timetable'));
    return snap.exists() ? snap.val() : null;
  } catch (e) {
    console.error('fbGetTimetable error:', e);
    return null;
  }
}

export async function fbSaveTimetable(timetable: any): Promise<void> {
  try {
    await set(ref(rtdb, 'timetable'), timetable);
  } catch (e) {
    console.error('fbSaveTimetable error:', e);
  }
}

// ─── ASSIGNMENTS ─────────────────────────────────────────

export async function fbGetAssignments(): Promise<any[]> {
  try {
    const snap = await get(ref(rtdb, 'assignments'));
    if (!snap.exists()) return [];
    const data = snap.val();
    return Object.keys(data).map(key => ({ ...data[key], id: key }));
  } catch (e) {
    console.error('fbGetAssignments error:', e);
    return [];
  }
}

export async function fbSaveAssignments(assignments: any[]): Promise<void> {
  try {
    const data: Record<string, any> = {};
    assignments.forEach(a => { data[a.id] = a; });
    await set(ref(rtdb, 'assignments'), data);
  } catch (e) {
    console.error('fbSaveAssignments error:', e);
  }
}

// ─── FEATURES ────────────────────────────────────────────

export async function fbGetFeatures(): Promise<any | null> {
  try {
    const snap = await get(ref(rtdb, 'features'));
    return snap.exists() ? snap.val() : null;
  } catch (e) {
    console.error('fbGetFeatures error:', e);
    return null;
  }
}

export async function fbSaveFeatures(features: any): Promise<void> {
  try {
    await set(ref(rtdb, 'features'), features);
  } catch (e) {
    console.error('fbSaveFeatures error:', e);
  }
}

// Realtime features listener
export function fbOnFeaturesChange(callback: (features: any) => void): () => void {
  const featRef = ref(rtdb, 'features');
  const handler = (snap: DataSnapshot) => {
    if (!snap.exists()) { callback(null); return; }
    callback(snap.val());
  };
  onValue(featRef, handler);
  return () => off(featRef, 'value', handler);
}

// ─── SIDEBAR CONFIG ──────────────────────────────────────

export async function fbGetSidebarConfig(): Promise<any | null> {
  try {
    const snap = await get(ref(rtdb, 'sidebarConfig'));
    return snap.exists() ? snap.val() : null;
  } catch (e) {
    console.error('fbGetSidebarConfig error:', e);
    return null;
  }
}

export async function fbSaveSidebarConfig(config: any): Promise<void> {
  try {
    await set(ref(rtdb, 'sidebarConfig'), config);
  } catch (e) {
    console.error('fbSaveSidebarConfig error:', e);
  }
}

export function fbOnSidebarConfigChange(callback: (config: any) => void): () => void {
  const sidebarRef = ref(rtdb, 'sidebarConfig');
  const handler = (snap: DataSnapshot) => {
    if (!snap.exists()) { callback(null); return; }
    callback(snap.val());
  };
  onValue(sidebarRef, handler);
  return () => off(sidebarRef, 'value', handler);
}

// ─── INITIAL DATA SYNC ──────────────────────────────────

/**
 * Sync localStorage data to Firebase (first time migration)
 * Only pushes if Firebase is empty
 */
export async function fbInitialSync(): Promise<void> {
  try {
    // Students
    const studentsSnap = await get(ref(rtdb, 'students'));
    if (!studentsSnap.exists()) {
      const localStudents = localStorage.getItem('sbci_students');
      if (localStudents) {
        const students: Student[] = JSON.parse(localStudents);
        const data: Record<string, Student> = {};
        students.forEach(s => { data[s.id] = s; });
        await set(ref(rtdb, 'students'), data);
        console.log('✅ Students synced to Firebase');
      }
    }

    // Settings
    const settingsSnap = await get(ref(rtdb, 'settings'));
    if (!settingsSnap.exists()) {
      const localSettings = localStorage.getItem('sbci_settings');
      if (localSettings) {
        await set(ref(rtdb, 'settings'), JSON.parse(localSettings));
        console.log('✅ Settings synced to Firebase');
      }
    }

    // Timetable
    const ttSnap = await get(ref(rtdb, 'timetable'));
    if (!ttSnap.exists()) {
      const localTT = localStorage.getItem('insuite_timetable');
      if (localTT) {
        await set(ref(rtdb, 'timetable'), JSON.parse(localTT));
        console.log('✅ Timetable synced to Firebase');
      }
    }

    // Assignments
    const assignSnap = await get(ref(rtdb, 'assignments'));
    if (!assignSnap.exists()) {
      const localAssign = localStorage.getItem('insuite_assignments');
      if (localAssign) {
        const assignments = JSON.parse(localAssign);
        const data: Record<string, any> = {};
        assignments.forEach((a: any) => { data[a.id] = a; });
        await set(ref(rtdb, 'assignments'), data);
        console.log('✅ Assignments synced to Firebase');
      }
    }

    // Features
    const featSnap = await get(ref(rtdb, 'features'));
    if (!featSnap.exists()) {
      const localFeat = localStorage.getItem('insuite_features_v1');
      if (localFeat) {
        await set(ref(rtdb, 'features'), JSON.parse(localFeat));
        console.log('✅ Features synced to Firebase');
      }
    }

  } catch (e) {
    console.error('Initial sync error:', e);
  }
}
