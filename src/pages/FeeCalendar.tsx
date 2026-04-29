import { useMemo, useState } from 'react';
import { getStudents } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { Calendar as CalIcon, Bell, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { toast } from 'sonner';
import { openWhatsApp } from '@/lib/whatsapp';
import { getSettings } from '@/lib/settings';
import { logAudit } from '@/lib/audit';
import { getCurrentUser } from '@/lib/auth';
import { AlertTriangle } from 'lucide-react';

export default function FeeCalendar() {
  const settings = getSettings();
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().split('T')[0]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [multiDates, setMultiDates] = useState<Set<string>>(new Set());
  const [multiMode, setMultiMode] = useState(false);

  const students = useMemo(() => getStudents(), []);

  const dueByDate = useMemo(() => {
    const map = new Map<string, { studentId: string; name: string; mobile: string; whatsapp: string; amount: number; lateFee: number; feeId: string; course: string }[]>();
    students.forEach(s => {
      s.feeRecords.forEach(f => {
        if (f.status === 'paid') return;
        const list = map.get(f.dueDate) || [];
        list.push({
          studentId: s.id, name: s.name, mobile: s.mobile, whatsapp: s.whatsappNumber || s.mobile,
          amount: f.amount + (f.lateFee || 0), lateFee: f.lateFee || 0, feeId: f.id, course: s.course,
        });
        map.set(f.dueDate, list);
      });
    });
    return map;
  }, [students]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const getDateStr = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const dueOnDate = dueByDate.get(selectedDate) || [];

  const monthName = new Date(year, month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const navMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    setMonth(d.getMonth()); setYear(d.getFullYear());
  };

  const toggleDate = (dateStr: string) => {
    if (multiMode) {
      setMultiDates(prev => { const n = new Set(prev); n.has(dateStr) ? n.delete(dateStr) : n.add(dateStr); return n; });
    } else {
      setSelectedDate(dateStr); setSelected(new Set());
    }
  };

  const sendMultiDateReminders = () => {
    if (multiDates.size === 0) { toast.error('Select at least one date'); return; }
    let count = 0;
    let delay = 0;
    multiDates.forEach(dateStr => {
      const list = dueByDate.get(dateStr) || [];
      list.forEach(it => {
        const msg = `🔔 *Fee Reminder*\n\nप्रिय ${it.name},\n${settings.instituteName} में आपकी फीस ₹${it.amount.toLocaleString()} ${new Date(dateStr).toLocaleDateString('en-IN')} को due थी।\nकृपया जल्द से जल्द जमा करें।\n\nधन्यवाद 🙏`;
        setTimeout(() => openWhatsApp(it.whatsapp, msg), delay);
        delay += 600; count++;
      });
    });
    if (count === 0) { toast.error('Selected dates have no pending fees'); return; }
    toast.success(`Triggering ${count} WhatsApp reminder(s) across ${multiDates.size} date(s)…`);
    setMultiDates(new Set());
  };

  const toggle = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const sendReminders = () => {
    const items = dueOnDate.filter(d => selected.has(d.feeId));
    if (items.length === 0) { toast.error('Select at least one student'); return; }
    const actor = getCurrentUser()?.email || getCurrentUser()?.name || 'admin';
    items.forEach((it, idx) => {
      const msg = `🔔 *Fee Reminder*\n\nप्रिय ${it.name},\n${settings.instituteName} में आपकी फीस ₹${it.amount.toLocaleString()} ${new Date(selectedDate).toLocaleDateString('en-IN')} को due थी।\nकृपया जल्द से जल्द जमा करें।\n\nधन्यवाद 🙏`;
      setTimeout(() => openWhatsApp(it.whatsapp, msg), idx * 600);
      logAudit({ actor, action: 'fee.reminder_sent', targetId: it.studentId, targetLabel: it.name, details: `Reminder ₹${it.amount} due ${selectedDate}` });
    });
    toast.success(`Opening WhatsApp for ${items.length} reminder(s)…`);
    setSelected(new Set());
  };

  const sendFinalWarnings = () => {
    const items = dueOnDate.filter(d => selected.has(d.feeId));
    if (items.length === 0) { toast.error('Select at least one student'); return; }
    const actor = getCurrentUser()?.email || getCurrentUser()?.name || 'admin';
    items.forEach((it, idx) => {
      const msg = `⚠️ *FINAL WARNING — Fee Overdue*\n\nप्रिय ${it.name},\n${settings.instituteName} में आपकी फीस ₹${it.amount.toLocaleString()} (due ${new Date(selectedDate).toLocaleDateString('en-IN')}) अभी तक pending है।\n\nयह *अंतिम सूचना* है। यदि 48 घंटे में भुगतान नहीं हुआ तो आपका enrollment suspend किया जा सकता है और late fee बढ़ाई जाएगी।\n\nकृपया तुरंत संपर्क करें।\n— ${settings.instituteName}`;
      setTimeout(() => openWhatsApp(it.whatsapp, msg), idx * 600);
      logAudit({ actor, action: 'fee.final_warning', targetId: it.studentId, targetLabel: it.name, details: `Final warning ₹${it.amount} due ${selectedDate}` });
    });
    toast.success(`Sending FINAL WARNING to ${items.length} student(s)…`);
    setSelected(new Set());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><CalIcon size={22} /> Fee Due Calendar</h1>
        <p className="text-muted-foreground text-sm mt-1">Daily pending fees aur manual reminder trigger</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-card border border-border rounded-xl p-3">
        <Button size="sm" variant={multiMode ? 'default' : 'outline'} onClick={() => { setMultiMode(m => !m); setMultiDates(new Set()); }} className="gap-1.5">
          <CalIcon size={14} /> {multiMode ? 'Exit Multi-Select' : 'Select Multiple Dates'}
        </Button>
        {multiMode && (
          <>
            <Badge variant="secondary">{multiDates.size} date(s) selected</Badge>
            <Button size="sm" className="gap-1.5" disabled={multiDates.size === 0} onClick={sendMultiDateReminders}>
              <Send size={14} /> Trigger Reminders Now
            </Button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={() => navMonth(-1)}><ChevronLeft size={16} /></Button>
            <h3 className="font-semibold text-foreground">{monthName}</h3>
            <Button variant="ghost" size="sm" onClick={() => navMonth(1)}><ChevronRight size={16} /></Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              if (d === null) return <div key={i} />;
              const dateStr = getDateStr(d);
              const due = dueByDate.get(dateStr) || [];
              const isSelected = multiMode ? multiDates.has(dateStr) : selectedDate === dateStr;
              const totalAmt = due.reduce((a, b) => a + b.amount, 0);
              return (
                <button key={i} onClick={() => toggleDate(dateStr)}
                  className={`aspect-square rounded-lg text-xs flex flex-col items-center justify-center transition-all border ${
                    isSelected ? 'bg-primary text-primary-foreground border-primary' :
                    due.length > 0 ? 'bg-destructive/10 border-destructive/30 text-foreground hover:bg-destructive/20' :
                    'border-transparent hover:bg-muted'
                  }`}>
                  <span className="font-medium">{d}</span>
                  {due.length > 0 && <span className={`text-[9px] mt-0.5 ${isSelected ? '' : 'text-destructive'}`}>{due.length} • ₹{totalAmt}</span>}
                </button>
              );
            })}
          </div>
          <div className="flex gap-3 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-destructive/20 border border-destructive/30"/> Pending dues</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary"/> Selected</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
              <p className="text-xs text-muted-foreground">{dueOnDate.length} pending fee(s) • Total ₹{dueOnDate.reduce((a,b) => a+b.amount, 0).toLocaleString()}</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <Button size="sm" className="gap-1.5" disabled={selected.size === 0} onClick={sendReminders}>
                <Send size={14} /> Reminder ({selected.size})
              </Button>
              <Button size="sm" variant="destructive" className="gap-1.5" disabled={selected.size === 0} onClick={sendFinalWarnings}>
                <AlertTriangle size={14} /> Final Warning
              </Button>
            </div>
          </div>
          <div className="space-y-2 max-h-[420px] overflow-y-auto">
            {dueOnDate.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">No pending fees on this date 🎉</div>
            ) : dueOnDate.map(d => (
              <label key={d.feeId} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                <Checkbox checked={selected.has(d.feeId)} onCheckedChange={() => toggle(d.feeId)} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.course} • {d.mobile}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-foreground">₹{d.amount.toLocaleString()}</p>
                  {d.lateFee > 0 && <Badge variant="destructive" className="text-[9px]">+₹{d.lateFee} late</Badge>}
                </div>
                <Button variant="ghost" size="sm" className="h-7 px-2"
                  onClick={(e) => { e.preventDefault(); openWhatsApp(d.whatsapp, `🔔 Fee Reminder\n\n${d.name}, आपकी ₹${d.amount} फीस ${new Date(selectedDate).toLocaleDateString('en-IN')} को due है। कृपया जमा करें।\n\n${settings.instituteName}`); }}>
                  <Bell size={12} />
                </Button>
              </label>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}