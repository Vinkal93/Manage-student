import { useState } from 'react';
import { getSettings, saveSettings, InstituteSettings } from '@/lib/settings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Building2, Phone, Mail, MapPin, BookOpen, IndianRupee, Plus, X, Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function Settings() {
  const [settings, setSettings] = useState<InstituteSettings>(getSettings());
  const [newCourse, setNewCourse] = useState('');

  const handleSave = () => {
    saveSettings(settings);
    toast.success('Settings saved! Changes will appear across the app.');
  };

  const addCourse = () => {
    if (newCourse.trim() && !settings.courses.includes(newCourse.trim())) {
      setSettings(s => ({ ...s, courses: [...s.courses, newCourse.trim()] }));
      setNewCourse('');
    }
  };

  const removeCourse = (course: string) => {
    setSettings(s => ({ ...s, courses: s.courses.filter(c => c !== course) }));
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
              <Input value={settings.instituteName} onChange={e => setSettings(s => ({ ...s, instituteName: e.target.value }))} placeholder="e.g. SBCI Computer Institute" />
              <p className="text-xs text-muted-foreground">This name will appear on login page, sidebar, and everywhere in the app</p>
            </div>
            <div className="space-y-2">
              <Label>Short Name / Abbreviation</Label>
              <Input value={settings.instituteShortName} onChange={e => setSettings(s => ({ ...s, instituteShortName: e.target.value }))} placeholder="e.g. SBCI" />
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input value={settings.tagline} onChange={e => setSettings(s => ({ ...s, tagline: e.target.value }))} placeholder="e.g. Institute Management System" />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-5">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><Phone size={16} /> Contact Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Phone size={12} /> Phone</Label>
              <Input type="tel" value={settings.phone} onChange={e => setSettings(s => ({ ...s, phone: e.target.value }))} placeholder="Phone number" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Mail size={12} /> Email</Label>
              <Input type="email" value={settings.email} onChange={e => setSettings(s => ({ ...s, email: e.target.value }))} placeholder="Email address" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><MapPin size={12} /> Address</Label>
            <Textarea value={settings.address} onChange={e => setSettings(s => ({ ...s, address: e.target.value }))} placeholder="Institute full address" rows={2} />
          </div>
        </div>

        {/* Courses */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-5">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><BookOpen size={16} /> Courses</h3>
          <div className="flex flex-wrap gap-2">
            {settings.courses.map(course => (
              <Badge key={course} variant="secondary" className="gap-1 pr-1">
                {course}
                <button onClick={() => removeCourse(course)} className="ml-1 p-0.5 rounded hover:bg-foreground/10">
                  <X size={12} />
                </button>
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
            <div className="space-y-2">
              <Label>Late Fee Amount (₹)</Label>
              <Input type="number" value={settings.lateFeeAmount} onChange={e => setSettings(s => ({ ...s, lateFeeAmount: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Fee Due Date (Day)</Label>
              <Input type="number" min={1} max={28} value={settings.feeDueDate} onChange={e => setSettings(s => ({ ...s, feeDueDate: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Grace Days</Label>
              <Input type="number" value={settings.feeGraceDays} onChange={e => setSettings(s => ({ ...s, feeGraceDays: Number(e.target.value) }))} />
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
