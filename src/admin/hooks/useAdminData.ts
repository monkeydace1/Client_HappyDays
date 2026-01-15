import { useState, useEffect, useCallback } from 'react';
import type { AdminVehicle, AdminBooking, BookingStatus, QuickAddData } from '../types/admin';
import {
  fetchVehicles,
  fetchBookings,
  updateVehicleStatus,
  updateBookingStatus,
  assignVehicleToBooking,
  updateBooking,
  createBooking,
  subscribeToBookings,
  subscribeToVehicles,
  generateBookingReference,
} from '../services/adminService';
import { supabase } from '../../lib/supabase';

// Send confirmation email when status changes to 'active'
async function sendConfirmationEmail(booking: AdminBooking): Promise<void> {
  if (!booking.clientEmail) {
    console.log('No customer email, skipping confirmation email');
    return;
  }

  try {
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        bookingReference: booking.bookingReference,
        customerEmail: booking.clientEmail,
        customerName: booking.clientName || 'Client',
        vehicleName: booking.vehicleName || 'Véhicule',
        departureDate: booking.departureDate,
        returnDate: booking.returnDate,
        pickupTime: booking.pickupTime,
        returnTime: booking.returnTime,
        pickupLocation: booking.pickupLocation,
        totalPrice: booking.totalPrice || 0,
      },
    });

    if (error) {
      console.error('Error sending confirmation email:', error);
    } else {
      console.log('Confirmation email sent successfully:', data);
    }
  } catch (err) {
    console.error('Failed to send confirmation email:', err);
  }
}

// ============================================
// FALLBACK SAMPLE DATA (when Supabase is empty/fails)
// ============================================

