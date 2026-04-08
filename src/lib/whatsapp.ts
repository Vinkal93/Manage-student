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
