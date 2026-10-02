import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  differenceInCalendarDays,
  eachMonthOfInterval,
  eachWeekOfInterval,
  startOfWeek,
  isValid,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import type { AdminBooking, AdminVehicle, BookingSource } from '../types/admin';

// ============================================
// FORMATTING
// ============================================

const euroFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

/** "1 250 €" */
export function formatEuro(amount: number): string {
  return euroFormatter.format(Math.round(amount));
}

/** "3 mars 2026" */
export function formatDay(iso: string): string {
  const d = parseISO(iso);
  return isValid(d) ? format(d, 'd MMM yyyy', { locale: fr }) : iso;
}

// ============================================
// PHONE NORMALISATION (clients are tracked by phone)
// ============================================

/**
 * Digits only; "00" international prefix and "+" are dropped so "+33 7…" and
 * "0033 7…" match; the Algerian prefix is folded to the local form so
 * "+213 559 59 99 55", "00213559599955" and "0559599955" all → "0559599955".
 * Returns null when nothing usable remains (e.g. "+213" alone).
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('213') && digits.length >= 12) digits = '0' + digits.slice(3);
  return digits.length >= 6 ? digits : null;
}

/** Grouping key: normalised phone, else the name (walk-ins without a phone). */
export function clientKey(booking: AdminBooking): string {
  const phone = normalizePhone(booking.clientPhone);
  if (phone) return `tel:${phone}`;
  return `name:${(booking.clientName || '').trim().toLowerCase() || booking.id}`;
}

// ============================================
// PERIODS
// ============================================

export type PeriodPreset = 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom';

export interface Period {
  from: string; // YYYY-MM-DD inclusive
  to: string;   // YYYY-MM-DD inclusive
}

const toIso = (d: Date) => format(d, 'yyyy-MM-dd');

export function resolvePeriod(
  preset: PeriodPreset,
  custom?: Partial<Period>,
  today: Date = new Date()
): Period {
  switch (preset) {
    case 'thisMonth':
      return { from: toIso(startOfMonth(today)), to: toIso(endOfMonth(today)) };
    case 'lastMonth': {
      const prev = subMonths(today, 1);
      return { from: toIso(startOfMonth(prev)), to: toIso(endOfMonth(prev)) };
    }
    case 'thisYear':
      return { from: toIso(startOfYear(today)), to: toIso(endOfYear(today)) };
    case 'custom': {
      const from = custom?.from || toIso(startOfMonth(today));
      const to = custom?.to || toIso(endOfMonth(today));
      return from <= to ? { from, to } : { from: to, to: from };
    }
  }
}

/** "1 → 31 mars 2026" */
export function formatPeriod(period: Period): string {
  const from = parseISO(period.from);
  const to = parseISO(period.to);
  if (!isValid(from) || !isValid(to)) return `${period.from} → ${period.to}`;
  const sameMonth = from.getFullYear() === to.getFullYear() && from.getMonth() === to.getMonth();
  if (sameMonth) {
    return `${format(from, 'd', { locale: fr })} → ${format(to, 'd MMMM yyyy', { locale: fr })}`;
  }
  return `${format(from, 'd MMM yyyy', { locale: fr })} → ${format(to, 'd MMM yyyy', { locale: fr })}`;
}

// ============================================
// SELECTION — only "Terminée" bookings count as money made,
// attributed to the period by their departure date.
// ============================================

export function isRevenueBooking(b: AdminBooking): boolean {
  return b.status === 'completed';
}

export function inPeriod(b: AdminBooking, period: Period): boolean {
  return b.departureDate >= period.from && b.departureDate <= period.to;
}

export function filterCompletedInPeriod(bookings: AdminBooking[], period: Period): AdminBooking[] {
  return bookings.filter((b) => isRevenueBooking(b) && inPeriod(b, period));
}

// ============================================
// AGGREGATES
// ============================================

export interface FinanceSummary {
  revenue: number;
  count: number;
  avgPerBooking: number;
  rentalDays: number;
}

export function summarize(list: AdminBooking[]): FinanceSummary {
  const revenue = list.reduce((s, b) => s + (b.totalPrice || 0), 0);
  const rentalDays = list.reduce((s, b) => s + (b.rentalDays || 0), 0);
  const count = list.length;
  return { revenue, count, avgPerBooking: count ? revenue / count : 0, rentalDays };
}

export interface RevenueBucket {
  key: string;
  label: string;
  revenue: number;
  count: number;
}

export type BucketGranularity = 'month' | 'week';

export function bucketGranularity(period: Period): BucketGranularity {
  const days = differenceInCalendarDays(parseISO(period.to), parseISO(period.from)) + 1;
  return days > 45 ? 'month' : 'week';
}

/**
 * Revenue per month (or per week on short ranges). Empty buckets are kept so
 * the chart axis is stable.
 */
