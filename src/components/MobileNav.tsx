import { LayoutDashboard, Users, IndianRupee, MessageSquare, UserPlus } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/add-student', label: 'Add', icon: UserPlus },
  { to: '/fees', label: 'Fees', icon: IndianRupee },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around py-2">
        {links.map(link => {
          const isActive = location.pathname === link.to;
          return (
            <NavLink
              key={link.to}
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
