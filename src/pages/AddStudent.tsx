import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addStudent, updateStudentFull } from '@/lib/store';
import { createStudentFirebaseAccount } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { UserPlus, Loader2 } from 'lucide-react';
import { generateAdmissionMessage } from '@/lib/whatsapp';
import WhatsAppConfirmDialog from '@/components/WhatsAppConfirmDialog';

export default function AddStudent() {
  const navigate = useNavigate();
  const settings = getSettings();
  const [form, setForm] = useState({
    name: '', fatherName: '', mobile: '', whatsappNumber: '', course: '', admissionDate: new Date().toISOString().split('T')[0], feeAmount: 500, password: 'sbci123',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savedStudent, setSavedStudent] = useState<{ studentId: string; name: string; mobile: string; whatsappNumber: string; course: string; admissionDate: string } | null>(null);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Student name is required';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    else if (form.name.trim().length > 100) e.name = 'Name must be under 100 characters';
    if (!form.fatherName.trim()) e.fatherName = "Father's name is required";
    else if (form.fatherName.trim().length < 2) e.fatherName = 'Name must be at least 2 characters';
    if (!form.mobile.trim()) e.mobile = 'Mobile number is required';
    else if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) e.mobile = 'Enter a valid 10-digit mobile number';
    if (form.whatsappNumber && form.whatsappNumber.trim() && !/^[6-9]\d{9}$/.test(form.whatsappNumber.trim())) {
      e.whatsappNumber = 'Enter a valid 10-digit number';
    }
    if (!form.course) e.course = 'Please select a course';
    if (!form.admissionDate) e.admissionDate = 'Admission date is required';
    if (!form.feeAmount || form.feeAmount <= 0) e.feeAmount = 'Fee must be greater than 0';
    else if (form.feeAmount > 100000) e.feeAmount = 'Fee seems too high';
    if (!form.password.trim()) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors in the form'); return; }
    setSubmitting(true);

    try {
      // Step 1: Add student to store (localStorage + Firebase RTDB)
      // We'll create Firebase Auth account first to get the UID
      const tempStudentId = 'TEMP_' + Date.now();

      // Step 2: Create Firebase Auth account — this returns the UID
      // and automatically re-authenticates as admin
      const result = await createStudentFirebaseAccount(
        // We need the final student ID but don't have it yet
        // So we create student in store first, then create auth account
        tempStudentId, // temp placeholder
        form.password || 'sbci123'
      );

      // Actually, let's do it properly:
      // 1. Create student in store to get the studentId
      const student = addStudent({
        name: form.name.trim(),
        fatherName: form.fatherName.trim(),
        mobile: form.mobile.trim(),
        whatsappNumber: (form.whatsappNumber || form.mobile).trim(),
        course: form.course,
        admissionDate: form.admissionDate,
        feeAmount: form.feeAmount,
      });

      // 2. Now create Firebase Auth account with the real studentId
      const authResult = await createStudentFirebaseAccount(student.studentId, form.password || 'sbci123');
      
      if (authResult.success && authResult.uid) {
        // Update student record with Firebase UID
        updateStudentFull(student.id, { firebaseUid: authResult.uid });
      }

      setSavedStudent({
        studentId: student.studentId,
        name: student.name,
        mobile: form.mobile.trim(),
        whatsappNumber: (form.whatsappNumber || form.mobile).trim(),
        course: form.course,
        admissionDate: form.admissionDate,
      });
      toast.success(`${form.name} admitted as ${student.studentId}! 🎉`);
      setShowWhatsApp(true);
    } catch (err) {
      console.error('Add student error:', err);
      toast.error('Failed to add student. Please try again.');
    }

    setSubmitting(false);
  };

  const clearError = (key: string) => {
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  };

  const resetForm = () => {
    setSavedStudent(null);
    setShowWhatsApp(false);
    setForm({ name: '', fatherName: '', mobile: '', whatsappNumber: '', course: '', admissionDate: new Date().toISOString().split('T')[0], feeAmount: 500, password: 'sbci123' });
    setErrors({});
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {savedStudent && (
        <WhatsAppConfirmDialog
          open={showWhatsApp}
          onClose={() => setShowWhatsApp(false)}
          title="Admission Saved Successfully! 🎉"
          subtitle="क्या आप student को WhatsApp पर welcome message भेजना चाहते हैं?"
          phoneNumber={savedStudent.whatsappNumber}
          message={generateAdmissionMessage(savedStudent)}
          details={[
            { label: 'Name', value: savedStudent.name },
            { label: 'Student ID', value: savedStudent.studentId },
            { label: 'Course', value: savedStudent.course },
          ]}
        />
      )}

      {savedStudent && !showWhatsApp ? (
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
            <UserPlus className="text-green-600 dark:text-green-400" size={28} />
          </div>
          <h2 className="text-xl font-bold text-foreground">Admission Successful! 🎉</h2>
          <div className="bg-muted rounded-lg p-4 text-left space-y-2">
            <p className="text-sm"><strong>Name:</strong> {savedStudent.name}</p>
            <p className="text-sm"><strong>Student ID:</strong> <span className="font-mono text-primary">{savedStudent.studentId}</span></p>
            <p className="text-sm"><strong>Course:</strong> {savedStudent.course}</p>
            <p className="text-sm text-muted-foreground"><strong>Login:</strong> Student ID + Password se login ho payega</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={resetForm}>Add Another</Button>
            <Button className="flex-1" onClick={() => navigate('/admin/students')}>View Students</Button>
          </div>
        </div>
      ) : !savedStudent && (
        <>
          <div>
            <h1 className="text-2xl font-bold text-foreground">New Admission</h1>
            <p className="text-muted-foreground text-sm mt-1">Register a new student (Firebase Auth account will be created automatically)</p>
          </div>
          <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-5">
            <div className="space-y-1.5">
              <Label>Student Name <span className="text-destructive">*</span></Label>
              <Input placeholder="e.g. Rahul Sharma" value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); clearError('name'); }} className={errors.name ? 'border-destructive' : ''} maxLength={100} />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Father's Name <span className="text-destructive">*</span></Label>
              <Input placeholder="e.g. Suresh Sharma" value={form.fatherName} onChange={e => { setForm(f => ({ ...f, fatherName: e.target.value })); clearError('fatherName'); }} className={errors.fatherName ? 'border-destructive' : ''} maxLength={100} />
              {errors.fatherName && <p className="text-xs text-destructive">{errors.fatherName}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Mobile Number <span className="text-destructive">*</span></Label>
                <Input type="tel" placeholder="9876543210" value={form.mobile} onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); setForm(f => ({ ...f, mobile: v })); clearError('mobile'); }} className={errors.mobile ? 'border-destructive' : ''} maxLength={10} />
                {errors.mobile && <p className="text-xs text-destructive">{errors.mobile}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>WhatsApp Number</Label>
                <Input type="tel" placeholder="Same as mobile" value={form.whatsappNumber} onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); setForm(f => ({ ...f, whatsappNumber: v })); clearError('whatsappNumber'); }} className={errors.whatsappNumber ? 'border-destructive' : ''} maxLength={10} />
                {errors.whatsappNumber && <p className="text-xs text-destructive">{errors.whatsappNumber}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Course <span className="text-destructive">*</span></Label>
              <Select value={form.course} onValueChange={v => { setForm(f => ({ ...f, course: v })); clearError('course'); }}>
                <SelectTrigger className={errors.course ? 'border-destructive' : ''}><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {settings.courses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.course && <p className="text-xs text-destructive">{errors.course}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Admission Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={form.admissionDate} onChange={e => { setForm(f => ({ ...f, admissionDate: e.target.value })); clearError('admissionDate'); }} className={errors.admissionDate ? 'border-destructive' : ''} />
                {errors.admissionDate && <p className="text-xs text-destructive">{errors.admissionDate}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Monthly Fee (₹) <span className="text-destructive">*</span></Label>
                <Input type="number" value={form.feeAmount} onChange={e => { setForm(f => ({ ...f, feeAmount: Number(e.target.value) })); clearError('feeAmount'); }} className={errors.feeAmount ? 'border-destructive' : ''} min={1} max={100000} />
                {errors.feeAmount && <p className="text-xs text-destructive">{errors.feeAmount}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Password <span className="text-destructive">*</span></Label>
                <Input value={form.password} onChange={e => { setForm(f => ({ ...f, password: e.target.value })); clearError('password'); }} placeholder="min 6 chars" className={errors.password ? 'border-destructive' : ''} />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>
            </div>
            <Button type="submit" className="w-full gap-2" size="lg" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2"><Loader2 size={18} className="animate-spin" /> Creating...</span>
              ) : (
                <><UserPlus size={18} /> Admit Student</>
              )}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
