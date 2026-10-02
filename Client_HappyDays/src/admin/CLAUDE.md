# Admin Dashboard Documentation

## Overview
Protected admin area for managing reservations and vehicles.

## Structure
```
admin/
├── pages/
│   ├── AdminLoginPage.tsx    → Email/password login
│   ├── AdminPinPage.tsx      → PIN verification
│   ├── AdminDashboardPage.tsx→ Main dashboard
│   └── AdminFinancePage.tsx  → /admin/finance: revenue by period, vehicles, sources, clients
├── components/
│   ├── calendar/             → Gantt chart, booking modals
│   ├── vehicles/             → VehicleGrid management
│   ├── reservations/         → Reservation list
│   ├── finance/              → Period selector, summary cards, recharts bar chart, client table/modal
│   └── layout/               → AdminTabs, sidebar
├── lib/
│   ├── finance.ts            → Pure finance maths (completed bookings only, by departure date; phone grouping)
│   └── bookingStatus.ts      → Shared status/source labels
├── data/
│   └── adminVehicleData.ts   → Auto-synced from vehicleData.ts
├── services/
│   └── adminService.ts       → Supabase CRUD
├── store/
│   └── adminStore.ts         → UI state (Zustand)
├── hooks/
│   ├── useAdminData.ts       → Data fetching with real-time (falls back to sample data when empty!)
│   ├── useFinanceData.ts     → Real rows only, for the finance page
│   └── useAdminGuard.ts      → Login + PIN redirect shared by every admin page
└── types/
    └── admin.ts              → TypeScript definitions
```

## Key Components

### VehicleGrid
- Displays all vehicles in grid format
- Click vehicle to change status (Active/Pause)
- Status: `available` | `maintenance`
- Delete vehicles with confirmation

### AdminTabs
Three main tabs:
1. **Calendrier** - Gantt chart view
2. **Réservations** - List view with filters
3. **Véhicules** - Fleet management

## Vehicle Data Flow
```
vehicleData.ts → adminVehicleData.ts → VehicleGrid component
```

Changes to `vehicleData.ts` automatically appear in admin.

## Auth (v1)
- Login: admin / admin1
- PIN: 1234
