import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppSidebar from "@/components/AppSidebar";
import MobileNav from "@/components/MobileNav";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { initTheme } from "@/lib/theme";
import ThemeToggle from "@/components/ThemeToggle";
import LangToggle from "@/components/LangToggle";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import SuperAdmin from "@/pages/SuperAdmin";
import AboutDeveloper from "@/pages/AboutDeveloper";
import Dashboard from "@/pages/Dashboard";
import Students from "@/pages/Students";
import StudentManagement from "@/pages/StudentManagement";
import AddStudent from "@/pages/AddStudent";
import FeeTracking from "@/pages/FeeTracking";
import FeeManagement from "@/pages/FeeManagement";
import Messages from "@/pages/Messages";
import BulkMessages from "@/pages/BulkMessages";
import Attendance from "@/pages/Attendance";
import Reports from "@/pages/Reports";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import StudentProfile from "@/pages/StudentProfile";
import StudentDashboard from "@/pages/StudentDashboard";
import Timetable from "@/pages/Timetable";
import Assignments from "@/pages/Assignments";
import Backup from "@/pages/Backup";
import DatabaseSettings from "@/pages/DatabaseSettings";
import DatabaseGuide from "@/pages/DatabaseGuide";
import FeeRecord from "@/pages/FeeRecord";
import FeeCalendar from "@/pages/FeeCalendar";
import ParentPortal from "@/pages/ParentPortal";
import StudentTimetable from "@/pages/StudentTimetable";
import StudentAssignments from "@/pages/StudentAssignments";
import StudentPayment from "@/pages/StudentPayment";
import FeatureToggles from "@/pages/FeatureToggles";
import SidebarConfig from "@/pages/SidebarConfig";
import NotFound from "./pages/NotFound";
import AIChatbot from "@/components/AIChatbot";
import Footer from "@/components/Footer";

// Initialize theme
initTheme();

const queryClient = new QueryClient();

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-12 border-b border-border bg-card flex items-center justify-end gap-2 px-4">
          <LangToggle />
          <ThemeToggle />
        </header>
        <main className="flex-1 p-4 md:p-8 pt-16 md:pt-4 pb-4 overflow-auto">
          {children}
          <Footer />
        </main>
      </div>
      <MobileNav />
      <AIChatbot />
    </div>
  );
}

function StudentLayout({ children }: { children: React.ReactNode }) {
  const settings = getSettings();
  return (
    <div className="min-h-screen bg-background">
      <header className="hidden md:flex bg-primary text-primary-foreground px-4 py-3 items-center justify-between sticky top-0 z-30 shadow">
        <div>
          <h1 className="text-lg font-bold">{settings.instituteName}</h1>
          <p className="text-xs opacity-80">Student Panel</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => { import('@/lib/auth').then(m => { m.logout(); window.location.href = '/login'; }); }}
            className="text-xs bg-primary-foreground/10 hover:bg-primary-foreground/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="px-4 py-4 md:px-8 md:py-6 pt-16 md:pt-6 pb-24 max-w-5xl mx-auto">
        {children}
        <Footer />
      </main>
      <MobileNav />
      <AIChatbot />
    </div>
  );
}

function AuthRedirect() {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/su" element={<SuperAdmin />} />
          <Route path="/about-developer" element={<AboutDeveloper />} />
          <Route path="/parent" element={<ParentPortal />} />
          <Route path="/dashboard" element={<AuthRedirect />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute role="admin"><AdminLayout><Students /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/student-management" element={<ProtectedRoute role="admin"><AdminLayout><StudentManagement /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/add-student" element={<ProtectedRoute role="admin"><AdminLayout><AddStudent /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/fees" element={<ProtectedRoute role="admin"><AdminLayout><FeeTracking /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/fee-management" element={<ProtectedRoute role="admin"><AdminLayout><FeeManagement /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/attendance" element={<ProtectedRoute role="admin"><AdminLayout><Attendance /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/messages" element={<ProtectedRoute role="admin"><AdminLayout><Messages /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/bulk-messages" element={<ProtectedRoute role="admin"><AdminLayout><BulkMessages /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute role="admin"><AdminLayout><Reports /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><AdminLayout><Analytics /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute role="admin"><AdminLayout><Settings /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/timetable" element={<ProtectedRoute role="admin"><AdminLayout><Timetable /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/assignments" element={<ProtectedRoute role="admin"><AdminLayout><Assignments /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/backup" element={<ProtectedRoute role="admin"><AdminLayout><Backup /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/database" element={<ProtectedRoute role="admin"><AdminLayout><DatabaseSettings /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/database/guide/:dbType" element={<ProtectedRoute role="admin"><AdminLayout><DatabaseGuide /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/fee-record" element={<ProtectedRoute role="admin"><AdminLayout><FeeRecord /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/fee-calendar" element={<ProtectedRoute role="admin"><AdminLayout><FeeCalendar /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/features" element={<ProtectedRoute role="admin"><AdminLayout><FeatureToggles /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/sidebar-config" element={<ProtectedRoute role="admin"><AdminLayout><SidebarConfig /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/student/:id" element={<ProtectedRoute role="admin"><AdminLayout><StudentProfile /></AdminLayout></ProtectedRoute>} />

          {/* Student Routes */}
          <Route path="/student" element={<ProtectedRoute role="student"><StudentLayout><StudentDashboard /></StudentLayout></ProtectedRoute>} />
          <Route path="/student/timetable" element={<ProtectedRoute role="student"><StudentLayout><StudentTimetable /></StudentLayout></ProtectedRoute>} />
          <Route path="/student/assignments" element={<ProtectedRoute role="student"><StudentLayout><StudentAssignments /></StudentLayout></ProtectedRoute>} />
          <Route path="/student/payment" element={<ProtectedRoute role="student"><StudentLayout><StudentPayment /></StudentLayout></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
