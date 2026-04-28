import { getSettings } from '@/lib/settings';

function sanitizeNumber(number: string): string {
  let clean = number.replace(/[\s\-\(\)\+]/g, '');
  if (clean.startsWith('91') && clean.length === 12) return clean;
  if (clean.length === 10 && /^[6-9]/.test(clean)) return '91' + clean;
  return '91' + clean;
}

export function generateAdmissionMessage(student: {
  name: string;
  studentId: string;
  course: string;
  admissionDate: string;
  mobile: string;
}): string {
  const settings = getSettings();
  const date = new Date(student.admissionDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return `🎓 *Welcome to ${settings.instituteName}*

प्रिय छात्र/अभिभावक,

आपका/आपकी *${student.name}* का प्रवेश सफलतापूर्वक दर्ज कर लिया गया है।

📌 *Admission Details:*
👤 Student Name: ${student.name}
📚 Course: ${student.course}
📅 Admission Date: ${date}
🆔 Student ID: ${student.studentId}
📞 Contact: ${student.mobile}

आपका हमारे संस्थान में हार्दिक स्वागत है।
कृपया समय पर कक्षाओं में उपस्थित रहें।

धन्यवाद 🙏
${settings.instituteName}
${settings.phone ? `📞 ${settings.phone}` : ''}`.trim();
}

export function generateFeeMessage(data: {
  studentName: string;
  course: string;
  amount: number;
  date: string;
  paymentMode: string;
  month: string;
  receiptNo?: string;
  remainingFee?: number;
}): string {
  const settings = getSettings();
  const dateStr = new Date(data.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const timeStr = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  });

  return `💰 *Fee Payment Confirmation*

प्रिय छात्र/अभिभावक,

आपकी फीस सफलतापूर्वक जमा हो गई है।

📌 *Payment Details:*
👤 Student Name: ${data.studentName}
📚 Course: ${data.course}
📅 Date: ${dateStr}
⏰ Time: ${timeStr}
💵 Paid Amount: ₹${data.amount.toLocaleString()}
🗓️ Fee For Month: ${data.month}
💳 Payment Mode: ${data.paymentMode.toUpperCase()}
${data.receiptNo ? `🧾 Receipt No: ${data.receiptNo}` : ''}
${data.remainingFee !== undefined ? `💼 Remaining Fee: ₹${data.remainingFee.toLocaleString()}` : ''}

कृपया इस संदेश को सुरक्षित रखें।

धन्यवाद 🙏
${settings.instituteName}
${settings.phone ? `📞 ${settings.phone}` : ''}`.trim();
}

export function openWhatsApp(number: string, message: string) {
  const sanitized = sanitizeNumber(number);
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${sanitized}?text=${encoded}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function generateStudentSummaryMessage(data: {
  name: string;
  studentId: string;
  course: string;
  paid: number;
  pending: number;
  lateFee: number;
  totalPayable: number;
}): string {
  const settings = getSettings();
  return `📋 *Student Fee Summary*

👤 Name: ${data.name}
🆔 ID: ${data.studentId}
📚 Course: ${data.course}

💰 *Payment Status:*
✅ Paid: ₹${data.paid.toLocaleString()}
⏳ Pending: ₹${data.pending.toLocaleString()}
⚠️ Late Fee: ₹${data.lateFee.toLocaleString()}
💵 Total Payable: ₹${data.totalPayable.toLocaleString()}

कृपया बकाया फीस जल्द से जल्द जमा करें।

धन्यवाद 🙏
${settings.instituteName}
${settings.phone ? `📞 ${settings.phone}` : ''}`.trim();
}

export function buildStudentSummary(student: {
  name: string;
  studentId: string;
  course: string;
  whatsappNumber: string;
  mobile: string;
  feeRecords: { amount: number; lateFee: number; status: string; paidAmount?: number; pendingAmount?: number }[];
}): { phone: string; message: string; data: { paid: number; pending: number; lateFee: number; totalPayable: number } } {
  let paid = 0, pending = 0, lateFee = 0;
  student.feeRecords.forEach(f => {
    const total = (f.amount || 0) + (f.lateFee || 0);
    if (f.status === 'paid') {
      paid += f.paidAmount ?? f.amount ?? 0;
    } else {
      paid += f.paidAmount ?? 0;
      pending += f.pendingAmount ?? total - (f.paidAmount ?? 0);
      lateFee += f.lateFee || 0;
    }
  });
  const totalPayable = pending;
  const message = generateStudentSummaryMessage({
    name: student.name, studentId: student.studentId, course: student.course,
    paid, pending, lateFee, totalPayable,
  });
  return {
    phone: student.whatsappNumber || student.mobile,
    message,
    data: { paid, pending, lateFee, totalPayable },
  };
}

export function shareStudentOnWhatsApp(student: Parameters<typeof buildStudentSummary>[0]) {
  const { phone, message } = buildStudentSummary(student);
  openWhatsApp(phone, message);
}
