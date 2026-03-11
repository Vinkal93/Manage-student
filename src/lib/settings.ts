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
}

const defaultSettings: InstituteSettings = {
  instituteName: 'SBCI Computer Institute',
  instituteShortName: 'SBCI',
  tagline: 'Institute Management System',
  phone: '',
  email: '',
  address: '',
  courses: ['ADCA', 'DCA', 'Tally', 'CCC', 'PGDCA', 'Web Design', 'Python', 'Java'],
  lateFeeAmount: 50,
  feeDueDate: 10,
  feeGraceDays: 5,
};

export function getSettings(): InstituteSettings {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (data) return { ...defaultSettings, ...JSON.parse(data) };
  return defaultSettings;
}

export function saveSettings(settings: InstituteSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
