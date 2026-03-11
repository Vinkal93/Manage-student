import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addStudent } from '@/lib/store';
import { createStudentFirebaseAccount } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { UserPlus, Copy } from 'lucide-react';

export default function AddStudent() {
  const navigate = useNavigate();
  const settings = getSettings();
  const [form, setForm] = useState({
    name: '', fatherName: '', mobile: '', whatsappNumber: '', course: '', admissionDate: new Date().toISOString().split('T')[0], feeAmount: 500, password: 'sbci123',
  });
  const [newStudent, setNewStudent] = useState<{ studentId: string; name: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.fatherName || !form.mobile || !form.course) {
      toast.error('Please fill all fields');
      return;
    }
    const student = addStudent({
      ...form,
      whatsappNumber: form.whatsappNumber || form.mobile,
    });
    
    // Create Firebase account for student
    await createStudentFirebaseAccount(student.studentId, form.password || 'sbci123');
    
    setNewStudent({ studentId: student.studentId, name: student.name });
    toast.success(`${form.name} admitted as ${student.studentId}! 🎉`);
  };

  const welcomeMessage = newStudent ? `Dear ${newStudent.name},\n\nWelcome to ${settings.instituteName}.\n\nStudent ID: ${newStudent.studentId}\nCourse: ${form.course}\nPassword: ${form.password}\n\nPlease keep this ID safe for login.\n\nRegards,\n${settings.instituteName}` : '';

  if (newStudent) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <UserPlus className="text-success" size={28} />
          </div>
          <h2 className="text-xl font-bold text-foreground">Admission Successful! 🎉</h2>
          <div className="bg-muted rounded-lg p-4 text-left space-y-2">
            <p className="text-sm"><strong>Name:</strong> {newStudent.name}</p>
            <p className="text-sm"><strong>Student ID:</strong> <span className="font-mono text-primary">{newStudent.studentId}</span></p>
            <p className="text-sm"><strong>Password:</strong> {form.password}</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-left">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground">WhatsApp Welcome Message:</p>
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => { navigator.clipboard.writeText(welcomeMessage); toast.success('Copied!'); }}>
                <Copy size={12} /> Copy
              </Button>
            </div>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans">{welcomeMessage}</pre>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { setNewStudent(null); setForm({ name: '', fatherName: '', mobile: '', whatsappNumber: '', course: '', admissionDate: new Date().toISOString().split('T')[0], feeAmount: 500, password: 'sbci123' }); }}>
              Add Another
            </Button>
            <Button className="flex-1" onClick={() => navigate('/admin/students')}>
              View Students
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Mobile Number</Label>
            <Input type="tel" placeholder="9876543210" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>WhatsApp Number</Label>
            <Input type="tel" placeholder="Same as mobile" value={form.whatsappNumber} onChange={e => setForm(f => ({ ...f, whatsappNumber: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Course</Label>
          <Select value={form.course} onValueChange={v => setForm(f => ({ ...f, course: v }))}>
            <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
            <SelectContent>
              {settings.courses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Admission Date</Label>
            <Input type="date" value={form.admissionDate} onChange={e => setForm(f => ({ ...f, admissionDate: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Monthly Fee (₹)</Label>
            <Input type="number" value={form.feeAmount} onChange={e => setForm(f => ({ ...f, feeAmount: Number(e.target.value) }))} />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="sbci123" />
          </div>
        </div>
        <Button type="submit" className="w-full gap-2" size="lg">
          <UserPlus size={18} /> Admit Student
        </Button>
      </form>
    </div>
  );
}
