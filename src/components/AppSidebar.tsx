import { useState } from 'react';
import { LayoutDashboard, Users, IndianRupee, MessageSquare, UserPlus, ClipboardList, BarChart3, Send, LogOut, UserCog, Wallet, Activity, Settings, GraduationCap, Calendar, FileText, Database, Sheet, PanelLeftClose, PanelLeft, ToggleRight } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '@/lib/auth';
import { getSettings } from '@/lib/settings';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/student-management', label: 'Student Manage', icon: UserCog },
  { to: '/admin/add-student', label: 'New Admission', icon: UserPlus },
  { to: '/admin/fees', label: 'Fee Tracking', icon: IndianRupee },
  { to: '/admin/fee-management', label: 'Fee Management', icon: Wallet },
  { to: '/admin/fee-record', label: 'Fee Record', icon: IndianRupee },
  { to: '/admin/timetable', label: 'Timetable', icon: Calendar },
  { to: '/admin/assignments', label: 'Assignments', icon: FileText },
  { to: '/admin/attendance', label: 'Attendance', icon: ClipboardList },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { to: '/admin/bulk-messages', label: 'Bulk Messages', icon: Send },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/analytics', label: 'Analytics', icon: Activity },
  { to: '/admin/backup', label: 'Backup', icon: Database },
  { to: '/admin/database', label: 'Database', icon: Sheet },
  { to: '/admin/features', label: 'Features & Content', icon: ToggleRight },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const settings = getSettings();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-sidebar-accent/50 text-sidebar-foreground/70 hover:text-sidebar-accent-foreground transition-colors flex-shrink-0"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {adminLinks.map(link => {
          const isActive = location.pathname === link.to || (link.to !== '/admin' && location.pathname.startsWith(link.to));
          return (
            <NavLink
              key={link.to}
              to={link.to}
              title={collapsed ? link.label : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                collapsed ? 'justify-center px-0' : ''
              } ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              }`}
            >
              <link.icon size={16} className="flex-shrink-0" />
              {!collapsed && link.label}
            </NavLink>
          );
        })}
      </nav>
      <div className={`p-3 border-t border-sidebar-border space-y-2 ${collapsed ? 'px-1' : ''}`}>
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-accent-foreground transition-colors w-full px-3 py-2 rounded-lg hover:bg-sidebar-accent/50 ${collapsed ? 'justify-center px-0' : ''}`}
        >
          <LogOut size={16} />
          {!collapsed && 'Logout'}
        </button>
        {!collapsed && <p className="text-xs text-sidebar-muted px-3">© 2026 {settings.instituteShortName}</p>}
      </div>
    </aside>
  );
}
