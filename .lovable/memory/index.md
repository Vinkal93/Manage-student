InSuite Manage - Multi-tenant Institute Management SaaS Platform

## Design System
- Font: IBM Plex Sans
- Primary: Navy (215 80% 28%), Accent: Teal (172 60% 40%)
- Success: Green (145 60% 40%), Warning: Orange (38 90% 55%)
- Sidebar: Light theme with semantic tokens
- All colors via CSS variables in index.css

## Architecture
- Auth: Firebase + localStorage fallback with admin/student roles
- Data: localStorage-based store (lib/store.ts)
- Student IDs: SBCI0001 format, auto-incremented
- Routes: /, /login, /register, /su, /about-developer, /admin/*, /student/*
- Super Admin: /su with password 'superadmin2026'
- Admin credentials: admin@sbci.com / admin123 (fallback)
- Firebase config in src/lib/firebase.ts (publishable keys)

## Pages
- Landing (typewriter hero, pricing with Free plan, footer with dev credit)
- Register (4-step wizard for institute registration)
- SuperAdmin (/su - approve/reject institutes, analytics, control panel)
- AboutDeveloper (Vinkal Prajapati profile)
- Login, Dashboard (with plan badge), Students, AddStudent
- FeeTracking, FeeManagement, Attendance, Messages, BulkMessages
- Reports, Analytics (advanced filters, device/browser tracking)
- StudentProfile (admin view), StudentDashboard (student view with tabs)
- Settings (institute branding, fee rules)
- StudentManagement (manage students, block/unblock)

## Contact Info
- Developer: Vinkal Prajapati
- Email: vinkal93041@gmail.com
- Phone: 9118245636

## Pricing Plans
- Free: ₹0 (15 students), Basic: ₹99/mo (50), Advanced: ₹199/mo (unlimited), AI Pro: ₹299/mo
