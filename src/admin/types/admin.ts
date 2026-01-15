import type { Vehicle } from '../../types';

// Admin Vehicle extends base Vehicle with admin-specific fields
export interface AdminVehicle extends Vehicle {
  status: 'available' | 'maintenance' | 'retired';
  licensePlate?: string;
  notes?: string;
}

// Booking status for admin dashboard
// Flow: new -> pending -> active -> completed/cancelled
export type BookingStatus = 'new' | 'pending' | 'active' | 'completed' | 'cancelled';

// Booking source
export type BookingSource = 'web' | 'walk_in' | 'phone';

// Admin booking record
export interface AdminBooking {
  id: string;
  bookingReference: string;
  status: BookingStatus;
  source: BookingSource;

  // Dates and Times
  departureDate: string;
  returnDate: string;
  rentalDays: number;
  pickupTime?: string;  // Format: "HH:MM" (stored 24h, display 12h AM/PM)
  returnTime?: string;  // Format: "HH:MM"

  // Location
  pickupLocation: string;
  customPickupLocation?: string;
  returnLocation?: string;

  // Vehicle
  vehicleId: number;
  vehicleName: string;
  assignedVehicleId?: number; // For assigning to specific car

  // Client (simplified for admin view)
  clientName: string;
  clientPhone: string;
  clientEmail?: string;

  // Pricing
  totalPrice: number;

  // Meta
  createdAt: string;
  updatedAt: string;
}

// QuickAdd form data (simplified for walk-ins)
export interface QuickAddData {
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  vehicleId: number;
  departureDate: string;
  returnDate: string;
  pickupTime?: string;
  returnTime?: string;
  notes?: string;
  pricePerDay?: number; // Custom price override for negotiations/discounts
}

// KPI data
export interface DashboardKPIs {
  totalCars: number;
  availableCars: number;
  activeReservations: number;
  pendingReservations: number;
}

// Calendar view options
export type CalendarViewDays = 7 | 14 | 30 | 60;

// Admin tab types
export type AdminTab = 'calendar' | 'reservations' | 'vehicles';

// Reservation filters
export interface ReservationFilters {
  search: string;
  status: BookingStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
}

// Full booking details (from bookings table - web bookings only)
export interface FullBookingDetails {
  // Personal info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  dateOfBirth: string;

  // Driver's license
  licenseNumber: string;
  licenseIssueDate: string;
  licenseExpirationDate: string;
  licensePhotoUrl?: string;

  // Vehicle details
  vehicleBrand: string;
  vehicleModel: string;
  vehicleCategory: string;
  vehiclePricePerDay: number;

  // Supplements
  supplements: Array<{
    id: string;
    name: string;
    pricePerDay: number;
    quantity?: number;
  }>;
  additionalDriver: boolean;

  // Pricing breakdown
  vehicleTotal: number;
  supplementsTotal: number;
  totalPrice: number;

  // Payment & notes
  paymentMethod: 'cash' | 'card' | 'transfer';
  extraInformation?: string;
  notes?: string;

  // Meta
  createdAt: string;
}
