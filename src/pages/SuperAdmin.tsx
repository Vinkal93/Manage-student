import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatCard from '@/components/StatCard';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Shield, Building2, Users, Activity, Settings, CheckCircle, XCircle,
  Search, Eye, Ban, RefreshCw, ArrowLeft, GraduationCap, Globe,
  TrendingUp, BarChart3, Bell, CreditCard, Lock
} from 'lucide-react';

const SU_PASS = 'superadmin2026';

function getRegistrations() {
  return JSON.parse(localStorage.getItem('insuite_registrations') || '[]');
}
function saveRegistrations(data: any[]) {
  localStorage.setItem('insuite_registrations', JSON.stringify(data));
}

export default function SuperAdmin() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const registrations = useMemo(() => getRegistrations(), [refreshKey]);
  const sessions = useMemo(() => JSON.parse(localStorage.getItem('sbci_sessions') || '[]'), [refreshKey]);
  const students = useMemo(() => JSON.parse(localStorage.getItem('sbci_students') || '[]'), [refreshKey]);

  const pending = registrations.filter((r: any) => r.status === 'pending');
  const approved = registrations.filter((r: any) => r.status === 'approved');
  const rejected = registrations.filter((r: any) => r.status === 'rejected');

  const filtered = useMemo(() => {
    let data = registrations;
    if (statusFilter !== 'all') data = data.filter((r: any) => r.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((r: any) => r.instituteName?.toLowerCase().includes(q) || r.ownerName?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q));
    }
    return data;
  }, [registrations, statusFilter, search]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SU_PASS) {
      setAuthenticated(true);
      toast.success('Super Admin authenticated');
    } else {
      toast.error('Invalid super admin password');
    }
  };

  const approveInstitute = (id: string) => {
    const regs = getRegistrations();
    const idx = regs.findIndex((r: any) => r.id === id);
    if (idx >= 0) { regs[idx].status = 'approved'; regs[idx].approvedAt = new Date().toISOString(); saveRegistrations(regs); setRefreshKey(k => k + 1); toast.success('Institute approved!'); }
  };

  const rejectInstitute = (id: string) => {
    const regs = getRegistrations();
    const idx = regs.findIndex((r: any) => r.id === id);
    if (idx >= 0) { regs[idx].status = 'rejected'; regs[idx].rejectedAt = new Date().toISOString(); saveRegistrations(regs); setRefreshKey(k => k + 1); toast.success('Institute rejected'); }
  };

  const deactivateInstitute = (id: string) => {
    const regs = getRegistrations();
    const idx = regs.findIndex((r: any) => r.id === id);
    if (idx >= 0) { regs[idx].status = 'deactivated'; saveRegistrations(regs); setRefreshKey(k => k + 1); toast.success('Institute deactivated'); }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <Button variant="ghost" size="sm" className="mb-4 gap-1 text-muted-foreground" onClick={() => navigate('/')}>
            <ArrowLeft size={14} /> Back
          </Button>
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-destructive flex items-center justify-center mx-auto mb-3">
              <Shield className="text-destructive-foreground" size={32} />
            </div>
            <h1 className="text-xl font-bold text-foreground">Super Admin Access</h1>
            <p className="text-xs text-muted-foreground mt-1">Restricted area — authorized personnel only</p>
          </div>
          <form onSubmit={handleLogin} className="bg-card rounded-xl border border-border shadow-lg p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input type="password" placeholder="Enter super admin password" value={password} onChange={e => setPassword(e.target.value)} className="pl-9" required />
              </div>
            </div>
            <Button type="submit" className="w-full gap-2"><Shield size={16} /> Authenticate</Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-destructive text-destructive-foreground px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield size={22} />
          <div>
            <h1 className="text-lg font-bold">Super Admin Panel</h1>
            <p className="text-xs opacity-80">InSuite Manage — Global Control</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-destructive-foreground/80 hover:text-destructive-foreground" onClick={() => setRefreshKey(k => k + 1)}>
            <RefreshCw size={14} />
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive-foreground/80 hover:text-destructive-foreground" onClick={() => { setAuthenticated(false); navigate('/'); }}>
            Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="Total Institutes" value={registrations.length} icon={Building2} variant="primary" />
          <StatCard title="Pending" value={pending.length} icon={Activity} variant="warning" />
          <StatCard title="Approved" value={approved.length} icon={CheckCircle} variant="success" />
          <StatCard title="Rejected" value={rejected.length} icon={XCircle} variant="warning" />
          <StatCard title="Total Students" value={students.length} icon={Users} variant="accent" />
          <StatCard title="Total Sessions" value={sessions.length} icon={Globe} variant="primary" />
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="gap-1 text-xs"><BarChart3 size={14} /> Dashboard</TabsTrigger>
            <TabsTrigger value="institutes" className="gap-1 text-xs"><Building2 size={14} /> Institutes</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1 text-xs"><TrendingUp size={14} /> Analytics</TabsTrigger>
            <TabsTrigger value="control" className="gap-1 text-xs"><Settings size={14} /> Control</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Pending Approvals */}
            <div className="bg-card rounded-xl border border-border shadow-sm">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><Bell size={16} className="text-warning" /> Pending Approvals ({pending.length})</h3>
              </div>
              <div className="divide-y divide-border">
                {pending.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">No pending requests</div>
                ) : pending.map((r: any) => (
                  <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{r.instituteName}</p>
                      <p className="text-xs text-muted-foreground">{r.ownerName} • {r.email} • {r.city}, {r.state}</p>
                      <p className="text-xs text-muted-foreground mt-1">Type: {r.instituteType} • Students: {r.numberOfStudents} • Applied: {new Date(r.submittedAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-1 bg-success hover:bg-success/90" onClick={() => approveInstitute(r.id)}><CheckCircle size={14} /> Approve</Button>
                      <Button size="sm" variant="destructive" className="gap-1" onClick={() => rejectInstitute(r.id)}><XCircle size={14} /> Reject</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card rounded-xl border border-border shadow-sm">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><Activity size={16} className="text-success" /> Recent Login Sessions</h3>
              </div>
              <div className="divide-y divide-border max-h-72 overflow-y-auto">
                {sessions.slice(-20).reverse().map((s: any, i: number) => (
                  <div key={i} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.userName}</p>
                      <p className="text-xs text-muted-foreground">{s.role} • {s.studentId || 'Admin'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{new Date(s.loginTime).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-muted-foreground">{s.screenSize}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="institutes" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <Input placeholder="Search institutes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="deactivated">Deactivated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Institute</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Owner</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs hidden sm:table-cell">Contact</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs hidden md:table-cell">Location</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Status</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r: any) => (
                      <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                        <td className="p-3">
                          <p className="font-medium text-foreground text-xs">{r.instituteName}</p>
                          <p className="text-xs text-muted-foreground capitalize">{r.instituteType}</p>
                        </td>
                        <td className="p-3 text-xs text-foreground">{r.ownerName}</td>
                        <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell">{r.email}<br />{r.phone}</td>
                        <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">{r.city}, {r.state}</td>
                        <td className="p-3">
                          <Badge variant={r.status === 'approved' ? 'default' : r.status === 'pending' ? 'secondary' : 'destructive'} className="text-xs capitalize">{r.status}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            {r.status === 'pending' && <>
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-success" onClick={() => approveInstitute(r.id)}><CheckCircle size={14} /></Button>
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => rejectInstitute(r.id)}><XCircle size={14} /></Button>
                            </>}
                            {r.status === 'approved' && (
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => deactivateInstitute(r.id)}><Ban size={14} /></Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                <h3 className="font-semibold text-foreground mb-4">Institute Registration Trend</h3>
                <div className="space-y-3">
                  {['pending', 'approved', 'rejected', 'deactivated'].map(status => {
                    const count = registrations.filter((r: any) => r.status === status).length;
                    const percent = registrations.length > 0 ? (count / registrations.length) * 100 : 0;
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground capitalize w-20">{status}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${status === 'approved' ? 'bg-success' : status === 'pending' ? 'bg-warning' : 'bg-destructive'}`} style={{ width: `${percent}%` }} />
                        </div>
                        <span className="text-xs font-medium text-foreground w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                <h3 className="font-semibold text-foreground mb-4">Platform Stats</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">Total Institutes</p>
                    <p className="text-xl font-bold text-foreground">{registrations.length}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">Total Students</p>
                    <p className="text-xl font-bold text-foreground">{students.length}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">Total Logins</p>
                    <p className="text-xl font-bold text-foreground">{sessions.length}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">Active Now</p>
                    <p className="text-xl font-bold text-success">{sessions.filter((s: any) => Date.now() - new Date(s.lastActivity).getTime() < 15 * 60 * 1000).length}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="control" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><Settings size={16} /> Website Settings</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Maintenance Mode</span>
                    <Badge variant="outline">Off</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">New Registrations</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Free Plan Limit</span>
                    <Badge variant="secondary">15 Students</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><CreditCard size={16} /> Plan Management</h3>
                <div className="space-y-3 text-sm">
                  {[
                    { name: 'Free', price: '₹0', limit: '15 students' },
                    { name: 'Basic', price: '₹99/mo', limit: '50 students' },
                    { name: 'Advanced', price: '₹199/mo', limit: 'Unlimited' },
                    { name: 'AI Pro', price: '₹299/mo', limit: 'Unlimited + AI' },
                  ].map(plan => (
                    <div key={plan.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <span className="font-medium text-foreground">{plan.name}</span>
                        <span className="text-muted-foreground ml-2">{plan.price}</span>
                      </div>
                      <Badge variant="outline">{plan.limit}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4 md:col-span-2">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><Bell size={16} /> Global Announcements</h3>
                <p className="text-sm text-muted-foreground">Send announcements to all institutes. Feature coming soon.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
