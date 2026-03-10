import { useMemo, useState } from 'react';
import { getStudents, markAttendance, saveStudents } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Search, Check, X, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Attendance() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const students = useMemo(() => getStudents().filter(s => s.status === 'active'), [refreshKey]);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId.toLowerCase().includes(search.toLowerCase()) ||
    s.course.toLowerCase().includes(search.toLowerCase())
  );

  const getAttendanceForDate = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student?.attendance.find(a => a.date === date);
  };

  const handleMark = (studentId: string, status: 'present' | 'absent' | 'late') => {
    markAttendance(studentId, date, status);
    setRefreshKey(k => k + 1);
  };

  const markAllPresent = () => {
    filtered.forEach(s => markAttendance(s.id, date, 'present'));
    toast.success('All marked present ✅');
    setRefreshKey(k => k + 1);
  };

  const presentToday = filtered.filter(s => getAttendanceForDate(s.id)?.status === 'present').length;
  const absentToday = filtered.filter(s => getAttendanceForDate(s.id)?.status === 'absent').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground text-sm mt-1">Mark daily attendance</p>
        </div>
        <div className="flex gap-3">
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-40" />
          <Button onClick={markAllPresent} variant="outline" size="sm">Mark All Present</Button>
        </div>
      </div>

      <div className="flex gap-3 text-sm">
        <Badge variant="default" className="gap-1"><Check size={12} /> Present: {presentToday}</Badge>
        <Badge variant="destructive" className="gap-1"><X size={12} /> Absent: {absentToday}</Badge>
        <Badge variant="secondary" className="gap-1"><Clock size={12} /> Unmarked: {filtered.length - presentToday - absentToday}</Badge>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input placeholder="Search student..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left p-4 font-medium text-muted-foreground">Student</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Course</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => {
              const att = getAttendanceForDate(s.id);
              return (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border last:border-0 hover:bg-muted/50"
                >
                  <td className="p-4">
                    <div className="font-medium text-foreground">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.studentId}</div>
                  </td>
                  <td className="p-4"><Badge variant="secondary" className="text-xs">{s.course}</Badge></td>
                  <td className="p-4">
                    {att ? (
                      <Badge variant={att.status === 'present' ? 'default' : att.status === 'absent' ? 'destructive' : 'secondary'} className="text-xs capitalize">
                        {att.status}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <Button size="sm" variant={att?.status === 'present' ? 'default' : 'outline'} className="h-7 w-7 p-0" onClick={() => handleMark(s.id, 'present')}>
                        <Check size={14} />
                      </Button>
                      <Button size="sm" variant={att?.status === 'absent' ? 'destructive' : 'outline'} className="h-7 w-7 p-0" onClick={() => handleMark(s.id, 'absent')}>
                        <X size={14} />
                      </Button>
                      <Button size="sm" variant={att?.status === 'late' ? 'secondary' : 'outline'} className="h-7 w-7 p-0" onClick={() => handleMark(s.id, 'late')}>
                        <Clock size={14} />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
