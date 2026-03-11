import { LayoutDashboard, Users, IndianRupee, ClipboardList, UserPlus, BarChart3, UserCog, Activity } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { getCurrentUser } from '@/lib/auth';

const adminLinks = [
  { to: '/admin', label: 'Home', icon: LayoutDashboard },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/fee-management', label: 'Fees', icon: IndianRupee },
  { to: '/admin/student-management', label: 'Manage', icon: UserCog },
  { to: '/admin/analytics', label: 'Analytics', icon: Activity },
];

const studentLinks = [
  { to: '/student', label: 'Home', icon: LayoutDashboard },
  { to: '/student', label: 'Fees', icon: IndianRupee },
  { to: '/student', label: 'Attend', icon: ClipboardList },
];

export default function MobileNav() {
  const location = useLocation();
  const user = getCurrentUser();
  const links = user?.role === 'student' ? studentLinks : adminLinks;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around py-2">
        {links.map((link, i) => {
          const isActive = location.pathname === link.to;
          return (
            <NavLink
              key={`${link.to}-${i}`}
              to={link.to}
              className={`flex flex-col items-center gap-1 px-2 py-1 text-xs transition-colors ${
                isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
              }`}
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
