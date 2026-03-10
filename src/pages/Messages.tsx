import { motion } from 'framer-motion';
import { MessageSquare, Send } from 'lucide-react';

const messages = [
  {
    title: '🎉 Welcome Message (Admission)',
    trigger: 'On new admission',
    template: `🎉 Congratulations {name}!

Welcome to SBCI Computer Institute.
Course: {course}
Monthly Fee: ₹{fee}
Fee Date: 1–10 every month

Rules:
• Fee must be paid before 10th
• Late fee may apply
• Continuous absence may stop classes

Best wishes for your learning journey 🚀`,
  },
  {
    title: '📅 Reminder 1 (5th of month)',
    trigger: '5th of every month',
    template: `Dear {name},

This is a reminder that your monthly fee of ₹{fee} is due.
Please deposit before 10th to avoid late fee.

– SBCI Computer Institute`,
  },
  {
    title: '⚠️ Reminder 2 (10th of month)',
    trigger: '10th of every month',
    template: `Dear {name},

Today is the last date to deposit your monthly fee.
Please clear the payment today to continue classes.

– SBCI Computer Institute`,
  },
  {
    title: '🔴 Warning (15th of month)',
    trigger: '15th of every month',
    template: `Dear {name},

Your fee is pending. Please deposit immediately.
Classes may be stopped if payment is not cleared.

– SBCI Computer Institute`,
  },
  {
    title: '🚫 Final Warning (20th of month)',
    trigger: '20th of every month',
    template: `Dear {name},

Your fee is still pending.
Your classes will be temporarily stopped until the fee is cleared.
Please contact the institute immediately.

– SBCI Computer Institute`,
  },
];

export default function Messages() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">WhatsApp Messages</h1>
        <p className="text-muted-foreground text-sm mt-1">Automated message templates</p>
      </div>

      <div className="space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-accent" />
                <h3 className="font-semibold text-foreground text-sm">{msg.title}</h3>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">{msg.trigger}</span>
            </div>
            <div className="p-4">
              <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed bg-muted/50 rounded-lg p-4">
                {msg.template}
              </pre>
            </div>
            <div className="px-4 pb-4">
              <button className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors font-medium">
                <Send size={12} /> Send Test Message
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-muted/50 border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground text-sm mb-2">📌 WhatsApp API Integration</h3>
        <p className="text-sm text-muted-foreground">
          To enable automatic WhatsApp messages, connect WhatsApp Business API. Messages will be sent automatically based on fee dates and admission events.
        </p>
      </div>
    </div>
  );
}
