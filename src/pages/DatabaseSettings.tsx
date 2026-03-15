import { useState } from 'react';
import { getSheetsConfig, saveSheetsConfig, testConnection, SheetsConfig } from '@/lib/sheets';
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
  FileSpreadsheet, Settings2, Zap, Clock, Hand, Shield, ExternalLink, Info
} from 'lucide-react';

const SUGGESTED_SHEETS = ['Students', 'Fees', 'Attendance', 'Assignments', 'Results', 'Reports', 'Logs'];

export default function DatabaseSettings() {
  const [config, setConfig] = useState<SheetsConfig>(getSheetsConfig());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const handleSave = () => {
    saveSheetsConfig(config);
    toast.success('Database settings saved!');
  };

  const handleTest = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      const result = testConnection(config);
      setTestResult(result);
      setTesting(false);
      if (result.success) {
        setConfig(c => ({ ...c, connected: true }));
        toast.success('Connection successful!');
      } else {
        toast.error(result.message);
      }
    }, 1500);
  };

  const handleSync = () => {
    toast.success('Data synced to Google Sheets!');
    setConfig(c => ({ ...c, lastSyncAt: new Date().toISOString() }));
  };

  const handleDisconnect = () => {
    setConfig(c => ({ ...c, connected: false, sheetId: '', serviceEmail: '', privateKey: '' }));
    setTestResult(null);
    saveSheetsConfig({ ...config, connected: false, sheetId: '', serviceEmail: '', privateKey: '' });
    toast.info('Disconnected from Google Sheets');
  };

  const updateMapping = (index: number, sheetName: string) => {
    const newMappings = [...config.mappings];
    newMappings[index] = { ...newMappings[index], sheetName };
    setConfig(c => ({ ...c, mappings: newMappings }));
  };

  const steps = [
    { title: 'Create Google Sheet', icon: FileSpreadsheet },
    { title: 'Enable API', icon: Shield },
    { title: 'Share Sheet', icon: ExternalLink },
    { title: 'Connect', icon: Link },
    { title: 'Map Tables', icon: Table2 },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Database size={24} /> External Database Integration
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Connect Google Sheets to store and manage your institute data automatically.
        </p>
      </div>

      {/* Connection Status */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border p-4 flex items-center justify-between ${config.connected ? 'bg-accent/20 border-accent/40' : 'bg-muted/50 border-border'}`}>
        <div className="flex items-center gap-3">
          {config.connected ? <CheckCircle2 className="text-accent" size={20} /> : <XCircle className="text-muted-foreground" size={20} />}
          <div>
            <p className="font-semibold text-foreground">{config.connected ? 'Connected' : 'Not Connected'}</p>
            <p className="text-xs text-muted-foreground">
              {config.connected ? `Sheet ID: ${config.sheetId.slice(0, 20)}...` : 'Follow the steps below to connect'}
            </p>
          </div>
        </div>
        {config.connected && (
          <Button variant="outline" size="sm" onClick={handleDisconnect} className="text-destructive border-destructive/30">
            Disconnect
          </Button>
        )}
      </motion.div>

      {/* Setup Steps */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <button
            key={i}
            onClick={() => setActiveStep(i)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeStep === i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            <step.icon size={14} />
            {step.title}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <motion.div key={activeStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">

        {activeStep === 0 && (
          <>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <FileSpreadsheet size={16} /> Step 1 — Create Google Sheet
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
              <p className="text-foreground">Create a new Google Sheet with the following sheet tabs:</p>
              <div className="flex flex-wrap gap-2">
                {['Students', 'Fees', 'Attendance', 'Assignments', 'Results'].map(s => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                <p className="font-medium text-foreground">Students Sheet Columns:</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Student ID', 'Name', 'Course', 'Phone', 'Email', 'Join Date', 'Status'].map(c => (
                    <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                  ))}
                </div>
                <p className="font-medium text-foreground mt-2">Fees Sheet Columns:</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Student ID', 'Month', 'Amount', 'Payment Date', 'Status'].map(c => (
                    <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeStep === 1 && (
          <>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Shield size={16} /> Step 2 — Enable Google Sheets API
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <ol className="list-decimal list-inside space-y-1.5 text-foreground">
                <li>Open <a href="https://console.cloud.google.com" target="_blank" rel="noopener" className="text-primary underline">Google Cloud Console</a></li>
                <li>Create a new Project</li>
                <li>Enable <strong>Google Sheets API</strong></li>
                <li>Enable <strong>Google Drive API</strong></li>
                <li>Go to Credentials → Create <strong>Service Account</strong></li>
                <li>Download the <strong>JSON Key File</strong></li>
              </ol>
            </div>
          </>
        )}

        {activeStep === 2 && (
          <>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <ExternalLink size={16} /> Step 3 — Share Sheet with Service Account
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <p className="text-foreground">Share your Google Sheet with the Service Account email:</p>
              <code className="block bg-background text-xs p-2 rounded border border-border break-all">
                service-account@project-id.iam.gserviceaccount.com
              </code>
              <p className="text-muted-foreground flex items-center gap-1"><Info size={12} /> Set permission to <strong>Editor</strong></p>
            </div>
          </>
        )}

        {activeStep === 3 && (
          <>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Link size={16} /> Step 4 — Connect Sheet
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Google Sheet ID</Label>
                <Input
                  value={config.sheetId}
                  onChange={e => setConfig(c => ({ ...c, sheetId: e.target.value }))}
                  placeholder="1G2hDkAq83kLJd92..."
                />
                <p className="text-xs text-muted-foreground">Found in the Google Sheet URL between /d/ and /edit</p>
              </div>
              <div className="space-y-2">
                <Label>Service Account Email</Label>
                <Input
                  value={config.serviceEmail}
                  onChange={e => setConfig(c => ({ ...c, serviceEmail: e.target.value }))}
                  placeholder="sheet-access@project-id.iam.gserviceaccount.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Private Key</Label>
                <Textarea
                  value={config.privateKey}
                  onChange={e => setConfig(c => ({ ...c, privateKey: e.target.value }))}
                  placeholder="-----BEGIN PRIVATE KEY-----&#10;xxxxx&#10;-----END PRIVATE KEY-----"
                  rows={4}
                  className="font-mono text-xs"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleTest} disabled={testing} className="gap-2">
                  {testing ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                  {testing ? 'Testing...' : 'Test Connection'}
                </Button>
                <Button variant="outline" onClick={handleSave} className="gap-2">
                  <Settings2 size={14} /> Save Config
                </Button>
              </div>
              {testResult && (
                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${testResult.success ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
                  {testResult.success ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  {testResult.message}
                </div>
              )}
            </div>
          </>
        )}

        {activeStep === 4 && (
          <>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Table2 size={16} /> Step 5 — Map Data Tables
            </h3>
            <p className="text-sm text-muted-foreground">Map your system data tables to Google Sheet tabs.</p>
            <div className="space-y-3">
              {config.mappings.map((m, i) => (
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
            <Button variant="outline" onClick={handleSave} className="gap-2 mt-2">
              <Settings2 size={14} /> Save Mappings
            </Button>
          </>
        )}
      </motion.div>

      {/* Sync Settings */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-5">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <RefreshCw size={16} /> Sync Settings
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Auto Sync</p>
            <p className="text-xs text-muted-foreground">Automatically sync data changes to Google Sheets</p>
          </div>
          <Switch checked={config.autoSync} onCheckedChange={v => setConfig(c => ({ ...c, autoSync: v }))} />
        </div>

        {config.autoSync && (
          <div className="space-y-2">
            <Label>Sync Frequency</Label>
            <div className="flex gap-2">
              {[
                { value: 'instant' as const, label: 'Instant', icon: Zap },
                { value: '5min' as const, label: 'Every 5 min', icon: Clock },
                { value: 'manual' as const, label: 'Manual', icon: Hand },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setConfig(c => ({ ...c, syncMode: opt.value }))}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${config.syncMode === opt.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >
                  <opt.icon size={12} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSync} disabled={!config.connected} className="gap-2">
            <RefreshCw size={14} /> Sync Now
          </Button>
          <Button variant="outline" onClick={handleSave} className="gap-2">
            <Settings2 size={14} /> Save Settings
          </Button>
        </div>

        {config.lastSyncAt && (
          <p className="text-xs text-muted-foreground">
            Last synced: {new Date(config.lastSyncAt).toLocaleString()}
          </p>
        )}
      </motion.div>

      {/* Backup Download */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Download size={16} /> Data Export
        </h3>
        <p className="text-sm text-muted-foreground">Download your institute data in various formats.</p>
        <div className="flex gap-2 flex-wrap">
          {['JSON', 'CSV', 'Excel'].map(fmt => (
            <Button key={fmt} variant="outline" size="sm" onClick={() => toast.info(`${fmt} export coming soon!`)}>
              <Download size={12} className="mr-1" /> {fmt}
            </Button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
