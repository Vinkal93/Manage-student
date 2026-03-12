Software name: InSuite Manage — Institute Management System (multi-tenant SaaS)

## Design System
- Font: IBM Plex Sans
- Primary: Navy (215 80% 28%), Accent: Teal (172 60% 40%)
- Success: Green (145 60% 40%), Warning: Orange (38 90% 55%)
- Sidebar: Light theme
- All colors via CSS variables in index.css

## Architecture
- Auth: Firebase Auth + localStorage fallback (lib/auth.ts)
- Firebase config in lib/firebase.ts (publishable API key in code)
- Data: localStorage-based store (lib/store.ts)
- Settings: localStorage-based (lib/settings.ts) - institute name configurable
- Export: xlsx library for Excel/CSV (lib/export.ts)
- Student IDs: SBCI0001 format, auto-incremented
- Routes: / (landing), /login, /admin/*, /student/*
- Admin: Firebase email auth
- Student: Firebase auth with {studentId}@sbci.institute email mapping
- Fallback: admin@sbci.com / admin123, SBCI0001 / sbci123

## Pages
- Landing (public), Login, Dashboard, Students, AddStudent, FeeTracking, FeeManagement
- StudentManagement, Attendance, Messages, BulkMessages, Reports
- Analytics (advanced with filters, charts, tabs), Settings
- StudentProfile (admin view), StudentDashboard (student view)

## Pricing (landing page)
- Free: 15 students
- Basic: ₹99/month (50 students, limited features)
- Advanced: ₹199/month (unlimited, all features)
- AI Pro: ₹299/month (AI insights, white label)

## Future: Needs Lovable Cloud for persistent DB, real WhatsApp API, cron jobs, super admin panel, multi-tenant