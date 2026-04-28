// Feature toggles + dynamic content (links, study material, QR, YouTube) — localStorage + Firebase backed
import { fbSaveFeatures, fbGetFeatures } from './firebaseStore';

export interface DynamicLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  visible: boolean;
}

export interface StudyMaterial {
  id: string;
  title: string;
  url: string;
  description?: string;
  visible: boolean;
}

export interface FeatureConfig {
  toggles: {
    chatbot: boolean;
    studyMaterial: boolean;
    importantLinks: boolean;
    youtube: boolean;
    downloadApp: boolean;
    qrPayment: boolean;
    onlinePayment: boolean;
    notifications: boolean;
    pwaInstall: boolean;
  };
  importantLinks: DynamicLink[];
  studyMaterial: StudyMaterial[];
  youtubeUrl: string;
  appDownloadUrl: string;
  qrImage: string;          // base64 data URL
  upiId: string;
  perDayLateFee: number;    // ₹ per day after grace
  faqs: { q: string; a: string }[];
}

const KEY = 'insuite_features_v1';

const DEFAULT: FeatureConfig = {
  toggles: {
    chatbot: true,
    studyMaterial: true,
    importantLinks: true,
    youtube: true,
    downloadApp: true,
    qrPayment: true,
    onlinePayment: true,
    notifications: true,
    pwaInstall: true,
  },
  importantLinks: [
    { id: '1', title: 'Institute Website', url: 'https://schoolfms.lovable.app', visible: true },
    { id: '2', title: 'Result Portal', url: '#', visible: true },
  ],
  studyMaterial: [
    { id: '1', title: 'Tally Notes PDF', url: '#', description: 'Complete Tally Prime notes', visible: true },
    { id: '2', title: 'CCC Practice Set', url: '#', description: 'NIELIT CCC mock test', visible: true },
  ],
  youtubeUrl: 'https://youtube.com',
  appDownloadUrl: '',
  qrImage: '',
  upiId: '',
  perDayLateFee: 10,
  faqs: [
    { q: 'fee', a: 'आप अपनी फीस "Fees" tab में देख सकते हैं। हर महीने 10 तारीख तक जमा करनी होती है।' },
    { q: 'late', a: 'देर से फीस जमा करने पर लेट फीस लगती है। Settings में देखें।' },
    { q: 'attendance', a: 'अपनी अटेंडेंस "Attendance" tab में देखें। 75% से ऊपर रखें।' },
    { q: 'assignment', a: 'सभी assignments "Assignments" tab में मिलेंगे। Deadline से पहले submit करें।' },
    { q: 'password', a: 'Default password sbci123 है। Admin से contact करें change करवाने के लिए।' },
    { q: 'certificate', a: 'Course पूरा होने पर certificate मिलता है। 75%+ attendance जरूरी है।' },
    { q: 'pay', a: 'आप QR code scan करके online pay कर सकते हैं या cash में institute में जमा करें।' },
    { q: 'contact', a: 'किसी भी समस्या के लिए institute से contact करें या Admin को message भेजें।' },
  ],
};

export function getFeatures(): FeatureConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT,
      ...parsed,
      toggles: { ...DEFAULT.toggles, ...(parsed.toggles || {}) },
    };
  } catch {
    return DEFAULT;
  }
}

/**
 * Save features to localStorage AND Firebase
 */
export function saveFeatures(cfg: FeatureConfig) {
  localStorage.setItem(KEY, JSON.stringify(cfg));
  window.dispatchEvent(new Event('features:updated'));
  // Sync to Firebase (fire and forget)
  fbSaveFeatures(cfg).catch(e => console.error('Firebase features save error:', e));
}

/**
 * Load features from Firebase and update localStorage
 */
export async function loadFeaturesFromFirebase(): Promise<FeatureConfig> {
  try {
    const data = await fbGetFeatures();
    if (data) {
      const cfg = {
        ...DEFAULT,
        ...data,
        toggles: { ...DEFAULT.toggles, ...(data.toggles || {}) },
      };
      localStorage.setItem(KEY, JSON.stringify(cfg));
      return cfg;
    }
    return getFeatures();
  } catch {
    return getFeatures();
  }
}

// FAQ matcher used by AI Chatbot
export function matchFaq(query: string): string | null {
  const cfg = getFeatures();
  const q = query.toLowerCase();
  let best: { score: number; ans: string } | null = null;
  for (const f of cfg.faqs) {
    const keys = f.q.toLowerCase().split(/\s+/);
    let score = 0;
    for (const k of keys) if (k && q.includes(k)) score++;
    if (score > 0 && (!best || score > best.score)) best = { score, ans: f.a };
  }
  return best?.ans || null;
}

// Late fee logic
export function calcLateFee(dueDateStr: string, isPaid: boolean, paidDate?: string): number {
  if (isPaid) return 0;
  const cfg = getFeatures();
  const due = new Date(dueDateStr);
  const ref = paidDate ? new Date(paidDate) : new Date();
  const diffDays = Math.floor((ref.getTime() - due.getTime()) / 86400000);
  if (diffDays <= 0) return 0;
  return diffDays * (cfg.perDayLateFee || 10);
}
