const LANG_KEY = 'insuite_lang';

export type Lang = 'en' | 'hi';

const translations: Record<string, Record<Lang, string>> = {
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },
  students: { en: 'Students', hi: 'छात्र' },
  fees: { en: 'Fees', hi: 'शुल्क' },
  attendance: { en: 'Attendance', hi: 'उपस्थिति' },
  messages: { en: 'Messages', hi: 'संदेश' },
  reports: { en: 'Reports', hi: 'रिपोर्ट' },
  analytics: { en: 'Analytics', hi: 'विश्लेषण' },
  settings: { en: 'Settings', hi: 'सेटिंग्स' },
  logout: { en: 'Logout', hi: 'लॉग आउट' },
  welcome: { en: 'Welcome', hi: 'स्वागत है' },
  total_students: { en: 'Total Students', hi: 'कुल छात्र' },
  active_students: { en: 'Active Students', hi: 'सक्रिय छात्र' },
  fee_collected: { en: 'Fee Collected', hi: 'शुल्क एकत्रित' },
  pending_fees: { en: 'Pending Fees', hi: 'बकाया शुल्क' },
  new_admission: { en: 'New Admission', hi: 'नया प्रवेश' },
  today_present: { en: 'Today Present', hi: 'आज उपस्थित' },
  timetable: { en: 'Timetable', hi: 'समय सारणी' },
  assignments: { en: 'Assignments', hi: 'असाइनमेंट' },
  backup: { en: 'Backup & Restore', hi: 'बैकअप और पुनर्स्थापना' },
  profile: { en: 'Profile', hi: 'प्रोफ़ाइल' },
  search: { en: 'Search', hi: 'खोजें' },
  save: { en: 'Save', hi: 'सहेजें' },
  cancel: { en: 'Cancel', hi: 'रद्द करें' },
  submit: { en: 'Submit', hi: 'जमा करें' },
  delete: { en: 'Delete', hi: 'हटाएं' },
  edit: { en: 'Edit', hi: 'संपादित करें' },
  add: { en: 'Add', hi: 'जोड़ें' },
  download: { en: 'Download', hi: 'डाउनलोड' },
  upload: { en: 'Upload', hi: 'अपलोड' },
  status: { en: 'Status', hi: 'स्थिति' },
  actions: { en: 'Actions', hi: 'कार्रवाई' },
  course: { en: 'Course', hi: 'पाठ्यक्रम' },
  name: { en: 'Name', hi: 'नाम' },
  paid: { en: 'Paid', hi: 'भुगतान किया' },
  pending: { en: 'Pending', hi: 'लंबित' },
  overdue: { en: 'Overdue', hi: 'अतिदेय' },
  parent_portal: { en: 'Parent Portal', hi: 'अभिभावक पोर्टल' },
};

export function getLang(): Lang {
  return (localStorage.getItem(LANG_KEY) as Lang) || 'en';
}

export function setLang(lang: Lang) {
  localStorage.setItem(LANG_KEY, lang);
}

export function t(key: string): string {
  const lang = getLang();
  return translations[key]?.[lang] || translations[key]?.en || key;
}