export function bucketRevenue(list: AdminBooking[], period: Period): RevenueBucket[] {
  const from = parseISO(period.from);
  const to = parseISO(period.to);
  if (!isValid(from) || !isValid(to)) return [];
  const granularity = bucketGranularity(period);

  const buckets: RevenueBucket[] = (
    granularity === 'month'
      ? eachMonthOfInterval({ start: from, end: to }).map((d) => ({
          key: format(d, 'yyyy-MM'),
          label: format(d, 'MMM yy', { locale: fr }),
        }))
      : eachWeekOfInterval({ start: from, end: to }, { weekStartsOn: 1 }).map((d) => ({
          key: format(d, 'yyyy-MM-dd'),
          label: `sem. du ${format(d, 'd MMM', { locale: fr })}`,
        }))
  ).map((b) => ({ ...b, revenue: 0, count: 0 }));

  const index = new Map(buckets.map((b) => [b.key, b]));
  for (const b of list) {
    const d = parseISO(b.departureDate);
    if (!isValid(d)) continue;
    const key =
      granularity === 'month'
        ? format(d, 'yyyy-MM')
        : format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const bucket = index.get(key);
    if (!bucket) continue;
    bucket.revenue += b.totalPrice || 0;
    bucket.count += 1;
  }
  return buckets;
}

export interface VehicleRevenue {
  vehicleId: number;
  name: string;
  revenue: number;
  count: number;
  rentalDays: number;
}

/**
 * One row per vehicle, revenue desc. The whole fleet (except retired cars) is
 * listed, so a car with no completed rental in the period shows at 0 instead
 * of disappearing. Cars that only exist on old bookings are appended.
 */
export function groupByVehicle(list: AdminBooking[], vehicles: AdminVehicle[]): VehicleRevenue[] {
  const names = new Map(vehicles.map((v) => [v.id, v.name]));
  const rows = new Map<number, VehicleRevenue>();
  for (const v of vehicles) {
    if (v.status === 'retired') continue;
    rows.set(v.id, { vehicleId: v.id, name: v.name, revenue: 0, count: 0, rentalDays: 0 });
  }
  for (const b of list) {
    const vehicleId = b.assignedVehicleId ?? b.vehicleId;
    let row = rows.get(vehicleId);
    if (!row) {
      row = {
        vehicleId,
        name: names.get(vehicleId) ?? b.vehicleName ?? `Véhicule #${vehicleId}`,
        revenue: 0,
        count: 0,
        rentalDays: 0,
      };
      rows.set(vehicleId, row);
    }
    row.revenue += b.totalPrice || 0;
    row.count += 1;
    row.rentalDays += b.rentalDays || 0;
  }
  return [...rows.values()].sort(
    (a, b) => b.revenue - a.revenue || b.count - a.count || a.name.localeCompare(b.name, 'fr')
  );
}

export interface SourceRevenue {
  source: BookingSource;
  revenue: number;
  count: number;
  share: number; // 0..1 of the period revenue
}

const SOURCES: BookingSource[] = ['web', 'walk_in', 'phone'];

export function groupBySource(list: AdminBooking[]): SourceRevenue[] {
  const total = list.reduce((s, b) => s + (b.totalPrice || 0), 0);
  return SOURCES.map((source) => {
    const subset = list.filter((b) => b.source === source);
    const revenue = subset.reduce((s, b) => s + (b.totalPrice || 0), 0);
    return { source, revenue, count: subset.length, share: total ? revenue / total : 0 };
  }).sort((a, b) => b.revenue - a.revenue);
}

export interface ClientRow {
  key: string;
  name: string;
  phone: string;
  email?: string;
  /** Completed bookings whose departure falls in the selected period */
  periodCount: number;
  periodTotal: number;
  /** Completed bookings, any date */
  lifetimeCount: number;
  lifetimeTotal: number;
  /** Most recent departure date, any status */
  lastRental: string;
  /** Every booking of this client (any status), newest departure first */
  bookings: AdminBooking[];
}

/**
 * One row per client (grouped by normalised phone). Only clients with at least
 * one completed booking in the period are returned; their full history is
 * attached for the detail view.
 */
export function groupByClient(all: AdminBooking[], period: Period): ClientRow[] {
  const rows = new Map<string, ClientRow>();
  const sorted = [...all].sort((a, b) => (a.departureDate < b.departureDate ? 1 : -1));

  for (const b of sorted) {
    const key = clientKey(b);
    let row = rows.get(key);
    if (!row) {
      // `sorted` is newest first, so the first booking seen carries the latest name/phone
      row = {
        key,
        name: b.clientName?.trim() || 'Client sans nom',
        phone: b.clientPhone?.trim() || '',
        email: b.clientEmail || undefined,
        periodCount: 0,
        periodTotal: 0,
        lifetimeCount: 0,
        lifetimeTotal: 0,
        lastRental: b.departureDate,
        bookings: [],
      };
      rows.set(key, row);
    }
    row.bookings.push(b);
    if (!row.email && b.clientEmail) row.email = b.clientEmail;
    if (!row.phone && b.clientPhone) row.phone = b.clientPhone.trim();
    if (isRevenueBooking(b)) {
      row.lifetimeCount += 1;
      row.lifetimeTotal += b.totalPrice || 0;
      if (inPeriod(b, period)) {
        row.periodCount += 1;
        row.periodTotal += b.totalPrice || 0;
      }
    }
  }

  return [...rows.values()]
    .filter((r) => r.periodCount > 0)
    .sort((a, b) => b.periodTotal - a.periodTotal || b.periodCount - a.periodCount);
}

/** Case/accent-insensitive search on name or phone. */
export function matchesClientSearch(row: ClientRow, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  const digits = q.replace(/\D/g, '');
  if (digits.length >= 3 && (normalizePhone(row.phone) ?? '').includes(digits)) return true;
  return row.name.toLowerCase().includes(q);
}
