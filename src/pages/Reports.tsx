import { useMemo } from 'react';
import { getStudents, getMonthlyRevenue, getCourseWiseStudents, getDashboardStats } from '@/lib/store';
import StatCard from '@/components/StatCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { Users, IndianRupee, TrendingUp, GraduationCap } from 'lucide-react';

const COLORS = ['hsl(215,80%,28%)', 'hsl(172,60%,40%)', 'hsl(145,60%,40%)', 'hsl(38,90%,55%)', 'hsl(0,72%,55%)', 'hsl(270,60%,50%)'];

export default function Reports() {
  const students = useMemo(() => getStudents(), []);
  const stats = useMemo(() => getDashboardStats(students), [students]);
  const monthlyRevenue = useMemo(() => getMonthlyRevenue(students), [students]);
  const courseWise = useMemo(() => getCourseWiseStudents(students), [students]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Fee analytics and student statistics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} variant="primary" />
        <StatCard title="Active Students" value={stats.activeStudents} icon={Users} variant="accent" />
        <StatCard title="Revenue This Month" value={`₹${stats.feeCollected.toLocaleString()}`} icon={IndianRupee} variant="success" />
        <StatCard title="Pending Fees" value={`₹${stats.pendingFees.toLocaleString()}`} icon={TrendingUp} variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold text-foreground mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="collected" name="Collected" fill="hsl(145,60%,40%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Pending" fill="hsl(38,90%,55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Course-wise Students */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold text-foreground mb-4">Course-wise Students</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={courseWise} dataKey="count" nameKey="course" cx="50%" cy="50%" outerRadius={90} label={({ course, count }) => `${course}: ${count}`}>
                {courseWise.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="collected" name="Collected" stroke="hsl(145,60%,40%)" strokeWidth={2} />
              <Line type="monotone" dataKey="pending" name="Pending" stroke="hsl(0,72%,55%)" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
