import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addStudent, updateStudentFull } from '@/lib/store';
import { createStudentFirebaseAccount } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { UserPlus, Loader2, Copy, MessageCircle, FileText } from 'lucide-react';
import { generateAdmissionMessage, openWhatsApp } from '@/lib/whatsapp';
import WhatsAppConfirmDialog from '@/components/WhatsAppConfirmDialog';

export default function AddStudent() {
  const navigate = useNavigate();
  const settings = getSettings();
  const [form, setForm] = useState({
    name: '', fatherName: '', motherName: '', mobile: '', whatsappNumber: '',
    course: '', admissionDate: new Date().toISOString().split('T')[0],
    feeAmount: 500, password: 'sbci123',
    dob: '', address: '', email: '', aadharNumber: '', linkedMobileNumber: '',
  });
  const [photoFile, setPhotoFile] = useState<string | undefined>();
  const [signatureFile, setSignatureFile] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savedStudent, setSavedStudent] = useState<any>(null);

  const handleFileRead = (file: File, setter: (v: string) => void) => {
    if (file.size > 1.5 * 1024 * 1024) { toast.error('File too large (max 1.5MB)'); return; }
    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Student name is required';
    if (!form.fatherName.trim()) e.fatherName = "Father's name is required";
    if (!form.mobile.trim()) e.mobile = 'Mobile number is required';
    else if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) e.mobile = 'Enter a valid 10-digit mobile number';
    if (form.whatsappNumber && form.whatsappNumber.trim() && !/^[6-9]\d{9}$/.test(form.whatsappNumber.trim())) {
      e.whatsappNumber = 'Enter a valid 10-digit number';
    }
    if (!form.course) e.course = 'Please select a course';
    if (!form.admissionDate) e.admissionDate = 'Admission date is required';
    if (!form.feeAmount || form.feeAmount <= 0) e.feeAmount = 'Fee must be greater than 0';
    if (!form.password.trim()) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.aadharNumber && form.aadharNumber.trim() && !/^\d{12}$/.test(form.aadharNumber.replace(/\s/g, ''))) {
      e.aadharNumber = 'Aadhar must be 12 digits';
    }
    if (form.email && form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Enter a valid email';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors in the form'); return; }
    setSubmitting(true);
    try {
      const student = addStudent({
        name: form.name.trim(), fatherName: form.fatherName.trim(), motherName: form.motherName.trim(),
        mobile: form.mobile.trim(), whatsappNumber: (form.whatsappNumber || form.mobile).trim(),
        course: form.course, admissionDate: form.admissionDate, feeAmount: form.feeAmount,
        password: form.password, dob: form.dob, address: form.address.trim(),
        email: form.email.trim(), aadharNumber: form.aadharNumber.replace(/\s/g, ''),
        linkedMobileNumber: form.linkedMobileNumber.trim(),
        photo: photoFile, signature: signatureFile,
      });
      const authResult = await createStudentFirebaseAccount(student.studentId, form.password || 'sbci123');
      if (authResult.success && authResult.uid) {
        updateStudentFull(student.id, { firebaseUid: authResult.uid });
      }
      setSavedStudent({ studentId: student.studentId, name: student.name, mobile: form.mobile.trim(),
        whatsappNumber: (form.whatsappNumber || form.mobile).trim(), course: form.course,
        admissionDate: form.admissionDate, password: form.password });
      toast.success(`${form.name} admitted as ${student.studentId}! 🎉`);
      setShowWhatsApp(true);
    } catch (err) {
      console.error('Add student error:', err);
      toast.error('Failed to add student. Please try again.');
    }
    setSubmitting(false);
  };

  const clearError = (key: string) => { if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n; }); };

  const resetForm = () => {
    setSavedStudent(null); setShowWhatsApp(false); setPhotoFile(undefined); setSignatureFile(undefined);
    setForm({ name: '', fatherName: '', motherName: '', mobile: '', whatsappNumber: '', course: '',
      admissionDate: new Date().toISOString().split('T')[0], feeAmount: 500, password: 'sbci123',
      dob: '', address: '', email: '', aadharNumber: '', linkedMobileNumber: '' });
    setErrors({});
  };

  const copyWelcomeMessage = () => {
    if (!savedStudent) return;
    const msg = generateAdmissionMessage(savedStudent);
    navigator.clipboard.writeText(msg);
    toast.success('Welcome message copied! 📋');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {savedStudent && (
        <WhatsAppConfirmDialog open={showWhatsApp} onClose={() => setShowWhatsApp(false)}
          title="Admission Saved Successfully! 🎉"
          subtitle="क्या आप student को WhatsApp पर welcome message भेजना चाहते हैं?"
          phoneNumber={savedStudent.whatsappNumber} message={generateAdmissionMessage(savedStudent)}
          details={[
            { label: 'Name', value: savedStudent.name },
            { label: 'Student ID', value: savedStudent.studentId },
            { label: 'Course', value: savedStudent.course },
            { label: 'Password', value: savedStudent.password },
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
            <p className="text-sm"><strong>Password:</strong> <span className="font-mono">{savedStudent.password}</span></p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={copyWelcomeMessage}>
              <Copy size={14} /> Copy Welcome Msg
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5"
              onClick={() => openWhatsApp(savedStudent.whatsappNumber, generateAdmissionMessage(savedStudent))}>
              <MessageCircle size={14} /> WhatsApp
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            📋 Required Documents: {settings.requiredDocuments?.join(', ') || 'Aadhar, Photos, Marksheets'}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={resetForm}>Add Another</Button>
            <Button className="flex-1" onClick={() => navigate('/admin/students')}>View Students</Button>
          </div>
        </div>
      ) : !savedStudent && (
        <>
          <div>
            <h1 className="text-2xl font-bold text-foreground">New Admission</h1>
            <p className="text-muted-foreground text-sm mt-1">Register a new student with complete details</p>
          </div>
          <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-5">
            {/* Basic Info */}
            <h3 className="font-semibold text-foreground border-b pb-2">👤 Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. Rahul Sharma" value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); clearError('name'); }} className={errors.name ? 'border-destructive' : ''} />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Date of Birth</Label>
                <Input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Father's Name <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. Suresh Sharma" value={form.fatherName} onChange={e => { setForm(f => ({ ...f, fatherName: e.target.value })); clearError('fatherName'); }} className={errors.fatherName ? 'border-destructive' : ''} />
                {errors.fatherName && <p className="text-xs text-destructive">{errors.fatherName}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Mother's Name</Label>
                <Input placeholder="e.g. Sunita Sharma" value={form.motherName} onChange={e => setForm(f => ({ ...f, motherName: e.target.value }))} />
              </div>
            </div>

            {/* Contact */}
            <h3 className="font-semibold text-foreground border-b pb-2">📞 Contact Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Mobile Number <span className="text-destructive">*</span></Label>
                <Input type="tel" placeholder="9876543210" value={form.mobile} onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); setForm(f => ({ ...f, mobile: v })); clearError('mobile'); }} className={errors.mobile ? 'border-destructive' : ''} />
                {errors.mobile && <p className="text-xs text-destructive">{errors.mobile}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>WhatsApp Number</Label>
                <Input type="tel" placeholder="Same as mobile" value={form.whatsappNumber} onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); setForm(f => ({ ...f, whatsappNumber: v })); clearError('whatsappNumber'); }} className={errors.whatsappNumber ? 'border-destructive' : ''} />
                {errors.whatsappNumber && <p className="text-xs text-destructive">{errors.whatsappNumber}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" placeholder="student@email.com" value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); clearError('email'); }} className={errors.email ? 'border-destructive' : ''} />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Aadhar Linked Mobile</Label>
                <Input type="tel" placeholder="Aadhar linked number" value={form.linkedMobileNumber} onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); setForm(f => ({ ...f, linkedMobileNumber: v })); }} />
              </div>
            </div>

            {/* Address & Aadhar */}
            <h3 className="font-semibold text-foreground border-b pb-2">🏠 Address & ID</h3>
            <div className="space-y-1.5">
              <Label>Full Address</Label>
              <Textarea placeholder="Village/City, District, State, PIN" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Aadhar Number</Label>
              <Input placeholder="1234 5678 9012" value={form.aadharNumber} onChange={e => { setForm(f => ({ ...f, aadharNumber: e.target.value })); clearError('aadharNumber'); }} className={errors.aadharNumber ? 'border-destructive' : ''} />
              {errors.aadharNumber && <p className="text-xs text-destructive">{errors.aadharNumber}</p>}
            </div>

            {/* Photo & Signature */}
            <h3 className="font-semibold text-foreground border-b pb-2">📸 Photo & Signature</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Passport Photo</Label>
                <Input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileRead(f, setPhotoFile); }} />
                {photoFile && <img src={photoFile} alt="Photo" className="w-20 h-20 rounded-lg object-cover border" />}
              </div>
              <div className="space-y-1.5">
                <Label>Signature</Label>
                <Input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileRead(f, setSignatureFile); }} />
                {signatureFile && <img src={signatureFile} alt="Signature" className="w-32 h-16 rounded-lg object-contain border" />}
              </div>
            </div>

            {/* Course & Fee */}
            <h3 className="font-semibold text-foreground border-b pb-2">📚 Course & Fee</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Course <span className="text-destructive">*</span></Label>
                <Select value={form.course} onValueChange={v => { setForm(f => ({ ...f, course: v })); clearError('course'); }}>
                  <SelectTrigger className={errors.course ? 'border-destructive' : ''}><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>{settings.courses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                {errors.course && <p className="text-xs text-destructive">{errors.course}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Admission Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={form.admissionDate} onChange={e => { setForm(f => ({ ...f, admissionDate: e.target.value })); clearError('admissionDate'); }} />
              </div>
              <div className="space-y-1.5">
                <Label>Monthly Fee (₹) <span className="text-destructive">*</span></Label>
                <Input type="number" value={form.feeAmount} onChange={e => { setForm(f => ({ ...f, feeAmount: Number(e.target.value) })); clearError('feeAmount'); }} min={1} />
                {errors.feeAmount && <p className="text-xs text-destructive">{errors.feeAmount}</p>}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label>Login Password <span className="text-destructive">*</span></Label>
              <Input value={form.password} onChange={e => { setForm(f => ({ ...f, password: e.target.value })); clearError('password'); }} placeholder="min 6 chars" className={errors.password ? 'border-destructive' : ''} />
              <p className="text-xs text-muted-foreground">Student will use Student ID + this password to login</p>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full gap-2" size="lg" disabled={submitting}>
              {submitting ? (<span className="flex items-center gap-2"><Loader2 size={18} className="animate-spin" /> Creating...</span>)
                : (<><UserPlus size={18} /> Admit Student</>)}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
