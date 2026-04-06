import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Globe, Menu, X, ChevronRight, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Lang = 'en' | 'hi' | 'hinglish';

const guides: Record<string, Record<Lang, { title: string; intro: string; sections: { id: string; title: string; content: string; code?: string }[] }>> = {
  firebase: {
    en: {
      title: 'How to Connect Firebase',
      intro: 'Complete step-by-step guide to connect your Firebase project as a database backend.',
      sections: [
        { id: 'create-account', title: 'Step 1: Create Firebase Account', content: 'Go to https://console.firebase.google.com and sign in with your Google account. If you don\'t have one, create a free Google account first.\n\n1. Visit Firebase Console\n2. Click "Add project"\n3. Enter your project name\n4. Disable Google Analytics (optional)\n5. Click "Create project"' },
        { id: 'create-project', title: 'Step 2: Create Firebase Project', content: 'After signing in, click on "Add Project". Give your project a meaningful name like "my-institute-db". You can disable analytics for now. Wait for the project to be created.\n\n📸 Screenshot: Firebase Console → Add Project button (top area)' },
        { id: 'get-keys', title: 'Step 3: Get API Keys', content: 'Once your project is created:\n\n1. Click the ⚙️ gear icon → Project Settings\n2. Scroll down to "Your apps" section\n3. Click the Web icon (</>) to add a web app\n4. Register your app with a nickname\n5. Copy the firebaseConfig object\n\nYou need these values:\n- API Key\n- Project ID\n- Auth Domain\n- Database URL', code: 'const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "your-project.firebaseapp.com",\n  projectId: "your-project-id",\n  databaseURL: "https://your-project.firebaseio.com"\n};' },
        { id: 'paste-keys', title: 'Step 4: Paste Keys in App', content: 'Go to Admin Panel → Database Settings page.\n\n1. Select "Firebase" from the database mode selector\n2. Paste each value in the corresponding field:\n   - API Key → API Key field\n   - Project ID → Project ID field\n   - Auth Domain → Auth Domain field\n   - Database URL → Database URL field\n3. Click "Save Config"' },
        { id: 'test-connection', title: 'Step 5: Test Connection', content: 'After pasting all keys:\n\n1. Click "Test Connection" button\n2. Wait for the test to complete\n3. If successful, you\'ll see ✅ Connected Successfully\n4. If failed, double-check your API keys\n\nCommon errors:\n- Invalid API Key: Copy the key again from Firebase Console\n- Permission denied: Check Firestore rules\n- Network error: Check your internet connection' },
      ],
    },
    hi: {
      title: 'Firebase कैसे Connect करें',
      intro: 'Firebase प्रोजेक्ट को डेटाबेस बैकएंड के रूप में कनेक्ट करने की पूरी स्टेप-बाय-स्टेप गाइड।',
      sections: [
        { id: 'create-account', title: 'स्टेप 1: Firebase अकाउंट बनाएं', content: 'https://console.firebase.google.com पर जाएं और अपने Google अकाउंट से साइन इन करें। अगर आपके पास नहीं है, तो पहले एक फ्री Google अकाउंट बनाएं।\n\n1. Firebase Console पर जाएं\n2. "Add project" पर क्लिक करें\n3. अपना प्रोजेक्ट नाम डालें\n4. Google Analytics बंद करें (वैकल्पिक)\n5. "Create project" पर क्लिक करें' },
        { id: 'create-project', title: 'स्टेप 2: Firebase प्रोजेक्ट बनाएं', content: 'साइन इन करने के बाद, "Add Project" पर क्लिक करें। अपने प्रोजेक्ट को एक अच्छा नाम दें जैसे "my-institute-db"। आप अभी के लिए एनालिटिक्स बंद कर सकते हैं।\n\n📸 स्क्रीनशॉट: Firebase Console → Add Project बटन' },
        { id: 'get-keys', title: 'स्टेप 3: API Keys प्राप्त करें', content: 'प्रोजेक्ट बनने के बाद:\n\n1. ⚙️ गियर आइकन → Project Settings पर क्लिक करें\n2. "Your apps" सेक्शन तक स्क्रॉल करें\n3. वेब आइकन (</>) पर क्लिक करें\n4. अपने ऐप को एक नाम दें\n5. firebaseConfig ऑब्जेक्ट कॉपी करें\n\nआपको ये वैल्यूज चाहिए:\n- API Key\n- Project ID\n- Auth Domain\n- Database URL', code: 'const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "your-project.firebaseapp.com",\n  projectId: "your-project-id",\n  databaseURL: "https://your-project.firebaseio.com"\n};' },
        { id: 'paste-keys', title: 'स्टेप 4: Keys ऐप में पेस्ट करें', content: 'Admin Panel → Database Settings पेज पर जाएं।\n\n1. Database mode selector से "Firebase" चुनें\n2. हर वैल्यू उसके field में पेस्ट करें\n3. "Save Config" पर क्लिक करें' },
        { id: 'test-connection', title: 'स्टेप 5: Connection टेस्ट करें', content: 'सभी keys पेस्ट करने के बाद:\n\n1. "Test Connection" बटन पर क्लिक करें\n2. टेस्ट पूरा होने तक इंतज़ार करें\n3. सफल होने पर ✅ Connected Successfully दिखेगा\n4. असफल होने पर API keys दोबारा चेक करें' },
      ],
    },
    hinglish: {
      title: 'Firebase Kaise Connect Kare',
      intro: 'Firebase project ko database backend ke roop me connect karne ki complete step-by-step guide.',
      sections: [
        { id: 'create-account', title: 'Step 1: Firebase Account Banao', content: 'https://console.firebase.google.com pe jao aur apne Google account se sign in karo. Agar nahi hai to pehle ek free Google account banao.\n\n1. Firebase Console pe jao\n2. "Add project" pe click karo\n3. Apna project name dalo\n4. Google Analytics band karo (optional)\n5. "Create project" pe click karo' },
        { id: 'create-project', title: 'Step 2: Firebase Project Banao', content: 'Sign in karne ke baad, "Add Project" pe click karo. Project ko ek accha naam do jaise "my-institute-db". Analytics abhi ke liye band kar sakte ho.\n\n📸 Screenshot: Firebase Console → Add Project button' },
        { id: 'get-keys', title: 'Step 3: API Keys Lo', content: 'Project banne ke baad:\n\n1. ⚙️ gear icon → Project Settings pe click karo\n2. "Your apps" section tak scroll karo\n3. Web icon (</>) pe click karo\n4. App ko ek naam do\n5. firebaseConfig object copy karo\n\nYe values chahiye:\n- API Key\n- Project ID\n- Auth Domain\n- Database URL', code: 'const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "your-project.firebaseapp.com",\n  projectId: "your-project-id",\n  databaseURL: "https://your-project.firebaseio.com"\n};' },
        { id: 'paste-keys', title: 'Step 4: Keys App Me Paste Karo', content: 'Admin Panel → Database Settings page pe jao.\n\n1. Database mode selector se "Firebase" chuno\n2. Har value uske field me paste karo\n3. "Save Config" pe click karo' },
        { id: 'test-connection', title: 'Step 5: Connection Test Karo', content: 'Sab keys paste karne ke baad:\n\n1. "Test Connection" button pe click karo\n2. Test complete hone tak wait karo\n3. Success pe ✅ Connected Successfully dikhega\n4. Fail hone pe API keys dobara check karo' },
      ],
    },
  },
  supabase: {
    en: {
      title: 'How to Connect Supabase',
      intro: 'Step-by-step guide to connect your Supabase project for a powerful PostgreSQL backend.',
      sections: [
        { id: 'create-account', title: 'Step 1: Create Supabase Account', content: 'Go to https://supabase.com and click "Start your project". Sign up with GitHub or email.\n\n1. Visit supabase.com\n2. Click "Start your project"\n3. Sign in with GitHub (recommended)\n4. Verify your email if needed' },
        { id: 'create-project', title: 'Step 2: Create New Project', content: 'After signing in:\n\n1. Click "New Project"\n2. Choose your organization\n3. Enter project name: e.g. "institute-management"\n4. Set a strong database password (save it!)\n5. Select nearest region\n6. Click "Create new project"\n7. Wait 2-3 minutes for setup' },
        { id: 'get-keys', title: 'Step 3: Get Project URL & Keys', content: 'Once project is ready:\n\n1. Go to Settings → API\n2. Copy "Project URL"\n3. Copy "anon public" key from Project API keys\n\nThese are safe to use in frontend.', code: 'Project URL: https://xyzcompany.supabase.co\nAnon Key: eyJhbGciOiJIUzI1NiIs...' },
        { id: 'paste-keys', title: 'Step 4: Paste Keys in App', content: 'Go to Admin Panel → Database Settings:\n\n1. Select "Supabase" from database selector\n2. Paste Project URL in the URL field\n3. Paste Anon Key in the Key field\n4. Click "Save Config"' },
        { id: 'test-connection', title: 'Step 5: Test Connection', content: 'Click "Test Connection" to verify:\n\n✅ Connected Successfully = You\'re all set!\n❌ Invalid URL = Check the Project URL\n❌ Invalid Key = Recopy the anon key from Supabase dashboard' },
      ],
    },
    hi: {
      title: 'Supabase कैसे Connect करें',
      intro: 'एक powerful PostgreSQL backend के लिए Supabase प्रोजेक्ट कनेक्ट करने की स्टेप-बाय-स्टेप गाइड।',
      sections: [
        { id: 'create-account', title: 'स्टेप 1: Supabase अकाउंट बनाएं', content: 'https://supabase.com पर जाएं और "Start your project" पर क्लिक करें।\n\n1. supabase.com पर जाएं\n2. GitHub या email से साइन अप करें\n3. Email verify करें' },
        { id: 'create-project', title: 'स्टेप 2: नया प्रोजेक्ट बनाएं', content: 'साइन इन के बाद:\n\n1. "New Project" पर क्लिक करें\n2. Organization चुनें\n3. Project name डालें\n4. Strong password सेट करें\n5. Nearest region चुनें\n6. "Create new project" पर क्लिक करें' },
        { id: 'get-keys', title: 'स्टेप 3: Project URL और Keys लें', content: 'प्रोजेक्ट ready होने पर:\n\n1. Settings → API पर जाएं\n2. "Project URL" कॉपी करें\n3. "anon public" key कॉपी करें', code: 'Project URL: https://xyzcompany.supabase.co\nAnon Key: eyJhbGciOiJIUzI1NiIs...' },
        { id: 'paste-keys', title: 'स्टेप 4: Keys ऐप में पेस्ट करें', content: 'Admin Panel → Database Settings पर जाएं:\n\n1. "Supabase" चुनें\n2. Project URL पेस्ट करें\n3. Anon Key पेस्ट करें\n4. "Save Config" पर क्लिक करें' },
        { id: 'test-connection', title: 'स्टेप 5: Connection टेस्ट करें', content: '"Test Connection" पर क्लिक करें:\n\n✅ Connected Successfully = सब सेट है!\n❌ Invalid URL = Project URL चेक करें\n❌ Invalid Key = Anon key दोबारा कॉपी करें' },
      ],
    },
    hinglish: {
      title: 'Supabase Kaise Connect Kare',
      intro: 'Ek powerful PostgreSQL backend ke liye Supabase project connect karne ki guide.',
      sections: [
        { id: 'create-account', title: 'Step 1: Supabase Account Banao', content: 'https://supabase.com pe jao aur "Start your project" pe click karo.\n\n1. supabase.com pe jao\n2. GitHub ya email se sign up karo\n3. Email verify karo' },
        { id: 'create-project', title: 'Step 2: Naya Project Banao', content: 'Sign in ke baad:\n\n1. "New Project" pe click karo\n2. Organization chuno\n3. Project name dalo\n4. Strong password set karo\n5. Nearest region chuno\n6. "Create new project" pe click karo' },
        { id: 'get-keys', title: 'Step 3: Project URL aur Keys Lo', content: 'Project ready hone pe:\n\n1. Settings → API pe jao\n2. "Project URL" copy karo\n3. "anon public" key copy karo', code: 'Project URL: https://xyzcompany.supabase.co\nAnon Key: eyJhbGciOiJIUzI1NiIs...' },
        { id: 'paste-keys', title: 'Step 4: Keys App Me Paste Karo', content: 'Admin Panel → Database Settings pe jao:\n\n1. "Supabase" chuno\n2. Project URL paste karo\n3. Anon Key paste karo\n4. "Save Config" pe click karo' },
        { id: 'test-connection', title: 'Step 5: Connection Test Karo', content: '"Test Connection" pe click karo:\n\n✅ Connected Successfully = Sab set hai!\n❌ Invalid URL = Project URL check karo\n❌ Invalid Key = Anon key dobara copy karo' },
      ],
    },
  },
  airtable: {
    en: {
      title: 'How to Connect Airtable',
      intro: 'Connect your Airtable base to use as a spreadsheet-like database.',
      sections: [
        { id: 'create-account', title: 'Step 1: Create Airtable Account', content: 'Go to https://airtable.com and sign up for a free account.\n\n1. Visit airtable.com\n2. Click "Sign up for free"\n3. Use email or Google to sign up' },
        { id: 'create-project', title: 'Step 2: Create a Base', content: 'After signing in:\n\n1. Click "Add a base" or "Start from scratch"\n2. Name it "Institute Database"\n3. Create tables: Students, Fees, Attendance\n4. Add relevant columns to each table' },
        { id: 'get-keys', title: 'Step 3: Get API Key & Base ID', content: 'To get your credentials:\n\n1. Go to https://airtable.com/create/tokens\n2. Click "Create new token"\n3. Give it a name and select scopes\n4. Copy the token\n5. Base ID is in the URL: airtable.com/BASE_ID/...', code: 'API Token: pat1234567890abcdef\nBase ID: appXXXXXXXXXXXXXX\nTable Name: Students' },
        { id: 'paste-keys', title: 'Step 4: Paste Keys in App', content: 'Go to Database Settings:\n\n1. Select "Airtable"\n2. Paste API Key\n3. Paste Base ID\n4. Enter Table Name\n5. Save Config' },
        { id: 'test-connection', title: 'Step 5: Test Connection', content: 'Click "Test Connection" to verify everything works.\n\n✅ Success = Ready to sync\n❌ Failed = Check API token permissions' },
      ],
    },
    hi: {
      title: 'Airtable कैसे Connect करें',
      intro: 'Airtable base को spreadsheet-like database के रूप में कनेक्ट करें।',
      sections: [
        { id: 'create-account', title: 'स्टेप 1: Airtable अकाउंट बनाएं', content: 'https://airtable.com पर जाएं और फ्री अकाउंट बनाएं।' },
        { id: 'create-project', title: 'स्टेप 2: Base बनाएं', content: '"Add a base" पर क्लिक करें और "Institute Database" नाम दें। Students, Fees, Attendance टेबल बनाएं।' },
        { id: 'get-keys', title: 'स्टेप 3: API Key और Base ID लें', content: 'https://airtable.com/create/tokens पर जाएं, नया token बनाएं और Base ID URL से कॉपी करें।', code: 'API Token: pat1234567890abcdef\nBase ID: appXXXXXXXXXXXXXX' },
        { id: 'paste-keys', title: 'स्टेप 4: Keys पेस्ट करें', content: 'Database Settings में Airtable चुनें, API Key और Base ID पेस्ट करें।' },
        { id: 'test-connection', title: 'स्टेप 5: Connection टेस्ट करें', content: '"Test Connection" पर क्लिक करके verify करें।' },
      ],
    },
    hinglish: {
      title: 'Airtable Kaise Connect Kare',
      intro: 'Airtable base ko spreadsheet-like database ke roop me connect karo.',
      sections: [
        { id: 'create-account', title: 'Step 1: Airtable Account Banao', content: 'https://airtable.com pe jao aur free account banao.' },
        { id: 'create-project', title: 'Step 2: Base Banao', content: '"Add a base" pe click karo aur "Institute Database" naam do.' },
        { id: 'get-keys', title: 'Step 3: API Key aur Base ID Lo', content: 'https://airtable.com/create/tokens pe jao, naya token banao.', code: 'API Token: pat1234567890abcdef\nBase ID: appXXXXXXXXXXXXXX' },
        { id: 'paste-keys', title: 'Step 4: Keys Paste Karo', content: 'Database Settings me Airtable chuno, API Key aur Base ID paste karo.' },
        { id: 'test-connection', title: 'Step 5: Connection Test Karo', content: '"Test Connection" pe click karke verify karo.' },
      ],
    },
  },
  google_sheets: {
    en: {
      title: 'How to Connect Google Sheets',
      intro: 'Use Google Sheets as a free, easy-to-use database for your institute.',
      sections: [
        { id: 'create-account', title: 'Step 1: Create Google Sheet', content: 'Go to https://sheets.google.com and create a new spreadsheet.\n\n1. Name it "Institute Database"\n2. Create tabs: Students, Fees, Attendance, Assignments, Results\n3. Add column headers in each tab' },
        { id: 'create-project', title: 'Step 2: Enable Google Sheets API', content: '1. Go to https://console.cloud.google.com\n2. Create a new project\n3. Enable Google Sheets API\n4. Enable Google Drive API\n5. Create Service Account\n6. Download JSON Key File' },
        { id: 'get-keys', title: 'Step 3: Share Sheet with Service Account', content: 'Share your Google Sheet with the service account email.\n\nExample: service-account@project-id.iam.gserviceaccount.com\n\nGive "Editor" permission.', code: 'Sheet ID: 1G2hDkAq83kLJd92...\nService Email: sheet-access@project-id.iam.gserviceaccount.com\nPrivate Key: -----BEGIN PRIVATE KEY-----\\nxxxxx\\n-----END PRIVATE KEY-----' },
        { id: 'paste-keys', title: 'Step 4: Connect in App', content: 'Go to Database Settings:\n\n1. Select "Google Sheets"\n2. Paste Sheet ID\n3. Paste Service Account Email\n4. Paste Private Key\n5. Click "Connect Sheet"' },
        { id: 'test-connection', title: 'Step 5: Test & Map Tables', content: 'Test the connection, then map your system tables to sheet tabs:\n\nStudents → Students Sheet\nFees → Fees Sheet\nAttendance → Attendance Sheet' },
      ],
    },
    hi: {
      title: 'Google Sheets कैसे Connect करें',
      intro: 'Google Sheets को अपने institute के लिए free database के रूप में use करें।',
      sections: [
        { id: 'create-account', title: 'स्टेप 1: Google Sheet बनाएं', content: 'https://sheets.google.com पर जाएं और नई spreadsheet बनाएं। Students, Fees, Attendance tabs बनाएं।' },
        { id: 'create-project', title: 'स्टेप 2: Google Sheets API Enable करें', content: 'Google Cloud Console पर जाएं, project बनाएं, Sheets API और Drive API enable करें।' },
        { id: 'get-keys', title: 'स्टेप 3: Sheet Share करें', content: 'Sheet को service account email के साथ share करें। Editor permission दें।', code: 'Sheet ID: 1G2hDkAq83kLJd92...\nService Email: sheet-access@project-id.iam.gserviceaccount.com' },
        { id: 'paste-keys', title: 'स्टेप 4: ऐप में Connect करें', content: 'Database Settings में Google Sheets चुनें, Sheet ID और credentials पेस्ट करें।' },
        { id: 'test-connection', title: 'स्टेप 5: Test और Map करें', content: 'Connection test करें, फिर tables को sheet tabs से map करें।' },
      ],
    },
    hinglish: {
      title: 'Google Sheets Kaise Connect Kare',
      intro: 'Google Sheets ko apne institute ke liye free database ke roop me use karo.',
      sections: [
        { id: 'create-account', title: 'Step 1: Google Sheet Banao', content: 'https://sheets.google.com pe jao aur nayi spreadsheet banao.' },
        { id: 'create-project', title: 'Step 2: Google Sheets API Enable Karo', content: 'Google Cloud Console pe jao, project banao, APIs enable karo.' },
        { id: 'get-keys', title: 'Step 3: Sheet Share Karo', content: 'Sheet ko service account email ke saath share karo.', code: 'Sheet ID: 1G2hDkAq83kLJd92...' },
        { id: 'paste-keys', title: 'Step 4: App Me Connect Karo', content: 'Database Settings me Google Sheets chuno aur credentials paste karo.' },
        { id: 'test-connection', title: 'Step 5: Test aur Map Karo', content: 'Connection test karo, phir tables ko sheet tabs se map karo.' },
      ],
    },
  },
  appwrite: {
    en: {
      title: 'How to Connect Appwrite',
      intro: 'Connect Appwrite as your open-source backend-as-a-service.',
      sections: [
        { id: 'create-account', title: 'Step 1: Create Appwrite Account', content: 'Go to https://cloud.appwrite.io and create a free account.' },
        { id: 'create-project', title: 'Step 2: Create Project', content: 'Click "Create Project", name it, and set up a database with collections for Students, Fees, etc.' },
        { id: 'get-keys', title: 'Step 3: Get Endpoint & Project ID', content: 'Go to Settings to find your Endpoint URL, Project ID, and create an API Key.', code: 'Endpoint: https://cloud.appwrite.io/v1\nProject ID: 64xxxxxxxxxxxx\nAPI Key: xxxxxxxxxxxxxxxx' },
        { id: 'paste-keys', title: 'Step 4: Paste in App', content: 'Select Appwrite in Database Settings and paste your Endpoint, Project ID, and API Key.' },
        { id: 'test-connection', title: 'Step 5: Test Connection', content: 'Click "Test Connection" to verify. Ensure your API key has the right permissions.' },
      ],
    },
    hi: {
      title: 'Appwrite कैसे Connect करें',
      intro: 'Appwrite को open-source backend-as-a-service के रूप में कनेक्ट करें।',
      sections: [
        { id: 'create-account', title: 'स्टेप 1: अकाउंट बनाएं', content: 'https://cloud.appwrite.io पर जाएं।' },
        { id: 'create-project', title: 'स्टेप 2: प्रोजेक्ट बनाएं', content: '"Create Project" पर क्लिक करें।' },
        { id: 'get-keys', title: 'स्टेप 3: Keys लें', content: 'Settings से Endpoint, Project ID और API Key कॉपी करें।', code: 'Endpoint: https://cloud.appwrite.io/v1\nProject ID: 64xxxxxxxxxxxx' },
        { id: 'paste-keys', title: 'स्टेप 4: Keys पेस्ट करें', content: 'Database Settings में Appwrite चुनें और credentials पेस्ट करें।' },
        { id: 'test-connection', title: 'स्टेप 5: टेस्ट करें', content: '"Test Connection" से verify करें।' },
      ],
    },
    hinglish: {
      title: 'Appwrite Kaise Connect Kare',
      intro: 'Appwrite ko open-source backend ke roop me connect karo.',
      sections: [
        { id: 'create-account', title: 'Step 1: Account Banao', content: 'https://cloud.appwrite.io pe jao.' },
        { id: 'create-project', title: 'Step 2: Project Banao', content: '"Create Project" pe click karo.' },
        { id: 'get-keys', title: 'Step 3: Keys Lo', content: 'Settings se Endpoint, Project ID aur API Key copy karo.', code: 'Endpoint: https://cloud.appwrite.io/v1' },
        { id: 'paste-keys', title: 'Step 4: Keys Paste Karo', content: 'Database Settings me Appwrite chuno aur credentials paste karo.' },
        { id: 'test-connection', title: 'Step 5: Test Karo', content: '"Test Connection" se verify karo.' },
      ],
    },
  },
  pocketbase: {
    en: {
      title: 'How to Connect PocketBase',
      intro: 'Connect PocketBase - a lightweight open-source backend.',
      sections: [
        { id: 'create-account', title: 'Step 1: Set Up PocketBase', content: 'Download PocketBase from https://pocketbase.io\n\n1. Download for your OS\n2. Extract and run: ./pocketbase serve\n3. Open http://127.0.0.1:8090/_/' },
        { id: 'create-project', title: 'Step 2: Create Collections', content: 'Create collections for Students, Fees, Attendance in the admin UI.' },
        { id: 'get-keys', title: 'Step 3: Get Server URL', content: 'Your PocketBase URL is where the server runs, typically http://127.0.0.1:8090 or your deployed URL.', code: 'Server URL: https://your-pocketbase.fly.dev\nAdmin Email: admin@example.com' },
        { id: 'paste-keys', title: 'Step 4: Paste in App', content: 'Select PocketBase and enter your server URL and admin credentials.' },
        { id: 'test-connection', title: 'Step 5: Test', content: 'Click "Test Connection" to verify access.' },
      ],
    },
    hi: {
      title: 'PocketBase कैसे Connect करें',
      intro: 'PocketBase - एक lightweight open-source backend कनेक्ट करें।',
      sections: [
        { id: 'create-account', title: 'स्टेप 1: PocketBase सेट अप करें', content: 'https://pocketbase.io से डाउनलोड करें।' },
        { id: 'create-project', title: 'स्टेप 2: Collections बनाएं', content: 'Admin UI में Students, Fees collections बनाएं।' },
        { id: 'get-keys', title: 'स्टेप 3: Server URL लें', content: 'जहां server चल रहा है वो URL लें।', code: 'Server URL: https://your-pocketbase.fly.dev' },
        { id: 'paste-keys', title: 'स्टेप 4: ऐप में डालें', content: 'PocketBase चुनें और Server URL डालें।' },
        { id: 'test-connection', title: 'स्टेप 5: टेस्ट करें', content: '"Test Connection" से verify करें।' },
      ],
    },
    hinglish: {
      title: 'PocketBase Kaise Connect Kare',
      intro: 'PocketBase - ek lightweight backend connect karo.',
      sections: [
        { id: 'create-account', title: 'Step 1: PocketBase Setup Karo', content: 'https://pocketbase.io se download karo.' },
        { id: 'create-project', title: 'Step 2: Collections Banao', content: 'Admin UI me Students, Fees collections banao.' },
        { id: 'get-keys', title: 'Step 3: Server URL Lo', content: 'Jahan server chal raha hai wo URL lo.', code: 'Server URL: https://your-pocketbase.fly.dev' },
        { id: 'paste-keys', title: 'Step 4: App Me Dalo', content: 'PocketBase chuno aur Server URL dalo.' },
        { id: 'test-connection', title: 'Step 5: Test Karo', content: '"Test Connection" se verify karo.' },
      ],
    },
  },
  baserow: {
    en: {
      title: 'How to Connect Baserow',
      intro: 'Connect Baserow - an open-source alternative to Airtable.',
      sections: [
        { id: 'create-account', title: 'Step 1: Create Baserow Account', content: 'Go to https://baserow.io and create a free account.' },
        { id: 'create-project', title: 'Step 2: Create Database & Tables', content: 'Create a database and add tables for your institute data.' },
        { id: 'get-keys', title: 'Step 3: Get API Token', content: 'Go to Settings → API tokens → Create token.\n\nCopy the token and your table URL.', code: 'API Token: xxxxxxxxxxxxxxxxx\nAPI URL: https://api.baserow.io\nTable ID: 12345' },
        { id: 'paste-keys', title: 'Step 4: Configure in App', content: 'Select Baserow in Database Settings and enter your API URL, Token, and Table ID.' },
        { id: 'test-connection', title: 'Step 5: Test Connection', content: 'Click "Test Connection" to verify. Make sure the token has read/write permissions.' },
      ],
    },
    hi: {
      title: 'Baserow कैसे Connect करें',
      intro: 'Baserow - Airtable का open-source alternative कनेक्ट करें।',
      sections: [
        { id: 'create-account', title: 'स्टेप 1: अकाउंट बनाएं', content: 'https://baserow.io पर जाएं।' },
        { id: 'create-project', title: 'स्टेप 2: Database बनाएं', content: 'Database और tables बनाएं।' },
        { id: 'get-keys', title: 'स्टेप 3: API Token लें', content: 'Settings → API tokens से token बनाएं।', code: 'API Token: xxxxxxxxxxxxxxxxx' },
        { id: 'paste-keys', title: 'स्टेप 4: ऐप में डालें', content: 'Baserow चुनें और credentials डालें।' },
        { id: 'test-connection', title: 'स्टेप 5: टेस्ट करें', content: '"Test Connection" से verify करें।' },
      ],
    },
    hinglish: {
      title: 'Baserow Kaise Connect Kare',
      intro: 'Baserow - Airtable ka open-source alternative connect karo.',
      sections: [
        { id: 'create-account', title: 'Step 1: Account Banao', content: 'https://baserow.io pe jao.' },
        { id: 'create-project', title: 'Step 2: Database Banao', content: 'Database aur tables banao.' },
        { id: 'get-keys', title: 'Step 3: API Token Lo', content: 'Settings → API tokens se token banao.', code: 'API Token: xxxxxxxxxxxxxxxxx' },
        { id: 'paste-keys', title: 'Step 4: App Me Dalo', content: 'Baserow chuno aur credentials dalo.' },
        { id: 'test-connection', title: 'Step 5: Test Karo', content: '"Test Connection" se verify karo.' },
      ],
    },
  },
};

