import { getTimetable, getDays } from '@/lib/timetable';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Clock, MapPin, User, Calendar } from 'lucide-react';

export default function StudentTimetable() {
  const schedules = getTimetable();
  const days = getDays();
  const todayIndex = new Date().getDay();
  const defaultDay = todayIndex === 0 ? 'Monday' : days[todayIndex - 1];

  const todayClasses = schedules.filter(s => s.day === defaultDay).sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><Calendar size={20} /> My Timetable</h2>
        <p className="text-sm text-muted-foreground">View your class schedule</p>
      </div>

      {todayClasses.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-primary mb-3">📌 Today's Classes ({defaultDay})</h3>
            <div className="space-y-2">
              {todayClasses.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-2 bg-card rounded-lg">
                  <div className="w-1 h-10 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-medium">{s.startTime} - {s.subject}</p>
                    <p className="text-xs text-muted-foreground">{s.teacher} · {s.room}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue={defaultDay} className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          {days.map(d => <TabsTrigger key={d} value={d} className="text-xs">{d.slice(0, 3)}</TabsTrigger>)}
        </TabsList>
        {days.map(day => {
          const daySchedules = schedules.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
          return (
            <TabsContent key={day} value={day}>
              {daySchedules.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No classes on {day}</p>
              ) : (
                <div className="space-y-2">
                  {daySchedules.map((s, i) => (
                    <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card>
                        <CardContent className="p-3 flex items-center gap-3">
                          <div className="text-center min-w-[60px]">
                            <p className="text-sm font-bold text-primary">{s.startTime}</p>
                            <p className="text-xs text-muted-foreground">{s.endTime}</p>
                          </div>
                          <div className="w-px h-10 bg-border" />
                          <div>
                            <p className="font-medium text-sm">{s.subject}</p>
                            <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                              <span className="flex items-center gap-0.5"><User size={10} /> {s.teacher}</span>
                              <span className="flex items-center gap-0.5"><MapPin size={10} /> {s.room}</span>
                            </div>
                          </div>
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
