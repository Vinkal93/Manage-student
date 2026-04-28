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
    serverKey: string;
    enabled: boolean;
    subscribers?: { token: string; userId: string; name?: string; subscribedAt: string }[];
  };
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
  fcm: { senderId: '', serverKey: '', enabled: false },
};

export function getSettings(): InstituteSettings {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (data) return { ...defaultSettings, ...JSON.parse(data) };
  return defaultSettings;
}

export function saveSettings(settings: InstituteSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}