export default function DatabaseGuide() {
  const { dbType } = useParams<{ dbType: string }>();
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>('en');
  const [activeSection, setActiveSection] = useState('');
  const [tocOpen, setTocOpen] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const guide = guides[dbType || '']?.[lang];

  useEffect(() => {
    if (!guide) return;
    const observer = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) { setActiveSection(e.target.id); break; }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    );
    Object.values(sectionRefs.current).forEach(el => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [guide]);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  if (!guide) {
    return (
      <div className="p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Guide Not Found</h1>
        <p className="text-muted-foreground">No guide available for "{dbType}"</p>
        <Button onClick={() => navigate('/admin/database')}>← Back to Database Settings</Button>
      </div>
    );
  }

  const langLabels: Record<Lang, string> = { en: 'English', hi: 'हिंदी', hinglish: 'Hinglish' };

  return (
    <div className="min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/database')} className="gap-1.5">
            <ArrowLeft size={16} /> Back
          </Button>
          <button className="md:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setTocOpen(!tocOpen)}>
            {tocOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <h1 className="text-sm font-bold text-foreground hidden sm:block">{guide.title}</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <Globe size={14} className="text-muted-foreground" />
          {(Object.keys(langLabels) as Lang[]).map(l => (
            <button key={l} onClick={() => setLang(l)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${lang === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
              {langLabels[l]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex max-w-5xl mx-auto">
        {/* TOC Sidebar - Desktop */}
        <aside className="hidden md:block w-56 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-border p-4 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contents</p>
          {guide.sections.map((s, i) => (
            <a key={s.id} href={`#${s.id}`}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeSection === s.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
              onClick={e => { e.preventDefault(); sectionRefs.current[s.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
              <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] shrink-0">{i + 1}</span>
              <span className="truncate">{s.title.replace(/^(Step \d+:|स्टेप \d+:)\s*/, '')}</span>
            </a>
          ))}
        </aside>

        {/* TOC Mobile Drawer */}
        <AnimatePresence>
          {tocOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setTocOpen(false)} />
              <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25 }}
                className="fixed left-0 top-0 bottom-0 w-72 bg-card z-50 shadow-xl p-6 space-y-1 overflow-y-auto md:hidden">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-foreground">Contents</p>
                  <button onClick={() => setTocOpen(false)} className="p-1 rounded hover:bg-muted"><X size={18} /></button>
                </div>
                {guide.sections.map((s, i) => (
                  <a key={s.id} href={`#${s.id}`}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeSection === s.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={e => { e.preventDefault(); sectionRefs.current[s.id]?.scrollIntoView({ behavior: 'smooth' }); setTocOpen(false); }}>
                    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs shrink-0">{i + 1}</span>
                    {s.title.replace(/^(Step \d+:|स्टेप \d+:)\s*/, '')}
                  </a>
                ))}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 max-w-3xl space-y-8">
          <div>
            <Badge variant="secondary" className="mb-3">{dbType?.replace('_', ' ').toUpperCase()}</Badge>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{guide.title}</h1>
            <p className="text-muted-foreground mt-2">{guide.intro}</p>
          </div>

          {guide.sections.map((section, i) => (
            <motion.section
              key={section.id}
              id={section.id}
              ref={el => { sectionRefs.current[section.id] = el; }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              className="scroll-mt-20"
            >
              <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</span>
                  <h2 className="text-lg font-bold text-foreground pt-0.5">{section.title}</h2>
                </div>
                <div className="pl-11 space-y-4">
                  <div className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">{section.content}</div>

                  {/* Screenshot placeholder */}
                  <div className="bg-muted/50 border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <p className="text-xs text-muted-foreground">📸 Screenshot / Visual Guide</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Reference image placeholder</p>
                  </div>

                  {section.code && (
                    <div className="relative">
                      <pre className="bg-muted rounded-lg p-4 text-xs font-mono overflow-x-auto text-foreground/80">{section.code}</pre>
                      <button
                        onClick={() => copyCode(section.code!, section.id)}
                        className="absolute top-2 right-2 p-1.5 rounded bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy code"
                      >
                        {copiedId === section.id ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {i < guide.sections.length - 1 && (
                <div className="flex justify-center py-2">
                  <ChevronRight size={16} className="text-muted-foreground rotate-90" />
                </div>
              )}
            </motion.section>
          ))}

          <div className="bg-accent/10 border border-accent/30 rounded-xl p-6 text-center space-y-3">
            <CheckCircle2 className="mx-auto text-accent" size={32} />
            <h3 className="font-bold text-foreground">{lang === 'hi' ? '🎉 बधाई हो! सेटअप पूरा हुआ।' : lang === 'hinglish' ? '🎉 Badhai ho! Setup complete ho gaya.' : '🎉 Congratulations! Setup Complete.'}</h3>
            <p className="text-sm text-muted-foreground">{lang === 'hi' ? 'अब Database Settings पर वापस जाएं और connection test करें।' : lang === 'hinglish' ? 'Ab Database Settings pe wapas jao aur connection test karo.' : 'Go back to Database Settings and test your connection.'}</p>
            <Button onClick={() => navigate('/admin/database')} className="gap-2">
              <ArrowLeft size={14} /> {lang === 'hi' ? 'Database Settings पर जाएं' : lang === 'hinglish' ? 'Database Settings pe Jao' : 'Go to Database Settings'}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
