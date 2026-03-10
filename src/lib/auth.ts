export type UserRole = 'admin' | 'student';

export interface AuthUser {
  id: string;
  email?: string;
  studentId?: string;
  name: string;
  role: UserRole;
}

const AUTH_KEY = 'sbci_auth';

const ADMIN_CREDENTIALS = {
  email: 'admin@sbci.com',
  password: 'admin123',
};

export function login(identifier: string, password: string): AuthUser | null {
  // Admin login
  if (identifier === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    const user: AuthUser = { id: 'admin-1', email: ADMIN_CREDENTIALS.email, name: 'Admin', role: 'admin' };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return user;
  }

  // Student login by student ID (e.g. SBCI0001)
  const students = JSON.parse(localStorage.getItem('sbci_students') || '[]');
  const student = students.find((s: any) => s.studentId === identifier.toUpperCase());
  if (student && password === (student.password || 'sbci123')) {
    const user: AuthUser = { id: student.id, studentId: student.studentId, name: student.name, role: 'student' };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return user;
  }

  return null;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

export function getCurrentUser(): AuthUser | null {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
}
