import { LayoutDashboard, Users, IndianRupee, MessageSquare, UserPlus } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/add-student', label: 'New Admission', icon: UserPlus },
  { to: '/fees', label: 'Fee Tracking', icon: IndianRupee },
  { to: '/messages', label: 'WhatsApp Messages', icon: MessageSquare },
];

export default function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground min-h-screen">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-primary-foreground">SBCI</h1>
        <p className="text-xs text-sidebar-muted mt-1">Computer Institute</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(link => {
          const isActive = location.pathname === link.to;
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
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-muted">© 2026 SBCI Institute</p>
      </div>
    </aside>
  );
}
