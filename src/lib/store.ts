export interface Student {
  id: string;
  name: string;
  fatherName: string;
  mobile: string;
  course: string;
  admissionDate: string;
  feeAmount: number;
  feeCycle: 'monthly';
  status: 'active' | 'stopped';
  feeRecords: FeeRecord[];
}

export interface FeeRecord {
  id: string;
  dueDate: string;
  paidDate?: string;
  amount: number;
  lateFee: number;
  status: 'paid' | 'pending' | 'overdue';
}

const STORAGE_KEY = 'sbci_students';

export function getStudents(): Student[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : getSampleStudents();
}

export function saveStudents(students: Student[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

export function addStudent(student: Omit<Student, 'id' | 'feeCycle' | 'status' | 'feeRecords'>): Student {
  const students = getStudents();
  const newStudent: Student = {
    ...student,
    id: crypto.randomUUID(),
    feeCycle: 'monthly',
    status: 'active',
    feeRecords: generateFeeRecords(student.admissionDate, student.feeAmount),
  };
  students.push(newStudent);
  saveStudents(students);
  return newStudent;
}

export function generateFeeRecords(admissionDate: string, amount: number): FeeRecord[] {
  const records: FeeRecord[] = [];
  const admission = new Date(admissionDate);
  const today = new Date();
  const current = new Date(admission);

  while (current <= today) {
    const dueDate = new Date(current);
    dueDate.setDate(10);
    const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    const isPast = daysDiff > 0;
    const isPaid = Math.random() > 0.4 && isPast;

    records.push({
      id: crypto.randomUUID(),
      dueDate: dueDate.toISOString().split('T')[0],
      paidDate: isPaid ? new Date(dueDate.getTime() + Math.random() * 8 * 86400000).toISOString().split('T')[0] : undefined,
      amount,
      lateFee: !isPaid && daysDiff > 10 ? 50 : 0,
      status: isPaid ? 'paid' : (daysDiff > 0 ? 'overdue' : 'pending'),
    });

    current.setMonth(current.getMonth() + 1);
  }

  return records;
}

function getSampleStudents(): Student[] {
  const courses = ['ADCA', 'DCA', 'Tally', 'CCC', 'PGDCA', 'Web Design'];
  const names = [
    { name: 'Rahul Sharma', father: 'Suresh Sharma' },
    { name: 'Priya Gupta', father: 'Rajesh Gupta' },
    { name: 'Amit Kumar', father: 'Ramesh Kumar' },
    { name: 'Sneha Verma', father: 'Anil Verma' },
    { name: 'Vikash Singh', father: 'Manoj Singh' },
    { name: 'Pooja Yadav', father: 'Dinesh Yadav' },
    { name: 'Rohit Patel', father: 'Kailash Patel' },
    { name: 'Anjali Mishra', father: 'Pramod Mishra' },
  ];

  const students: Student[] = names.map((n, i) => {
    const admDate = new Date();
    admDate.setMonth(admDate.getMonth() - Math.floor(Math.random() * 6 + 1));
    const fee = [500, 800, 600, 400, 1000, 700][i % 6];

    return {
      id: crypto.randomUUID(),
      name: n.name,
      fatherName: n.father,
      mobile: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      course: courses[i % courses.length],
      admissionDate: admDate.toISOString().split('T')[0],
      feeAmount: fee,
      feeCycle: 'monthly' as const,
      status: Math.random() > 0.15 ? 'active' as const : 'stopped' as const,
      feeRecords: generateFeeRecords(admDate.toISOString().split('T')[0], fee),
    };
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  return students;
}

export function getDashboardStats(students: Student[]) {
  const today = new Date();
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active').length;

  let feeCollected = 0;
  let pendingFees = 0;
  let newAdmissions = 0;

  students.forEach(s => {
    const admDate = new Date(s.admissionDate);
    if (admDate.getMonth() === thisMonth && admDate.getFullYear() === thisYear) {
      newAdmissions++;
    }
    s.feeRecords.forEach(f => {
      const dueDate = new Date(f.dueDate);
      if (dueDate.getMonth() === thisMonth && dueDate.getFullYear() === thisYear) {
        if (f.status === 'paid') feeCollected += f.amount;
        else pendingFees += f.amount + f.lateFee;
      }
    });
  });

  return { totalStudents, activeStudents, feeCollected, pendingFees, newAdmissions };
}

export function getFeeStatus(dueDate: string): { status: string; daysLate: number; reminder: number } {
  const today = new Date();
  const due = new Date(dueDate);
  due.setDate(10);
  const daysDiff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff < 0) return { status: 'upcoming', daysLate: 0, reminder: 0 };
  if (daysDiff <= 5) return { status: 'due', daysLate: daysDiff, reminder: 1 };
  if (daysDiff <= 10) return { status: 'pending', daysLate: daysDiff, reminder: 2 };
  if (daysDiff <= 15) return { status: 'overdue', daysLate: daysDiff, reminder: 3 };
  return { status: 'critical', daysLate: daysDiff, reminder: 4 };
}
