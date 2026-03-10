import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addStudent } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

const courses = ['ADCA', 'DCA', 'Tally', 'CCC', 'PGDCA', 'Web Design', 'Python', 'Java'];

export default function AddStudent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', fatherName: '', mobile: '', course: '', admissionDate: new Date().toISOString().split('T')[0], feeAmount: 500,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.fatherName || !form.mobile || !form.course) {
      toast.error('Please fill all fields');
      return;
    }
    addStudent(form);
    toast.success(`${form.name} admitted successfully! 🎉`);
    navigate('/students');
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">New Admission</h1>
        <p className="text-muted-foreground text-sm mt-1">Register a new student</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-5">
        <div className="space-y-2">
          <Label>Student Name</Label>
          <Input placeholder="e.g. Rahul Sharma" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Father's Name</Label>
          <Input placeholder="e.g. Suresh Sharma" value={form.fatherName} onChange={e => setForm(f => ({ ...f, fatherName: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Mobile Number</Label>
          <Input type="tel" placeholder="e.g. 9876543210" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Course</Label>
          <Select value={form.course} onValueChange={v => setForm(f => ({ ...f, course: v }))}>
            <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
            <SelectContent>
              {courses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Admission Date</Label>
            <Input type="date" value={form.admissionDate} onChange={e => setForm(f => ({ ...f, admissionDate: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Monthly Fee (₹)</Label>
            <Input type="number" value={form.feeAmount} onChange={e => setForm(f => ({ ...f, feeAmount: Number(e.target.value) }))} />
          </div>
        </div>
        <Button type="submit" className="w-full gap-2" size="lg">
          <UserPlus size={18} /> Admit Student
        </Button>
      </form>
    </div>
  );
}
