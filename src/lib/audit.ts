// Lightweight audit log for Super Admin forced actions
export type AuditAction =
  | 'institute.approve'
  | 'institute.reject'
  | 'institute.suspend'
  | 'institute.reactivate'
  | 'institute.plan_change'
  | 'institute.password_reset'
  | 'institute.renew'
  | 'fee.manual_edit'
  | 'fee.late_rule_override'
  | 'fee.final_warning'
  | 'fee.reminder_sent';

export interface AuditEntry {
  id: string;
  ts: string;
  actor: string; // 'super-admin' or institute admin email
  action: AuditAction;
  targetId?: string;
  targetLabel?: string;
  details?: string;
  instituteId?: string;
}

const KEY = 'insuite_audit_log';

export function getAuditLog(): AuditEntry[] {
  return JSON.parse(localStorage.getItem(KEY) || '[]');
}

export function logAudit(entry: Omit<AuditEntry, 'id' | 'ts'>) {
  const list = getAuditLog();
  list.push({ id: crypto.randomUUID(), ts: new Date().toISOString(), ...entry });
  if (list.length > 1000) list.splice(0, list.length - 1000);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function clearAuditLog() {
  localStorage.removeItem(KEY);
}
