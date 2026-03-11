import * as XLSX from 'xlsx';
import type { Student } from './store';

export function exportStudentsToExcel(students: Student[], filename = 'students') {
  const data = students.map(s => ({
    'Student ID': s.studentId,
    'Name': s.name,
    'Father Name': s.fatherName,
    'Mobile': s.mobile,
    'WhatsApp': s.whatsappNumber,
    'Course': s.course,
    'Admission Date': s.admissionDate,
    'Fee Amount': s.feeAmount,
    'Status': s.status,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Students');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportFeesToExcel(students: Student[], filename = 'fee-report') {
  const data = students.flatMap(s =>
    s.feeRecords.map(f => ({
      'Student ID': s.studentId,
      'Name': s.name,
      'Course': s.course,
      'Month': f.month,
      'Amount': f.amount,
      'Late Fee': f.lateFee,
      'Status': f.status,
      'Due Date': f.dueDate,
      'Paid Date': f.paidDate || '',
      'Payment Mode': f.paymentMode || '',
    }))
  );
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Fees');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportAttendanceToExcel(students: Student[], filename = 'attendance') {
  const data = students.flatMap(s =>
    s.attendance.map(a => ({
      'Student ID': s.studentId,
      'Name': s.name,
      'Course': s.course,
      'Date': a.date,
      'Status': a.status,
    }))
  );
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToCSV(students: Student[], filename = 'students') {
  const headers = ['Student ID', 'Name', 'Father Name', 'Mobile', 'Course', 'Fee', 'Status'];
  const rows = students.map(s => [s.studentId, s.name, s.fatherName, s.mobile, s.course, s.feeAmount, s.status]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export interface ImportedStudent {
  name: string;
  fatherName: string;
  mobile: string;
  whatsappNumber: string;
  course: string;
  admissionDate: string;
  feeAmount: number;
}

export function parseExcelFile(file: File): Promise<ImportedStudent[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws) as any[];
        
        const students: ImportedStudent[] = json.map(row => ({
          name: row['Name'] || row['name'] || row['Student Name'] || '',
          fatherName: row['Father Name'] || row['fatherName'] || row['Father'] || '',
          mobile: String(row['Mobile'] || row['mobile'] || row['Phone'] || ''),
          whatsappNumber: String(row['WhatsApp'] || row['whatsapp'] || row['Mobile'] || ''),
          course: row['Course'] || row['course'] || '',
          admissionDate: row['Admission Date'] || row['admissionDate'] || new Date().toISOString().split('T')[0],
          feeAmount: Number(row['Fee'] || row['Fee Amount'] || row['feeAmount'] || 500),
        })).filter(s => s.name && s.course);
        
        resolve(students);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
