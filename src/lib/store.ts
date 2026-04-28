import { fbGetStudents, fbSaveAllStudents, fbSaveStudent, fbUpdateStudent, fbDeleteStudent as fbDeleteStudentFromDb } from './firebaseStore';

export interface Student {
  id: string;
  studentId: string;
  firebaseUid?: string;
  name: string;
  fatherName: string;
  motherName: string;
  mobile: string;
  whatsappNumber: string;
  course: string;
  admissionDate: string;
  feeAmount: number;
  feeCycle: 'monthly';
  status: 'active' | 'stopped';
  password: string;
  photo?: string;
  signature?: string;
  dob?: string;
  address?: string;
  email?: string;
  aadharNumber?: string;
  linkedMobileNumber?: string;
  joinDate?: string;
  documents?: StudentDocuments;
  stopReason?: string;
  stopDate?: string;
  feeRecords: FeeRecord[];
  attendance: AttendanceRecord[];
  messageHistory: MessageRecord[];
}

export interface StudentDocuments {
  aadharCard?: string;
  photo1?: string;
  photo2?: string;
  signatureFile?: string;
  marksheet10th?: string;
  marksheet12th?: string;
}

export interface FeeRecord {
  id: string;
  month: string;
  dueDate: string;
  paidDate?: string;
  amount: number;
  lateFee: number;
  status: 'paid' | 'pending' | 'overdue';
  paymentMode?: 'cash' | 'upi' | 'online';
  txnId?: string;
  receiptUrl?: string;
  paidAmount?: number;
  pendingAmount?: number;
  receiptNo?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
}

export interface MessageRecord {
  id: string;
  date: string;
  type: 'welcome' | 'reminder' | 'warning' | 'final' | 'bulk' | 'stop' | 'fee_update';
  message: string;
  status: 'sent' | 'pending' | 'failed';
}

const STORAGE_KEY = 'sbci_students';
let studentsCache: Student[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5000;

function getNextStudentId(): string {
  const students = getStudents();
  const numbers = students.map(s => {
    const num = parseInt(s.studentId.replace('SBCI', ''), 10);
    return isNaN(num) ? 0 : num;
  });
  const max = numbers.length > 0 ? Math.max(...numbers) : 0;
  return 'SBCI' + String(max + 1).padStart(4, '0');
}

export function getStudents(): Student[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) return JSON.parse(data);
  return [];
}

export async function loadStudentsFromFirebase(): Promise<Student[]> {
  try {
    const students = await fbGetStudents();
    if (students.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
      studentsCache = students;
      cacheTimestamp = Date.now();
      return students;
    }
    return getStudents();
  } catch (e) {
    console.error('loadStudentsFromFirebase error:', e);
    return getStudents();
  }
}

export function getStudentById(id: string): Student | undefined {
  return getStudents().find(s => s.id === id);
}

export function getStudentByStudentId(studentId: string): Student | undefined {
  return getStudents().find(s => s.studentId === studentId);
}

export function getStudentByFirebaseUid(uid: string): Student | undefined {
  return getStudents().find(s => s.firebaseUid === uid);
}

export function saveStudents(students: Student[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  fbSaveAllStudents(students).catch(e => console.error('Firebase save error:', e));
}

export function addStudent(data: {
  name: string; fatherName: string; motherName?: string; mobile: string; course: string;
  admissionDate: string; feeAmount: number; whatsappNumber?: string; firebaseUid?: string;
  password?: string; dob?: string; address?: string; email?: string; aadharNumber?: string;
  linkedMobileNumber?: string; photo?: string; signature?: string;
}): Student {
  const students = getStudents();
  const studentId = getNextStudentId();
  const newStudent: Student = {
    id: data.firebaseUid || crypto.randomUUID(),
    studentId, firebaseUid: data.firebaseUid,
    name: data.name, fatherName: data.fatherName, motherName: data.motherName || '',
    mobile: data.mobile, whatsappNumber: data.whatsappNumber || data.mobile,
    course: data.course, admissionDate: data.admissionDate, feeAmount: data.feeAmount,
    feeCycle: 'monthly', status: 'active', password: data.password || 'sbci123',
    photo: data.photo, signature: data.signature, dob: data.dob,
    address: data.address, email: data.email, aadharNumber: data.aadharNumber,
    linkedMobileNumber: data.linkedMobileNumber, joinDate: data.admissionDate,
    documents: {},
    feeRecords: generateFeeRecords(data.admissionDate, data.feeAmount),
    attendance: generateAttendance(data.admissionDate),
    messageHistory: [{ id: crypto.randomUUID(), date: data.admissionDate, type: 'welcome',
      message: `🎉 Welcome ${data.name}! Student ID: ${studentId}, Course: ${data.course}`, status: 'sent' }],
  };
  students.push(newStudent);
  saveStudents(students);
  return newStudent;
}

export function updateStudentFull(studentId: string, updates: Partial<Student>) {
  const students = getStudents();
  const idx = students.findIndex(s => s.id === studentId);
  if (idx < 0) return null;
  students[idx] = { ...students[idx], ...updates };
  saveStudents(students);
  return students[idx];
}

export function stopStudentAccount(studentId: string, reason: string): Student | null {
  const students = getStudents();
  const idx = students.findIndex(s => s.id === studentId);
  if (idx < 0) return null;
  students[idx].status = 'stopped';
  students[idx].stopReason = reason;
  students[idx].stopDate = new Date().toISOString();
  students[idx].messageHistory.push({ id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0],
    type: 'stop', message: `⚠️ Account stopped: ${reason}`, status: 'sent' });
  saveStudents(students);
  return students[idx];
}

