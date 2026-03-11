# Memory: index.md
# SBCI Institute Management System

## Design System
- Font: IBM Plex Sans
- Primary: Navy (215 80% 28%), Accent: Teal (172 60% 40%)
- Success: Green (145 60% 40%), Warning: Orange (38 90% 55%)
- Sidebar: Light theme (not dark navy)
- All colors via CSS variables in index.css

## Architecture
- Auth: Firebase Auth + localStorage fallback (lib/auth.ts)
- Firebase config in lib/firebase.ts (publishable API key in code)
- Data: localStorage-based store (lib/store.ts)
- Settings: localStorage-based (lib/settings.ts) - institute name configurable
- Export: xlsx library for Excel/CSV (lib/export.ts)
- Student IDs: SBCI0001 format, auto-incremented
- Routes: /login, /admin/*, /student/*
- Admin: Firebase email auth
- Student: Firebase auth with {studentId}@sbci.institute email mapping
- Fallback: admin@sbci.com / admin123, SBCI0001 / sbci123

## Pages
- Login, Dashboard, Students, AddStudent, FeeTracking, FeeManagement
- StudentManagement, Attendance, Messages, BulkMessages, Reports
- Analytics, Settings
- StudentProfile (admin view), StudentDashboard (student view)

## Key Features
- Export: Excel/CSV for students, fees, attendance
- Import: Excel upload for bulk student import
- Analytics: Session tracking with device/browser info
- Settings: Institute name, courses, fee config (shows everywhere)
- Student Management: Change password, block/unblock, send messages, create Firebase accounts
- No "create account" on login page - admin assigns credentials

## Future: Needs Lovable Cloud for persistent DB, real WhatsApp API, cron jobs
