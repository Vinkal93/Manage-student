import { useState, useMemo } from 'react';
import { getStudents } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Send, MessageSquare, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const templates = [
  { label: 'Holiday Notice', message: 'Dear Students,\n\nPlease note that the institute will remain closed on {date} due to {reason}.\n\nRegards,\nSBCI Computer Institute' },
  { label: 'Exam Notice', message: 'Dear Students,\n\nExams for {course} are scheduled from {date}.\nPlease prepare accordingly.\n\nRegards,\nSBCI Computer Institute' },
  { label: 'Fee Reminder', message: 'Dear Students,\n\nThis is a reminder to deposit your monthly fee before 10th.\nLate fee of ₹50 will apply.\n\nRegards,\nSBCI Computer Institute' },
  { label: 'Custom Message', message: '' },
];

export default function BulkMessages() {
  const students = useMemo(() => getStudents(), []);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [message, setMessage] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [filterCourse, setFilterCourse] = useState('all');

  const courses = [...new Set(students.map(s => s.course))];
  const filtered = filterCourse === 'all' ? students : students.filter(s => s.course === filterCourse);

  const handleTemplateChange = (label: string) => {
    setSelectedTemplate(label);
    const t = templates.find(t => t.label === label);
    if (t) setMessage(t.message);
  };

  const toggleStudent = (id: string) => {
    const next = new Set(selectedStudents);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedStudents(next);
  };

  const selectAll = () => {
    if (selectedStudents.size === filtered.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filtered.map(s => s.id)));
    }
  };

  const handleSend = () => {
    if (!message.trim()) { toast.error('Please write a message'); return; }
    if (selectedStudents.size === 0) { toast.error('Please select students'); return; }
    toast.success(`Message sent to ${selectedStudents.size} students! 📨`);
    setSelectedStudents(new Set());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bulk Messages</h1>
        <p className="text-muted-foreground text-sm mt-1">Send WhatsApp messages to multiple students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message composer */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><MessageSquare size={16} /> Compose Message</h3>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
              <SelectContent>
                {templates.map(t => <SelectItem key={t.label} value={t.label}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea placeholder="Type your message..." value={message} onChange={e => setMessage(e.target.value)} rows={8} />
            <Button onClick={handleSend} className="w-full gap-2">
              <Send size={16} /> Send to {selectedStudents.size} Students
            </Button>
          </div>
        </div>

        {/* Student selection */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><Users size={16} /> Select Students</h3>
            <div className="flex gap-2">
              <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={selectAll} className="text-xs h-8">
                {selectedStudents.size === filtered.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-border">
            {filtered.map(s => (
              <label key={s.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer">
                <Checkbox checked={selectedStudents.has(s.id)} onCheckedChange={() => toggleStudent(s.id)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.studentId} • {s.mobile}</p>
                </div>
                <Badge variant="secondary" className="text-xs">{s.course}</Badge>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
