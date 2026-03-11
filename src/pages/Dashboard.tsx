import { Users, IndianRupee, AlertTriangle, UserPlus, ClipboardList, TrendingUp } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { getStudents, getDashboardStats } from '@/lib/store';
import { getSettings } from '@/lib/settings';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const settings = getSettings();
  const students = useMemo(() => getStudents(), []);
  const stats = useMemo(() => getDashboardStats(students), [students]);

  const recentStudents = students.slice(-5).reverse();
  const pendingFeeStudents = students.filter(s => s.feeRecords.some(f => f.status === 'overdue')).slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">{settings.instituteName} Overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} variant="primary" />
        <StatCard title="Active" value={stats.activeStudents} icon={Users} variant="accent" />
        <StatCard title="Fee Collected" value={`₹${stats.feeCollected.toLocaleString()}`} icon={IndianRupee} variant="success" />
        <StatCard title="Pending Fees" value={`₹${stats.pendingFees.toLocaleString()}`} icon={AlertTriangle} variant="warning" />
        <StatCard title="New Admissions" value={stats.newAdmissions} icon={UserPlus} variant="accent" />
        <StatCard title="Today Present" value={stats.todayPresent} icon={ClipboardList} variant="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Recent Students</h2>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/admin/students')}>View All</Button>
          </div>
          <div className="divide-y divide-border">
            {recentStudents.map(s => (
              <div key={s.id} className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => navigate(`/admin/student/${s.id}`)}>
                <div>
                  <p className="font-medium text-foreground text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.studentId} • {s.course}</p>
                </div>
                <Badge variant={s.status === 'active' ? 'default' : 'destructive'} className="text-xs">
                  {s.status === 'active' ? 'Active' : 'Stopped'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">⚠️ Pending Fees</h2>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/admin/fee-management')}>View All</Button>
          </div>
          <div className="divide-y divide-border">
            {pendingFeeStudents.map(s => {
              const overdueFees = s.feeRecords.filter(f => f.status === 'overdue');
              const totalPending = overdueFees.reduce((a, b) => a + b.amount + b.lateFee, 0);
              return (
                <div key={s.id} className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => navigate(`/admin/student/${s.id}`)}>
                  <div>
                    <p className="font-medium text-foreground text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.studentId} • {overdueFees.length} month(s) overdue</p>
                  </div>
                  <span className="text-sm font-semibold text-destructive">₹{totalPending}</span>
                </div>
              );
            })}
            {pendingFeeStudents.length === 0 && (
              <div className="p-6 text-center text-muted-foreground text-sm">No pending fees 🎉</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
