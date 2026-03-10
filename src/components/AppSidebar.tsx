import { LayoutDashboard, Users, IndianRupee, MessageSquare, UserPlus, ClipboardList, BarChart3, Send, LogOut } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '@/lib/auth';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/add-student', label: 'New Admission', icon: UserPlus },
  { to: '/admin/fees', label: 'Fee Tracking', icon: IndianRupee },
  { to: '/admin/attendance', label: 'Attendance', icon: ClipboardList },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { to: '/admin/bulk-messages', label: 'Bulk Messages', icon: Send },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground min-h-screen">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-primary-foreground">SBCI</h1>
        <p className="text-xs text-sidebar-muted mt-1">Admin Panel</p>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {adminLinks.map(link => {
          const isActive = location.pathname === link.to || (link.to !== '/admin' && location.pathname.startsWith(link.to));
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              }`}
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-accent-foreground transition-colors w-full px-4 py-2 rounded-lg hover:bg-sidebar-accent/50">
          <LogOut size={16} /> Logout
        </button>
        <p className="text-xs text-sidebar-muted px-4">© 2026 SBCI Institute</p>
      </div>
    </aside>
  );
}
