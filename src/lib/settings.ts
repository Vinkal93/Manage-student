import { fbSaveSettings, fbGetSettings } from './firebaseStore';

const SETTINGS_KEY = 'sbci_settings';

export interface InstituteSettings {
  instituteName: string;
  instituteShortName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  logo?: string;
  courses: string[];
  lateFeeAmount: number;
  feeDueDate: number;
  feeGraceDays: number;
  fcm?: {
    senderId: string;
    serverKey?: string;
    enabled: boolean;
  };
  // Knowledge Panel — institute info for chatbot
  knowledgeBase: KnowledgeEntry[];
  // Welcome message settings
  welcomeRulesLink: string;
  registrationFee: number;
  // Admin notification email
  adminNotificationEmail: string;
  // Institute contact for stopped accounts
  instituteContactNumber: string;
  // Required documents list
  requiredDocuments: string[];
}

export interface KnowledgeEntry {
  id: string;
  topic: string;
  content: string;
}

const defaultSettings: InstituteSettings = {
  instituteName: 'InSuite Manage',
  instituteShortName: 'InSuite',
  tagline: 'Institute Management System',
  phone: '',
  email: '',
  address: '',
  courses: ['ADCA', 'DCA', 'Tally', 'CCC', 'PGDCA', 'Web Design', 'Python', 'Java'],
  lateFeeAmount: 50,
  feeDueDate: 10,
  feeGraceDays: 5,
  fcm: { senderId: '', enabled: false },
  knowledgeBase: [],
  welcomeRulesLink: '',
  registrationFee: 0,
  adminNotificationEmail: 'vinkal93041@gmail.com',
  instituteContactNumber: '',
  requiredDocuments: [
    'Aadhar Card',
    '2 Passport Size Photos',
    'Phone Number',
    'Signature',
    'Email ID',
    '10th Marksheet',
    '12th Marksheet',
  ],
};

export function getSettings(): InstituteSettings {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (data) return { ...defaultSettings, ...JSON.parse(data) };
  return defaultSettings;
}

export function saveSettings(settings: InstituteSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  // Sync to Firebase
  fbSaveSettings(settings).catch(e => console.error('Firebase settings sync error:', e));
}

/**
 * Load settings from Firebase and update localStorage
 */
export async function loadSettingsFromFirebase(): Promise<InstituteSettings> {
  try {
    const data = await fbGetSettings();
    if (data) {
      const merged = { ...defaultSettings, ...data };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
      return merged;
    }
    return getSettings();
  } catch {
    return getSettings();
  }
}