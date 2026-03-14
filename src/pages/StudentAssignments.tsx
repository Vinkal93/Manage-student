import { useState } from 'react';
import { getAssignments, submitAssignment } from '@/lib/assignments';
import { getCurrentUser } from '@/lib/auth';
import { getStudents } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { FileText, Clock, Upload, CheckCircle, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState(getAssignments());
  const [submitOpen, setSubmitOpen] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const user = getCurrentUser();
  const student = getStudents().find(s => s.id === user?.id || s.studentId === user?.studentId);

  const handleSubmit = (assignmentId: string) => {
    if (!student) return;
    submitAssignment(assignmentId, {
      studentId: student.studentId,
      studentName: student.name,
      comment: comment || 'Submitted',
    });
    setAssignments(getAssignments());
    setSubmitOpen(null);
    setComment('');
    toast.success('Assignment submitted successfully');
  };

  const isOverdue = (deadline: string) => new Date(deadline) < new Date();
  const hasSubmitted = (a: typeof assignments[0]) => a.submissions.some(s => s.studentId === student?.studentId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><FileText size={20} /> My Assignments</h2>
        <p className="text-sm text-muted-foreground">View and submit your assignments</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><div className="text-xl font-bold text-foreground">{assignments.length}</div><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><div className="text-xl font-bold text-success">{assignments.filter(a => hasSubmitted(a)).length}</div><p className="text-xs text-muted-foreground">Submitted</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><div className="text-xl font-bold text-warning">{assignments.filter(a => !hasSubmitted(a) && !isOverdue(a.deadline)).length}</div><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
      </div>

      <div className="space-y-3">
        {assignments.map((a, i) => {
          const submitted = hasSubmitted(a);
          const mySubmission = a.submissions.find(s => s.studentId === student?.studentId);
          const overdue = isOverdue(a.deadline);

          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={submitted ? 'border-success/30' : overdue ? 'border-destructive/30' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{a.title}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{a.subject}</Badge>
                        <Badge variant={submitted ? 'default' : overdue ? 'destructive' : 'secondary'}>
                          {submitted ? '✅ Submitted' : overdue ? '⏰ Overdue' : `Due: ${a.deadline}`}
                        </Badge>
                      </div>
                      {a.description && <p className="text-sm text-muted-foreground mt-2">{a.description}</p>}
                      {mySubmission?.marks !== undefined && (
                        <div className="mt-2 p-2 bg-success/10 rounded-lg text-sm">
                          <Award size={14} className="inline mr-1" /> Marks: <strong>{mySubmission.marks}/100</strong>
                          {mySubmission.feedback && <span className="ml-2 text-muted-foreground">— {mySubmission.feedback}</span>}
                        </div>
                      )}
                    </div>
                    {!submitted && !overdue && (
                      <Dialog open={submitOpen === a.id} onOpenChange={v => setSubmitOpen(v ? a.id : null)}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="gap-1"><Upload size={14} /> Submit</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Submit: {a.title}</DialogTitle></DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <label className="text-sm font-medium">Comment</label>
                              <Input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." />
                            </div>
                            <Button className="w-full gap-2" onClick={() => handleSubmit(a.id)}>
                              <CheckCircle size={16} /> Submit Assignment
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