export function activateStudentAccount(studentId: string): Student | null {
  const students = getStudents();
  const idx = students.findIndex(s => s.id === studentId);
  if (idx < 0) return null;
  students[idx].status = 'active';
  students[idx].stopReason = undefined;
  students[idx].stopDate = undefined;
  students[idx].messageHistory.push({ id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0],
    type: 'welcome', message: `✅ Account reactivated!`, status: 'sent' });
  saveStudents(students);
  return students[idx];
}

export function deleteStudent(studentId: string): boolean {
  const students = getStudents();
  const idx = students.findIndex(s => s.id === studentId);
  if (idx < 0) return false;
  students.splice(idx, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  fbDeleteStudentFromDb(studentId).catch(e => console.error('Firebase delete error:', e));
  return true;
}

export function markFeePaid(studentId: string, feeId: string, paymentMode: 'cash' | 'upi' | 'online' = 'cash') {
  const students = getStudents();
  const student = students.find(s => s.id === studentId);
  if (!student) return;
  const fee = student.feeRecords.find(f => f.id === feeId);
  if (!fee) return;
  fee.status = 'paid'; fee.paidDate = new Date().toISOString().split('T')[0];
  fee.paymentMode = paymentMode; fee.lateFee = 0;
  fee.paidAmount = (fee.amount || 0); fee.pendingAmount = 0;
  saveStudents(students);
}

export function recordPayment(studentId: string, feeId: string, paid: number,
  opts: { paymentMode?: 'cash' | 'upi' | 'online'; txnId?: string; receiptUrl?: string } = {}) {
  const students = getStudents();
  const student = students.find(s => s.id === studentId);
  if (!student) return null;
  const fee = student.feeRecords.find(f => f.id === feeId);
  if (!fee) return null;
  const total = (fee.amount || 0) + (fee.lateFee || 0);
  const prevPaid = fee.paidAmount || 0;
  const newPaid = Math.min(total, prevPaid + paid);
  const pending = Math.max(0, total - newPaid);
  fee.paidAmount = newPaid; fee.pendingAmount = pending;
  fee.paymentMode = opts.paymentMode || fee.paymentMode || 'cash';
  if (opts.txnId) fee.txnId = opts.txnId;
  if (opts.receiptUrl) fee.receiptUrl = opts.receiptUrl;
  if (pending === 0) {
    fee.status = 'paid'; fee.paidDate = new Date().toISOString().split('T')[0]; fee.lateFee = 0;
    if (!fee.receiptNo) fee.receiptNo = `RCP-${Date.now().toString(36).toUpperCase()}`;
  }
  student.messageHistory.push({ id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0],
    type: 'fee_update', message: `💰 Fee payment of ₹${paid} recorded for ${fee.month} via ${fee.paymentMode}`, status: 'sent' });
  saveStudents(students);
  return fee;
}

export function updateStudentPhoto(studentId: string, photoDataUrl: string) {
  const students = getStudents();
  const idx = students.findIndex(s => s.id === studentId);
  if (idx >= 0) { students[idx].photo = photoDataUrl; saveStudents(students); }
}

export function markAttendance(studentId: string, date: string, status: 'present' | 'absent' | 'late') {
  const students = getStudents();
  const student = students.find(s => s.id === studentId);
  if (!student) return;
  const existing = student.attendance.find(a => a.date === date);
  if (existing) { existing.status = status; } else { student.attendance.push({ id: crypto.randomUUID(), date, status }); }
  saveStudents(students);
}

