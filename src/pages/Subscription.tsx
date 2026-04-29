import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import StatCard from '@/components/StatCard';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, IndianRupee, RefreshCw, CheckCircle, Crown, AlertTriangle } from 'lucide-react';
import { getCurrentInstitute, updateInstitute, PLANS, type PlanType } from '@/lib/tenant';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';

export default function Subscription() {
  const [refresh, setRefresh] = useState(0);
  const inst = useMemo(() => getCurrentInstitute(), [refresh]);
  if (!inst) return <Navigate to="/login" replace />;

  const plan = PLANS[inst.plan];
  const expiresAt = inst.expiresAt ? new Date(inst.expiresAt) : null;
  const daysLeft = expiresAt ? Math.ceil((expiresAt.getTime() - Date.now()) / 86400000) : 0;
  const expired = daysLeft <= 0;
  const expiringSoon = daysLeft > 0 && daysLeft <= 7;
  const mrr = inst.monthlyFee || plan.price;

  const renew = (months = 1) => {
    const baseTime = expiresAt && expiresAt.getTime() > Date.now() ? expiresAt.getTime() : Date.now();
    const newExpiry = new Date(baseTime + months * 30 * 86400000).toISOString();
    updateInstitute(inst.id, { expiresAt: newExpiry, status: 'approved' });
    logAudit({
      actor: getCurrentUser()?.email || 'admin',
      action: 'fee.manual_edit',
      targetId: inst.id,
      targetLabel: inst.instituteName,
      details: `Renewed subscription +${months} month(s) → ${new Date(newExpiry).toLocaleDateString('en-IN')}`,
      instituteId: inst.id,
    });
    toast.success(`Subscription renewed for ${months} month(s)`);
    setRefresh(k => k + 1);
  };

  const upgrade = (newPlan: PlanType) => {
    if (newPlan === inst.plan) return;
    updateInstitute(inst.id, { plan: newPlan, monthlyFee: PLANS[newPlan].price });
    logAudit({
      actor: getCurrentUser()?.email || 'admin',
      action: 'institute.plan_change',
      targetId: inst.id,
      targetLabel: inst.instituteName,
      details: `Plan upgraded to ${PLANS[newPlan].name} (₹${PLANS[newPlan].price}/mo)`,
      instituteId: inst.id,
    });
    toast.success(`Plan changed to ${PLANS[newPlan].name}`);
    setRefresh(k => k + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CreditCard size={22} /> Subscription
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{inst.instituteName} • Manage your plan, billing & renewal</p>
      </div>

      {expired && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/40 text-destructive">
          <AlertTriangle size={18} />
          <div className="flex-1 text-sm">
            Your subscription has <strong>expired</strong>. Renew now to keep all features active.
          </div>
          <Button size="sm" variant="destructive" onClick={() => renew(1)} className="gap-1.5"><RefreshCw size={14}/> Renew Now</Button>
        </div>
      )}
      {expiringSoon && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/40">
          <AlertTriangle size={18} className="text-warning" />
          <div className="flex-1 text-sm text-foreground">
            Your subscription expires in <strong>{daysLeft} day(s)</strong>. Renew to avoid disruption.
          </div>
          <Button size="sm" onClick={() => renew(1)} className="gap-1.5"><RefreshCw size={14}/> Renew</Button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Current Plan" value={plan.name} icon={Crown} variant="primary" />
        <StatCard title="MRR" value={`₹${mrr}`} icon={IndianRupee} variant="success" />
        <StatCard title="Expires On" value={expiresAt ? expiresAt.toLocaleDateString('en-IN') : '—'} icon={Calendar} variant="accent" />
        <StatCard title="Days Left" value={Math.max(0, daysLeft)} icon={RefreshCw} variant={expired ? 'warning' : expiringSoon ? 'warning' : 'success'} />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-semibold text-foreground">Active Subscription</h3>
              <p className="text-xs text-muted-foreground">Status: <Badge variant={inst.status === 'approved' ? 'default' : 'destructive'} className="ml-1 text-[10px] capitalize">{inst.status}</Badge></p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => renew(1)} className="gap-1.5"><RefreshCw size={14}/> Renew 1 Month (₹{mrr})</Button>
              <Button size="sm" variant="outline" onClick={() => renew(12)} className="gap-1.5"><RefreshCw size={14}/> Renew 1 Year (₹{mrr * 12})</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className="p-3 bg-muted/40 rounded-lg">
              <p className="text-xs text-muted-foreground">Owner</p>
              <p className="font-medium text-foreground">{inst.ownerName}</p>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{inst.email}</p>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg">
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-medium text-foreground">{inst.phone}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <div>
        <h3 className="font-semibold text-foreground mb-3">Available Plans</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(PLANS) as PlanType[]).map(p => {
            const pl = PLANS[p];
            const current = p === inst.plan;
            return (
              <Card key={p} className={`p-5 space-y-3 ${current ? 'border-primary ring-2 ring-primary/30' : ''}`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">{pl.name}</h4>
                  {current && <Badge className="text-[10px]"><CheckCircle size={10} className="mr-1"/>Current</Badge>}
                </div>
                <p className="text-2xl font-bold text-foreground">₹{pl.price}<span className="text-xs text-muted-foreground font-normal">/mo</span></p>
                <p className="text-xs text-muted-foreground">{pl.label}</p>
                <Button size="sm" variant={current ? 'outline' : 'default'} disabled={current} className="w-full" onClick={() => upgrade(p)}>
                  {current ? 'Current Plan' : `Switch to ${pl.name}`}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
