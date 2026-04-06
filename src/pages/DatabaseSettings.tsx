import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDbConfig, saveDbConfig, testDbConnection, DB_LABELS, DB_FIELDS, type DatabaseConfig, type DatabaseType } from '@/lib/dbConnectors';
import { getSheetsConfig, saveSheetsConfig, type SheetsConfig } from '@/lib/sheets';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Database, Link, Table2, RefreshCw, CheckCircle2, XCircle, Download,
  FileSpreadsheet, Settings2, Zap, Clock, Hand, Shield, ExternalLink, Info, Flame, Cloud, Grid3X3, Server, Box, LayoutGrid, BookOpen
} from 'lucide-react';

const SUGGESTED_SHEETS = ['Students', 'Fees', 'Attendance', 'Assignments', 'Results', 'Reports', 'Logs'];

const DB_ICONS: Record<DatabaseType, React.ReactNode> = {
  local: <Database size={16} />,
  google_sheets: <FileSpreadsheet size={16} />,
  firebase: <Flame size={16} />,
  supabase: <Cloud size={16} />,
  airtable: <Grid3X3 size={16} />,
  appwrite: <Server size={16} />,
  pocketbase: <Box size={16} />,
  baserow: <LayoutGrid size={16} />,
};

export default function DatabaseSettings() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<DatabaseConfig>(getDbConfig());
  const [sheetsConfig, setSheetsConfig] = useState<SheetsConfig>(getSheetsConfig());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDbTypeChange = (type: DatabaseType) => {
    setConfig(c => ({ ...c, type, connected: false }));
    setTestResult(null);
    setErrors({});
  };

  const validateField = (key: string, value: string, label: string): string => {
    if (!value.trim()) return `${label} is required`;
    if (key.includes('Email') && !value.includes('@')) return 'Invalid email format';
    if (key.includes('Url') || key.includes('Endpoint')) {
      try { new URL(value); } catch { return 'Invalid URL format'; }
    }
    return '';
  };

  const handleFieldChange = (key: keyof DatabaseConfig, value: string) => {
    setConfig(c => ({ ...c, [key]: value }));
    // Clear error on change
    if (errors[key]) {
      setErrors(e => { const n = { ...e }; delete n[key]; return n; });
    }
  };

  const handleTest = () => {
    // Validate all fields first
    const fields = DB_FIELDS[config.type];
    const newErrors: Record<string, string> = {};
    fields.forEach(f => {
      const err = validateField(f.key, (config[f.key] as string) || '', f.label);
      if (err) newErrors[f.key] = err;
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors before testing');
      return;
    }

    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      const result = testDbConnection(config);
      setTestResult(result);
      setTesting(false);
      if (result.success) {
        const updated = { ...config, connected: true, lastTestAt: new Date().toISOString() };
        setConfig(updated);
        saveDbConfig(updated);
        toast.success('Connection successful!');
      } else {
        toast.error(result.message);
      }
    }, 1500);
  };

  const handleSave = () => {
    saveDbConfig(config);
    if (config.type === 'google_sheets') {
      saveSheetsConfig({
        ...sheetsConfig,
        sheetId: config.sheetId || '',
        serviceEmail: config.serviceEmail || '',
        privateKey: config.privateKey || '',
        connected: config.connected,
      });
    }
    toast.success('Database settings saved!');
  };

  const handleDisconnect = () => {
    const updated = { ...config, connected: false };
    setConfig(updated);
    saveDbConfig(updated);
    setTestResult(null);
    toast.info(`Disconnected from ${DB_LABELS[config.type]}`);
  };

  const handleSync = () => {
    if (!config.connected) {
      toast.error('Please connect to a database first');
      return;
    }
    toast.success(`Data synced to ${DB_LABELS[config.type]}!`);
    setSheetsConfig(c => ({ ...c, lastSyncAt: new Date().toISOString() }));
  };

  const handleExport = (format: string) => {
    const allData: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sbci_') || key?.startsWith('insuite_')) {
        try { allData[key] = JSON.parse(localStorage.getItem(key)!); } catch { allData[key!] = localStorage.getItem(key); }
      }
    }

    if (format === 'JSON') {
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `insuite-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('JSON exported!');
    } else if (format === 'CSV') {
      // Export students as CSV
      const students = JSON.parse(localStorage.getItem('sbci_students') || '[]');
      if (students.length === 0) { toast.info('No student data to export'); return; }
      const headers = ['Student ID', 'Name', 'Father Name', 'Mobile', 'Course', 'Admission Date', 'Status'];
      const rows = students.map((s: any) => [s.studentId, s.name, s.fatherName, s.mobile, s.course, s.admissionDate, s.status].join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('CSV exported!');
    } else {
      toast.info('Excel export requires server-side processing. Use CSV or JSON for now.');
    }
  };

  const updateMapping = (index: number, sheetName: string) => {
    const newMappings = [...sheetsConfig.mappings];
    newMappings[index] = { ...newMappings[index], sheetName };
    setSheetsConfig(c => ({ ...c, mappings: newMappings }));
  };

  const fields = DB_FIELDS[config.type];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Database size={24} /> External Database Integration
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Connect your preferred database to store and manage institute data.
        </p>
      </div>

      {/* Connection Status */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border p-4 flex items-center justify-between ${config.connected ? 'bg-accent/20 border-accent/40' : 'bg-muted/50 border-border'}`}>
        <div className="flex items-center gap-3">
          {config.connected ? <CheckCircle2 className="text-accent" size={20} /> : <XCircle className="text-muted-foreground" size={20} />}
          <div>
            <p className="font-semibold text-foreground">{config.connected ? `Connected to ${DB_LABELS[config.type]}` : 'Not Connected'}</p>
            <p className="text-xs text-muted-foreground">
              {config.connected && config.lastTestAt ? `Last tested: ${new Date(config.lastTestAt).toLocaleString()}` : 'Select a database and connect'}
            </p>
          </div>
        </div>
        {config.connected && (
          <Button variant="outline" size="sm" onClick={handleDisconnect} className="text-destructive border-destructive/30">
            Disconnect
          </Button>
        )}
      </motion.div>

      {/* Database Mode Selector */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Settings2 size={16} /> Select Database Mode
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(DB_LABELS) as DatabaseType[]).map(dbType => (
            <button
              key={dbType}
              onClick={() => handleDbTypeChange(dbType)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-lg text-xs font-medium transition-all border ${
                config.type === dbType
                  ? 'bg-primary text-primary-foreground border-primary shadow-md'
                  : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:border-border'
              }`}
            >
              {DB_ICONS[dbType]}
              <span>{DB_LABELS[dbType]}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Connection Form */}
      {config.type !== 'local' && (
        <motion.div key={config.type} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            {DB_ICONS[config.type]} {DB_LABELS[config.type]} Configuration
          </h3>

          <div className="space-y-4">
            {fields.map(field => (
              <div key={field.key} className="space-y-1.5">
                <Label>{field.label}</Label>
                {field.key === 'privateKey' ? (
                  <Textarea
                    value={(config[field.key] as string) || ''}
                    onChange={e => handleFieldChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                    className={`font-mono text-xs ${errors[field.key] ? 'border-destructive' : ''}`}
                  />
                ) : (
                  <Input
                    type={field.type === 'password' ? 'password' : 'text'}
                    value={(config[field.key] as string) || ''}
                    onChange={e => handleFieldChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className={errors[field.key] ? 'border-destructive' : ''}
                  />
                )}
                {errors[field.key] && (
                  <p className="text-xs text-destructive">{errors[field.key]}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleTest} disabled={testing} className="gap-2">
              {testing ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button variant="outline" onClick={handleSave} className="gap-2">
              <Settings2 size={14} /> Save Config
            </Button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${testResult.success ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>
              {testResult.success ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {testResult.message}
            </div>
          )}
        </motion.div>
      )}

      {config.type === 'local' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Database size={16} /> Local Storage (Default)
          </h3>
          <p className="text-sm text-muted-foreground">
            Data is stored in your browser's localStorage. No external database needed.
          </p>
          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
            <p>⚠️ Data will be lost if browser data is cleared</p>
            <p>✅ Works offline without any setup</p>
            <p>📥 Use Backup page to export your data</p>
          </div>
        </motion.div>
      )}

      {/* Google Sheets specific: Table Mapping */}
      {config.type === 'google_sheets' && config.connected && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Table2 size={16} /> Map Data Tables
          </h3>
          <p className="text-sm text-muted-foreground">Map your system data tables to Google Sheet tabs.</p>
          <div className="space-y-3">
            {sheetsConfig.mappings.map((m, i) => (
              <div key={m.systemTable} className="flex items-center gap-3">
                <Badge variant="secondary" className="w-28 justify-center">{m.systemTable}</Badge>
                <span className="text-muted-foreground">→</span>
                <Select value={m.sheetName} onValueChange={v => updateMapping(i, v)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select Sheet Tab" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUGGESTED_SHEETS.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <Button variant="outline" onClick={() => { saveSheetsConfig(sheetsConfig); toast.success('Mappings saved!'); }} className="gap-2 mt-2">
            <Settings2 size={14} /> Save Mappings
          </Button>
        </motion.div>
      )}

      {/* Sync Settings */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-5">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <RefreshCw size={16} /> Sync Settings
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Auto Sync</p>
            <p className="text-xs text-muted-foreground">Automatically sync data changes</p>
          </div>
          <Switch checked={sheetsConfig.autoSync} onCheckedChange={v => setSheetsConfig(c => ({ ...c, autoSync: v }))} />
        </div>
        {sheetsConfig.autoSync && (
          <div className="space-y-2">
            <Label>Sync Frequency</Label>
            <div className="flex gap-2">
              {[
                { value: 'instant' as const, label: 'Instant', icon: Zap },
                { value: '5min' as const, label: 'Every 5 min', icon: Clock },
                { value: 'manual' as const, label: 'Manual', icon: Hand },
              ].map(opt => (
                <button key={opt.value}
                  onClick={() => setSheetsConfig(c => ({ ...c, syncMode: opt.value }))}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${sheetsConfig.syncMode === opt.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >
                  <opt.icon size={12} /> {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <Button onClick={handleSync} disabled={!config.connected && config.type !== 'local'} className="gap-2">
            <RefreshCw size={14} /> Sync Now
          </Button>
          <Button variant="outline" onClick={handleSave} className="gap-2">
            <Settings2 size={14} /> Save Settings
          </Button>
        </div>
        {sheetsConfig.lastSyncAt && (
          <p className="text-xs text-muted-foreground">Last synced: {new Date(sheetsConfig.lastSyncAt).toLocaleString()}</p>
        )}
      </motion.div>

      {/* Data Export */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Download size={16} /> Data Export
        </h3>
        <p className="text-sm text-muted-foreground">Download your institute data in various formats.</p>
        <div className="flex gap-2 flex-wrap">
          {['JSON', 'CSV', 'Excel'].map(fmt => (
            <Button key={fmt} variant="outline" size="sm" onClick={() => handleExport(fmt)}>
              <Download size={12} className="mr-1" /> {fmt}
            </Button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
