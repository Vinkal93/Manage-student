import { useMemo } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { getStudents } from '@/lib/store';
import { getFeatures, calcLateFee } from '@/lib/features';
import { getSettings } from '@/lib/settings';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { QrCode, IndianRupee, AlertCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentPayment() {
  const user = getCurrentUser();
  const features = getFeatures();
  const settings = getSettings();
  const student = useMemo(() => {
    return getStudents().find(s => s.id === user?.id || s.studentId === user?.studentId);
  }, [user]);

  if (!student) return <div className="text-center py-20 text-muted-foreground">Student not found</div>;

  const summary = useMemo(() => {
    let pending = 0, late = 0;
    student.feeRecords.forEach(f => {
      if (f.status !== 'paid') {
        pending += f.amount;
        late += calcLateFee(f.dueDate, false);
      }
    });
    return { pending, late, total: pending + late };
  }, [student]);

  const copyUpi = () => {
    if (!features.upiId) return;
    navigator.clipboard.writeText(features.upiId);
    toast.success('UPI ID copied!');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Pay Fees Online</h1>
        <p className="text-sm text-muted-foreground mt-1">Scan QR or use UPI to pay your pending fees</p>
      </motion.div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2"><IndianRupee size={16} /> Fee Summary</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-lg font-bold text-foreground">₹{summary.pending}</p>
          </div>
          <div className="bg-destructive/10 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Late Fee</p>
            <p className="text-lg font-bold text-destructive">₹{summary.late}</p>
          </div>
          <div className="bg-primary/10 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Total Payable</p>
            <p className="text-lg font-bold text-primary">₹{summary.total}</p>
          </div>
        </div>
      </div>

      {features.toggles.qrPayment && features.qrImage ? (
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 text-center">
          <h3 className="font-semibold text-foreground flex items-center justify-center gap-2 mb-4"><QrCode size={16} /> Scan QR to Pay</h3>
          <img src={features.qrImage} alt="Payment QR" className="mx-auto max-w-[260px] rounded-lg border border-border" />
          {features.upiId && (
            <button onClick={copyUpi} className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline">
              <Copy size={14} /> {features.upiId}
            </button>
          )}
          <p className="text-xs text-muted-foreground mt-3">Pay ₹{summary.total} and inform admin with screenshot</p>
        </div>
      ) : (
        <div className="bg-muted/30 rounded-xl border border-dashed border-border p-8 text-center">
          <AlertCircle className="mx-auto mb-2 text-muted-foreground" size={28} />
          <p className="text-sm text-muted-foreground">Online payment not configured yet. Please pay at {settings.instituteName}.</p>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground">Pending Fee Breakdown</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr><th className="text-left p-3">Month</th><th className="text-left p-3">Amount</th><th className="text-left p-3">Late</th><th className="text-left p-3">Status</th></tr>
          </thead>
          <tbody>
            {student.feeRecords.filter(f => f.status !== 'paid').map(f => (
              <tr key={f.id} className="border-t border-border">
                <td className="p-3 font-medium">{f.month}</td>
                <td className="p-3">₹{f.amount}</td>
                <td className="p-3 text-destructive">₹{calcLateFee(f.dueDate, false)}</td>
                <td className="p-3"><Badge variant="destructive" className="text-xs capitalize">{f.status}</Badge></td>
              </tr>
            ))}
            {student.feeRecords.filter(f => f.status !== 'paid').length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-muted-foreground text-sm">No pending fees 🎉</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
