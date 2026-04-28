import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { getStudents, markFeePaid, updateStudentFull, deleteStudent, updateStudentPhoto } from '@/lib/store';
import { getSettings } from '@/lib/settings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, Phone, GraduationCap, Calendar, CreditCard, ClipboardList, MessageSquare, User, Pencil, Trash2, Camera, Key, Power } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const settings = getSettings();
  const [refreshKey, setRefreshKey] = useState(0);
  const [editOpen, setEditOpen] = useState(false);

  const student = useMemo(() => {
    return getStudents().find(s => s.id === id);
  }, [id, refreshKey]);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '', fatherName: '', mobile: '', whatsappNumber: '', course: '', feeAmount: 0, status: 'active' as 'active' | 'stopped', password: '',
  });

  const openEdit = () => {
    if (!student) return;
    setEditForm({
      name: student.name,
      fatherName: student.fatherName,
      mobile: student.mobile,
      whatsappNumber: student.whatsappNumber,
      course: student.course,
      feeAmount: student.feeAmount,
      status: student.status,
      password: student.password || '',
    });
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!student) return;
    updateStudentFull(student.id, {
      name: editForm.name.trim(),
      fatherName: editForm.fatherName.trim(),
      mobile: editForm.mobile.trim(),
      whatsappNumber: editForm.whatsappNumber.trim(),
      course: editForm.course,
      feeAmount: editForm.feeAmount,
      status: editForm.status,
      password: editForm.password || student.password,
    });
    toast.success('Student info updated! ✅');
    setEditOpen(false);
    setRefreshKey(k => k + 1);
  };

  const handleDelete = () => {
    if (!student) return;
    const success = deleteStudent(student.id);
    if (success) {
      toast.success(`${student.name} has been deleted`);
      navigate('/admin/students');
    } else {
      toast.error('Failed to delete student');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !student) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image too large (max 2MB)'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      updateStudentPhoto(student.id, reader.result as string);
      toast.success('Photo updated!');
      setRefreshKey(k => k + 1);
    };
    reader.readAsDataURL(file);
  };

  const handleToggleStatus = () => {
    if (!student) return;
    const newStatus = student.status === 'active' ? 'stopped' : 'active';
    updateStudentFull(student.id, { status: newStatus });
    toast.success(`Student ${newStatus === 'active' ? 'activated' : 'stopped'}`);
    setRefreshKey(k => k + 1);
  };

  if (!student) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Student not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const presentCount = student.attendance.filter(a => a.status === 'present').length;
  const totalAttendance = student.attendance.length;
  const attendancePercent = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;
  const paidFees = student.feeRecords.filter(f => f.status === 'paid');
  const pendingFees = student.feeRecords.filter(f => f.status !== 'paid');

  const handleMarkPaid = (feeId: string, mode: 'cash' | 'upi' | 'online') => {
    markFeePaid(student.id, feeId, mode);
    toast.success('Fee marked as paid ✅');
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft size={16} /> Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={openEdit}>
            <Pencil size={14} /> Edit
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleToggleStatus}>
            <Power size={14} /> {student.status === 'active' ? 'Stop' : 'Activate'}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-1.5">
                <Trash2 size={14} /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Student?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete <strong>{student.name}</strong> ({student.studentId})?
                  This action cannot be undone. All data including fee records, attendance, and messages will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Yes, Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student — {student.studentId}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Student Name</Label>
              <Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Father's Name</Label>
              <Input value={editForm.fatherName} onChange={e => setEditForm(f => ({ ...f, fatherName: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Mobile</Label>
                <Input value={editForm.mobile} onChange={e => setEditForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))} />
              </div>
              <div className="space-y-1.5">
                <Label>WhatsApp</Label>
                <Input value={editForm.whatsappNumber} onChange={e => setEditForm(f => ({ ...f, whatsappNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Course</Label>
                <Select value={editForm.course} onValueChange={v => setEditForm(f => ({ ...f, course: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {settings.courses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Monthly Fee (₹)</Label>
                <Input type="number" value={editForm.feeAmount} onChange={e => setEditForm(f => ({ ...f, feeAmount: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={(v: 'active' | 'stopped') => setEditForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="stopped">Stopped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))} placeholder="Change password" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6"
      >
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="relative group">
            {student.photo ? (
              <img src={student.photo} alt={student.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/30" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <User className="text-primary" size={36} />
              </div>
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Camera size={20} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-xl font-bold text-foreground">{student.name}</h1>
              <p className="text-sm text-muted-foreground">S/o {student.fatherName}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <Badge variant="outline" className="gap-1"><GraduationCap size={12} /> {student.studentId}</Badge>
              <Badge variant="secondary" className="gap-1">{student.course}</Badge>
              <Badge variant={student.status === 'active' ? 'default' : 'destructive'}>
                {student.status === 'active' ? 'Active' : 'Stopped'}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Phone size={12} /> {student.mobile}</span>
              <span className="flex items-center gap-1"><Calendar size={12} /> Joined {new Date(student.admissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span className="flex items-center gap-1"><CreditCard size={12} /> ₹{student.feeAmount}/month</span>
              <span className="flex items-center gap-1"><Key size={12} /> {student.password}</span>
            </div>
          </div>
          <div className="flex gap-3 text-center">
            <div className="bg-success/10 rounded-lg px-4 py-2">
              <p className="text-2xl font-bold text-success">{attendancePercent}%</p>
              <p className="text-xs text-muted-foreground">Attendance</p>
            </div>
            <div className="bg-warning/10 rounded-lg px-4 py-2">
              <p className="text-2xl font-bold text-warning">{pendingFees.length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="fees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fees" className="gap-1.5"><CreditCard size={14} /> Fee History</TabsTrigger>
          <TabsTrigger value="attendance" className="gap-1.5"><ClipboardList size={14} /> Attendance</TabsTrigger>
          <TabsTrigger value="messages" className="gap-1.5"><MessageSquare size={14} /> Messages</TabsTrigger>
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
                  <th className="text-left p-4 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {student.feeRecords.map(f => (
                  <tr key={f.id} className="border-b border-border last:border-0">
                    <td className="p-4 font-medium text-foreground">{f.month}</td>
                    <td className="p-4 text-foreground">₹{f.amount}{f.lateFee > 0 && <span className="text-destructive text-xs ml-1">+₹{f.lateFee}</span>}</td>
                    <td className="p-4">
                      <Badge variant={f.status === 'paid' ? 'default' : f.status === 'overdue' ? 'destructive' : 'secondary'} className="text-xs capitalize">{f.status}</Badge>
                    </td>
                    <td className="p-4 text-muted-foreground text-xs hidden sm:table-cell">
                      {f.paidDate ? new Date(f.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    </td>
                    <td className="p-4">
                      {f.status !== 'paid' ? (
                        <Select onValueChange={(v) => handleMarkPaid(f.id, v as any)}>
                          <SelectTrigger className="h-8 w-28 text-xs">
                            <SelectValue placeholder="Mark Paid" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="online">Online</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-xs text-muted-foreground capitalize">{f.paymentMode || 'cash'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm">Attendance Record</h3>
              <div className="flex gap-3 text-xs">
                <span className="text-success">Present: {presentCount}</span>
                <span className="text-destructive">Absent: {student.attendance.filter(a => a.status === 'absent').length}</span>
                <span className="text-warning">Late: {student.attendance.filter(a => a.status === 'late').length}</span>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
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
                      <td className="p-3">
                        <Badge variant={a.status === 'present' ? 'default' : a.status === 'absent' ? 'destructive' : 'secondary'} className="text-xs capitalize">{a.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="messages">
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="divide-y divide-border">
              {student.messageHistory.map(m => (
                <div key={m.id} className="p-4 flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    m.type === 'welcome' ? 'bg-success/10' : m.type === 'warning' || m.type === 'final' ? 'bg-destructive/10' : 'bg-primary/10'
                  }`}>
                    <MessageSquare size={14} className={
                      m.type === 'welcome' ? 'text-success' : m.type === 'warning' || m.type === 'final' ? 'text-destructive' : 'text-primary'
                    } />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">{m.type}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(m.date).toLocaleDateString('en-IN')}</span>
                    </div>
                    <p className="text-sm text-foreground mt-1">{m.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
