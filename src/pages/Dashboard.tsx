import { Users, IndianRupee, AlertTriangle, UserPlus } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { getStudents, getDashboardStats } from '@/lib/store';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const students = useMemo(() => getStudents(), []);
  const stats = useMemo(() => getDashboardStats(students), [students]);

  const recentStudents = students.slice(-5).reverse();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">SBCI Computer Institute Overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} variant="primary" />
        <StatCard title="Fee Collected" value={`₹${stats.feeCollected.toLocaleString()}`} icon={IndianRupee} variant="success" />
        <StatCard title="Pending Fees" value={`₹${stats.pendingFees.toLocaleString()}`} icon={AlertTriangle} variant="warning" />
        <StatCard title="New Admissions" value={stats.newAdmissions} icon={UserPlus} variant="accent" />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent Students</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Course</th>
                <th className="text-left p-4 font-medium">Fee</th>
                <th className="text-left p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentStudents.map(s => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="p-4 font-medium text-foreground">{s.name}</td>
                  <td className="p-4 text-muted-foreground">{s.course}</td>
                  <td className="p-4 text-foreground">₹{s.feeAmount}</td>
                  <td className="p-4">
                    <Badge variant={s.status === 'active' ? 'default' : 'destructive'} className="text-xs">
                      {s.status === 'active' ? 'Active' : 'Stopped'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
