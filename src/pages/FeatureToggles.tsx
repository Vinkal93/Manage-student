import { useState } from 'react';
import { getFeatures, saveFeatures, FeatureConfig } from '@/lib/features';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Trash2, Upload, QrCode, Youtube, Link as LinkIcon, BookOpen, Bot } from 'lucide-react';

export default function FeatureToggles() {
  const [cfg, setCfg] = useState<FeatureConfig>(getFeatures());

  const update = (patch: Partial<FeatureConfig>) => setCfg(c => ({ ...c, ...patch }));
  const setToggle = (k: keyof FeatureConfig['toggles'], v: boolean) => setCfg(c => ({ ...c, toggles: { ...c.toggles, [k]: v } }));

  const save = () => { saveFeatures(cfg); toast.success('Settings saved!'); };

  const onQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) { toast.error('Image too large (max 1.5MB)'); return; }
    const reader = new FileReader();
    reader.onload = () => update({ qrImage: reader.result as string });
    reader.readAsDataURL(file);
  };

  const addLink = () => update({ importantLinks: [...cfg.importantLinks, { id: crypto.randomUUID(), title: '', url: '', visible: true }] });
  const removeLink = (id: string) => update({ importantLinks: cfg.importantLinks.filter(l => l.id !== id) });
  const addMaterial = () => update({ studyMaterial: [...cfg.studyMaterial, { id: crypto.randomUUID(), title: '', url: '', visible: true }] });
  const removeMaterial = (id: string) => update({ studyMaterial: cfg.studyMaterial.filter(l => l.id !== id) });
  const addFaq = () => update({ faqs: [...cfg.faqs, { q: '', a: '' }] });
  const removeFaq = (i: number) => update({ faqs: cfg.faqs.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Features & Dynamic Content</h1>
        <p className="text-sm text-muted-foreground mt-1">Toggle features, manage links, study material, payment QR & chatbot FAQ</p>
      </div>

      {/* Toggles */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">⚙️ Feature Toggles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(cfg.toggles).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
              <Label className="capitalize text-sm">{k.replace(/([A-Z])/g, ' $1').trim()}</Label>
              <Switch checked={v} onCheckedChange={(val) => setToggle(k as any, val)} />
            </div>
          ))}
        </div>
      </div>

      {/* Late Fee */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-3">
        <h3 className="font-semibold">💰 Late Fee Logic</h3>
        <Label>Late Fee Per Day (₹)</Label>
        <Input type="number" min={0} value={cfg.perDayLateFee} onChange={e => update({ perDayLateFee: Number(e.target.value) })} />
        <p className="text-xs text-muted-foreground">Charged automatically per day after the fee due date.</p>
      </div>

      {/* QR Payment */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-3">
        <h3 className="font-semibold flex items-center gap-2"><QrCode size={16}/> Online Payment (QR)</h3>
        <Label>Upload Payment QR Image</Label>
        <Input type="file" accept="image/*" onChange={onQrUpload} />
        {cfg.qrImage && <img src={cfg.qrImage} className="max-w-[180px] rounded-lg border border-border" alt="QR" />}
        <Label>UPI ID (optional)</Label>
        <Input value={cfg.upiId} onChange={e => update({ upiId: e.target.value })} placeholder="yourname@upi" />
      </div>

      {/* YouTube + App */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-3">
        <h3 className="font-semibold flex items-center gap-2"><Youtube size={16}/> Channel & App</h3>
        <Label>YouTube Channel URL</Label>
        <Input value={cfg.youtubeUrl} onChange={e => update({ youtubeUrl: e.target.value })} placeholder="https://youtube.com/@yourchannel" />
        <Label>Download App URL</Label>
        <Input value={cfg.appDownloadUrl} onChange={e => update({ appDownloadUrl: e.target.value })} placeholder="https://play.google.com/..." />
      </div>

      {/* Important Links */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2"><LinkIcon size={16}/> Important Links</h3>
          <Button size="sm" variant="outline" onClick={addLink}><Plus size={14}/> Add</Button>
        </div>
        {cfg.importantLinks.map((l, i) => (
          <div key={l.id} className="grid grid-cols-12 gap-2 items-center">
            <Input className="col-span-4" value={l.title} placeholder="Title" onChange={e => { const arr = [...cfg.importantLinks]; arr[i] = { ...l, title: e.target.value }; update({ importantLinks: arr }); }} />
            <Input className="col-span-6" value={l.url} placeholder="https://..." onChange={e => { const arr = [...cfg.importantLinks]; arr[i] = { ...l, url: e.target.value }; update({ importantLinks: arr }); }} />
            <Switch checked={l.visible} onCheckedChange={v => { const arr = [...cfg.importantLinks]; arr[i] = { ...l, visible: v }; update({ importantLinks: arr }); }} />
            <button onClick={() => removeLink(l.id)} className="text-destructive p-1"><Trash2 size={14}/></button>
          </div>
        ))}
      </div>

      {/* Study Material */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2"><BookOpen size={16}/> Study Material</h3>
          <Button size="sm" variant="outline" onClick={addMaterial}><Plus size={14}/> Add</Button>
        </div>
        {cfg.studyMaterial.map((l, i) => (
          <div key={l.id} className="grid grid-cols-12 gap-2 items-center">
            <Input className="col-span-4" value={l.title} placeholder="Title" onChange={e => { const arr = [...cfg.studyMaterial]; arr[i] = { ...l, title: e.target.value }; update({ studyMaterial: arr }); }} />
            <Input className="col-span-6" value={l.url} placeholder="https://..." onChange={e => { const arr = [...cfg.studyMaterial]; arr[i] = { ...l, url: e.target.value }; update({ studyMaterial: arr }); }} />
            <Switch checked={l.visible} onCheckedChange={v => { const arr = [...cfg.studyMaterial]; arr[i] = { ...l, visible: v }; update({ studyMaterial: arr }); }} />
            <button onClick={() => removeMaterial(l.id)} className="text-destructive p-1"><Trash2 size={14}/></button>
          </div>
        ))}
      </div>

      {/* Chatbot FAQs */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2"><Bot size={16}/> Chatbot FAQs</h3>
          <Button size="sm" variant="outline" onClick={addFaq}><Plus size={14}/> Add</Button>
        </div>
        {cfg.faqs.map((f, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-start">
            <Input className="col-span-3" value={f.q} placeholder="Keyword (e.g. fee)" onChange={e => { const arr = [...cfg.faqs]; arr[i] = { ...f, q: e.target.value }; update({ faqs: arr }); }} />
            <Textarea className="col-span-8" rows={2} value={f.a} placeholder="Answer" onChange={e => { const arr = [...cfg.faqs]; arr[i] = { ...f, a: e.target.value }; update({ faqs: arr }); }} />
            <button onClick={() => removeFaq(i)} className="text-destructive p-1 mt-2"><Trash2 size={14}/></button>
          </div>
        ))}
      </div>

      <Button className="w-full" size="lg" onClick={save}><Upload size={16} className="mr-2"/> Save All Changes</Button>
    </div>
  );
}
