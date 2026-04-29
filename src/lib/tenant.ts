// Multi-tenant SaaS core. Every query MUST be scoped by instituteId.

export type InstituteStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | 'deactivated';
export type PlanType = 'free' | 'basic' | 'advanced' | 'aipro';

export interface Institute {
  id: string;
  instituteName: string;
  ownerName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  instituteType?: string;
  numberOfStudents?: string;
  coursesOffered?: string;
  status: InstituteStatus;
  plan: PlanType;
  adminPassword: string; // generated on approval
  submittedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  suspendedAt?: string;
  expiresAt?: string; // subscription expiry
  monthlyFee?: number;
}

const REG_KEY = 'insuite_registrations';
const CURRENT_INSTITUTE_KEY = 'insuite_current_institute';

export const PLANS: Record<PlanType, { name: string; price: number; limit: number; label: string }> = {
  free: { name: 'Free', price: 0, limit: 15, label: '₹0 / 15 students' },
  basic: { name: 'Basic', price: 99, limit: 50, label: '₹99/mo / 50 students' },
  advanced: { name: 'Advanced', price: 199, limit: 9999, label: '₹199/mo / Unlimited' },
  aipro: { name: 'AI Pro', price: 299, limit: 9999, label: '₹299/mo / Unlimited + AI' },
};

export function getInstitutes(): Institute[] {
  const raw = localStorage.getItem(REG_KEY);
  if (!raw) {
    // seed default demo institute so existing admin@sbci.com works
    const demo: Institute = {
      id: 'demo-institute',
      instituteName: 'SBCI Demo Institute',
      ownerName: 'Demo Owner',
      email: 'admin@sbci.com',
      phone: '9118245636',
      city: 'Demo', state: 'Demo', country: 'India',
      instituteType: 'computer',
      status: 'approved',
      plan: 'advanced',
      adminPassword: 'admin123',
      submittedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
      monthlyFee: 199,
    };
    localStorage.setItem(REG_KEY, JSON.stringify([demo]));
    return [demo];
  }
  const list = JSON.parse(raw) as any[];
  // migration: ensure required fields
  const migrated = list.map(r => ({
    plan: 'free' as PlanType,
    adminPassword: r.adminPassword || generateAdminPassword(),
    monthlyFee: 0,
    ...r,
  }));
  return migrated as Institute[];
}

export function saveInstitutes(list: Institute[]) {
  localStorage.setItem(REG_KEY, JSON.stringify(list));
}

export function getInstitute(id: string): Institute | undefined {
  return getInstitutes().find(i => i.id === id);
}

export function findInstituteByEmail(email: string): Institute | undefined {
  return getInstitutes().find(i => i.email.toLowerCase() === email.toLowerCase());
}

export function updateInstitute(id: string, patch: Partial<Institute>) {
  const list = getInstitutes();
  const idx = list.findIndex(i => i.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...patch };
    saveInstitutes(list);
    return list[idx];
  }
  return null;
}

export function generateAdminPassword(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let p = '';
  for (let i = 0; i < 8; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p;
}

export function approveInstitute(id: string, plan: PlanType = 'free'): Institute | null {
  const inst = getInstitute(id);
  if (!inst) return null;
  const password = inst.adminPassword || generateAdminPassword();
  return updateInstitute(id, {
    status: 'approved',
    plan,
    adminPassword: password,
    approvedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    monthlyFee: PLANS[plan].price,
  });
}

// ----- current tenant context -----
export function setCurrentInstitute(id: string) {
  localStorage.setItem(CURRENT_INSTITUTE_KEY, id);
}
export function getCurrentInstituteId(): string | null {
  return localStorage.getItem(CURRENT_INSTITUTE_KEY);
}
export function clearCurrentInstitute() {
  localStorage.removeItem(CURRENT_INSTITUTE_KEY);
}
export function getCurrentInstitute(): Institute | null {
  const id = getCurrentInstituteId();
  return id ? getInstitute(id) || null : null;
}

// ----- per-tenant key helper -----
export function tenantKey(base: string, instituteId?: string | null): string {
  const id = instituteId || getCurrentInstituteId() || 'demo-institute';
  return `${base}::${id}`;
}
