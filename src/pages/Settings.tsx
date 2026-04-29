import { useState, useEffect } from 'react';
import { getSettings, saveSettings, InstituteSettings, KnowledgeEntry } from '@/lib/settings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Building2, Phone, Mail, MapPin, BookOpen, IndianRupee, Plus, X, Bell, Brain, Link as LinkIcon, FileText, Trash2, BellRing, BellOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { getCurrentUser } from '@/lib/auth';

export default function Settings() {
  const [settings, setSettings] = useState<InstituteSettings>(getSettings());
  const [newCourse, setNewCourse] = useState('');
  const [newDoc, setNewDoc] = useState('');
  const user = getCurrentUser();
  const subs = settings.fcm?.subscribers || [];
  const isSubscribed = !!user && subs.some(s => s.userId === user?.id);

  const subscribePush = async () => {
    if (!user) return;
    try {
      if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') { toast.error('Permission denied'); return; }
      }
      const token = `fcm_${user.id}_${Date.now().toString(36)}`;
      const next = { ...settings, fcm: { ...(settings.fcm || { senderId: '', serverKey: '', enabled: false }), subscribers: [...subs, { token, userId: user.id, name: user.name, subscribedAt: new Date().toISOString() }] } };
      setSettings(next); saveSettings(next);
      toast.success('Subscribed to fee reminder push notifications');
    } catch { toast.error('Subscription failed'); }
  };

  const unsubscribePush = () => {
    if (!user) return;
    const next = { ...settings, fcm: { ...(settings.fcm || { senderId: '', serverKey: '', enabled: false }), subscribers: subs.filter(s => s.userId !== user.id) } };
    setSettings(next); saveSettings(next);
    toast.success('Unsubscribed from push notifications');
  };

  const handleSave = () => {
    saveSettings(settings);
    toast.success('Settings saved & synced to cloud! ☁️');
  };

  const addCourse = () => {
    if (newCourse.trim() && !settings.courses.includes(newCourse.trim())) {
      setSettings(s => ({ ...s, courses: [...s.courses, newCourse.trim()] }));
      setNewCourse('');
    }
  };
  const removeCourse = (course: string) => setSettings(s => ({ ...s, courses: s.courses.filter(c => c !== course) }));

  const addDoc = () => {
    if (newDoc.trim() && !settings.requiredDocuments?.includes(newDoc.trim())) {
      setSettings(s => ({ ...s, requiredDocuments: [...(s.requiredDocuments || []), newDoc.trim()] }));
      setNewDoc('');
    }
  };
  const removeDoc = (doc: string) => setSettings(s => ({ ...s, requiredDocuments: (s.requiredDocuments || []).filter(d => d !== doc) }));

  // Knowledge Base
  const addKnowledge = () => {
    const entry: KnowledgeEntry = { id: crypto.randomUUID(), topic: '', content: '' };
    setSettings(s => ({ ...s, knowledgeBase: [...(s.knowledgeBase || []), entry] }));
  };
  const removeKnowledge = (id: string) => {
    setSettings(s => ({ ...s, knowledgeBase: (s.knowledgeBase || []).filter(k => k.id !== id) }));
  };
  const updateKnowledge = (id: string, field: 'topic' | 'content', value: string) => {
    setSettings(s => ({
      ...s,
      knowledgeBase: (s.knowledgeBase || []).map(k => k.id === id ? { ...k, [field]: value } : k),
    }));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Customize institute profile & system settings</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Institute Profile */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-5">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><Building2 size={16} /> Institute Profile</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Institute Name</Label>
              <Input value={settings.instituteName} onChange={e => setSettings(s => ({ ...s, instituteName: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Short Name</Label>
                <Input value={settings.instituteShortName} onChange={e => setSettings(s => ({ ...s, instituteShortName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input value={settings.tagline} onChange={e => setSettings(s => ({ ...s, tagline: e.target.value }))} />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-5">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><Phone size={16} /> Contact Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Phone</Label><Input type="tel" value={settings.phone} onChange={e => setSettings(s => ({ ...s, phone: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={settings.email} onChange={e => setSettings(s => ({ ...s, email: e.target.value }))} /></div>
          </div>
          <div className="space-y-2"><Label>Address</Label><Textarea value={settings.address} onChange={e => setSettings(s => ({ ...s, address: e.target.value }))} rows={2} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Institute Contact (for stopped accounts)</Label>
              <Input value={settings.instituteContactNumber || ''} onChange={e => setSettings(s => ({ ...s, instituteContactNumber: e.target.value }))} placeholder="Helpline number" />
              <p className="text-xs text-muted-foreground">Shown when student account is stopped</p>
            </div>
            <div className="space-y-2">
              <Label>Admin Notification Email</Label>
              <Input type="email" value={settings.adminNotificationEmail || ''} onChange={e => setSettings(s => ({ ...s, adminNotificationEmail: e.target.value }))} placeholder="vinkal93041@gmail.com" />
              <p className="text-xs text-muted-foreground">Fee/update notifications sent from here</p>
            </div>
          </div>
        </div>

        {/* Welcome Message Settings */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-5">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><LinkIcon size={16} /> Welcome Message Settings</h3>
          <div className="space-y-2">
            <Label>Rules Link (for welcome message)</Label>
            <Input value={settings.welcomeRulesLink || ''} onChange={e => setSettings(s => ({ ...s, welcomeRulesLink: e.target.value }))} placeholder="https://your-rules-page.com" />
            <p className="text-xs text-muted-foreground">Students will click this link to read institute rules</p>
          </div>
          <div className="space-y-2">
            <Label>Registration Fee (₹)</Label>
            <Input type="number" value={settings.registrationFee || 0} onChange={e => setSettings(s => ({ ...s, registrationFee: Number(e.target.value) }))} />
          </div>
        </div>

        {/* Required Documents */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-5">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><FileText size={16} /> Required Documents</h3>
          <div className="flex flex-wrap gap-2">
            {(settings.requiredDocuments || []).map(doc => (
              <Badge key={doc} variant="secondary" className="gap-1 pr-1">{doc}
                <button onClick={() => removeDoc(doc)} className="ml-1 p-0.5 rounded hover:bg-foreground/10"><X size={12} /></button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newDoc} onChange={e => setNewDoc(e.target.value)} placeholder="Add document" className="flex-1" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDoc())} />
            <Button variant="outline" onClick={addDoc} className="gap-1"><Plus size={14} /> Add</Button>
          </div>
        </div>

        {/* Courses */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-5">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><BookOpen size={16} /> Courses</h3>
          <div className="flex flex-wrap gap-2">
            {settings.courses.map(course => (
              <Badge key={course} variant="secondary" className="gap-1 pr-1">{course}
                <button onClick={() => removeCourse(course)} className="ml-1 p-0.5 rounded hover:bg-foreground/10"><X size={12} /></button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newCourse} onChange={e => setNewCourse(e.target.value)} placeholder="Add new course" className="flex-1" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCourse())} />
            <Button variant="outline" onClick={addCourse} className="gap-1"><Plus size={14} /> Add</Button>
          </div>
        </div>

        {/* Fee Settings */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-5">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><IndianRupee size={16} /> Fee Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Late Fee Amount (₹)</Label><Input type="number" value={settings.lateFeeAmount} onChange={e => setSettings(s => ({ ...s, lateFeeAmount: Number(e.target.value) }))} /></div>
            <div className="space-y-2"><Label>Fee Due Date (Day)</Label><Input type="number" min={1} max={28} value={settings.feeDueDate} onChange={e => setSettings(s => ({ ...s, feeDueDate: Number(e.target.value) }))} /></div>
            <div className="space-y-2"><Label>Grace Days</Label><Input type="number" value={settings.feeGraceDays} onChange={e => setSettings(s => ({ ...s, feeGraceDays: Number(e.target.value) }))} /></div>
          </div>
        </div>

        {/* Knowledge Panel for Chatbot */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><Brain size={16} /> Knowledge Panel (Chatbot)</h3>
            <Button size="sm" variant="outline" onClick={addKnowledge} className="gap-1"><Plus size={14} /> Add</Button>
          </div>
          <p className="text-xs text-muted-foreground">Add institute information here. The AI chatbot will use this data to answer student queries accurately.</p>
          {(settings.knowledgeBase || []).map(entry => (
            <div key={entry.id} className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
              <div className="flex items-center justify-between">
                <Input value={entry.topic} onChange={e => updateKnowledge(entry.id, 'topic', e.target.value)}
                  placeholder="Topic (e.g. Timing, Fees, Courses, Holidays)" className="flex-1 font-medium" />
                <button onClick={() => removeKnowledge(entry.id)} className="text-destructive p-2 hover:bg-destructive/10 rounded-lg ml-2"><Trash2 size={14} /></button>
              </div>
              <Textarea value={entry.content} onChange={e => updateKnowledge(entry.id, 'content', e.target.value)}
                placeholder="Enter detailed information about this topic..." rows={3} />
            </div>
          ))}
          {(settings.knowledgeBase || []).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No knowledge entries yet. Add topics like Timing, Fee Structure, Holidays etc.</p>
          )}
        </div>

        {/* FCM Push Notifications */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><Bell size={16} /> Push Notifications (FCM)</h3>
            <Switch checked={!!settings.fcm?.enabled}
              onCheckedChange={(v) => setSettings(s => ({ ...s, fcm: { ...(s.fcm || { senderId: '', enabled: false }), enabled: v } }))} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Sender ID</Label>
              <Input value={settings.fcm?.senderId || ''} onChange={e => setSettings(s => ({ ...s, fcm: { ...(s.fcm || { senderId: '', enabled: false }), senderId: e.target.value } }))} placeholder="123456789012" />
            </div>
          </div>
          {settings.fcm?.enabled && settings.fcm?.serverKey && (
            <p className="text-xs text-success">✅ Push notifications enabled — fee reminders will be sent to subscribed devices.</p>
          )}

          <div className="border-t border-border pt-4 space-y-2">
            <p className="text-sm font-medium text-foreground flex items-center gap-2"><BellRing size={14} /> Your Device Subscription</p>
            <p className="text-xs text-muted-foreground">Subscribe to receive fee reminder push notifications on this device.</p>
            <div className="flex gap-2">
              {!isSubscribed ? (
                <Button size="sm" onClick={subscribePush} className="gap-1.5"><BellRing size={14} /> Subscribe</Button>
              ) : (
                <Button size="sm" variant="destructive" onClick={unsubscribePush} className="gap-1.5"><BellOff size={14} /> Unsubscribe</Button>
              )}
              <Badge variant="secondary" className="self-center">{subs.length} device(s) subscribed</Badge>
            </div>
          </div>
        </div>

        <Button className="w-full" size="lg" onClick={handleSave}>
          <SettingsIcon size={16} className="mr-2" /> Save Settings
        </Button>
      </motion.div>
    </div>
  );
}
