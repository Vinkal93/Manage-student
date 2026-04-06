import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents, markFeePaid } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Search, Check, Wallet, Plus } from 'lucide-react';

export default function FeeTracking() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const students = useMemo(() => getStudents(), [refreshKey]);

  const feeData = students.flatMap(s =>
    s.feeRecords.map(f => ({ ...f, studentId: s.id, studentName: s.name, studentCode: s.studentId, course: s.course, mobile: s.mobile }))
  ).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  const filtered = feeData.filter(f => {
    const matchSearch = f.studentName.toLowerCase().includes(search.toLowerCase()) || f.studentCode.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleMarkPaid = (studentId: string, feeId: string) => {
    markFeePaid(studentId, feeId, 'cash');
    toast.success('Fee marked as paid ✅');
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fee Tracking</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and manage all fee payments</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => navigate('/admin/fee-management')} variant="outline" className="gap-1.5 text-xs" size="sm">
            <Wallet size={14} /> Fee Management
          </Button>
          <Button onClick={() => navigate('/admin/fee-record')} className="gap-1.5 text-xs" size="sm">
            <Plus size={14} /> Fee Record
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input placeholder="Search student..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
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
                <th className="text-left p-4 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((f, i) => (
                <motion.tr
                  key={f.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="font-medium text-foreground">{f.studentName}</div>
                    <div className="text-xs text-muted-foreground">{f.studentCode} • {f.course}</div>
                  </td>
                  <td className="p-4 text-foreground">
                    {new Date(f.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="p-4 font-medium text-foreground">₹{f.amount}</td>
                  <td className="p-4 hidden sm:table-cell">
                    {f.lateFee > 0 ? <span className="text-destructive font-medium">₹{f.lateFee}</span> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="p-4">
                    <Badge variant={f.status === 'paid' ? 'default' : f.status === 'overdue' ? 'destructive' : 'secondary'} className="text-xs capitalize">{f.status}</Badge>
                  </td>
                  <td className="p-4">
                    {f.status !== 'paid' ? (
                      <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={() => handleMarkPaid(f.studentId, f.id)}>
                        <Check size={12} /> Paid
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">{f.paidDate ? new Date(f.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</span>
                    )}
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
