import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppSidebar from "@/components/AppSidebar";
import MobileNav from "@/components/MobileNav";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getCurrentUser } from "@/lib/auth";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Students from "@/pages/Students";
import AddStudent from "@/pages/AddStudent";
import FeeTracking from "@/pages/FeeTracking";
import Messages from "@/pages/Messages";
import BulkMessages from "@/pages/BulkMessages";
import Attendance from "@/pages/Attendance";
import Reports from "@/pages/Reports";
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
  return (
    <div className="min-h-screen">
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">SBCI Institute</h1>
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

function RootRedirect() {
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
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute role="admin"><AdminLayout><Students /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/add-student" element={<ProtectedRoute role="admin"><AdminLayout><AddStudent /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/fees" element={<ProtectedRoute role="admin"><AdminLayout><FeeTracking /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/attendance" element={<ProtectedRoute role="admin"><AdminLayout><Attendance /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/messages" element={<ProtectedRoute role="admin"><AdminLayout><Messages /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/bulk-messages" element={<ProtectedRoute role="admin"><AdminLayout><BulkMessages /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute role="admin"><AdminLayout><Reports /></AdminLayout></ProtectedRoute>} />
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