const SAMPLE_VEHICLES: AdminVehicle[] = [
  // Premium / SUV
  { id: 1, name: 'Fiat 500X 2024', brand: 'Fiat', model: '500X', year: 2024, category: 'SUV', transmission: 'Automatique', fuel: 'Essence', seats: 5, pricePerDay: 45, image: '/vehicles/fiat-500x/main.jpg', status: 'available' },
  // Citadines récentes
  { id: 2, name: 'Renault Clio 5 2022', brand: 'Renault', model: 'Clio 5', year: 2022, category: 'Citadine', transmission: 'Manuelle', fuel: 'Essence', seats: 5, pricePerDay: 35, image: '/vehicles/renault-clio5/main.jpg', status: 'available' },
  { id: 3, name: 'Peugeot 208 2022', brand: 'Peugeot', model: '208', year: 2022, category: 'Citadine', transmission: 'Manuelle', fuel: 'Essence', seats: 5, pricePerDay: 35, image: '/vehicles/peugeot-208/main.jpg', status: 'available' },
  { id: 4, name: 'Seat Ibiza 2019 Auto', brand: 'Seat', model: 'Ibiza', year: 2019, category: 'Citadine', transmission: 'Automatique', fuel: 'Essence', seats: 5, pricePerDay: 35, image: '/vehicles/seat-ibiza-2019-auto/main.jpg', status: 'available' },
  { id: 5, name: 'Seat Ibiza FR 2019', brand: 'Seat', model: 'Ibiza FR', year: 2019, category: 'Citadine', transmission: 'Manuelle', fuel: 'Essence', seats: 5, pricePerDay: 35, image: '/vehicles/seat-ibiza-fr/main.jpg', status: 'available' },
  { id: 6, name: 'Suzuki Swift 2022', brand: 'Suzuki', model: 'Swift', year: 2022, category: 'Citadine', transmission: 'Automatique', fuel: 'Essence', seats: 5, pricePerDay: 30, image: '/vehicles/suzuki-swift/main.jpg', status: 'available' },
  // Compactes
  { id: 7, name: 'VW Polo Star Plus 2019', brand: 'Volkswagen', model: 'Polo Star Plus', year: 2019, category: 'Citadine', transmission: 'Manuelle', fuel: 'Essence', seats: 5, pricePerDay: 32, image: '/vehicles/vw-polo-2019/main.jpg', status: 'available' },
  { id: 8, name: 'Clio 4 Limited 2019', brand: 'Renault', model: 'Clio 4 Limited', year: 2019, category: 'Citadine', transmission: 'Manuelle', fuel: 'Diesel', seats: 5, pricePerDay: 32, image: '/vehicles/renault-clio4-limited/main.jpg', status: 'available' },
  { id: 9, name: 'Seat Ibiza Style 2018', brand: 'Seat', model: 'Ibiza Style', year: 2018, category: 'Citadine', transmission: 'Manuelle', fuel: 'Essence', seats: 5, pricePerDay: 30, image: '/vehicles/seat-ibiza-style/main.jpg', status: 'available' },
  { id: 10, name: 'Fiat 500 Dolce Vita 2025', brand: 'Fiat', model: '500 Dolce Vita', year: 2025, category: 'Citadine', transmission: 'Manuelle', fuel: 'Hybride', seats: 4, pricePerDay: 30, image: '/vehicles/fiat-500-dolcevita/main.jpg', status: 'available' },
  { id: 11, name: 'Toyota Yaris Auto', brand: 'Toyota', model: 'Yaris', year: 2020, category: 'Citadine', transmission: 'Automatique', fuel: 'Essence', seats: 5, pricePerDay: 28, image: '/vehicles/toyota-yaris/main.jpg', status: 'available' },
  // Économiques
  { id: 12, name: 'Renault Symbol 2018', brand: 'Renault', model: 'Symbol', year: 2018, category: 'Berline', transmission: 'Manuelle', fuel: 'Essence', seats: 5, pricePerDay: 26, image: '/vehicles/renault-symbol/main.jpg', status: 'available' },
  { id: 13, name: 'Seat Ibiza Sol 2017', brand: 'Seat', model: 'Ibiza Sol', year: 2017, category: 'Citadine', transmission: 'Manuelle', fuel: 'Essence', seats: 5, pricePerDay: 27, image: '/vehicles/seat-ibiza-sol/main.jpg', status: 'available' },
  { id: 14, name: 'Kia Picanto 2019', brand: 'Kia', model: 'Picanto', year: 2019, category: 'Mini', transmission: 'Manuelle', fuel: 'Essence', seats: 4, pricePerDay: 25, image: '/vehicles/kia-picanto/main.jpg', status: 'available' },
  { id: 15, name: 'VW Polo Carat 2016', brand: 'Volkswagen', model: 'Polo Carat', year: 2016, category: 'Citadine', transmission: 'Manuelle', fuel: 'Essence', seats: 5, pricePerDay: 28, image: '/vehicles/vw-polo-carat/main.jpg', status: 'available' },
  { id: 16, name: 'Renault Clio 4 2016', brand: 'Renault', model: 'Clio 4', year: 2016, category: 'Citadine', transmission: 'Manuelle', fuel: 'Essence', seats: 5, pricePerDay: 25, image: '/vehicles/renault-clio4-2016/main.jpg', status: 'available' },
  { id: 17, name: 'Renault Clio 4 2013', brand: 'Renault', model: 'Clio 4', year: 2013, category: 'Citadine', transmission: 'Manuelle', fuel: 'Essence', seats: 5, pricePerDay: 22, image: '/vehicles/renault-clio4-2013/main.jpg', status: 'maintenance' },
  // Budget
  { id: 18, name: 'Nissan Micra 2015', brand: 'Nissan', model: 'Micra', year: 2015, category: 'Mini', transmission: 'Manuelle', fuel: 'Essence', seats: 5, pricePerDay: 20, image: '/vehicles/nissan-micra/main.jpg', status: 'available' },
  { id: 19, name: 'Ford Fiesta 2014', brand: 'Ford', model: 'Fiesta', year: 2014, category: 'Citadine', transmission: 'Manuelle', fuel: 'Essence', seats: 5, pricePerDay: 20, image: '/vehicles/ford-fiesta/main.jpg', status: 'available' },
  // New Vehicle
  { id: 20, name: 'Renault Clio 4 Rouge', brand: 'Renault', model: 'Clio 4', year: 2016, category: 'Citadine', transmission: 'Manuelle', fuel: 'Essence', seats: 5, pricePerDay: 25, image: '/vehicles/renault-clio4-2016/main.jpg', status: 'available' },
];

