import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppSidebar from "@/components/AppSidebar";
import MobileNav from "@/components/MobileNav";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-auto">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}

function StudentLayout({ children }: { children: React.ReactNode }) {
  const settings = getSettings();
  return (
    <div className="min-h-screen">
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">{settings.instituteName}</h1>
          <p className="text-xs opacity-80">Student Panel</p>
        </div>
        <button
          onClick={() => { import('@/lib/auth').then(m => { m.logout(); window.location.href = '/login'; }); }}
          className="text-xs bg-primary-foreground/10 hover:bg-primary-foreground/20 px-3 py-1.5 rounded-lg transition-colors"
        >
          Logout
        </button>
      </header>
      <main className="p-4 md:p-8 pb-20 md:pb-8">
        {children}
      </main>
      <MobileNav />
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
          <Route path="/admin/student/:id" element={<ProtectedRoute role="admin"><AdminLayout><StudentProfile /></AdminLayout></ProtectedRoute>} />

          {/* Student Routes */}
          <Route path="/student" element={<ProtectedRoute role="student"><StudentLayout><StudentDashboard /></StudentLayout></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
