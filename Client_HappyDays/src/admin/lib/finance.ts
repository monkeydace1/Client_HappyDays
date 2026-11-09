import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  subDays,
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

function emptyBuckets(period: Period): RevenueBucket[] {
  const from = parseISO(period.from);
  const to = parseISO(period.to);
  if (!isValid(from) || !isValid(to)) return [];
  return (
    bucketGranularity(period) === 'month'
      ? eachMonthOfInterval({ start: from, end: to }).map((d) => ({
          key: format(d, 'yyyy-MM'),
          label: format(d, 'MMM yy', { locale: fr }),
        }))
      : eachWeekOfInterval({ start: from, end: to }, { weekStartsOn: 1 }).map((d) => ({
          key: format(d, 'yyyy-MM-dd'),
          label: `sem. du ${format(d, 'd MMM', { locale: fr })}`,
        }))
  ).map((b) => ({ ...b, revenue: 0, count: 0 }));
}

function bucketKey(departureDate: string, granularity: BucketGranularity): string | null {
  const d = parseISO(departureDate);
  if (!isValid(d)) return null;
  return granularity === 'month'
    ? format(d, 'yyyy-MM')
    : format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

/**
 * Revenue per month (or per week on short ranges). Empty buckets are kept so
 * the chart axis is stable.
 */
export function bucketRevenue(list: AdminBooking[], period: Period): RevenueBucket[] {
  const granularity = bucketGranularity(period);
  const buckets = emptyBuckets(period);
  const index = new Map(buckets.map((b) => [b.key, b]));
  for (const b of list) {
    const key = bucketKey(b.departureDate, granularity);
    const bucket = key ? index.get(key) : undefined;
    if (!bucket) continue;
    bucket.revenue += b.totalPrice || 0;
    bucket.count += 1;
  }
  return buckets;
}

// ============================================
// VEHICLE IDENTITY
// Two IDs were reused in October 2026 when a car was replaced (the admin numbering
// was kept). Bookings before `since` belong to the previous car, which gets its own
// row under the negative ID: −11 = the Toyota Yaris that was n°11.
// ============================================

export interface ReplacedVehicle {
  id: number;
  since: string; // YYYY-MM-DD, first day of the current car
  previousName: string;
}

export const REPLACED_VEHICLES: ReplacedVehicle[] = [
  { id: 11, since: '2026-10-01', previousName: 'Toyota Yaris' },
  { id: 19, since: '2026-10-01', previousName: 'Ford Fiesta' },
];

const replacedById = new Map(REPLACED_VEHICLES.map((r) => [r.id, r]));

/** The car a booking's money goes to: the assigned car first, the previous car for reused IDs. */
export function financeVehicleId(b: AdminBooking): number {
  const id = b.assignedVehicleId ?? b.vehicleId;
  const replaced = replacedById.get(id);
  return replaced && b.departureDate < replaced.since ? -id : id;
}

export interface FinanceVehicle {
  id: number;      // vehicles.id, or −id for the car that had this number before
  number: number;  // n° shown in the admin (always positive)
  name: string;
  category?: string;
  former: boolean; // no longer in the fleet, listed for its history
  activeFrom: string | null; // first day in the fleet (YYYY-MM-DD), null = unknown
  activeTo: string | null;   // last day in the fleet, null = still in it
}

/**
 * Cars the finance page lists: the current fleet (retired cars excluded) by n°, then
 * the cars that are gone but have completed bookings (previous occupants of reused
 * IDs, retired or deleted cars).
 */
export function buildFinanceFleet(vehicles: AdminVehicle[], bookings: AdminBooking[]): FinanceVehicle[] {
  // First completed departure and a name per finance ID (bookings carry the requested model)
  const firstDeparture = new Map<number, string>();
  const bookedName = new Map<number, string>();
  for (const b of bookings) {
    if (!isRevenueBooking(b)) continue;
    const id = financeVehicleId(b);
    const first = firstDeparture.get(id);
    if (!first || b.departureDate < first) firstDeparture.set(id, b.departureDate);
    if (!bookedName.has(id) && b.vehicleName) bookedName.set(id, b.vehicleName);
  }
  const earliest = (...dates: (string | null | undefined)[]) =>
    dates.filter((d): d is string => !!d).sort()[0] ?? null;

  const current: FinanceVehicle[] = [];
  const former: FinanceVehicle[] = [];
  const known = new Set<number>();

  for (const v of vehicles) {
    known.add(v.id);
    const created = v.createdAt ? v.createdAt.slice(0, 10) : null;
    const replaced = replacedById.get(v.id);
    if (v.status !== 'retired') {
      current.push({
        id: v.id,
        number: v.id,
        name: v.name,
        category: v.category,
        former: false,
        activeFrom: replaced ? replaced.since : earliest(created, firstDeparture.get(v.id)),
        activeTo: null,
      });
    } else if (firstDeparture.has(v.id)) {
      former.push({
        id: v.id,
        number: v.id,
        name: v.name,
        category: v.category,
        former: true,
        activeFrom: earliest(created, firstDeparture.get(v.id)),
        activeTo: null,
      });
    }
    if (replaced) {
      known.add(-v.id);
      if (firstDeparture.has(-v.id)) {
        former.push({
          id: -v.id,
          number: v.id,
          name: replaced.previousName,
          former: true,
          activeFrom: earliest(created, firstDeparture.get(-v.id)),
          activeTo: toIso(subDays(parseISO(replaced.since), 1)),
        });
      }
    }
  }

  // Cars deleted from the vehicles table that still have completed bookings
  for (const [id, first] of firstDeparture) {
    if (known.has(id)) continue;
    former.push({
      id,
      number: Math.abs(id),
      name: bookedName.get(id) || `Véhicule n°${Math.abs(id)}`,
      former: true,
      activeFrom: first,
      activeTo: null,
    });
  }

  return [...current, ...former.sort((a, b) => a.number - b.number || a.id - b.id)];
}

export interface VehicleRevenue {
  vehicleId: number;
  number: number;
  name: string;
  former: boolean;
  revenue: number;
  count: number;
  rentalDays: number;
}

function emptyVehicleRow(v: FinanceVehicle): VehicleRevenue {
  return { vehicleId: v.id, number: v.number, name: v.name, former: v.former, revenue: 0, count: 0, rentalDays: 0 };
}

function byRevenueDesc(a: VehicleRevenue, b: VehicleRevenue): number {
  return b.revenue - a.revenue || b.count - a.count || a.name.localeCompare(b.name, 'fr') || a.number - b.number;
}

/**
 * One row per vehicle, revenue desc. The whole current fleet is listed, so a car
 * with no completed rental in the period shows at 0 instead of disappearing; cars
 * that are gone only appear when they earned something in the period.
 */
export function groupByVehicle(list: AdminBooking[], fleet: FinanceVehicle[]): VehicleRevenue[] {
  const byId = new Map(fleet.map((v) => [v.id, v]));
  const rows = new Map<number, VehicleRevenue>();
  for (const v of fleet) {
    if (!v.former) rows.set(v.id, emptyVehicleRow(v));
  }
  for (const b of list) {
    const id = financeVehicleId(b);
    let row = rows.get(id);
    if (!row) {
      const v = byId.get(id);
      row = v
        ? emptyVehicleRow(v)
        : { vehicleId: id, number: Math.abs(id), name: b.vehicleName || `Véhicule n°${Math.abs(id)}`, former: true, revenue: 0, count: 0, rentalDays: 0 };
      rows.set(id, row);
    }
    row.revenue += b.totalPrice || 0;
    row.count += 1;
    row.rentalDays += b.rentalDays || 0;
  }
  return [...rows.values()].sort(byRevenueDesc);
}

// ============================================
// VEHICLE COMPARISON (finance → "Comparer des véhicules")
// ============================================

/** Completed bookings of the selected cars (finance IDs, see financeVehicleId). */
export function filterByVehicles(list: AdminBooking[], vehicleIds: number[]): AdminBooking[] {
  const ids = new Set(vehicleIds);
  return list.filter((b) => ids.has(financeVehicleId(b)));
}

/**
 * Days of the period the car could be rented: the period cut at today and at the
 * car's time in the fleet. 0 when the car was not in the fleet during the period.
 */
export function activeDaysInPeriod(v: FinanceVehicle, period: Period, today: Date = new Date()): number {
  let from = period.from;
  let to = period.to;
  const todayIso = toIso(today);
  if (to > todayIso) to = todayIso;
  if (v.activeFrom && v.activeFrom > from) from = v.activeFrom;
  if (v.activeTo && v.activeTo < to) to = v.activeTo;
  if (from > to) return 0;
  return differenceInCalendarDays(parseISO(to), parseISO(from)) + 1;
}

export interface VehicleComparisonRow extends VehicleRevenue {
  avgPerDay: number;        // revenue ÷ rental days
  activeDays: number;       // see activeDaysInPeriod
  occupancy: number | null; // rental days ÷ active days, capped at 1; null when activeDays = 0
  share: number;            // 0..1 of the selection's revenue
}

export interface VehicleComparison {
  rows: VehicleComparisonRow[]; // revenue desc
  total: VehicleComparisonRow;  // the selection as a whole (vehicleId 0)
}

function withRatios(row: VehicleRevenue, activeDays: number, selectionRevenue: number): VehicleComparisonRow {
  return {
    ...row,
    avgPerDay: row.rentalDays ? row.revenue / row.rentalDays : 0,
    activeDays,
    occupancy: activeDays ? Math.min(1, row.rentalDays / activeDays) : null,
    share: selectionRevenue ? row.revenue / selectionRevenue : 0,
  };
}

/**
 * Per-car figures for the selected cars over the period. `completed` is the
 * period's completed bookings (filterCompletedInPeriod). Occupancy counts each
 * rental's days in the period of its departure, like the revenue, hence the cap.
 */
export function compareVehicles(
  completed: AdminBooking[],
  fleet: FinanceVehicle[],
  period: Period,
  selectedIds: number[],
  today: Date = new Date()
): VehicleComparison {
  const selected = new Set(selectedIds);
  const cars = fleet.filter((v) => selected.has(v.id));
  const rows = new Map(cars.map((v) => [v.id, emptyVehicleRow(v)]));
  for (const b of completed) {
    const row = rows.get(financeVehicleId(b));
    if (!row) continue;
    row.revenue += b.totalPrice || 0;
    row.count += 1;
    row.rentalDays += b.rentalDays || 0;
  }
  const activeDays = new Map(cars.map((v) => [v.id, activeDaysInPeriod(v, period, today)]));
  const all = [...rows.values()];
  const revenue = all.reduce((s, r) => s + r.revenue, 0);

  const totalRow: VehicleRevenue = {
    vehicleId: 0,
    number: 0,
    name: 'Sélection',
    former: false,
    revenue,
    count: all.reduce((s, r) => s + r.count, 0),
    rentalDays: all.reduce((s, r) => s + r.rentalDays, 0),
  };
  const totalActiveDays = [...activeDays.values()].reduce((s, d) => s + d, 0);

  return {
    rows: all.map((r) => withRatios(r, activeDays.get(r.vehicleId) ?? 0, revenue)).sort(byRevenueDesc),
    total: withRatios(totalRow, totalActiveDays, revenue),
  };
}

export interface VehicleBucket extends RevenueBucket {
  /** Revenue per car in this bucket, keyed by vehicleSeriesKey(id) */
  values: Record<string, number>;
}

/** Chart data key for a car (negative IDs = previous cars). */
export function vehicleSeriesKey(id: number): string {
  return id < 0 ? `old${-id}` : `car${id}`;
}

/** Like bucketRevenue, with each bucket split per car. */
export function bucketRevenueByVehicle(list: AdminBooking[], period: Period, vehicleIds: number[]): VehicleBucket[] {
  const granularity = bucketGranularity(period);
  const keys = vehicleIds.map(vehicleSeriesKey);
  const buckets: VehicleBucket[] = emptyBuckets(period).map((b) => ({
    ...b,
    values: Object.fromEntries(keys.map((k) => [k, 0])),
  }));
  const index = new Map(buckets.map((b) => [b.key, b]));
  const ids = new Set(vehicleIds);
  for (const b of list) {
    const id = financeVehicleId(b);
    if (!ids.has(id)) continue;
    const key = bucketKey(b.departureDate, granularity);
    const bucket = key ? index.get(key) : undefined;
    if (!bucket) continue;
    bucket.revenue += b.totalPrice || 0;
    bucket.count += 1;
    bucket.values[vehicleSeriesKey(id)] += b.totalPrice || 0;
  }
  return buckets;
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
