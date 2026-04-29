import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import StatCard from '@/components/StatCard';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Shield, Building2, Users, Activity, Settings, CheckCircle, XCircle,
  Search, Eye, Ban, RefreshCw, ArrowLeft, Globe, KeyRound,
  TrendingUp, BarChart3, Bell, CreditCard, Lock, Play, IndianRupee, AlertTriangle,
} from 'lucide-react';
import {
  getInstitutes, updateInstitute, approveInstitute, PLANS,
  type Institute, type PlanType,
} from '@/lib/tenant';
import { getStudents } from '@/lib/store';
import { getAuditLog, logAudit } from '@/lib/audit';
import { ScrollText, ClipboardCheck } from 'lucide-react';

const SU_PASS = 'superadmin2026';

export default function SuperAdmin() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [drillInstitute, setDrillInstitute] = useState<Institute | null>(null);
  const [credsInstitute, setCredsInstitute] = useState<Institute | null>(null);

  const institutes = useMemo(() => getInstitutes(), [refreshKey]);
  const sessions = useMemo(() => JSON.parse(localStorage.getItem('sbci_sessions') || '[]'), [refreshKey]);
  const auditLog = useMemo(() => getAuditLog().slice().reverse(), [refreshKey]);
  const [approvalPlan, setApprovalPlan] = useState<Record<string, PlanType>>({});

  // Aggregate per-institute analytics (tenant-scoped reads)
  const tenantData = useMemo(() => institutes.map(inst => {
    const students = getStudents(inst.id);
    let collected = 0, pending = 0, overdueStudents = 0;
    students.forEach(s => {
      let hasOverdue = false;
      s.feeRecords.forEach(f => {
        if (f.status === 'paid') collected += (f.paidAmount ?? f.amount) || 0;
        else { pending += ((f.amount || 0) + (f.lateFee || 0)) - (f.paidAmount || 0); if (f.status === 'overdue') hasOverdue = true; }
      });
      if (hasOverdue) overdueStudents++;
    });
    const collectionRate = (collected + pending) > 0 ? Math.round((collected / (collected + pending)) * 100) : 0;
    return { institute: inst, students, collected, pending, overdueStudents, collectionRate };
  }), [institutes, refreshKey]);

  const totalStudents = tenantData.reduce((a, t) => a + t.students.length, 0);
  const totalRevenue = tenantData.reduce((a, t) => a + t.collected, 0);
  const totalPending = tenantData.reduce((a, t) => a + t.pending, 0);
  const monthlyMRR = institutes.filter(i => i.status === 'approved').reduce((a, i) => a + (i.monthlyFee || PLANS[i.plan]?.price || 0), 0);

  const pending = institutes.filter(r => r.status === 'pending');
  const approved = institutes.filter(r => r.status === 'approved');
  const suspended = institutes.filter(r => r.status === 'suspended' || r.status === 'deactivated');

  const filtered = useMemo(() => {
    let data = institutes;
    if (statusFilter !== 'all') data = data.filter(r => r.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(r => r.instituteName?.toLowerCase().includes(q) || r.ownerName?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q));
    }
    return data;
  }, [institutes, statusFilter, search]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SU_PASS) { setAuthenticated(true); toast.success('Super Admin authenticated'); }
    else toast.error('Invalid super admin password');
  };

  const refresh = () => setRefreshKey(k => k + 1);

  const doApprove = (id: string, plan: PlanType = 'free') => {
    const r = approveInstitute(id, plan);
    if (r) {
      setCredsInstitute(r); toast.success('Institute approved! Share credentials with the owner.'); refresh();
      logAudit({ actor: 'super-admin', action: 'institute.approve', targetId: id, targetLabel: r.instituteName, details: `Approved on plan ${PLANS[plan].name}` });
    }
  };
  const doReject = (id: string) => { const r = updateInstitute(id, { status: 'rejected', rejectedAt: new Date().toISOString() }); toast.success('Institute rejected'); refresh(); logAudit({ actor: 'super-admin', action: 'institute.reject', targetId: id, targetLabel: r?.instituteName }); };
  const doSuspend = (id: string) => { const r = updateInstitute(id, { status: 'suspended', suspendedAt: new Date().toISOString() }); toast.success('Institute suspended'); refresh(); logAudit({ actor: 'super-admin', action: 'institute.suspend', targetId: id, targetLabel: r?.instituteName }); };
  const doReactivate = (id: string) => { const r = updateInstitute(id, { status: 'approved' }); toast.success('Institute reactivated'); refresh(); logAudit({ actor: 'super-admin', action: 'institute.reactivate', targetId: id, targetLabel: r?.instituteName }); };
  const doChangePlan = (id: string, plan: PlanType) => { const r = updateInstitute(id, { plan, monthlyFee: PLANS[plan].price }); toast.success(`Plan changed to ${PLANS[plan].name}`); refresh(); logAudit({ actor: 'super-admin', action: 'institute.plan_change', targetId: id, targetLabel: r?.instituteName, details: `New plan: ${PLANS[plan].name}` }); };

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
              <p className="text-[11px] text-muted-foreground">Default password: <code className="bg-muted px-1 rounded">superadmin2026</code></p>
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
            <p className="text-xs opacity-80">InSuite Manage — Multi-Tenant SaaS Control</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-destructive-foreground/80 hover:text-destructive-foreground" onClick={refresh}><RefreshCw size={14} /></Button>
          <Button variant="ghost" size="sm" className="text-destructive-foreground/80 hover:text-destructive-foreground" onClick={() => { setAuthenticated(false); navigate('/'); }}>Logout</Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {/* Global Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="Total Institutes" value={institutes.length} icon={Building2} variant="primary" />
          <StatCard title="Active" value={approved.length} icon={CheckCircle} variant="success" />
          <StatCard title="Pending" value={pending.length} icon={Activity} variant="warning" />
          <StatCard title="Suspended" value={suspended.length} icon={Ban} variant="warning" />
          <StatCard title="Total Students" value={totalStudents} icon={Users} variant="accent" />
          <StatCard title="MRR (₹)" value={monthlyMRR} icon={IndianRupee} variant="success" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Revenue Collected (₹)" value={totalRevenue} icon={TrendingUp} variant="success" />
          <StatCard title="Global Pending (₹)" value={totalPending} icon={AlertTriangle} variant="warning" />
          <StatCard title="Login Sessions" value={sessions.length} icon={Globe} variant="primary" />
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="gap-1 text-xs"><BarChart3 size={14} /> Overview</TabsTrigger>
            <TabsTrigger value="approvals" className="gap-1 text-xs"><ClipboardCheck size={14} /> Approvals</TabsTrigger>
            <TabsTrigger value="institutes" className="gap-1 text-xs"><Building2 size={14} /> Institutes</TabsTrigger>
            <TabsTrigger value="revenue" className="gap-1 text-xs"><IndianRupee size={14} /> Revenue</TabsTrigger>
            <TabsTrigger value="audit" className="gap-1 text-xs"><ScrollText size={14} /> Audit Log</TabsTrigger>
            <TabsTrigger value="control" className="gap-1 text-xs"><Settings size={14} /> Control</TabsTrigger>
          </TabsList>

          {/* Overview tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="bg-card rounded-xl border border-border shadow-sm">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><Bell size={16} className="text-warning" /> Pending Approvals ({pending.length})</h3>
              </div>
              <div className="divide-y divide-border">
                {pending.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">No pending requests</div>
                ) : pending.map(r => (
                  <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{r.instituteName}</p>
                      <p className="text-xs text-muted-foreground">{r.ownerName} • {r.email} • {r.city}, {r.state}</p>
                      <p className="text-xs text-muted-foreground mt-1">Type: {r.instituteType} • Students: {r.numberOfStudents} • Applied: {new Date(r.submittedAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-1 bg-success hover:bg-success/90" onClick={() => doApprove(r.id, 'free')}><CheckCircle size={14} /> Approve</Button>
                      <Button size="sm" variant="destructive" className="gap-1" onClick={() => doReject(r.id)}><XCircle size={14} /> Reject</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><Activity size={16} className="text-success" /> Recent Login Sessions</h3>
              </div>
              <div className="divide-y divide-border max-h-72 overflow-y-auto">
                {sessions.slice(-20).reverse().map((s: any, i: number) => (
                  <div key={i} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.userName}</p>
                      <p className="text-xs text-muted-foreground">{s.role} • {s.studentId || s.email || 'Admin'}</p>
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

          {/* Approvals tab */}
          <TabsContent value="approvals" className="space-y-4">
            <div className="bg-card rounded-xl border border-border shadow-sm">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><ClipboardCheck size={16} className="text-warning" /> Pending Institute Registrations ({pending.length})</h3>
                <Badge variant="outline">Approve with plan selection</Badge>
              </div>
              <div className="divide-y divide-border">
                {pending.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">No pending registrations 🎉</div>
                ) : pending.map(r => (
                  <div key={r.id} className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                    <div className="md:col-span-5">
                      <p className="font-medium text-foreground">{r.instituteName}</p>
                      <p className="text-xs text-muted-foreground">{r.ownerName} • {r.email}</p>
                      <p className="text-xs text-muted-foreground">{r.phone} • {r.city}, {r.state}</p>
                      <p className="text-xs text-muted-foreground mt-1">Type: {r.instituteType} • Students: {r.numberOfStudents}</p>
                    </div>
                    <div className="md:col-span-3">
                      <p className="text-[11px] text-muted-foreground mb-1">Courses</p>
                      <p className="text-xs text-foreground line-clamp-2">{r.coursesOffered || '—'}</p>
                      <p className="text-[11px] text-muted-foreground mt-2">Applied {new Date(r.submittedAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-[11px] text-muted-foreground mb-1">Assign Plan</p>
                      <Select value={approvalPlan[r.id] || 'free'} onValueChange={v => setApprovalPlan(p => ({ ...p, [r.id]: v as PlanType }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(Object.keys(PLANS) as PlanType[]).map(p => <SelectItem key={p} value={p} className="text-xs">{PLANS[p].name} • ₹{PLANS[p].price}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 flex gap-2 md:justify-end">
                      <Button size="sm" className="gap-1 bg-success hover:bg-success/90" onClick={() => doApprove(r.id, approvalPlan[r.id] || 'free')}><CheckCircle size={14} /> Approve</Button>
                      <Button size="sm" variant="destructive" className="gap-1" onClick={() => doReject(r.id)}><XCircle size={14} /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Audit log tab */}
          <TabsContent value="audit" className="space-y-4">
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><ScrollText size={16} /> Audit Log ({auditLog.length})</h3>
                <Badge variant="outline">Tracks suspends, plan changes, fee edits & overrides</Badge>
              </div>
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted/50">
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-xs text-muted-foreground">Time</th>
                      <th className="text-left p-3 text-xs text-muted-foreground">Actor</th>
                      <th className="text-left p-3 text-xs text-muted-foreground">Action</th>
                      <th className="text-left p-3 text-xs text-muted-foreground">Target</th>
                      <th className="text-left p-3 text-xs text-muted-foreground">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLog.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">No audit entries yet</td></tr>
                    ) : auditLog.map(e => (
                      <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(e.ts).toLocaleString('en-IN')}</td>
                        <td className="p-3 text-xs"><Badge variant={e.actor === 'super-admin' ? 'destructive' : 'secondary'} className="text-[10px]">{e.actor}</Badge></td>
                        <td className="p-3 text-xs font-mono text-foreground">{e.action}</td>
                        <td className="p-3 text-xs text-foreground">{e.targetLabel || e.targetId || '—'}</td>
                        <td className="p-3 text-xs text-muted-foreground">{e.details || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Institutes tab — table + drill-down */}
          <TabsContent value="institutes" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <Input placeholder="Search institutes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Institute</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Plan</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Students</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs hidden md:table-cell">Revenue</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs hidden md:table-cell">Pending</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Status</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(r => {
                      const td = tenantData.find(t => t.institute.id === r.id);
                      return (
                      <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                        <td className="p-3">
                          <p className="font-medium text-foreground text-xs">{r.instituteName}</p>
                          <p className="text-xs text-muted-foreground">{r.ownerName} • {r.email}</p>
                        </td>
                        <td className="p-3">
                          <Select value={r.plan} onValueChange={v => doChangePlan(r.id, v as PlanType)}>
                            <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {(Object.keys(PLANS) as PlanType[]).map(p => <SelectItem key={p} value={p} className="text-xs">{PLANS[p].name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3 text-xs text-foreground">{td?.students.length ?? 0}</td>
                        <td className="p-3 text-xs text-success font-medium hidden md:table-cell">₹{td?.collected ?? 0}</td>
                        <td className="p-3 text-xs text-warning hidden md:table-cell">₹{td?.pending ?? 0}</td>
                        <td className="p-3">
                          <Badge variant={r.status === 'approved' ? 'default' : r.status === 'pending' ? 'secondary' : 'destructive'} className="text-xs capitalize">{r.status}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setDrillInstitute(r)} title="Drill down"><Eye size={14} /></Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setCredsInstitute(r)} title="View credentials"><KeyRound size={14} /></Button>
                            {r.status === 'pending' && <>
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-success" onClick={() => doApprove(r.id, 'free')}><CheckCircle size={14} /></Button>
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => doReject(r.id)}><XCircle size={14} /></Button>
                            </>}
                            {r.status === 'approved' && (
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-warning" onClick={() => doSuspend(r.id)} title="Suspend"><Ban size={14} /></Button>
                            )}
                            {(r.status === 'suspended' || r.status === 'deactivated') && (
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-success" onClick={() => doReactivate(r.id)} title="Reactivate"><Play size={14} /></Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Revenue tab */}
          <TabsContent value="revenue" className="space-y-4">
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><IndianRupee size={16} className="text-success" /> Revenue per Institute</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-3 text-xs text-muted-foreground">Institute</th>
                      <th className="text-left p-3 text-xs text-muted-foreground">Students</th>
                      <th className="text-left p-3 text-xs text-muted-foreground">Collected</th>
                      <th className="text-left p-3 text-xs text-muted-foreground">Pending</th>
                      <th className="text-left p-3 text-xs text-muted-foreground">Collection %</th>
                      <th className="text-left p-3 text-xs text-muted-foreground">Subscription</th>
                      <th className="text-left p-3 text-xs text-muted-foreground">Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenantData.map(t => (
                      <tr key={t.institute.id} className="border-b border-border last:border-0">
                        <td className="p-3 text-xs font-medium text-foreground">{t.institute.instituteName}</td>
                        <td className="p-3 text-xs">{t.students.length}</td>
                        <td className="p-3 text-xs text-success">₹{t.collected}</td>
                        <td className="p-3 text-xs text-warning">₹{t.pending}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-[60px]">
                              <div className="h-full bg-success" style={{ width: `${t.collectionRate}%` }} />
                            </div>
                            <span className="text-xs">{t.collectionRate}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-xs"><Badge variant="outline">{PLANS[t.institute.plan]?.name || 'Free'} • ₹{t.institute.monthlyFee || 0}/mo</Badge></td>
                        <td className="p-3 text-xs text-muted-foreground">{t.institute.expiresAt ? new Date(t.institute.expiresAt).toLocaleDateString('en-IN') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Control tab */}
          <TabsContent value="control" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><CreditCard size={16} /> Plan Catalog</h3>
                <div className="space-y-3 text-sm">
                  {(Object.keys(PLANS) as PlanType[]).map(p => (
                    <div key={p} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <span className="font-medium text-foreground">{PLANS[p].name}</span>
                        <span className="text-muted-foreground ml-2">₹{PLANS[p].price}/mo</span>
                      </div>
                      <Badge variant="outline">{PLANS[p].limit >= 9999 ? 'Unlimited' : `${PLANS[p].limit} students`}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><AlertTriangle size={16} className="text-warning" /> Subscription Alerts</h3>
                <div className="space-y-2 text-sm max-h-72 overflow-y-auto">
                  {institutes.filter(i => i.expiresAt && new Date(i.expiresAt).getTime() - Date.now() < 7 * 86400000 && i.status === 'approved').map(i => (
                    <div key={i.id} className="p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{i.instituteName}</p>
                        <p className="text-xs text-muted-foreground">Expires {new Date(i.expiresAt!).toLocaleDateString('en-IN')}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => { updateInstitute(i.id, { expiresAt: new Date(Date.now() + 30 * 86400000).toISOString() }); refresh(); toast.success('Renewed +30 days'); }}>Renew</Button>
                    </div>
                  ))}
                  {institutes.filter(i => i.expiresAt && new Date(i.expiresAt).getTime() - Date.now() < 7 * 86400000 && i.status === 'approved').length === 0 && (
                    <p className="text-xs text-muted-foreground">No subscriptions expiring this week.</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Drill-down dialog */}
      <Dialog open={!!drillInstitute} onOpenChange={(o) => !o && setDrillInstitute(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Building2 size={18} /> {drillInstitute?.instituteName}</DialogTitle>
            <DialogDescription>{drillInstitute?.ownerName} • {drillInstitute?.email} • {drillInstitute?.phone}</DialogDescription>
          </DialogHeader>
          {drillInstitute && (() => {
            const td = tenantData.find(t => t.institute.id === drillInstitute.id);
            if (!td) return null;
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard title="Students" value={td.students.length} icon={Users} variant="primary" />
                  <StatCard title="Collected" value={`₹${td.collected}`} icon={TrendingUp} variant="success" />
                  <StatCard title="Pending" value={`₹${td.pending}`} icon={AlertTriangle} variant="warning" />
                  <StatCard title="Overdue" value={td.overdueStudents} icon={Ban} variant="warning" />
                </div>
                <div className="bg-muted/30 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-2">Student ID</th>
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Course</th>
                        <th className="text-left p-2">Pending</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {td.students.map(s => {
                        const pend = s.feeRecords.filter(f => f.status !== 'paid').reduce((a, f) => a + ((f.amount || 0) + (f.lateFee || 0) - (f.paidAmount || 0)), 0);
                        return (
                          <tr key={s.id} className="border-b border-border/60">
                            <td className="p-2 font-mono">{s.studentId}</td>
                            <td className="p-2">{s.name}</td>
                            <td className="p-2">{s.course}</td>
                            <td className="p-2 text-warning">₹{pend}</td>
                            <td className="p-2"><Badge variant={s.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">{s.status}</Badge></td>
                          </tr>
                        );
                      })}
                      {td.students.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No students yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Credentials dialog */}
      <Dialog open={!!credsInstitute} onOpenChange={(o) => !o && setCredsInstitute(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><KeyRound size={18} /> Admin Credentials</DialogTitle>
            <DialogDescription>Share these with the institute admin to log in.</DialogDescription>
          </DialogHeader>
          {credsInstitute && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Institute</p>
                <p className="font-medium text-foreground">{credsInstitute.instituteName}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Login Email</p>
                <p className="font-mono text-sm text-foreground">{credsInstitute.email}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Password</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-sm text-foreground">{credsInstitute.adminPassword}</p>
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(`Email: ${credsInstitute.email}\nPassword: ${credsInstitute.adminPassword}`); toast.success('Copied'); }}>Copy</Button>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full" onClick={() => { const np = Math.random().toString(36).slice(2, 10); updateInstitute(credsInstitute.id, { adminPassword: np }); setCredsInstitute({ ...credsInstitute, adminPassword: np }); refresh(); toast.success('Password reset'); }}>Reset Password</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
