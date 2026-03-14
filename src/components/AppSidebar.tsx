import { LayoutDashboard, Users, IndianRupee, MessageSquare, UserPlus, ClipboardList, BarChart3, Send, LogOut, UserCog, Wallet, Activity, Settings, GraduationCap, Calendar, FileText, Database } from 'lucide-react';
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
  { to: '/admin/timetable', label: 'Timetable', icon: Calendar },
  { to: '/admin/assignments', label: 'Assignments', icon: FileText },
  { to: '/admin/attendance', label: 'Attendance', icon: ClipboardList },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { to: '/admin/bulk-messages', label: 'Bulk Messages', icon: Send },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/analytics', label: 'Analytics', icon: Activity },
  { to: '/admin/backup', label: 'Backup', icon: Database },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const settings = getSettings();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground min-h-screen border-r border-sidebar-border">
      <div className="p-5 border-b border-sidebar-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <GraduationCap className="text-primary-foreground" size={20} />
        </div>
        <div>
          <h1 className="text-sm font-bold text-sidebar-primary">{settings.instituteShortName}</h1>
          <p className="text-xs text-sidebar-muted">Admin Panel</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {adminLinks.map(link => {
          const isActive = location.pathname === link.to || (link.to !== '/admin' && location.pathname.startsWith(link.to));
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              }`}
            >
              <link.icon size={16} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-accent-foreground transition-colors w-full px-3 py-2 rounded-lg hover:bg-sidebar-accent/50">
          <LogOut size={16} /> Logout
        </button>
        <p className="text-xs text-sidebar-muted px-3">© 2026 {settings.instituteShortName}</p>
      </div>
    </aside>
  );
}
