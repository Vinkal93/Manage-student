import { useState } from 'react';
import { getAssignments, addAssignment, deleteAssignment, gradeSubmission, type Assignment } from '@/lib/assignments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import { Plus, Trash2, FileText, Users, Clock, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function Assignments() {
  const [assignments, setAssignments] = useState(getAssignments());
  const [open, setOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [form, setForm] = useState({ title: '', className: '', subject: '', description: '', deadline: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [gradeForm, setGradeForm] = useState({ marks: '', feedback: '' });

  const validateForm = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.length > 200) e.title = 'Title too long';
    if (!form.className.trim()) e.className = 'Class is required (e.g. ADCA Batch A or All)';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.deadline) e.deadline = 'Deadline is required';
    else if (new Date(form.deadline) < new Date(new Date().toISOString().split('T')[0])) e.deadline = 'Deadline cannot be in the past';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = () => {
    if (!validateForm()) {
      toast.error('Please fix the errors');
      return;
    }
    addAssignment({ ...form, title: form.title.trim(), className: form.className.trim(), subject: form.subject.trim(), description: form.description.trim() });
    setAssignments(getAssignments());
    setForm({ title: '', className: '', subject: '', description: '', deadline: '' });
    setFormErrors({});
    setOpen(false);
    toast.success('Assignment created — students will see it in their Messages tab');
  };

  const handleDelete = (id: string) => {
    deleteAssignment(id);
    setAssignments(getAssignments());
    toast.success('Assignment deleted');
  };

  const handleGrade = (assignmentId: string, submissionId: string) => {
    const marks = parseInt(gradeForm.marks);
    if (isNaN(marks) || marks < 0 || marks > 100) {
      toast.error('Marks must be between 0-100');
      return;
    }
    gradeSubmission(assignmentId, submissionId, marks, gradeForm.feedback);
    setAssignments(getAssignments());
    setGradeForm({ marks: '', feedback: '' });
    toast.success('Graded successfully');
  };

  const isOverdue = (deadline: string) => new Date(deadline) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><FileText size={24} /> Assignments</h1>
          <p className="text-sm text-muted-foreground">Create and manage student assignments. Use "All" in Class field to assign to everyone.</p>
        </div>
        <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) setFormErrors({}); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus size={16} /> Create Assignment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Assignment</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label>Title <span className="text-destructive">*</span></Label>
                <Input value={form.title} onChange={e => { setForm({...form, title: e.target.value}); if (formErrors.title) setFormErrors(er => ({ ...er, title: '' })); }} placeholder="Assignment title" className={formErrors.title ? 'border-destructive' : ''} maxLength={200} />
                {formErrors.title && <p className="text-xs text-destructive">{formErrors.title}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Class <span className="text-destructive">*</span></Label>
                  <Input value={form.className} onChange={e => { setForm({...form, className: e.target.value}); if (formErrors.className) setFormErrors(er => ({ ...er, className: '' })); }} placeholder="All or ADCA Batch A" className={formErrors.className ? 'border-destructive' : ''} />
                  {formErrors.className && <p className="text-xs text-destructive">{formErrors.className}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Subject <span className="text-destructive">*</span></Label>
                  <Input value={form.subject} onChange={e => { setForm({...form, subject: e.target.value}); if (formErrors.subject) setFormErrors(er => ({ ...er, subject: '' })); }} placeholder="Excel" className={formErrors.subject ? 'border-destructive' : ''} />
                  {formErrors.subject && <p className="text-xs text-destructive">{formErrors.subject}</p>}
                </div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Assignment details..." rows={3} maxLength={1000} /></div>
              <div className="space-y-1.5">
                <Label>Deadline <span className="text-destructive">*</span></Label>
                <Input type="date" value={form.deadline} onChange={e => { setForm({...form, deadline: e.target.value}); if (formErrors.deadline) setFormErrors(er => ({ ...er, deadline: '' })); }} className={formErrors.deadline ? 'border-destructive' : ''} />
                {formErrors.deadline && <p className="text-xs text-destructive">{formErrors.deadline}</p>}
              </div>
              <Button onClick={handleAdd} className="w-full">Publish Assignment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-foreground">{assignments.length}</div><p className="text-xs text-muted-foreground">Total Assignments</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-foreground">{assignments.reduce((a, b) => a + b.submissions.length, 0)}</div><p className="text-xs text-muted-foreground">Total Submissions</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-foreground">{assignments.filter(a => !isOverdue(a.deadline)).length}</div><p className="text-xs text-muted-foreground">Active Assignments</p></CardContent></Card>
      </div>

      <div className="grid gap-4">
        {assignments.map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{a.title}</CardTitle>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{a.className}</Badge>
                      <Badge variant="secondary">{a.subject}</Badge>
                      <Badge variant={isOverdue(a.deadline) ? 'destructive' : 'default'} className="gap-1">
                        <Clock size={10} /> {isOverdue(a.deadline) ? 'Overdue' : `Due: ${a.deadline}`}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedAssignment(selectedAssignment?.id === a.id ? null : a)} className="gap-1">
                      <Users size={14} /> {a.submissions.length} Submissions
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)} className="text-destructive"><Trash2 size={16} /></Button>
                  </div>
                </div>
              </CardHeader>
              {a.description && <CardContent className="pt-0"><p className="text-sm text-muted-foreground">{a.description}</p></CardContent>}
              {selectedAssignment?.id === a.id && (
                <CardContent className="pt-0">
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><Award size={14} /> Submissions</h4>
                    {a.submissions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No submissions yet</p>
                    ) : (
                      <Table>
                        <TableHeader><TableRow>
                          <TableHead>Student</TableHead><TableHead>Submitted</TableHead><TableHead>Comment</TableHead><TableHead>Marks</TableHead><TableHead>Actions</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                          {a.submissions.map(sub => (
                            <TableRow key={sub.id}>
                              <TableCell className="font-medium">{sub.studentName}</TableCell>
                              <TableCell>{sub.submittedAt}</TableCell>
                              <TableCell>{sub.comment}</TableCell>
                              <TableCell>{sub.marks !== undefined ? <Badge variant="default">{sub.marks}/100</Badge> : <Badge variant="secondary">Not graded</Badge>}</TableCell>
                              <TableCell>
                                {sub.marks === undefined && (
                                  <div className="flex gap-2">
                                    <Input type="number" placeholder="0-100" className="w-20 h-8" min={0} max={100} value={gradeForm.marks} onChange={e => setGradeForm({...gradeForm, marks: e.target.value})} />
                                    <Button size="sm" onClick={() => handleGrade(a.id, sub.id)}>Grade</Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
