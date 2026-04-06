import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Phone, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Students() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const students = useMemo(() => getStudents(), []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.course.toLowerCase().includes(search.toLowerCase()) ||
    s.mobile.includes(search) ||
    s.studentId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground text-sm mt-1">{students.length} total students</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => navigate('/admin/add-student')} className="gap-1.5 text-xs" size="sm">
            <UserPlus size={14} /> Add Student
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/student-management')} className="gap-1.5 text-xs" size="sm">
            <UserCog size={14} /> Manage Students
          </Button>
        </div>
      </div>
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          placeholder="Search name, ID, course, mobile..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-medium text-muted-foreground">ID</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Student</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Father</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Course</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Mobile</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Fee</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/student/${s.id}`)}
                >
                  <td className="p-4 text-xs text-muted-foreground font-mono">{s.studentId}</td>
                  <td className="p-4">
                    <div className="font-medium text-foreground">{s.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Adm: {new Date(s.admissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </td>
                  <td className="p-4 text-muted-foreground hidden sm:table-cell">{s.fatherName}</td>
                  <td className="p-4"><Badge variant="secondary" className="text-xs">{s.course}</Badge></td>
                  <td className="p-4 hidden md:table-cell">
                    <a href={`tel:${s.mobile}`} className="text-primary flex items-center gap-1 text-xs" onClick={e => e.stopPropagation()}>
                      <Phone size={12} /> {s.mobile}
                    </a>
                  </td>
                  <td className="p-4 font-medium text-foreground">₹{s.feeAmount}</td>
                  <td className="p-4">
                    <Badge variant={s.status === 'active' ? 'default' : 'destructive'} className="text-xs">
                      {s.status === 'active' ? 'Active' : 'Stopped'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={e => { e.stopPropagation(); navigate(`/admin/student/${s.id}`); }}>
                      <Eye size={14} />
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No students found</div>
        )}
      </div>
    </div>
  );
}
