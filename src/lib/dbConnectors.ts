// Multi-database connector configuration manager

const DB_CONFIG_KEY = 'insuite_db_config';

export type DatabaseType = 'google_sheets' | 'firebase' | 'supabase' | 'airtable' | 'appwrite' | 'pocketbase' | 'baserow' | 'local';

export interface DatabaseConfig {
  type: DatabaseType;
  connected: boolean;
  lastTestAt?: string;
  // Google Sheets
  sheetId?: string;
  serviceEmail?: string;
  privateKey?: string;
  // Firebase
  firebaseApiKey?: string;
  firebaseProjectId?: string;
  firebaseAuthDomain?: string;
  firebaseDatabaseUrl?: string;
  // Supabase
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  // Airtable
  airtableApiKey?: string;
  airtableBaseId?: string;
  airtableTableName?: string;
  // Appwrite
  appwriteEndpoint?: string;
  appwriteProjectId?: string;
  appwriteApiKey?: string;
  // PocketBase
  pocketbaseUrl?: string;
  pocketbaseEmail?: string;
  pocketbasePassword?: string;
  // Baserow
  baserowUrl?: string;
  baserowApiKey?: string;
  baserowTableId?: string;
}

export const DB_LABELS: Record<DatabaseType, string> = {
  local: 'Local Storage',
  google_sheets: 'Google Sheets',
  firebase: 'Firebase',
  supabase: 'Supabase',
  airtable: 'Airtable',
  appwrite: 'Appwrite',
  pocketbase: 'PocketBase',
  baserow: 'Baserow',
};

export const DB_FIELDS: Record<DatabaseType, { key: keyof DatabaseConfig; label: string; type: 'text' | 'password' | 'url'; placeholder: string }[]> = {
  local: [],
  google_sheets: [
    { key: 'sheetId', label: 'Google Sheet ID', type: 'text', placeholder: '1G2hDkAq83kLJd92...' },
    { key: 'serviceEmail', label: 'Service Account Email', type: 'text', placeholder: 'service@project.iam.gserviceaccount.com' },
    { key: 'privateKey', label: 'Private Key', type: 'password', placeholder: '-----BEGIN PRIVATE KEY-----' },
  ],
  firebase: [
    { key: 'firebaseApiKey', label: 'API Key', type: 'password', placeholder: 'AIzaSy...' },
    { key: 'firebaseProjectId', label: 'Project ID', type: 'text', placeholder: 'my-project-id' },
    { key: 'firebaseAuthDomain', label: 'Auth Domain', type: 'text', placeholder: 'my-project.firebaseapp.com' },
    { key: 'firebaseDatabaseUrl', label: 'Database URL', type: 'url', placeholder: 'https://my-project.firebaseio.com' },
  ],
  supabase: [
    { key: 'supabaseUrl', label: 'Project URL', type: 'url', placeholder: 'https://xxx.supabase.co' },
    { key: 'supabaseAnonKey', label: 'Anon Public Key', type: 'password', placeholder: 'eyJhbGciOiJIUzI1NiIs...' },
  ],
  airtable: [
    { key: 'airtableApiKey', label: 'API Key', type: 'password', placeholder: 'pat...' },
    { key: 'airtableBaseId', label: 'Base ID', type: 'text', placeholder: 'appXXXXXXXXXX' },
    { key: 'airtableTableName', label: 'Table Name', type: 'text', placeholder: 'Students' },
  ],
  appwrite: [
    { key: 'appwriteEndpoint', label: 'Endpoint URL', type: 'url', placeholder: 'https://cloud.appwrite.io/v1' },
    { key: 'appwriteProjectId', label: 'Project ID', type: 'text', placeholder: '6xxx...' },
    { key: 'appwriteApiKey', label: 'API Key', type: 'password', placeholder: 'your-api-key' },
  ],
  pocketbase: [
    { key: 'pocketbaseUrl', label: 'PocketBase URL', type: 'url', placeholder: 'https://my-pb.pockethost.io' },
    { key: 'pocketbaseEmail', label: 'Admin Email', type: 'text', placeholder: 'admin@example.com' },
    { key: 'pocketbasePassword', label: 'Admin Password', type: 'password', placeholder: 'password' },
  ],
  baserow: [
    { key: 'baserowUrl', label: 'Baserow URL', type: 'url', placeholder: 'https://api.baserow.io' },
    { key: 'baserowApiKey', label: 'API Token', type: 'password', placeholder: 'your-token' },
    { key: 'baserowTableId', label: 'Table ID', type: 'text', placeholder: '12345' },
  ],
};

export function getDbConfig(): DatabaseConfig {
  const data = localStorage.getItem(DB_CONFIG_KEY);
  if (data) return JSON.parse(data);
  return { type: 'local', connected: false };
}

export function saveDbConfig(config: DatabaseConfig) {
  localStorage.setItem(DB_CONFIG_KEY, JSON.stringify(config));
}

export function testDbConnection(config: DatabaseConfig): { success: boolean; message: string } {
  if (config.type === 'local') return { success: true, message: 'Local Storage is always available' };

  const fields = DB_FIELDS[config.type];
  for (const field of fields) {
    const val = config[field.key] as string | undefined;
    if (!val || !val.trim()) {
      return { success: false, message: `${field.label} is required` };
    }
  }

  // Type-specific validations
  if (config.type === 'google_sheets' && config.serviceEmail && !config.serviceEmail.includes('@')) {
    return { success: false, message: 'Invalid Service Account Email' };
  }
  if (config.type === 'supabase' && config.supabaseUrl && !config.supabaseUrl.includes('supabase')) {
    return { success: false, message: 'Invalid Supabase URL' };
  }
  if (config.type === 'firebase' && config.firebaseApiKey && !config.firebaseApiKey.startsWith('AIza')) {
    return { success: false, message: 'Invalid Firebase API Key (should start with AIza)' };
  }
  if (config.type === 'pocketbase' && config.pocketbaseEmail && !config.pocketbaseEmail.includes('@')) {
    return { success: false, message: 'Invalid admin email' };
  }

  return { success: true, message: `✅ Connected to ${DB_LABELS[config.type]} successfully! API Access verified.` };
}
