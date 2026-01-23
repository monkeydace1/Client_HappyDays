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

## Conventions

- French localization for all UI strings
- camelCase for functions/variables, PascalCase for components/types
- Tailwind CSS with Framer Motion animations
- Lucide React for icons
