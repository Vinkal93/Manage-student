const TIMETABLE_KEY = 'insuite_timetable';

export interface ClassSchedule {
  id: string;
  className: string;
  subject: string;
  teacher: string;
  startTime: string;
  endTime: string;
  room: string;
  day: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function getDays() { return DAYS; }

export function getTimetable(): ClassSchedule[] {
  const data = localStorage.getItem(TIMETABLE_KEY);
  if (data) return JSON.parse(data);
  const sample = getSampleTimetable();
  localStorage.setItem(TIMETABLE_KEY, JSON.stringify(sample));
  return sample;
}

export function saveTimetable(schedules: ClassSchedule[]) {
  localStorage.setItem(TIMETABLE_KEY, JSON.stringify(schedules));
}

export function addSchedule(schedule: Omit<ClassSchedule, 'id'>): ClassSchedule {
  const schedules = getTimetable();
  const newSchedule = { ...schedule, id: crypto.randomUUID() };
  schedules.push(newSchedule);
  saveTimetable(schedules);
  return newSchedule;
}

export function deleteSchedule(id: string) {
  const schedules = getTimetable().filter(s => s.id !== id);
  saveTimetable(schedules);
}

function getSampleTimetable(): ClassSchedule[] {
  return [
    { id: crypto.randomUUID(), className: 'ADCA Batch A', subject: 'Excel', teacher: 'Vinkal Sir', startTime: '10:00', endTime: '11:30', room: 'Lab 1', day: 'Monday' },
    { id: crypto.randomUUID(), className: 'DCA Batch B', subject: 'Tally', teacher: 'Rahul Sir', startTime: '11:30', endTime: '13:00', room: 'Lab 2', day: 'Monday' },
    { id: crypto.randomUUID(), className: 'CCC Batch', subject: 'Typing', teacher: 'Amit Sir', startTime: '14:00', endTime: '15:30', room: 'Lab 1', day: 'Tuesday' },
    { id: crypto.randomUUID(), className: 'PGDCA Batch', subject: 'Python', teacher: 'Vinkal Sir', startTime: '10:00', endTime: '12:00', room: 'Lab 2', day: 'Wednesday' },
    { id: crypto.randomUUID(), className: 'Web Design', subject: 'HTML/CSS', teacher: 'Sneha Ma\'am', startTime: '13:00', endTime: '14:30', room: 'Lab 1', day: 'Thursday' },
    { id: crypto.randomUUID(), className: 'ADCA Batch A', subject: 'MS Word', teacher: 'Vinkal Sir', startTime: '10:00', endTime: '11:30', room: 'Lab 1', day: 'Friday' },
  ];
}
