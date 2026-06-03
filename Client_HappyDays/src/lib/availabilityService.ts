import { supabase } from './supabase';

export type AvailabilityStatus = 'available' | 'partial_conflict' | 'unavailable' | 'maintenance';

export interface VehicleAvailability {
  vehicleId: number;
  status: AvailabilityStatus;
  conflicts?: {
    startDate: string;
    endDate: string;
    bookingReference?: string;
  }[];
}

export interface AvailabilityResult {
  availabilities: VehicleAvailability[];
  loading: boolean;
  error: string | null;
}

/**
 * Check vehicle availability for a given date range
 * Returns availability status for all vehicles
 */
export async function checkVehicleAvailability(
  startDate: string,
  endDate: string
): Promise<VehicleAvailability[]> {
  try {
    // Fetch all bookings that overlap with the requested date range
    // A booking overlaps if: booking.start <= requested.end AND booking.end >= requested.start
    const { data: bookings, error: bookingsError } = await supabase
      .from('admin_bookings')
      .select('id, booking_reference, vehicle_id, assigned_vehicle_id, departure_date, return_date, status')
      .in('status', ['pending', 'confirmed'])
      .lte('departure_date', endDate)
      .gte('return_date', startDate);

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      throw bookingsError;
    }

    // Fetch vehicle statuses (for maintenance check)
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('id, status');

    if (vehiclesError) {
      console.error('Error fetching vehicles:', vehiclesError);
      throw vehiclesError;
    }

    // Build availability map
    const availabilityMap = new Map<number, VehicleAvailability>();

    // Initialize all vehicles as available
    vehicles?.forEach((vehicle) => {
      const status: AvailabilityStatus = vehicle.status === 'maintenance' ? 'maintenance' : 'available';
      availabilityMap.set(vehicle.id, {
        vehicleId: vehicle.id,
        status,
        conflicts: [],
      });
    });

    // Mark vehicles with booking conflicts
    bookings?.forEach((booking) => {
      const vehicleId = booking.assigned_vehicle_id || booking.vehicle_id;
      const existing = availabilityMap.get(vehicleId);

      if (existing && existing.status !== 'maintenance') {
        existing.conflicts = existing.conflicts || [];
        existing.conflicts.push({
          startDate: booking.departure_date,
          endDate: booking.return_date,
          bookingReference: booking.booking_reference,
        });

        // Determine if it's a full or partial conflict
        const bookingStart = new Date(booking.departure_date);
        const bookingEnd = new Date(booking.return_date);
        const requestedStart = new Date(startDate);
        const requestedEnd = new Date(endDate);

        // Full conflict: booking covers entire requested range
        const isFullConflict = bookingStart <= requestedStart && bookingEnd >= requestedEnd;

        if (isFullConflict) {
          existing.status = 'unavailable';
        } else if (existing.status !== 'unavailable') {
          existing.status = 'partial_conflict';
        }
      }
    });

    return Array.from(availabilityMap.values());
  } catch (error) {
    console.error('Error checking availability:', error);
    // Return empty array on error - will show all as available (safe fallback)
    return [];
  }
}

/**
 * Format conflict dates for display
 */
export function formatConflictDates(conflicts: VehicleAvailability['conflicts']): string {
  if (!conflicts || conflicts.length === 0) return '';

  const conflict = conflicts[0]; // Show first conflict
  const start = new Date(conflict.startDate);
  const end = new Date(conflict.endDate);

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return `${formatDate(start)} - ${formatDate(end)}`;
}

/**
 * Get availability badge text in French
 */
export function getAvailabilityBadgeText(status: AvailabilityStatus): string {
  switch (status) {
    case 'available':
      return 'Disponible';
    case 'partial_conflict':
      return 'Partiellement réservé';
    case 'unavailable':
      return 'Non disponible';
    case 'maintenance':
      return 'En maintenance';
    default:
      return 'Disponible';
  }
}

/**
 * Get availability badge color classes
 */
export function getAvailabilityBadgeColor(status: AvailabilityStatus): string {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'partial_conflict':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'unavailable':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'maintenance':
      return 'bg-gray-100 text-gray-600 border-gray-200';
    default:
      return 'bg-green-100 text-green-800 border-green-200';
  }
}
