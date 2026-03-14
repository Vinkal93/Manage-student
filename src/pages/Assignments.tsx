import { useState } from 'react';
import { getAssignments, addAssignment, deleteAssignment, gradeSubmission, type Assignment } from '@/lib/assignments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import { Plus, Trash2, FileText, Users, Clock, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function Assignments() {
  const [assignments, setAssignments] = useState(getAssignments());
  const [open, setOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [form, setForm] = useState({ title: '', className: '', subject: '', description: '', deadline: '' });
  const [gradeForm, setGradeForm] = useState({ marks: '', feedback: '' });

  const handleAdd = () => {
    if (!form.title || !form.className || !form.subject || !form.deadline) {
      toast.error('Please fill all required fields');
      return;
    }
    addAssignment(form);
    setAssignments(getAssignments());
    setForm({ title: '', className: '', subject: '', description: '', deadline: '' });
    setOpen(false);
    toast.success('Assignment created');
  };

  const handleDelete = (id: string) => {
    deleteAssignment(id);
    setAssignments(getAssignments());
    toast.success('Assignment deleted');
  };

  const handleGrade = (assignmentId: string, submissionId: string) => {
    if (!gradeForm.marks) return;
    gradeSubmission(assignmentId, submissionId, parseInt(gradeForm.marks), gradeForm.feedback);
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
          <p className="text-sm text-muted-foreground">Create and manage student assignments</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus size={16} /> Create Assignment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Assignment</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Assignment title" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Class</Label><Input value={form.className} onChange={e => setForm({...form, className: e.target.value})} placeholder="ADCA Batch A" /></div>
                <div><Label>Subject</Label><Input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="Excel" /></div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Assignment details..." rows={3} /></div>
              <div><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} /></div>
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
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Comment</TableHead>
                            <TableHead>Marks</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
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
                                    <Input type="number" placeholder="Marks" className="w-20 h-8" value={gradeForm.marks} onChange={e => setGradeForm({...gradeForm, marks: e.target.value})} />
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
