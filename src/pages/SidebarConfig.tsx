import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { fbGetSidebarConfig, fbSaveSidebarConfig } from '@/lib/firebaseStore';
import { GripVertical, Save, RotateCcw, Eye, Loader2, LayoutDashboard, Users, IndianRupee, UserPlus, UserCog, Wallet, Calendar, FileText, ClipboardList, MessageSquare, Send, BarChart3, Activity, Database, Sheet, Settings, ToggleRight, CalendarDays } from 'lucide-react';

export interface SidebarItem {
  id: string; to: string; label: string; icon: string; visible: boolean; category: string;
}

const ICON_MAP: Record<string, any> = {
  LayoutDashboard, Users, IndianRupee, UserPlus, UserCog, Wallet, Calendar, FileText, ClipboardList, MessageSquare, Send, BarChart3, Activity, Database, Sheet, Settings, ToggleRight, CalendarDays,
};

const DEFAULT_ADMIN_ITEMS: SidebarItem[] = [
  { id: '1', to: '/admin', label: 'Dashboard', icon: 'LayoutDashboard', visible: true, category: 'Main' },
  { id: '2', to: '/admin/students', label: 'Students', icon: 'Users', visible: true, category: 'Students' },
  { id: '3', to: '/admin/student-management', label: 'Student Manage', icon: 'UserCog', visible: true, category: 'Students' },
  { id: '4', to: '/admin/add-student', label: 'New Admission', icon: 'UserPlus', visible: true, category: 'Students' },
  { id: '5', to: '/admin/fees', label: 'Fee Tracking', icon: 'IndianRupee', visible: true, category: 'Fees' },
  { id: '6', to: '/admin/fee-management', label: 'Fee Management', icon: 'Wallet', visible: true, category: 'Fees' },
  { id: '7', to: '/admin/fee-record', label: 'Fee Record', icon: 'IndianRupee', visible: true, category: 'Fees' },
  { id: '8', to: '/admin/fee-calendar', label: 'Fee Calendar', icon: 'CalendarDays', visible: true, category: 'Fees' },
  { id: '9', to: '/admin/timetable', label: 'Timetable', icon: 'Calendar', visible: true, category: 'Academic' },
  { id: '10', to: '/admin/assignments', label: 'Assignments', icon: 'FileText', visible: true, category: 'Academic' },
  { id: '11', to: '/admin/attendance', label: 'Attendance', icon: 'ClipboardList', visible: true, category: 'Academic' },
  { id: '12', to: '/admin/messages', label: 'Messages', icon: 'MessageSquare', visible: true, category: 'Communication' },
  { id: '13', to: '/admin/bulk-messages', label: 'Bulk Messages', icon: 'Send', visible: true, category: 'Communication' },
  { id: '14', to: '/admin/reports', label: 'Reports', icon: 'BarChart3', visible: true, category: 'Analytics' },
  { id: '15', to: '/admin/analytics', label: 'Analytics', icon: 'Activity', visible: true, category: 'Analytics' },
  { id: '16', to: '/admin/backup', label: 'Backup', icon: 'Database', visible: true, category: 'System' },
  { id: '17', to: '/admin/database', label: 'Database', icon: 'Sheet', visible: true, category: 'System' },
  { id: '18', to: '/admin/features', label: 'Features & Content', icon: 'ToggleRight', visible: true, category: 'System' },
  { id: '19', to: '/admin/settings', label: 'Settings', icon: 'Settings', visible: true, category: 'System' },
  { id: '20', to: '/admin/sidebar-config', label: 'Sidebar Config', icon: 'Settings', visible: true, category: 'System' },
];

export function getDefaultSidebarConfig() { return { adminItems: DEFAULT_ADMIN_ITEMS }; }

export default function SidebarConfig() {
  const [items, setItems] = useState<SidebarItem[]>(DEFAULT_ADMIN_ITEMS);
  const [loading, setLoading] = useState(true);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fbGetSidebarConfig().then(cfg => {
      if (cfg?.adminItems) setItems(cfg.adminItems);
      setLoading(false);
    });
  }, []);

  // Auto-save with debounce — saves 500ms after last change
  const autoSave = useCallback((newItems: SidebarItem[]) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const cfg = { adminItems: newItems };
      localStorage.setItem('insuite_sidebar_config', JSON.stringify(cfg));
      await fbSaveSidebarConfig(cfg);
      window.dispatchEvent(new Event('sidebar:updated'));
    }, 500);
  }, []);

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const newItems = [...items];
    const [moved] = newItems.splice(dragIdx, 1);
    newItems.splice(idx, 0, moved);
    setItems(newItems);
    setDragIdx(idx);
  };
  const handleDragEnd = () => {
    setDragIdx(null);
    autoSave(items); // Auto-save after drag
  };

  const toggleVisibility = (id: string) => {
    const newItems = items.map(i => i.id === id ? { ...i, visible: !i.visible } : i);
    setItems(newItems);
    autoSave(newItems); // Auto-save after toggle
  };

  const updateCategory = (id: string, category: string) => {
    const newItems = items.map(i => i.id === id ? { ...i, category } : i);
    setItems(newItems);
    autoSave(newItems);
  };

  const updateLabel = (id: string, label: string) => {
    const newItems = items.map(i => i.id === id ? { ...i, label } : i);
    setItems(newItems);
    autoSave(newItems);
  };

  const reset = () => {
    setItems(DEFAULT_ADMIN_ITEMS);
    autoSave(DEFAULT_ADMIN_ITEMS);
    toast.info('Reset to default');
  };

  const categories = [...new Set(items.map(i => i.category))];

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={24} /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sidebar Configuration</h1>
          <p className="text-sm text-muted-foreground mt-1">Drag to reorder, toggle visibility — changes auto-save & apply instantly ✨</p>
        </div>
        <Button variant="outline" size="sm" onClick={reset} className="gap-1.5"><RotateCcw size={14} /> Reset</Button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm divide-y divide-border">
        {items.map((item, idx) => {
          const IconComp = ICON_MAP[item.icon] || Settings;
          return (
            <div key={item.id} draggable onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)} onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-3 transition-colors ${dragIdx === idx ? 'bg-primary/5' : 'hover:bg-muted/50'} ${!item.visible ? 'opacity-50' : ''}`}>
              <GripVertical size={16} className="text-muted-foreground cursor-grab shrink-0" />
              <span className="text-xs text-muted-foreground w-6 text-center">{idx + 1}</span>
              <IconComp size={16} className="text-primary shrink-0" />
              <Input value={item.label} onChange={e => updateLabel(item.id, e.target.value)}
                className="h-8 text-sm flex-1 max-w-[160px]" />
              <Input value={item.category} onChange={e => updateCategory(item.id, e.target.value)}
                className="h-8 text-xs w-24 text-muted-foreground" placeholder="Category" />
              <Switch checked={item.visible} onCheckedChange={() => toggleVisibility(item.id)} />
            </div>
          );
        })}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Eye size={14} /> Preview — Categories</h3>
        <div className="space-y-3">
          {categories.map(cat => {
            const catItems = items.filter(i => i.category === cat && i.visible);
            if (catItems.length === 0) return null;
            return (
              <div key={cat}>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground px-2 mb-1">{cat}</p>
                {catItems.map(item => {
                  const IconComp = ICON_MAP[item.icon] || Settings;
                  return (
                    <div key={item.id} className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground">
                      <IconComp size={14} /> {item.label}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
