import { useState } from 'react';
import { LayoutDashboard, Users, IndianRupee, ClipboardList, UserCog, Activity, Calendar, FileText, Menu, X, MessageSquare, Send, BarChart3, Database, Sheet, Settings, LogOut, UserPlus, Wallet, GraduationCap } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { motion, AnimatePresence } from 'framer-motion';

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
  { to: '/admin/database', label: 'Database', icon: Sheet },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const studentLinks = [
  { to: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/timetable', label: 'Timetable', icon: Calendar },
  { to: '/student/assignments', label: 'Assignments', icon: FileText },
];

const bottomQuickLinks = [
  { to: '/admin', label: 'Home', icon: LayoutDashboard },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/fees', label: 'Fees', icon: IndianRupee },
  { to: '/admin/analytics', label: 'Analytics', icon: Activity },
];

const studentQuickLinks = [
  { to: '/student', label: 'Home', icon: LayoutDashboard },
  { to: '/student/timetable', label: 'Schedule', icon: Calendar },
  { to: '/student/assignments', label: 'Tasks', icon: FileText },
];

export default function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const settings = getSettings();
  const [open, setOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const links = isAdmin ? adminLinks : studentLinks;
  const quickLinks = isAdmin ? bottomQuickLinks : studentQuickLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setOpen(false);
  };

  return (
    <>
      {/* Bottom Quick Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
        <div className="flex justify-around items-center py-2">
          <button onClick={() => setOpen(true)} className="flex flex-col items-center gap-1 px-2 py-1 text-xs text-muted-foreground">
            <Menu size={18} />
            <span>Menu</span>
          </button>
          {quickLinks.map(link => {
            const isActive = location.pathname === link.to;
            return (
              <NavLink key={link.to} to={link.to}
                className={`flex flex-col items-center gap-1 px-2 py-1 text-xs transition-colors ${isActive ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                <link.icon size={18} />
                {link.label}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Slide-out Sidebar Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-sidebar text-sidebar-foreground z-50 shadow-2xl flex flex-col md:hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-sidebar-border flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <GraduationCap className="text-primary-foreground" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm font-bold text-sidebar-primary truncate">{settings.instituteShortName}</h1>
                  <p className="text-xs text-sidebar-muted">{isAdmin ? 'Admin Panel' : 'Student Panel'}</p>
                </div>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-sidebar-accent/50">
                  <X size={18} />
                </button>
              </div>

              {/* Links */}
              <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
                {links.map(link => {
                  const isActive = location.pathname === link.to || (link.to !== '/admin' && link.to !== '/student' && location.pathname.startsWith(link.to));
                  return (
                    <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                      }`}>
                      <link.icon size={16} className="shrink-0" />
                      {link.label}
                    </NavLink>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="p-3 border-t border-sidebar-border space-y-2">
                <button onClick={handleLogout}
                  className="flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-accent-foreground transition-colors w-full px-3 py-2 rounded-lg hover:bg-sidebar-accent/50">
                  <LogOut size={16} /> Logout
                </button>
                <p className="text-xs text-sidebar-muted px-3">© 2026 {settings.instituteShortName}</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
