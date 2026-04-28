import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, IndianRupee, MessageSquare, UserPlus, ClipboardList, BarChart3, Send, LogOut, UserCog, Wallet, Activity, Settings, GraduationCap, Calendar, FileText, Database, Sheet, PanelLeftClose, PanelLeft, ToggleRight, CalendarDays } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { fbGetSidebarConfig } from '@/lib/firebaseStore';
import type { SidebarItem } from '@/pages/SidebarConfig';

const ICON_MAP: Record<string, any> = {
  LayoutDashboard, Users, IndianRupee, MessageSquare, UserPlus, ClipboardList, BarChart3, Send, UserCog, Wallet, Activity, Settings, GraduationCap, Calendar, FileText, Database, Sheet, ToggleRight, CalendarDays,
};

const defaultLinks = [
  { to: '/admin', label: 'Dashboard', icon: 'LayoutDashboard', category: 'Main' },
  { to: '/admin/students', label: 'Students', icon: 'Users', category: 'Students' },
  { to: '/admin/student-management', label: 'Student Manage', icon: 'UserCog', category: 'Students' },
  { to: '/admin/add-student', label: 'New Admission', icon: 'UserPlus', category: 'Students' },
  { to: '/admin/fees', label: 'Fee Tracking', icon: 'IndianRupee', category: 'Fees' },
  { to: '/admin/fee-management', label: 'Fee Management', icon: 'Wallet', category: 'Fees' },
  { to: '/admin/fee-record', label: 'Fee Record', icon: 'IndianRupee', category: 'Fees' },
  { to: '/admin/fee-calendar', label: 'Fee Calendar', icon: 'CalendarDays', category: 'Fees' },
  { to: '/admin/timetable', label: 'Timetable', icon: 'Calendar', category: 'Academic' },
  { to: '/admin/assignments', label: 'Assignments', icon: 'FileText', category: 'Academic' },
  { to: '/admin/attendance', label: 'Attendance', icon: 'ClipboardList', category: 'Academic' },
  { to: '/admin/messages', label: 'Messages', icon: 'MessageSquare', category: 'Communication' },
  { to: '/admin/bulk-messages', label: 'Bulk Messages', icon: 'Send', category: 'Communication' },
  { to: '/admin/reports', label: 'Reports', icon: 'BarChart3', category: 'Analytics' },
  { to: '/admin/analytics', label: 'Analytics', icon: 'Activity', category: 'Analytics' },
  { to: '/admin/backup', label: 'Backup', icon: 'Database', category: 'System' },
  { to: '/admin/database', label: 'Database', icon: 'Sheet', category: 'System' },
  { to: '/admin/features', label: 'Features & Content', icon: 'ToggleRight', category: 'System' },
  { to: '/admin/sidebar-config', label: 'Sidebar Config', icon: 'Settings', category: 'System' },
  { to: '/admin/settings', label: 'Settings', icon: 'Settings', category: 'System' },
];

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const settings = getSettings();
  const [collapsed, setCollapsed] = useState(false);
  const [links, setLinks] = useState(defaultLinks);

  // Load sidebar config
  useEffect(() => {
    const loadConfig = () => {
      const local = localStorage.getItem('insuite_sidebar_config');
      if (local) {
        try {
          const cfg = JSON.parse(local);
          if (cfg.adminItems) {
            setLinks(cfg.adminItems.filter((i: SidebarItem) => i.visible).map((i: SidebarItem) => ({
              to: i.to, label: i.label, icon: i.icon, category: i.category,
            })));
          }
        } catch {}
      }
    };
    loadConfig();
    // Also try Firebase
    fbGetSidebarConfig().then(cfg => {
      if (cfg?.adminItems) {
        localStorage.setItem('insuite_sidebar_config', JSON.stringify(cfg));
        setLinks(cfg.adminItems.filter((i: SidebarItem) => i.visible).map((i: SidebarItem) => ({
          to: i.to, label: i.label, icon: i.icon, category: i.category,
        })));
      }
    }).catch(() => {});

    const handler = () => loadConfig();
    window.addEventListener('sidebar:updated', handler);
    return () => window.removeEventListener('sidebar:updated', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };
  const categories = [...new Set(links.map(l => l.category))];

  return (
    <aside className={`hidden md:flex flex-col bg-sidebar text-sidebar-foreground min-h-screen border-r border-sidebar-border transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className={`p-3 border-b border-sidebar-border flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-5'}`}>
        {!collapsed && (
          <>
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <GraduationCap className="text-primary-foreground" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-sidebar-primary truncate">{settings.instituteShortName}</h1>
              <p className="text-xs text-sidebar-muted">Admin Panel</p>
            </div>
          </>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-sidebar-accent/50 text-sidebar-foreground/70 hover:text-sidebar-accent-foreground transition-colors flex-shrink-0" title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {categories.map(cat => {
          const catLinks = links.filter(l => l.category === cat);
          return (
            <div key={cat}>
              {!collapsed && <p className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted px-3 pt-3 pb-1">{cat}</p>}
              {catLinks.map(link => {
                const IconComp = ICON_MAP[link.icon] || Settings;
                const isActive = location.pathname === link.to || (link.to !== '/admin' && location.pathname.startsWith(link.to));
                return (
                  <NavLink key={link.to} to={link.to} title={collapsed ? link.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${collapsed ? 'justify-center px-0' : ''} ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'}`}>
                    <IconComp size={16} className="flex-shrink-0" />
                    {!collapsed && link.label}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>
      <div className={`p-3 border-t border-sidebar-border space-y-2 ${collapsed ? 'px-1' : ''}`}>
        <button onClick={handleLogout} title={collapsed ? 'Logout' : undefined}
          className={`flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-accent-foreground transition-colors w-full px-3 py-2 rounded-lg hover:bg-sidebar-accent/50 ${collapsed ? 'justify-center px-0' : ''}`}>
          <LogOut size={16} /> {!collapsed && 'Logout'}
        </button>
        {!collapsed && <p className="text-xs text-sidebar-muted px-3">© 2026 {settings.instituteShortName}</p>}
      </div>
    </aside>
  );
}
