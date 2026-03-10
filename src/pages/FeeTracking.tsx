import { useMemo } from 'react';
import { getStudents } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function FeeTracking() {
  const students = useMemo(() => getStudents(), []);

  const feeData = students.flatMap(s =>
    s.feeRecords.map(f => ({ ...f, studentName: s.name, course: s.course, mobile: s.mobile }))
  ).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    paid: 'default',
    pending: 'secondary',
    overdue: 'destructive',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Fee Tracking</h1>
        <p className="text-muted-foreground text-sm mt-1">Track all fee payments</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-medium text-muted-foreground">Student</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Due Date</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Late Fee</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Paid On</th>
              </tr>
            </thead>
            <tbody>
              {feeData.slice(0, 30).map((f, i) => (
                <motion.tr
                  key={f.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="font-medium text-foreground">{f.studentName}</div>
                    <div className="text-xs text-muted-foreground">{f.course}</div>
                  </td>
                  <td className="p-4 text-foreground">
                    {new Date(f.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="p-4 font-medium text-foreground">₹{f.amount}</td>
                  <td className="p-4 hidden sm:table-cell">
                    {f.lateFee > 0 ? <span className="text-destructive font-medium">₹{f.lateFee}</span> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="p-4">
                    <Badge variant={statusColors[f.status]} className="text-xs capitalize">{f.status}</Badge>
                  </td>
                  <td className="p-4 text-muted-foreground text-xs hidden md:table-cell">
                    {f.paidDate ? new Date(f.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
