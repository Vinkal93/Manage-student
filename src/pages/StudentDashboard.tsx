import { useMemo } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { getStudents } from '@/lib/store';
import { getSettings } from '@/lib/settings';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatCard from '@/components/StatCard';
import { motion } from 'framer-motion';
import { GraduationCap, CreditCard, ClipboardList, MessageSquare, BookOpen } from 'lucide-react';

export default function StudentDashboard() {
  const user = getCurrentUser();
  const settings = getSettings();
  const student = useMemo(() => {
    const students = getStudents();
    return students.find(s => s.id === user?.id || s.studentId === user?.studentId);
  }, [user]);

  if (!student) {
    return <div className="text-center py-20 text-muted-foreground">Student data not found. Please contact admin.</div>;
  }

  const presentCount = student.attendance.filter(a => a.status === 'present').length;
  const totalAttendance = student.attendance.length;
  const attendancePercent = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;
  const paidFees = student.feeRecords.filter(f => f.status === 'paid').length;
  const pendingFees = student.feeRecords.filter(f => f.status !== 'paid').length;
  const totalPaid = student.feeRecords.filter(f => f.status === 'paid').reduce((a, b) => a + b.amount, 0);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Welcome {student.name} 👋</h1>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="gap-1"><GraduationCap size={12} /> {student.studentId}</Badge>
          <Badge variant="secondary">{student.course}</Badge>
          <Badge variant="outline">Joined {new Date(student.admissionDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</Badge>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Attendance" value={`${attendancePercent}%`} icon={ClipboardList} variant="primary" />
        <StatCard title="Fees Paid" value={paidFees} icon={CreditCard} variant="success" />
        <StatCard title="Pending Fees" value={pendingFees} icon={CreditCard} variant="warning" />
        <StatCard title="Total Paid" value={`₹${totalPaid.toLocaleString()}`} icon={CreditCard} variant="accent" />
      </div>

      <Tabs defaultValue="fees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fees" className="text-xs gap-1"><CreditCard size={14} /> Fees</TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs gap-1"><ClipboardList size={14} /> Attendance</TabsTrigger>
          <TabsTrigger value="messages" className="text-xs gap-1"><MessageSquare size={14} /> Messages</TabsTrigger>
          <TabsTrigger value="course" className="text-xs gap-1"><BookOpen size={14} /> Course</TabsTrigger>
        </TabsList>

        <TabsContent value="fees">
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-medium text-muted-foreground">Month</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Paid On</th>
                </tr>
              </thead>
              <tbody>
                {student.feeRecords.map(f => (
                  <tr key={f.id} className="border-b border-border last:border-0">
                    <td className="p-4 font-medium text-foreground">{f.month}</td>
                    <td className="p-4 text-foreground">₹{f.amount}</td>
                    <td className="p-4"><Badge variant={f.status === 'paid' ? 'default' : 'destructive'} className="text-xs capitalize">{f.status}</Badge></td>
                    <td className="p-4 text-muted-foreground text-xs hidden sm:table-cell">{f.paidDate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {student.attendance.slice(-30).reverse().map(a => (
                  <tr key={a.id} className="border-b border-border last:border-0">
                    <td className="p-3 text-foreground">{new Date(a.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                    <td className="p-3"><Badge variant={a.status === 'present' ? 'default' : 'destructive'} className="text-xs capitalize">{a.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="messages">
          <div className="bg-card rounded-xl border border-border shadow-sm divide-y divide-border">
            {student.messageHistory.map(m => (
              <div key={m.id} className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs capitalize">{m.type}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(m.date).toLocaleDateString('en-IN')}</span>
                </div>
                <p className="text-sm text-foreground">{m.message}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="course">
          <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Course Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Course</p>
                <p className="font-medium text-foreground">{student.course}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Monthly Fee</p>
                <p className="font-medium text-foreground">₹{student.feeAmount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="font-medium text-foreground">{student.course === 'ADCA' || student.course === 'PGDCA' ? '12 Months' : '6 Months'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Certificate</p>
                <p className="font-medium text-foreground">On Completion</p>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">{settings.instituteName} - Rules:</p>
              <p>• Fee must be paid before {settings.feeDueDate}th of every month</p>
              <p>• Late fee of ₹{settings.lateFeeAmount} may apply after {settings.feeDueDate}th</p>
              <p>• Minimum 75% attendance required for certificate</p>
              <p>• Classes may be stopped for pending fees beyond 20 days</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
