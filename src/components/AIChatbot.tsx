import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { matchFaq, getFeatures } from '@/lib/features';
import { getSettings } from '@/lib/settings';

interface Msg { role: 'user' | 'bot'; text: string; }

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(getFeatures().toggles.chatbot);
  const [input, setInput] = useState('');
  const settings = getSettings();
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'bot', text: `नमस्ते 👋 मैं ${settings.instituteShortName} का AI सहायक हूँ। आप fees, attendance, assignments या किसी भी जानकारी के बारे में पूछ सकते हैं।` },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onUpd = () => setEnabled(getFeatures().toggles.chatbot);
    window.addEventListener('features:updated', onUpd);
    return () => window.removeEventListener('features:updated', onUpd);
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  if (!enabled) return null;

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setTimeout(() => {
      const ans = matchFaq(text) || `माफ कीजिए, मैं इसका सटीक जवाब नहीं दे पाया। कृपया Admin से संपर्क करें${settings.phone ? ` (📞 ${settings.phone})` : ''}.`;
      setMessages(prev => [...prev, { role: 'bot', text: ans }]);
    }, 400);
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
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-card border border-border text-foreground rounded-bl-sm'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
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
