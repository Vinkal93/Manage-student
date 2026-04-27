import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { matchFaq, getFeatures } from '@/lib/features';
import { getSettings } from '@/lib/settings';
import { getCurrentUser } from '@/lib/auth';
import { getStudents } from '@/lib/store';
import { calcLateFee } from '@/lib/features';

interface Msg { role: 'user' | 'bot'; text: string; }

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(getFeatures().toggles.chatbot);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const settings = getSettings();
  const user = getCurrentUser();
  const student = useMemo(() => {
    if (!user || user.role !== 'student') return null;
    const all = getStudents();
    return all.find(s => s.id === user.id || s.studentId === user.studentId) || null;
  }, [user?.id]);

  const greeting = student
    ? `नमस्ते ${student.name} 👋\nमैं ${settings.instituteShortName} का AI सहायक हूँ। आप अपनी attendance, fees, course, assignments, या किसी भी निजी जानकारी के बारे में पूछ सकते हैं।`
    : `नमस्ते 👋 मैं ${settings.instituteShortName} का AI सहायक हूँ। आप fees, attendance, assignments या किसी भी जानकारी के बारे में पूछ सकते हैं।`;

  const [messages, setMessages] = useState<Msg[]>([
    { role: 'bot', text: greeting },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onUpd = () => setEnabled(getFeatures().toggles.chatbot);
    window.addEventListener('features:updated', onUpd);
    return () => window.removeEventListener('features:updated', onUpd);
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open, typing]);

  if (!enabled) return null;

  const answerPersonal = (q: string): string | null => {
    if (!student) return null;
    const t = q.toLowerCase();

    // Personal identity
    if (/(मेरा नाम|my name|naam|kaun hu|who am i)/i.test(q)) {
      return `आपका नाम **${student.name}** है। Student ID: ${student.studentId}, Course: ${student.course}.`;
    }
    if (/(पिता|father|papa)/i.test(q)) {
      return `आपके पिता का नाम **${student.fatherName}** है।`;
    }
    if (/(mobile|phone|number|नंबर|mobail)/i.test(q)) {
      return `आपका registered mobile: **${student.mobile}**, WhatsApp: ${student.whatsappNumber || student.mobile}`;
    }
    if (/(कब से|kab se|since when|joining|join|admission|प्रवेश)/i.test(q)) {
      const months = Math.floor((Date.now() - new Date(student.admissionDate).getTime()) / (30 * 86400000));
      return `आप ${new Date(student.admissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} से class कर रहे हैं — लगभग **${months} महीने** हो चुके हैं।`;
    }
    if (/(course|कोर्स|class|पढ़ाई|kya padh)/i.test(q)) {
      return `आप **${student.course}** course कर रहे हैं। Monthly fee: ₹${student.feeAmount}`;
    }

    // Attendance
    if (/(attendance|उपस्थिति|hazri|present|absent)/i.test(q)) {
      const present = student.attendance.filter(a => a.status === 'present').length;
      const total = student.attendance.length;
      const pct = total > 0 ? Math.round((present / total) * 100) : 0;
      return `आपकी attendance: **${pct}%** (${present}/${total} दिन present)। ${pct < 75 ? '⚠️ 75% से कम है, सुधारें।' : '✅ अच्छी attendance है!'}`;
    }

    // Fees
    if (/(fee|फीस|payment|baki|pending|due|paid|जमा)/i.test(q)) {
      const paid = student.feeRecords.filter(f => f.status === 'paid').length;
      const totalPaid = student.feeRecords.filter(f => f.status === 'paid').reduce((a, b) => a + (b.paidAmount ?? b.amount), 0);
      const pendingAmt = student.feeRecords.filter(f => f.status !== 'paid').reduce((a, b) => a + (b.pendingAmount ?? b.amount), 0);
      const lateFee = student.feeRecords.reduce((acc, f) => acc + calcLateFee(f.dueDate, f.status === 'paid', f.paidDate), 0);
      return `💰 **Fee Status:**\n✅ Paid: ₹${totalPaid.toLocaleString()} (${paid} months)\n⏳ Pending: ₹${pendingAmt.toLocaleString()}\n⚠️ Late Fee: ₹${lateFee}\n💵 Total Payable: ₹${(pendingAmt + lateFee).toLocaleString()}`;
    }

    // Last payment
    if (/(last|पिछला|recent).*(payment|fee)/i.test(q)) {
      const last = [...student.feeRecords].filter(f => f.paidDate).sort((a,b) => new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime())[0];
      if (last) return `आपकी last payment ₹${last.paidAmount ?? last.amount} थी, ${new Date(last.paidDate!).toLocaleDateString('en-IN')} को (${last.paymentMode || 'cash'})`;
      return 'अभी तक कोई payment record नहीं है।';
    }

    // Greeting
    if (/(hi|hello|hey|namaste|नमस्ते|hii)/i.test(q)) {
      return `नमस्ते ${student.name}! कैसे मदद कर सकता हूँ? 😊`;
    }
    return null;
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setTyping(true);
    const delay = 600 + Math.random() * 700;
    setTimeout(() => {
      const personal = answerPersonal(text);
      const ans = personal || matchFaq(text) || `माफ कीजिए, मैं इसका सटीक जवाब नहीं दे पाया। कृपया Admin से संपर्क करें${settings.phone ? ` (📞 ${settings.phone})` : ''}.`;
      setTyping(false);
      setMessages(prev => [...prev, { role: 'bot', text: ans }]);
    }, delay);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
        aria-label="Open AI Chatbot"
      >
        <MessageCircle size={24} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 left-4 md:left-auto md:bottom-6 md:right-6 z-50 w-auto md:w-[380px] h-[70vh] md:h-[520px] bg-card rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center"><Bot size={16} /></div>
                <div>
                  <p className="font-semibold text-sm">AI सहायक</p>
                  <p className="text-xs opacity-80">Online • Quick Help</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-primary-foreground/10"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-muted/30">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-card border border-border text-foreground rounded-bl-sm'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="max-w-[60%] px-4 py-3 rounded-2xl rounded-bl-sm bg-card border border-border flex items-center gap-2">
                    <span className="text-xs text-muted-foreground italic">सोच रहा हूँ</span>
                    <span className="flex gap-1">
                      <motion.span className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0 }} />
                      <motion.span className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.15 }} />
                      <motion.span className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }} />
                    </span>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="p-2 border-t border-border bg-card flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="अपना सवाल लिखें..."
                className="flex-1 bg-muted/50 border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                maxLength={300}
              />
              <button onClick={handleSend} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 active:scale-95">
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