// Generate sample bookings based on current date
function generateSampleBookings(): AdminBooking[] {
  const today = new Date();
  const bookings: AdminBooking[] = [];

  const sampleClients = [
    { name: 'Ahmed Benali', phone: '0555123456' },
    { name: 'Fatima Zahra', phone: '0661234567' },
    { name: 'Mohamed Kaci', phone: '0770123456' },
    { name: 'Amina Hadj', phone: '0551234567' },
    { name: 'Youcef Mansouri', phone: '0662345678' },
    { name: 'Samira Boudiaf', phone: '0773456789' },
  ];

  // Create bookings spread across vehicles and dates
  const bookingConfigs = [
    { vehicleId: 1, daysFromToday: -2, duration: 5, status: 'active' as const },
    { vehicleId: 3, daysFromToday: 1, duration: 3, status: 'active' as const },
    { vehicleId: 5, daysFromToday: 0, duration: 4, status: 'active' as const },
    { vehicleId: 7, daysFromToday: 3, duration: 2, status: 'pending' as const },
    { vehicleId: 10, daysFromToday: -1, duration: 6, status: 'active' as const },
    { vehicleId: 13, daysFromToday: 2, duration: 3, status: 'pending' as const },
    { vehicleId: 16, daysFromToday: 4, duration: 5, status: 'active' as const },
    { vehicleId: 4, daysFromToday: -3, duration: 2, status: 'completed' as const },
  ];

  bookingConfigs.forEach((config, index) => {
    const client = sampleClients[index % sampleClients.length];
    const vehicle = SAMPLE_VEHICLES.find(v => v.id === config.vehicleId)!;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + config.daysFromToday);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + config.duration - 1);

    bookings.push({
      id: `sample-${index + 1}`,
      bookingReference: `HD-2024-11-${String(index + 1).padStart(4, '0')}`,
      status: config.status,
      source: index % 3 === 0 ? 'web' : index % 3 === 1 ? 'phone' : 'walk_in',
      departureDate: startDate.toISOString().split('T')[0],
      returnDate: endDate.toISOString().split('T')[0],
      rentalDays: config.duration,
      pickupLocation: 'Aéroport Oran',
      vehicleId: config.vehicleId,
      vehicleName: vehicle.name,
      assignedVehicleId: config.vehicleId,
      clientName: client.name,
      clientPhone: client.phone,
      totalPrice: config.duration * vehicle.pricePerDay,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  return bookings;
}

interface UseAdminDataReturn {
  // Data
  vehicles: AdminVehicle[];
  bookings: AdminBooking[];

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
  toggleVehicleMaintenance: (vehicleId: number) => Promise<void>;
  changeBookingStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
  assignVehicle: (bookingId: string, vehicleId: number) => Promise<void>;
  updateBookingDetails: (bookingId: string, updates: Partial<AdminBooking>) => Promise<void>;
  addWalkInBooking: (data: QuickAddData, vehicles: AdminVehicle[]) => Promise<void>;
}

export function useAdminData(): UseAdminDataReturn {
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial data fetch with fallback to sample data
  const loadData = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setIsRefreshing(true);
      setError(null);

      const [vehiclesData, bookingsData] = await Promise.all([
        fetchVehicles(),
        fetchBookings(),
      ]);

      // Use Supabase vehicles if available, otherwise fallback to sample
      const finalVehicles = vehiclesData.length > 0 ? vehiclesData : SAMPLE_VEHICLES;
      setVehicles(finalVehicles);

      // Use Supabase bookings if available, otherwise generate sample bookings
      if (bookingsData.length > 0) {
        setBookings(bookingsData);
      } else {
        // Generate sample bookings for demo
        console.log('Using sample bookings (no bookings in DB)');
        setBookings(generateSampleBookings());
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
      // Fallback to sample data on error
      console.log('Using sample data (Supabase error)');
      setVehicles(SAMPLE_VEHICLES);
      setBookings(generateSampleBookings());
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Set up real-time subscriptions
  useEffect(() => {
    const unsubscribeBookings = subscribeToBookings(
      // On insert
      (newBooking) => {
        setBookings((prev) => [newBooking, ...prev]);
      },
      // On update
      (updatedBooking) => {
        setBookings((prev) =>
          prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
        );
      },
      // On delete
      (deletedId) => {
        setBookings((prev) => prev.filter((b) => b.id !== deletedId));
      }
    );

    const unsubscribeVehicles = subscribeToVehicles((updatedVehicle) => {
      setVehicles((prev) =>
        prev.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v))
      );
    });

    return () => {
      unsubscribeBookings();
      unsubscribeVehicles();
    };
  }, []);

  // Refresh
  const refresh = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  // Toggle vehicle maintenance
  const toggleVehicleMaintenance = useCallback(async (vehicleId: number) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;

    const newStatus = vehicle.status === 'maintenance' ? 'available' : 'maintenance';

    // Optimistic update
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, status: newStatus } : v))
    );

    try {
      await updateVehicleStatus(vehicleId, newStatus);
    } catch (err) {
      // Revert on error
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicleId ? { ...v, status: vehicle.status } : v))
      );
      console.error('Error toggling maintenance:', err);
    }
  }, [vehicles]);

  // Change booking status
  const changeBookingStatus = useCallback(async (bookingId: string, status: BookingStatus) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    // Optimistic update
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );

    try {
      await updateBookingStatus(bookingId, status);

      // Send confirmation email when status changes to 'active'
      if (status === 'active' && booking.status !== 'active') {
        sendConfirmationEmail(booking);
      }
    } catch (err) {
      // Revert on error
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: booking.status } : b))
      );
      console.error('Error changing status:', err);
    }
  }, [bookings]);

  // Assign vehicle to booking
  const assignVehicle = useCallback(async (bookingId: string, vehicleId: number) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    // Optimistic update
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, assignedVehicleId: vehicleId } : b))
    );

    try {
      await assignVehicleToBooking(bookingId, vehicleId);
    } catch (err) {
      // Revert on error
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, assignedVehicleId: booking.assignedVehicleId } : b))
      );
      console.error('Error assigning vehicle:', err);
    }
  }, [bookings]);

  // Update booking details
  const updateBookingDetails = useCallback(async (bookingId: string, updates: Partial<AdminBooking>) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    // Optimistic update
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, ...updates } : b))
    );

    try {
      await updateBooking(bookingId, updates);
    } catch (err) {
      // Revert on error
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? booking : b))
      );
      console.error('Error updating booking:', err);
    }
  }, [bookings]);

  // Add walk-in booking
  const addWalkInBooking = useCallback(async (data: QuickAddData, vehiclesList: AdminVehicle[]) => {
    const vehicle = vehiclesList.find((v) => v.id === data.vehicleId);
    if (!vehicle) return;

    const departureDate = new Date(data.departureDate);
    const returnDate = new Date(data.returnDate);
    const days = Math.ceil((returnDate.getTime() - departureDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;

    const newBooking: Omit<AdminBooking, 'id' | 'createdAt' | 'updatedAt'> = {
      bookingReference: generateBookingReference(),
      status: 'pending',
      source: 'walk_in',
      departureDate: data.departureDate,
      returnDate: data.returnDate,
      rentalDays: days,
      pickupLocation: 'Direct',
      vehicleId: data.vehicleId,
      vehicleName: vehicle.name,
      assignedVehicleId: data.vehicleId,
      clientName: data.clientName,
      clientPhone: data.clientPhone || '',
      totalPrice: days * (data.pricePerDay || vehicle.pricePerDay),
    };

    try {
      const created = await createBooking(newBooking);
      setBookings((prev) => [created, ...prev]);
    } catch (err) {
      console.error('Error creating booking:', err);
      throw err;
    }
  }, []);

  return {
    vehicles,
    bookings,
    isLoading,
    isRefreshing,
    error,
    refresh,
    toggleVehicleMaintenance,
    changeBookingStatus,
    assignVehicle,
    updateBookingDetails,
    addWalkInBooking,
  };
}
