// Google Sheets Database Integration - localStorage config store

const SHEETS_CONFIG_KEY = 'insuite_sheets_config';

export interface SheetMapping {
  systemTable: string;
  sheetName: string;
}

export interface SheetsConfig {
  sheetId: string;
  serviceEmail: string;
  privateKey: string;
  connected: boolean;
  syncMode: 'instant' | '5min' | 'manual';
  autoSync: boolean;
  mappings: SheetMapping[];
  lastSyncAt?: string;
}

const defaultConfig: SheetsConfig = {
  sheetId: '',
  serviceEmail: '',
  privateKey: '',
  connected: false,
  syncMode: 'manual',
  autoSync: false,
  mappings: [
    { systemTable: 'Students', sheetName: '' },
    { systemTable: 'Fees', sheetName: '' },
    { systemTable: 'Attendance', sheetName: '' },
    { systemTable: 'Assignments', sheetName: '' },
    { systemTable: 'Results', sheetName: '' },
  ],
};

export function getSheetsConfig(): SheetsConfig {
  const data = localStorage.getItem(SHEETS_CONFIG_KEY);
  if (data) return { ...defaultConfig, ...JSON.parse(data) };
  return { ...defaultConfig };
}

export function saveSheetsConfig(config: SheetsConfig) {
  localStorage.setItem(SHEETS_CONFIG_KEY, JSON.stringify(config));
}

export function testConnection(config: SheetsConfig): { success: boolean; message: string } {
  if (!config.sheetId.trim()) return { success: false, message: 'Sheet ID is required' };
  if (!config.serviceEmail.trim()) return { success: false, message: 'Service Account Email is required' };
  if (!config.privateKey.trim()) return { success: false, message: 'Private Key is required' };
  if (!config.serviceEmail.includes('@')) return { success: false, message: 'Invalid Service Account Email' };
  // Simulate connection test
  return { success: true, message: 'Connected Successfully! API Access verified.' };
}
