import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents, saveStudents, addStudent, Student, updateStudentPhoto } from '@/lib/store';
import { createStudentFirebaseAccount } from '@/lib/auth';
import { exportStudentsToExcel, exportToCSV, parseExcelFile } from '@/lib/export';
import { getSettings } from '@/lib/settings';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Search, Eye, Upload, Download, UserCog, Key, Ban, MessageSquare,
  CheckCircle, FileSpreadsheet, Users, Shield, Edit, Image as ImageIcon, Share2
} from 'lucide-react';
import { buildStudentSummary } from '@/lib/whatsapp';
import WhatsAppConfirmDialog from '@/components/WhatsAppConfirmDialog';
import { updateStudentPhoto as updPhoto } from '@/lib/store';
import { Trash2 } from 'lucide-react';

export default function StudentManagement() {
  const navigate = useNavigate();
  const settings = getSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [importantMessage, setImportantMessage] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoTarget, setPhotoTarget] = useState<Student | null>(null);
  const [shareTarget, setShareTarget] = useState<Student | null>(null);

  const students = useMemo(() => getStudents(), [refreshKey]);
  const courses = [...new Set(students.map(s => s.course))];

  const filtered = useMemo(() => {
    return students.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.studentId.toLowerCase().includes(search.toLowerCase()) ||
        s.mobile.includes(search) ||
        s.course.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchCourse = courseFilter === 'all' || s.course === courseFilter;
      return matchSearch && matchStatus && matchCourse;
    });
  }, [students, search, statusFilter, courseFilter]);

  const handleToggleStatus = (student: Student) => {
    const all = getStudents();
    const idx = all.findIndex(s => s.id === student.id);
    if (idx >= 0) {
      all[idx].status = all[idx].status === 'active' ? 'stopped' : 'active';
      saveStudents(all);
      toast.success(`${student.name} ${all[idx].status === 'active' ? 'activated' : 'blocked'}`);
      setRefreshKey(k => k + 1);
    }
  };

  const handleChangePassword = async () => {
    if (!selectedStudent || !newPassword.trim()) return;
    const all = getStudents();
    const idx = all.findIndex(s => s.id === selectedStudent.id);
    if (idx >= 0) {
      all[idx].password = newPassword;
      saveStudents(all);
      // Try to create/update Firebase account
      await createStudentFirebaseAccount(all[idx].studentId, newPassword);
      toast.success(`Password updated for ${selectedStudent.name}`);
      setShowPasswordDialog(false);
      setNewPassword('');
      setRefreshKey(k => k + 1);
    }
  };

  const handleSendMessage = () => {
    if (!selectedStudent || !importantMessage.trim()) return;
    const all = getStudents();
    const idx = all.findIndex(s => s.id === selectedStudent.id);
    if (idx >= 0) {
      all[idx].messageHistory.push({
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        type: 'bulk',
        message: importantMessage,
        status: 'sent',
      });
      saveStudents(all);
      toast.success(`Message sent to ${selectedStudent.name}`);
      setShowMessageDialog(false);
      setImportantMessage('');
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await parseExcelFile(file);
      if (imported.length === 0) {
        toast.error('No valid data found in file');
        return;
      }
      let addedCount = 0;
      for (const s of imported) {
        addStudent(s);
        addedCount++;
      }
      toast.success(`${addedCount} students imported successfully! 🎉`);
      setRefreshKey(k => k + 1);
    } catch {
      toast.error('Error reading file');
    }
    e.target.value = '';
  };

  const handleCreateFirebaseAccount = async (student: Student) => {
    const success = await createStudentFirebaseAccount(student.studentId, student.password);
    if (success) {
      toast.success(`Firebase account created for ${student.name}`);
    } else {
      toast.error('Failed to create Firebase account');
    }
  };

  const triggerPhotoUpload = (s: Student) => {
    setPhotoTarget(s);
    setTimeout(() => photoInputRef.current?.click(), 0);
  };

  const handlePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !photoTarget) return;
    if (file.size > 1.5 * 1024 * 1024) { toast.error('Photo too large (max 1.5MB)'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      updateStudentPhoto(photoTarget.id, reader.result as string);
      toast.success(`Photo updated for ${photoTarget.name}`);
      setRefreshKey(k => k + 1);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (s: Student) => {
    if (!s.photo) { toast.info('No photo to remove'); return; }
    updPhoto(s.id, '');
    toast.success(`Photo removed for ${s.name}`);
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all students, IDs, passwords & access</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportExcel} />
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelected} />
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} /> Import Excel
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => exportStudentsToExcel(students)}>
            <FileSpreadsheet size={14} /> Export Excel
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => exportToCSV(students)}>
            <Download size={14} /> Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input placeholder="Search name, ID, mobile, course..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="stopped">Blocked</SelectItem>
          </SelectContent>
        </Select>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      <div className="flex gap-3 text-sm">
        <Badge variant="default" className="gap-1"><Users size={12} /> Total: {students.length}</Badge>
        <Badge variant="secondary" className="gap-1"><CheckCircle size={12} /> Active: {students.filter(s => s.status === 'active').length}</Badge>
        <Badge variant="destructive" className="gap-1"><Ban size={12} /> Blocked: {students.filter(s => s.status === 'stopped').length}</Badge>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-medium text-muted-foreground">ID</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Student</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Course</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Mobile</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Password</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.5) }}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="p-4 font-mono text-xs text-muted-foreground">{s.studentId}</td>
                  <td className="p-4">
                    <div className="font-medium text-foreground">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.fatherName}</div>
                  </td>
                  <td className="p-4 hidden sm:table-cell"><Badge variant="secondary" className="text-xs">{s.course}</Badge></td>
                  <td className="p-4 hidden md:table-cell text-xs text-muted-foreground">{s.mobile}</td>
                  <td className="p-4 font-mono text-xs text-muted-foreground">{s.password}</td>
                  <td className="p-4">
                    <Badge variant={s.status === 'active' ? 'default' : 'destructive'} className="text-xs cursor-pointer" onClick={() => handleToggleStatus(s)}>
                      {s.status === 'active' ? '✅ Active' : '🚫 Blocked'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="View Profile" onClick={() => navigate(`/admin/student/${s.id}`)}>
                        <Eye size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Upload Photo" onClick={() => triggerPhotoUpload(s)}>
                        <ImageIcon size={14} className="text-primary" />
                      </Button>
                      {s.photo && (
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Remove Photo" onClick={() => removePhoto(s)}>
                          <Trash2 size={14} className="text-destructive" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Share on WhatsApp" onClick={() => setShareTarget(s)}>
                        <Share2 size={14} className="text-success" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Change Password" onClick={() => { setSelectedStudent(s); setShowPasswordDialog(true); }}>
                        <Key size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Send Message" onClick={() => { setSelectedStudent(s); setShowMessageDialog(true); }}>
                        <MessageSquare size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title={s.status === 'active' ? 'Block' : 'Activate'} onClick={() => handleToggleStatus(s)}>
                        {s.status === 'active' ? <Ban size={14} className="text-destructive" /> : <CheckCircle size={14} className="text-success" />}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Create Firebase Account" onClick={() => handleCreateFirebaseAccount(s)}>
                        <Shield size={14} className="text-primary" />
                      </Button>
                    </div>
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

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password - {selectedStudent?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-3 text-sm">
              <p><strong>Student ID:</strong> {selectedStudent?.studentId}</p>
              <p><strong>Current Password:</strong> {selectedStudent?.password}</p>
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" />
            </div>
            <Button className="w-full" onClick={handleChangePassword}>Update Password</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Important Message - {selectedStudent?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-3 text-sm">
              <p><strong>Student:</strong> {selectedStudent?.name} ({selectedStudent?.studentId})</p>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea value={importantMessage} onChange={e => setImportantMessage(e.target.value)} placeholder="Type important message for student..." rows={4} />
            </div>
            <Button className="w-full" onClick={handleSendMessage}>Send Message</Button>
          </div>
        </DialogContent>
      </Dialog>

      {shareTarget && (() => {
        const { phone, message, data } = buildStudentSummary(shareTarget);
        return (
          <WhatsAppConfirmDialog
            open={!!shareTarget}
            onClose={() => setShareTarget(null)}
            title={`Share ${shareTarget.name}`}
            subtitle="Review the encoded message before sending on WhatsApp"
            phoneNumber={phone}
            message={message}
            details={[
              { label: 'Student', value: `${shareTarget.name} (${shareTarget.studentId})` },
              { label: 'Course', value: shareTarget.course },
              { label: 'Paid', value: `₹${data.paid.toLocaleString()}` },
              { label: 'Pending', value: `₹${data.pending.toLocaleString()}` },
              { label: 'Late Fee', value: `₹${data.lateFee.toLocaleString()}` },
            ]}
          />
        );
      })()}
    </div>
  );
}