export function generateFeeRecords(admissionDate: string, amount: number): FeeRecord[] {
  const records: FeeRecord[] = [];
  const admission = new Date(admissionDate);
  const today = new Date();
  const current = new Date(admission);
  while (current <= today) {
    const dueDate = new Date(current); dueDate.setDate(10);
    const monthName = dueDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    const isPast = daysDiff > 0;
    const isPaid = Math.random() > 0.4 && isPast;
    records.push({ id: crypto.randomUUID(), month: monthName, dueDate: dueDate.toISOString().split('T')[0],
      paidDate: isPaid ? new Date(dueDate.getTime() + Math.random() * 8 * 86400000).toISOString().split('T')[0] : undefined,
      amount, lateFee: !isPaid && daysDiff > 10 ? 50 : 0,
      status: isPaid ? 'paid' : (daysDiff > 0 ? 'overdue' : 'pending'),
      paymentMode: isPaid ? (['cash', 'upi', 'online'] as const)[Math.floor(Math.random() * 3)] : undefined });
    current.setMonth(current.getMonth() + 1);
  }
  return records;
}

function generateAttendance(admissionDate: string): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const admission = new Date(admissionDate);
  const today = new Date();
  const current = new Date(admission);
  while (current <= today) {
    if (current.getDay() !== 0) {
      const statuses: ('present' | 'absent' | 'late')[] = ['present', 'present', 'present', 'present', 'absent', 'late'];
      records.push({ id: crypto.randomUUID(), date: current.toISOString().split('T')[0],
        status: statuses[Math.floor(Math.random() * statuses.length)] });
    }
    current.setDate(current.getDate() + 1);
  }
  return records;
}

export function getDashboardStats(students: Student[]) {
  const today = new Date(); const thisMonth = today.getMonth(); const thisYear = today.getFullYear();
  const totalStudents = students.length; const activeStudents = students.filter(s => s.status === 'active').length;
  let feeCollected = 0; let pendingFees = 0; let newAdmissions = 0; let todayPresent = 0;
  const todayStr = today.toISOString().split('T')[0];
  students.forEach(s => {
    const admDate = new Date(s.admissionDate);
    if (admDate.getMonth() === thisMonth && admDate.getFullYear() === thisYear) newAdmissions++;
    s.feeRecords.forEach(f => {
      const dueDate = new Date(f.dueDate);
      if (dueDate.getMonth() === thisMonth && dueDate.getFullYear() === thisYear) {
        if (f.status === 'paid') feeCollected += f.amount; else pendingFees += f.amount + f.lateFee;
      }
    });
    const todayAttendance = s.attendance.find(a => a.date === todayStr);
    if (todayAttendance && todayAttendance.status === 'present') todayPresent++;
  });
  return { totalStudents, activeStudents, feeCollected, pendingFees, newAdmissions, todayPresent };
}

export function getMonthlyRevenue(students: Student[]): { month: string; collected: number; pending: number }[] {
  const monthMap = new Map<string, { collected: number; pending: number }>();
  students.forEach(s => { s.feeRecords.forEach(f => {
    const key = f.month;
    if (!monthMap.has(key)) monthMap.set(key, { collected: 0, pending: 0 });
    const entry = monthMap.get(key)!;
    if (f.status === 'paid') entry.collected += f.amount; else entry.pending += f.amount + f.lateFee;
  }); });
  return Array.from(monthMap.entries()).map(([month, data]) => ({ month, ...data })).slice(-6);
}

export function getCourseWiseStudents(students: Student[]): { course: string; count: number }[] {
  const courseMap = new Map<string, number>();
  students.forEach(s => courseMap.set(s.course, (courseMap.get(s.course) || 0) + 1));
  return Array.from(courseMap.entries()).map(([course, count]) => ({ course, count }));
}

export function getFeeStatus(dueDate: string): { status: string; daysLate: number; reminder: number } {
  const today = new Date(); const due = new Date(dueDate); due.setDate(10);
  const daysDiff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff < 0) return { status: 'upcoming', daysLate: 0, reminder: 0 };
  if (daysDiff <= 5) return { status: 'due', daysLate: daysDiff, reminder: 1 };
  if (daysDiff <= 10) return { status: 'pending', daysLate: daysDiff, reminder: 2 };
  if (daysDiff <= 15) return { status: 'overdue', daysLate: daysDiff, reminder: 3 };
  return { status: 'critical', daysLate: daysDiff, reminder: 4 };
}
