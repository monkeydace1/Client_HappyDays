# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Happy Days Location is a car rental booking application with a public booking interface and admin dashboard. Built with React 19, TypeScript, and Vite. Uses Supabase for database/auth and Resend for emails.

## Commands

```bash
npm run dev      # Start dev server (localhost:5173)
npm run build    # Type check + production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Architecture

### Directory Structure

- `src/pages/` - Public pages (Booking, Fleet, Conditions, ThankYou)
- `src/components/` - Public UI components
- `src/components/booking/` - 4-step booking form components
- `src/admin/pages/` - Admin pages (Login, PIN, Dashboard)
- `src/admin/components/` - Admin UI (Gantt chart, modals, reservation list)
- `src/admin/services/adminService.ts` - Supabase CRUD operations for admin
- `src/admin/store/adminStore.ts` - Admin UI state (Zustand)
- `src/store/bookingStore.ts` - Public booking state (Zustand)
- `src/lib/` - Utilities (Supabase client, booking service, email templates)
- `src/types/` - TypeScript definitions
- `supabase/migrations/` - Database schema
- `supabase/functions/` - Edge functions for email delivery

### Data Flow

**Public Booking:**
```
User Input → bookingStore → bookingService.ts → Supabase → Edge Function → Resend Email
```

**Admin Dashboard:**
```
useAdminData hook → adminService.ts → Supabase (with real-time subscriptions)
```

### Key Patterns

- **State Management**: Zustand stores for both public (bookingStore) and admin (adminStore)
- **Booking Flow**: 4 steps - Dates → Vehicle → Supplements → Client Info
- **Admin Tabs**: Calendar (Gantt), Reservations List, Vehicles
- **Auth**: Email login + PIN verification (hardcoded in v1: admin/admin1, PIN: 1234)

### Database Tables

- `vehicles` - Car inventory with status (available/maintenance/retired)
- `bookings` - Web bookings with full customer details
- `admin_bookings` - Admin reservations with source tracking (web/walk_in/phone)

### External Services

- **Supabase**: PostgreSQL, RLS, real-time subscriptions
- **Resend**: Email delivery
- **Analytics**: Google Analytics, Google Ads, Facebook Pixel

## Vehicle Management

### Key Files
| File | Purpose |
|------|---------|
| `src/data/vehicleData.ts` | All vehicle definitions (22 vehicles) |
| `src/admin/data/adminVehicleData.ts` | Admin vehicle data (auto-synced from vehicleData) |
| `public/vehicles/` | Vehicle images (see README.md inside) |

### Add a New Vehicle
1. Create folder in `public/vehicles/{brand-model}/`
2. Add `main.jpg` (required) and `1.jpg`, `2.jpg`, etc. (optional)
3. Add vehicle object in `src/data/vehicleData.ts` with new ID
4. Set correct image count in `getVehicleImages(folder, count)` call
5. Insert the matching row in the `vehicles` table — the admin grid, QuickAdd and the
   maintenance/hidden filter read the DB, not `vehicleData.ts`
   (pattern: `supabase/migrations/009_fleet_update_oct2026.sql`)

### Update Vehicle Images
1. Put the new photos in a **new folder** (e.g. `seat-leon-2021/`), 4:3, ≤ 1200×900, `main.jpg` + `1.jpg`…
2. Update the folder name and image count in `vehicleData.ts`, and `vehicles.image` in the DB
3. Never overwrite a photo under the same path: browsers and the CDN may keep serving the old
   file (`npx vercel --prod --force` is no longer usable from this PC, see CHANGES.md #5)

### Current Fleet: 22 vehicles (IDs 1–22)
See `public/vehicles/README.md` for complete list with folder paths and prices.

## Conventions

- French localization for all UI strings
- camelCase for functions/variables, PascalCase for components/types
- Tailwind CSS with Framer Motion animations
- Lucide React for icons
