import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { openWhatsApp } from '@/lib/whatsapp';
import { CheckCircle2, MessageCircle, Copy, X, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface WhatsAppConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  phoneNumber: string;
  message: string;
  details?: { label: string; value: string }[];
}

export default function WhatsAppConfirmDialog({
  open, onClose, title, subtitle, phoneNumber, message, details
}: WhatsAppConfirmDialogProps) {
  const [editNumber, setEditNumber] = useState(phoneNumber);
  const [showPreview, setShowPreview] = useState(false);

  const handleSendWhatsApp = () => {
    if (!editNumber || editNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    openWhatsApp(editNumber, message);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <div>
              <DialogTitle className="text-lg">{title}</DialogTitle>
              <DialogDescription className="text-sm mt-0.5">{subtitle}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {details && details.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
            {details.map((d, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{d.label}</span>
                <span className="font-medium text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm"><Phone size={13} /> WhatsApp Number</Label>
            <Input
              value={editNumber}
              onChange={e => setEditNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="9876543210"
              maxLength={10}
            />
          </div>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-primary hover:underline"
          >
            {showPreview ? 'Hide' : 'Preview'} Message
          </button>

          {showPreview && (
            <div className="bg-muted/50 rounded-lg p-3 max-h-48 overflow-y-auto">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">{message}</pre>
              <Button
                variant="ghost" size="sm"
                className="mt-2 h-7 text-xs gap-1"
                onClick={() => { navigator.clipboard.writeText(message); toast.success('Message copied!'); }}
              >
                <Copy size={12} /> Copy Message
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="gap-1.5">
            <X size={14} /> Close
          </Button>
          <Button
            onClick={handleSendWhatsApp}
            className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
          >
            <MessageCircle size={14} /> Send WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
