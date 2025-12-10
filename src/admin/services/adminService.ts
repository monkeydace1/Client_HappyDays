import { supabase } from '../../lib/supabase';
import type { AdminVehicle, AdminBooking, BookingStatus } from '../types/admin';

// ============================================
// VEHICLE OPERATIONS
// ============================================

export async function fetchVehicles(): Promise<AdminVehicle[]> {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching vehicles:', error);
    throw error;
  }

  return (data || []).map(mapVehicleFromDb);
}

export async function updateVehicleStatus(
  vehicleId: number,
  status: AdminVehicle['status']
): Promise<void> {
  const { error } = await supabase
    .from('vehicles')
    .update({ status })
    .eq('id', vehicleId);

  if (error) {
    console.error('Error updating vehicle status:', error);
    throw error;
  }
}

// ============================================
// BOOKING OPERATIONS
// ============================================

export async function fetchBookings(): Promise<AdminBooking[]> {
  const { data, error } = await supabase
    .from('admin_bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }

  return (data || []).map(mapBookingFromDb);
}

export async function createBooking(
  booking: Omit<AdminBooking, 'id' | 'createdAt' | 'updatedAt'>
): Promise<AdminBooking> {
  const dbBooking = {
    booking_reference: booking.bookingReference,
    status: booking.status,
    source: booking.source,
    departure_date: booking.departureDate,
    return_date: booking.returnDate,
    rental_days: booking.rentalDays,
    pickup_location: booking.pickupLocation,
    vehicle_id: booking.vehicleId,
    vehicle_name: booking.vehicleName,
    assigned_vehicle_id: booking.assignedVehicleId || booking.vehicleId,
    client_name: booking.clientName,
    client_phone: booking.clientPhone,
    client_email: booking.clientEmail,
    total_price: booking.totalPrice,
  };

  const { data, error } = await supabase
    .from('admin_bookings')
    .insert(dbBooking)
    .select()
    .single();

  if (error) {
    console.error('Error creating booking:', error);
    throw error;
  }

  return mapBookingFromDb(data);
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<void> {
  const { error } = await supabase
    .from('admin_bookings')
    .update({ status })
    .eq('id', bookingId);

  if (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
}

export async function assignVehicleToBooking(
  bookingId: string,
  vehicleId: number
): Promise<void> {
  const { error } = await supabase
    .from('admin_bookings')
    .update({ assigned_vehicle_id: vehicleId })
    .eq('id', bookingId);

  if (error) {
    console.error('Error assigning vehicle:', error);
    throw error;
  }
}

export async function updateBooking(
  bookingId: string,
  updates: Partial<AdminBooking>
): Promise<void> {
  const dbUpdates: Record<string, unknown> = {};

  if (updates.clientName) dbUpdates.client_name = updates.clientName;
  if (updates.clientPhone) dbUpdates.client_phone = updates.clientPhone;
  if (updates.departureDate) dbUpdates.departure_date = updates.departureDate;
  if (updates.returnDate) dbUpdates.return_date = updates.returnDate;
  if (updates.rentalDays) dbUpdates.rental_days = updates.rentalDays;
  if (updates.totalPrice) dbUpdates.total_price = updates.totalPrice;
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.assignedVehicleId) dbUpdates.assigned_vehicle_id = updates.assignedVehicleId;

  const { error } = await supabase
    .from('admin_bookings')
    .update(dbUpdates)
    .eq('id', bookingId);

  if (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
}

export async function deleteBooking(bookingId: string): Promise<void> {
  const { error } = await supabase
    .from('admin_bookings')
    .delete()
    .eq('id', bookingId);

  if (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

export function subscribeToBookings(
  onInsert: (booking: AdminBooking) => void,
  onUpdate: (booking: AdminBooking) => void,
  onDelete: (bookingId: string) => void
) {
  const channel = supabase
    .channel('admin_bookings_changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'admin_bookings' },
      (payload) => onInsert(mapBookingFromDb(payload.new))
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'admin_bookings' },
      (payload) => onUpdate(mapBookingFromDb(payload.new))
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'admin_bookings' },
      (payload) => onDelete(payload.old.id)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToVehicles(
  onUpdate: (vehicle: AdminVehicle) => void
) {
  const channel = supabase
    .channel('vehicles_changes')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'vehicles' },
      (payload) => onUpdate(mapVehicleFromDb(payload.new))
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ============================================
// HELPERS
// ============================================

export function generateBookingReference(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `HD-${year}-${month}-${random}`;
}

// Map database row to AdminVehicle type
function mapVehicleFromDb(row: Record<string, unknown>): AdminVehicle {
  return {
    id: row.id as number,
    name: row.name as string,
    brand: row.brand as string,
    model: row.model as string,
    year: (row.year as number) || 2020,
    category: row.category as string,
    transmission: row.transmission as 'Manuelle' | 'Automatique',
    fuel: row.fuel as 'Essence' | 'Diesel' | 'Électrique' | 'Hybride',
    seats: row.seats as number,
    pricePerDay: row.price_per_day as number,
    image: row.image as string,
    status: row.status as AdminVehicle['status'],
    licensePlate: row.license_plate as string | undefined,
    notes: row.notes as string | undefined,
  };
}

// Map database row to AdminBooking type
function mapBookingFromDb(row: Record<string, unknown>): AdminBooking {
  return {
    id: row.id as string,
    bookingReference: row.booking_reference as string,
    status: row.status as BookingStatus,
    source: row.source as AdminBooking['source'],
    departureDate: row.departure_date as string,
    returnDate: row.return_date as string,
    rentalDays: row.rental_days as number,
    pickupLocation: row.pickup_location as string,
    vehicleId: row.vehicle_id as number,
    vehicleName: row.vehicle_name as string,
    assignedVehicleId: row.assigned_vehicle_id as number | undefined,
    clientName: row.client_name as string,
    clientPhone: row.client_phone as string,
    clientEmail: row.client_email as string | undefined,
    totalPrice: row.total_price as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
