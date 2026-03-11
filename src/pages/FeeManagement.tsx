import { useMemo, useState } from 'react';
import { getStudents, markFeePaid } from '@/lib/store';
import { exportFeesToExcel } from '@/lib/export';
import { getSettings } from '@/lib/settings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Search, Check, Download, IndianRupee, AlertTriangle, TrendingUp, Filter, X } from 'lucide-react';
import StatCard from '@/components/StatCard';

export default function FeeManagement() {
  const settings = getSettings();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [paymentModeFilter, setPaymentModeFilter] = useState('all');
  const [amountRange, setAmountRange] = useState<'all' | 'low' | 'mid' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'name'>('date-desc');
  const [refreshKey, setRefreshKey] = useState(0);
  const students = useMemo(() => getStudents(), [refreshKey]);

  const courses = [...new Set(students.map(s => s.course))];
  const months = [...new Set(students.flatMap(s => s.feeRecords.map(f => f.month)))];

  const feeData = useMemo(() => {
    let data = students.flatMap(s =>
      s.feeRecords.map(f => ({
        ...f,
        studentId: s.id,
        studentName: s.name,
        studentCode: s.studentId,
        course: s.course,
        mobile: s.mobile,
        studentStatus: s.status,
      }))
    );

    // Search
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(f => f.studentName.toLowerCase().includes(q) || f.studentCode.toLowerCase().includes(q) || f.course.toLowerCase().includes(q));
    }
    // Status
    if (statusFilter !== 'all') data = data.filter(f => f.status === statusFilter);
    // Course
    if (courseFilter !== 'all') data = data.filter(f => f.course === courseFilter);
    // Month
    if (monthFilter !== 'all') data = data.filter(f => f.month === monthFilter);
    // Payment mode
    if (paymentModeFilter !== 'all') data = data.filter(f => f.paymentMode === paymentModeFilter);
    // Amount range
    if (amountRange === 'low') data = data.filter(f => f.amount <= 500);
    else if (amountRange === 'mid') data = data.filter(f => f.amount > 500 && f.amount <= 1000);
    else if (amountRange === 'high') data = data.filter(f => f.amount > 1000);

    // Sort
    data.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      if (sortBy === 'date-asc') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (sortBy === 'amount-desc') return (b.amount + b.lateFee) - (a.amount + a.lateFee);
      if (sortBy === 'amount-asc') return (a.amount + a.lateFee) - (b.amount + b.lateFee);
      return a.studentName.localeCompare(b.studentName);
    });

    return data;
  }, [students, search, statusFilter, courseFilter, monthFilter, paymentModeFilter, amountRange, sortBy]);

  // Stats
  const totalCollected = feeData.filter(f => f.status === 'paid').reduce((a, b) => a + b.amount, 0);
  const totalPending = feeData.filter(f => f.status !== 'paid').reduce((a, b) => a + b.amount + b.lateFee, 0);
  const overdueCount = feeData.filter(f => f.status === 'overdue').length;
  const totalLateFees = feeData.reduce((a, b) => a + b.lateFee, 0);

  const handleMarkPaid = (studentId: string, feeId: string, mode: 'cash' | 'upi' | 'online') => {
    markFeePaid(studentId, feeId, mode);
    toast.success('Fee marked as paid ✅');
    setRefreshKey(k => k + 1);
  };

  const clearFilters = () => {
    setSearch(''); setStatusFilter('all'); setCourseFilter('all');
    setMonthFilter('all'); setPaymentModeFilter('all'); setAmountRange('all');
    setSortBy('date-desc');
  };

  const hasFilters = statusFilter !== 'all' || courseFilter !== 'all' || monthFilter !== 'all' || paymentModeFilter !== 'all' || amountRange !== 'all' || search;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fee Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Detailed fee analytics and management</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => exportFeesToExcel(students)}>
          <Download size={16} /> Export Excel
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Collected" value={`₹${totalCollected.toLocaleString()}`} icon={IndianRupee} variant="success" />
        <StatCard title="Total Pending" value={`₹${totalPending.toLocaleString()}`} icon={AlertTriangle} variant="warning" />
        <StatCard title="Overdue Records" value={overdueCount} icon={AlertTriangle} variant="primary" />
        <StatCard title="Late Fees" value={`₹${totalLateFees.toLocaleString()}`} icon={TrendingUp} variant="accent" />
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2"><Filter size={14} /> Filters</h3>
          {hasFilters && (
            <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={clearFilters}>
              <X size={12} /> Clear All
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">✅ Paid</SelectItem>
              <SelectItem value="pending">⏳ Pending</SelectItem>
              <SelectItem value="overdue">🔴 Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Course" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Month" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={amountRange} onValueChange={(v: any) => setAmountRange(v)}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Amount" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Amounts</SelectItem>
              <SelectItem value="low">≤ ₹500</SelectItem>
              <SelectItem value="mid">₹501 - ₹1000</SelectItem>
              <SelectItem value="high">&gt; ₹1000</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="amount-desc">Amount ↓</SelectItem>
              <SelectItem value="amount-asc">Amount ↑</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {feeData.length} records</span>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-medium text-muted-foreground">Student</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Course</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Month</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Due Date</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Late Fee</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Total</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Mode</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {feeData.slice(0, 100).map((f, i) => (
                <motion.tr
                  key={`${f.id}-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.01, 0.5) }}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="font-medium text-foreground">{f.studentName}</div>
                    <div className="text-xs text-muted-foreground">{f.studentCode}</div>
                  </td>
                  <td className="p-4"><Badge variant="secondary" className="text-xs">{f.course}</Badge></td>
                  <td className="p-4 text-foreground text-xs">{f.month}</td>
                  <td className="p-4 text-foreground text-xs">{new Date(f.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td className="p-4 font-medium text-foreground">₹{f.amount}</td>
                  <td className="p-4 hidden sm:table-cell">
                    {f.lateFee > 0 ? <span className="text-destructive font-medium">₹{f.lateFee}</span> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="p-4 hidden md:table-cell font-semibold text-foreground">₹{f.amount + f.lateFee}</td>
                  <td className="p-4">
                    <Badge variant={f.status === 'paid' ? 'default' : f.status === 'overdue' ? 'destructive' : 'secondary'} className="text-xs capitalize">{f.status}</Badge>
                  </td>
                  <td className="p-4 hidden sm:table-cell text-xs text-muted-foreground capitalize">{f.paymentMode || '—'}</td>
                  <td className="p-4">
                    {f.status !== 'paid' ? (
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => handleMarkPaid(f.studentId, f.id, 'cash')}>Cash</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => handleMarkPaid(f.studentId, f.id, 'upi')}>UPI</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => handleMarkPaid(f.studentId, f.id, 'online')}>Online</Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">{f.paidDate ? new Date(f.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '✅'}</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {feeData.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No records found</div>
        )}
      </div>
    </div>
  );
}
