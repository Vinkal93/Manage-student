import { getSettings } from '@/lib/settings';

export interface ReceiptData {
  studentName: string;
  studentId: string;
  course: string;
  amount: number;
  paidAmount?: number;
  pendingAmount?: number;
  month: string;
  date: string;
  paymentMode: string;
  txnId?: string;
  receiptNo: string;
}

export function buildReceiptHTML(d: ReceiptData): string {
  const s = getSettings();
  const inst = s.instituteName || 'Institute';
  const dateStr = new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  return `<!doctype html><html><head><meta charset="utf-8"/><title>Receipt ${d.receiptNo}</title>
<style>
body{font-family:Arial,sans-serif;margin:0;padding:24px;color:#0f172a;background:#f8fafc}
.box{max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden}
.h{background:#1e3a8a;color:#fff;padding:18px 22px}
.h h1{margin:0;font-size:20px}.h p{margin:2px 0 0;font-size:12px;opacity:.85}
.body{padding:22px}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #e2e8f0;font-size:14px}
.row span:first-child{color:#64748b}.row span:last-child{font-weight:600}
.total{margin-top:12px;background:#ecfdf5;color:#065f46;padding:12px;border-radius:8px;font-size:16px;font-weight:700;text-align:center}
.foot{padding:14px 22px;text-align:center;font-size:11px;color:#64748b;border-top:1px solid #e2e8f0}
.btn{display:inline-block;margin:14px auto 0;background:#1e3a8a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:13px}
@media print{.btn{display:none}body{background:#fff}.box{border:none}}
</style></head><body>
<div class="box">
  <div class="h"><h1>${inst}</h1><p>Official Fee Payment Receipt</p></div>
  <div class="body">
    <div class="row"><span>Receipt No</span><span>${d.receiptNo}</span></div>
    <div class="row"><span>Date</span><span>${dateStr}</span></div>
    <div class="row"><span>Student Name</span><span>${d.studentName}</span></div>
    <div class="row"><span>Student ID</span><span>${d.studentId}</span></div>
    <div class="row"><span>Course</span><span>${d.course}</span></div>
    <div class="row"><span>Fee Month</span><span>${d.month}</span></div>
    <div class="row"><span>Payment Mode</span><span>${d.paymentMode.toUpperCase()}</span></div>
    ${d.txnId ? `<div class="row"><span>Transaction ID</span><span>${d.txnId}</span></div>` : ''}
    <div class="row"><span>Amount Paid</span><span>₹${(d.paidAmount ?? d.amount).toLocaleString()}</span></div>
    ${d.pendingAmount ? `<div class="row"><span>Pending</span><span>₹${d.pendingAmount.toLocaleString()}</span></div>` : ''}
    <div class="total">Total Received: ₹${(d.paidAmount ?? d.amount).toLocaleString()}</div>
    <div style="text-align:center"><a class="btn" href="javascript:window.print()">🖨️ Print / Save PDF</a></div>
  </div>
  <div class="foot">${s.phone ? '📞 ' + s.phone + ' • ' : ''}${s.email || ''}<br/>This is a computer-generated receipt.</div>
</div></body></html>`;
}

export function downloadReceipt(d: ReceiptData) {
  const html = buildReceiptHTML(d);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Receipt-${d.receiptNo}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function openReceipt(d: ReceiptData) {
  const html = buildReceiptHTML(d);
  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); }
}