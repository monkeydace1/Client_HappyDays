// Centralized rental duration + pricing rules.
//
// Duration rule:
//   - Round the elapsed time UP to whole hours (a started hour counts).
//   - Less than 24h total → 1 full day, 0 extra hours.
//   - Otherwise split into full 24h days + remainder hours.
//   - If remainder > 10 hours, promote to one more full day (extra = 0).
//
// Pricing rule:
//   - vehicle:      pricePerDay × fullDays + EXTRA_HOUR_RATE × extraHours
//   - supplements:  per-day rate × fullDays only (no hourly proration)

export const EXTRA_HOUR_RATE = 3;        // € per extra hour
export const EXTRA_HOURS_THRESHOLD = 10; // strictly above this → +1 day, 0 extra

export interface RentalUnits {
  fullDays: number;
  extraHours: number;
}

function toDate(input: Date | string): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  const d = new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Compute fullDays + extraHours between two datetimes.
 * Returns { fullDays: 0, extraHours: 0 } if inputs invalid or end <= start.
 */
export function computeRentalUnits(
  start: Date | string,
  end: Date | string
): RentalUnits {
  const s = toDate(start);
  const e = toDate(end);
  if (!s || !e) return { fullDays: 0, extraHours: 0 };

  const diffMs = e.getTime() - s.getTime();
  if (diffMs <= 0) return { fullDays: 0, extraHours: 0 };

  const totalHours = Math.ceil(diffMs / (1000 * 60 * 60));

  if (totalHours < 24) {
    return { fullDays: 1, extraHours: 0 };
  }

  let fullDays = Math.floor(totalHours / 24);
  let extraHours = totalHours % 24;

  if (extraHours > EXTRA_HOURS_THRESHOLD) {
    fullDays += 1;
    extraHours = 0;
  }

  return { fullDays, extraHours };
}

/**
 * Same as computeRentalUnits but the admin stores date + time as separate fields.
 * Pass YYYY-MM-DD plus HH:MM (time may be null/undefined → defaults to 00:00).
 */
export function computeRentalUnitsFromDateTime(
  startDate: string | null | undefined,
  startTime: string | null | undefined,
  endDate: string | null | undefined,
  endTime: string | null | undefined
): RentalUnits {
  if (!startDate || !endDate) return { fullDays: 0, extraHours: 0 };
  const startISO = `${startDate}T${(startTime || '00:00').slice(0, 5)}`;
  const endISO = `${endDate}T${(endTime || '00:00').slice(0, 5)}`;
  return computeRentalUnits(startISO, endISO);
}

/**
 * Vehicle subtotal: pricePerDay × fullDays + 3€ × extraHours.
 */
export function computeVehicleSubtotal(
  pricePerDay: number,
  units: RentalUnits
): number {
  return pricePerDay * units.fullDays + EXTRA_HOUR_RATE * units.extraHours;
}

/**
 * Per-day supplements bill on full days only.
 */
export function computeSupplementSubtotal(
  pricePerDay: number,
  quantity: number,
  units: RentalUnits
): number {
  return pricePerDay * quantity * units.fullDays;
}

/**
 * An add-on attached to a booking (admin "Suppléments", plus the web supplements
 * copied at sync time). per_day items bill on fullDays like supplements; one_time
 * items bill once.
 */
export interface BookingExtra {
  id: string;
  name: string;
  mode: 'per_day' | 'one_time';
  price: number;
  quantity: number;
}

export function computeExtrasSubtotal(extras: BookingExtra[], units: RentalUnits): number {
  return extras.reduce((sum, extra) => {
    const qty = extra.quantity || 1;
    return sum + (extra.mode === 'per_day'
      ? computeSupplementSubtotal(extra.price, qty, units)
      : extra.price * qty);
  }, 0);
}

/**
 * Single source of truth for a booking total (admin edit / drag-drop / extend, QuickAdd):
 *   vehicle (rate × days + 3 €/h) + extras + one-time delivery fee.
 */
export function computeBookingTotal(input: {
  pricePerDay: number;
  units: RentalUnits;
  extras?: BookingExtra[];
  deliveryFee?: number;
}): number {
  return Math.round(
    computeVehicleSubtotal(input.pricePerDay, input.units) +
      computeExtrasSubtotal(input.extras ?? [], input.units) +
      (input.deliveryFee ?? 0)
  );
}

/**
 * Daily rate for bookings saved before price_per_day existed (migration 008):
 * back it out of the stored total, which then only held rate × days + 3 €/h.
 */
export function deriveDailyRate(totalPrice: number, fullDays: number, extraHours: number): number {
  if (fullDays <= 0) return totalPrice;
  return Math.max(0, Math.round((totalPrice - EXTRA_HOUR_RATE * extraHours) / fullDays));
}

/**
 * French label for a duration, e.g. "1 jour + 1h", "2 jours", "1 jour".
 */
export function formatRentalDuration(units: RentalUnits): string {
  const { fullDays, extraHours } = units;
  if (fullDays === 0 && extraHours === 0) return '';
  const daysPart =
    fullDays === 0 ? '' : `${fullDays} jour${fullDays > 1 ? 's' : ''}`;
  const hoursPart = extraHours === 0 ? '' : `${extraHours}h`;
  if (daysPart && hoursPart) return `${daysPart} + ${hoursPart}`;
  return daysPart || hoursPart;
}
