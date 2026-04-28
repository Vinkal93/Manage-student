import { useState, useMemo } from 'react';
import { getStudents, saveStudents } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Search, IndianRupee, Calendar, CreditCard, StickyNote, CheckCircle2, User, Hash, Upload, FileDown } from 'lucide-react';
import { generateFeeMessage } from '@/lib/whatsapp';
import WhatsAppConfirmDialog from '@/components/WhatsAppConfirmDialog';
import { downloadReceipt, openReceipt } from '@/lib/receipt';

export default function FeeRecord() {
  const [search, setSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'online'>('cash');
  const [note, setNote] = useState('');
  const [txnId, setTxnId] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptName, setReceiptName] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [lastPayment, setLastPayment] = useState<{ studentName: string; course: string; amount: number; month: string; phone: string; receiptNo: string } | null>(null);

  const students = useMemo(() => getStudents(), [refreshKey]);

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students.filter(s => s.status === 'active');
    return students.filter(s =>
      s.status === 'active' && (
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.studentId.toLowerCase().includes(search.toLowerCase()) ||
        s.course.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [students, search]);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const recentRecords = useMemo(() => {
    return students.flatMap(s =>
      s.feeRecords.filter(f => f.status === 'paid').map(f => ({
        ...f, studentName: s.name, studentCode: s.studentId, course: s.course, _student: s,
      }))
    ).sort((a, b) => new Date(b.paidDate || '').getTime() - new Date(a.paidDate || '').getTime()).slice(0, 10);
  }, [students]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedStudentId) e.student = 'Please select a student';
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) e.amount = 'Enter valid amount';
    if (Number(amount) > 500000) e.amount = 'Amount seems too high';
    if (!date) e.date = 'Select date';
    if (paymentMode !== 'cash' && !txnId.trim()) e.txnId = 'Transaction ID required for UPI/Online';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const all = getStudents();
    const student = all.find(s => s.id === selectedStudentId);
    if (!student) return;

    const monthName = new Date(date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    const receiptNo = `RCP-${Date.now().toString(36).toUpperCase()}`;
    const paidAmt = Number(amount);
    const totalDue = student.feeAmount;
    const pendingAfter = Math.max(0, totalDue - paidAmt);

    student.feeRecords.push({
      id: crypto.randomUUID(), month: monthName, dueDate: date, paidDate: date,
      amount: totalDue, lateFee: 0,
      status: pendingAfter === 0 ? 'paid' : 'pending',
      paymentMode,
      paidAmount: paidAmt,
      pendingAmount: pendingAfter,
      txnId: txnId.trim() || undefined,
      receiptUrl: receiptUrl || undefined,
      receiptNo,
    });

    if (note.trim()) {
      student.messageHistory.push({
        id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0],
        type: 'bulk', message: `💰 Fee Payment: ₹${amount} received via ${paymentMode}. ${note}`, status: 'sent',
      });
    }

    saveStudents(all);

    setLastPayment({
      studentName: student.name, course: student.course,
      amount: paidAmt, month: monthName,
      phone: student.whatsappNumber || student.mobile,
      receiptNo,
    });
    setShowWhatsApp(true);

    toast.success(`₹${amount} fee recorded for ${student.name}${pendingAfter > 0 ? ` (₹${pendingAfter} pending)` : ' ✓ Fully paid'}`);
    setSelectedStudentId(''); setAmount(''); setNote(''); setSearch(''); setTxnId(''); setReceiptUrl(''); setReceiptName('');
    setRefreshKey(k => k + 1);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('File too large (max 2MB)'); return; }
    const reader = new FileReader();
    reader.onload = () => { setReceiptUrl(reader.result as string); setReceiptName(file.name); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {lastPayment && (
        <WhatsAppConfirmDialog
          open={showWhatsApp}
          onClose={() => setShowWhatsApp(false)}
          title="Fee Entry Saved Successfully! ✅"
          subtitle="क्या आप student को WhatsApp पर payment confirmation भेजना चाहते हैं?"
          phoneNumber={lastPayment.phone}
          message={generateFeeMessage({
            studentName: lastPayment.studentName,
            course: lastPayment.course,
            amount: lastPayment.amount,
            date, paymentMode, month: lastPayment.month,
            receiptNo: lastPayment.receiptNo,
          })}
          details={[
            { label: 'Student', value: lastPayment.studentName },
            { label: 'Amount', value: `₹${lastPayment.amount.toLocaleString()}` },
            { label: 'Month', value: lastPayment.month },
            { label: 'Receipt', value: lastPayment.receiptNo },
          ]}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <IndianRupee size={24} /> Fee Record
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Record fee payments for students</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6 space-y-5">
        <h3 className="font-semibold text-foreground">New Fee Entry</h3>

        <div className="space-y-1.5 relative">
          <Label className="flex items-center gap-1.5"><User size={14} /> Student Name</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <Input
              placeholder="Type to search student..."
              value={selectedStudent ? `${selectedStudent.name} (${selectedStudent.studentId})` : search}
              onChange={e => {
                setSearch(e.target.value); setSelectedStudentId(''); setDropdownOpen(true);
                if (errors.student) setErrors(er => { const n = { ...er }; delete n.student; return n; });
              }}
              onFocus={() => setDropdownOpen(true)}
              className={`pl-9 ${errors.student ? 'border-destructive' : ''}`}
            />
          </div>
          {errors.student && <p className="text-xs text-destructive">{errors.student}</p>}

          {dropdownOpen && !selectedStudentId && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="absolute z-20 w-full bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
              {filteredStudents.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground text-center">No students found</div>
              ) : (
                filteredStudents.slice(0, 8).map(s => (
                  <button key={s.id}
                    className="w-full text-left px-4 py-2.5 hover:bg-muted/50 flex items-center justify-between text-sm transition-colors"
                    onClick={() => { setSelectedStudentId(s.id); setSearch(''); setDropdownOpen(false); setAmount(String(s.feeAmount)); }}>
                    <div>
                      <span className="font-medium text-foreground">{s.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{s.studentId}</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{s.course}</Badge>
                  </button>
                ))
              )}
            </motion.div>
          )}
        </div>

        {selectedStudent && (
          <div className="bg-muted/50 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
            <div>
              <span className="font-medium">{selectedStudent.name}</span>
              <span className="text-muted-foreground ml-2">({selectedStudent.studentId})</span>
              <Badge variant="secondary" className="ml-2 text-xs">{selectedStudent.course}</Badge>
            </div>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => { setSelectedStudentId(''); setSearch(''); }}>Change</Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><IndianRupee size={14} /> Amount (₹)</Label>
            <Input type="number" value={amount} onChange={e => { setAmount(e.target.value); if (errors.amount) setErrors(er => { const n = { ...er }; delete n.amount; return n; }); }}
              placeholder="Enter amount" className={errors.amount ? 'border-destructive' : ''} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><Calendar size={14} /> Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className={errors.date ? 'border-destructive' : ''} />
            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5"><CreditCard size={14} /> Payment Mode</Label>
          <div className="flex gap-2 flex-wrap">
            {(['cash', 'upi', 'online'] as const).map(mode => (
              <button key={mode} onClick={() => setPaymentMode(mode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${paymentMode === mode ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                {mode === 'upi' ? 'UPI' : mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {paymentMode !== 'cash' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Hash size={14} /> Transaction / Reference ID</Label>
              <Input value={txnId} onChange={e => { setTxnId(e.target.value); if (errors.txnId) setErrors(er => { const n = { ...er }; delete n.txnId; return n; }); }}
                placeholder="e.g. UPI ref / Bank txn ID" className={errors.txnId ? 'border-destructive' : ''} />
              {errors.txnId && <p className="text-xs text-destructive">{errors.txnId}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Upload size={14} /> Receipt / Screenshot (Optional)</Label>
              <Input type="file" accept="image/*,application/pdf" onChange={handleReceiptUpload} />
              {receiptName && <p className="text-xs text-success">✓ {receiptName}</p>}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5"><StickyNote size={14} /> Note (Optional)</Label>
          <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..." rows={2} maxLength={200} />
          <p className="text-xs text-muted-foreground text-right">{note.length}/200</p>
        </div>

        <Button onClick={handleSubmit} className="w-full gap-2">
          <CheckCircle2 size={16} /> Record Payment
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Recent Payments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground">Student</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Mode</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.map(r => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="p-3">
                    <div className="font-medium text-foreground">{r.studentName}</div>
                    <div className="text-xs text-muted-foreground">{r.studentCode}</div>
                  </td>
                  <td className="p-3 font-medium text-foreground">₹{r.amount}</td>
                  <td className="p-3 hidden sm:table-cell">
                    <Badge variant="secondary" className="text-xs capitalize">{r.paymentMode || 'cash'}</Badge>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {r.paidDate ? new Date(r.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" title="View receipt"
                        onClick={() => openReceipt({
                          studentName: r.studentName, studentId: r.studentCode, course: r.course,
                          amount: r.amount, paidAmount: r.paidAmount, pendingAmount: r.pendingAmount,
                          month: r.month, date: r.paidDate || new Date().toISOString().split('T')[0],
                          paymentMode: r.paymentMode || 'cash', txnId: r.txnId,
                          receiptNo: r.receiptNo || `RCP-${r.id.slice(0,8).toUpperCase()}`,
                        })}>
                        <FileDown size={12} /> View
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" title="Download"
                        onClick={() => downloadReceipt({
                          studentName: r.studentName, studentId: r.studentCode, course: r.course,
                          amount: r.amount, paidAmount: r.paidAmount, pendingAmount: r.pendingAmount,
                          month: r.month, date: r.paidDate || new Date().toISOString().split('T')[0],
                          paymentMode: r.paymentMode || 'cash', txnId: r.txnId,
                          receiptNo: r.receiptNo || `RCP-${r.id.slice(0,8).toUpperCase()}`,
                        })}>
                        ⬇
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {recentRecords.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No recent payments</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
