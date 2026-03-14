import { useState } from 'react';
import { getTimetable, addSchedule, deleteSchedule, getDays, type ClassSchedule } from '@/lib/timetable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Plus, Trash2, Clock, MapPin, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function Timetable() {
  const [schedules, setSchedules] = useState(getTimetable());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ className: '', subject: '', teacher: '', startTime: '10:00', endTime: '11:30', room: '', day: 'Monday' });
  const days = getDays();

  const handleAdd = () => {
    if (!form.className || !form.subject || !form.teacher || !form.room) {
      toast.error('All fields are required');
      return;
    }
    addSchedule(form);
    setSchedules(getTimetable());
    setForm({ className: '', subject: '', teacher: '', startTime: '10:00', endTime: '11:30', room: '', day: 'Monday' });
    setOpen(false);
    toast.success('Class scheduled successfully');
  };

  const handleDelete = (id: string) => {
    deleteSchedule(id);
    setSchedules(getTimetable());
    toast.success('Schedule deleted');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Calendar size={24} /> Timetable Manager</h1>
          <p className="text-sm text-muted-foreground">Manage class schedules and timings</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus size={16} /> Add Class</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Class Schedule</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Class Name</Label><Input value={form.className} onChange={e => setForm({...form, className: e.target.value})} placeholder="ADCA Batch A" /></div>
                <div><Label>Subject</Label><Input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="Excel" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Teacher</Label><Input value={form.teacher} onChange={e => setForm({...form, teacher: e.target.value})} placeholder="Teacher name" /></div>
                <div><Label>Room</Label><Input value={form.room} onChange={e => setForm({...form, room: e.target.value})} placeholder="Lab 1" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Start Time</Label><Input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} /></div>
                <div><Label>End Time</Label><Input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} /></div>
                <div>
                  <Label>Day</Label>
                  <Select value={form.day} onValueChange={v => setForm({...form, day: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full">Save Schedule</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue={days[new Date().getDay() === 0 ? 0 : new Date().getDay() - 1]} className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          {days.map(d => <TabsTrigger key={d} value={d} className="text-xs">{d.slice(0, 3)}</TabsTrigger>)}
        </TabsList>
        {days.map(day => {
          const daySchedules = schedules.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
          return (
            <TabsContent key={day} value={day}>
              {daySchedules.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-muted-foreground">No classes scheduled for {day}</CardContent></Card>
              ) : (
                <div className="grid gap-3">
                  {daySchedules.map((s, i) => (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-1.5 h-14 rounded-full bg-primary" />
                            <div>
                              <h3 className="font-semibold text-foreground">{s.subject}</h3>
                              <p className="text-sm text-muted-foreground">{s.className}</p>
                              <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Clock size={12} /> {s.startTime} - {s.endTime}</span>
                                <span className="flex items-center gap-1"><User size={12} /> {s.teacher}</span>
                                <span className="flex items-center gap-1"><MapPin size={12} /> {s.room}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} className="text-destructive hover:text-destructive">
                            <Trash2 size={16} />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
