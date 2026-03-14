import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Download, Upload, Database, FileJson, AlertTriangle, CheckCircle, HardDrive, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const BACKUP_KEYS = [
  { key: 'sbci_students', label: 'Students Data', icon: '👨‍🎓' },
  { key: 'insuite_timetable', label: 'Timetable', icon: '📅' },
  { key: 'insuite_assignments', label: 'Assignments', icon: '📝' },
  { key: 'sbci_settings', label: 'Institute Settings', icon: '⚙️' },
];

export default function Backup() {
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [lastBackup, setLastBackup] = useState(localStorage.getItem('insuite_last_backup') || 'Never');

  const handleFullBackup = () => {
    const backup: Record<string, any> = { _meta: { version: '1.0', date: new Date().toISOString(), platform: 'InSuite Manage' } };
    BACKUP_KEYS.forEach(({ key }) => {
      const data = localStorage.getItem(key);
      if (data) backup[key] = JSON.parse(data);
    });

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insuite-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    const now = new Date().toLocaleString('en-IN');
    localStorage.setItem('insuite_last_backup', now);
    setLastBackup(now);
    toast.success('Full backup downloaded successfully');
  };

  const handleSingleBackup = (key: string, label: string) => {
    const data = localStorage.getItem(key);
    if (!data) { toast.error(`No ${label} data found`); return; }

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${key}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${label} backup downloaded`);
  };

  const handleRestore = () => {
    if (!restoreFile) { toast.error('Please select a backup file'); return; }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);
        if (!backup._meta) { toast.error('Invalid backup file format'); return; }

        let restored = 0;
        BACKUP_KEYS.forEach(({ key }) => {
          if (backup[key]) {
            localStorage.setItem(key, JSON.stringify(backup[key]));
            restored++;
          }
        });

        toast.success(`Restored ${restored} data sets from backup (${backup._meta.date})`);
        setRestoreFile(null);
        setTimeout(() => window.location.reload(), 1000);
      } catch {
        toast.error('Failed to parse backup file');
      }
    };
    reader.readAsText(restoreFile);
  };

  const getDataSize = (key: string) => {
    const data = localStorage.getItem(key);
    if (!data) return '0 B';
    const bytes = new Blob([data]).size;
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Database size={24} /> Backup & Restore</h1>
        <p className="text-sm text-muted-foreground">Manage your institute data backups</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><HardDrive className="mx-auto mb-2 text-primary" size={24} /><div className="text-lg font-bold text-foreground">{BACKUP_KEYS.reduce((t, k) => t + (localStorage.getItem(k.key) ? 1 : 0), 0)}</div><p className="text-xs text-muted-foreground">Data Sets Available</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><RefreshCw className="mx-auto mb-2 text-accent" size={24} /><div className="text-sm font-bold text-foreground">{lastBackup}</div><p className="text-xs text-muted-foreground">Last Backup</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><FileJson className="mx-auto mb-2 text-warning" size={24} /><div className="text-lg font-bold text-foreground">{BACKUP_KEYS.reduce((t, k) => t + new Blob([localStorage.getItem(k.key) || '']).size, 0) > 1024 ? `${(BACKUP_KEYS.reduce((t, k) => t + new Blob([localStorage.getItem(k.key) || '']).size, 0) / 1024).toFixed(1)} KB` : `${BACKUP_KEYS.reduce((t, k) => t + new Blob([localStorage.getItem(k.key) || '']).size, 0)} B`}</div><p className="text-xs text-muted-foreground">Total Data Size</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Download size={18} /> Download Backup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleFullBackup} className="w-full gap-2"><Download size={16} /> Full Backup (All Data)</Button>
            <div className="border-t pt-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Individual Backups:</p>
              {BACKUP_KEYS.map(({ key, label, icon }) => (
                <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm">
                    <span>{icon}</span>
                    <span>{label}</span>
                    <Badge variant="outline" className="text-xs">{getDataSize(key)}</Badge>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleSingleBackup(key, label)}>
                    <Download size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Upload size={18} /> Restore Backup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg flex items-start gap-2">
              <AlertTriangle size={18} className="text-warning mt-0.5" />
              <div className="text-sm">
                <strong>Warning:</strong> Restoring a backup will replace all existing data. Make sure to download a backup first.
              </div>
            </div>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <Upload className="mx-auto mb-3 text-muted-foreground" size={32} />
              <p className="text-sm text-muted-foreground mb-3">Select a backup file (.json)</p>
              <input
                type="file"
                accept=".json"
                onChange={e => setRestoreFile(e.target.files?.[0] || null)}
                className="text-sm"
              />
            </div>
            {restoreFile && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <CheckCircle size={16} className="text-success" />
                <span className="text-sm">{restoreFile.name}</span>
                <Badge variant="outline">{(restoreFile.size / 1024).toFixed(1)} KB</Badge>
              </div>
            )}
            <Button onClick={handleRestore} variant="destructive" className="w-full gap-2" disabled={!restoreFile}>
              <Upload size={16} /> Restore Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
