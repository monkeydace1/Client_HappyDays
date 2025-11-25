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

// ============================================
// FALLBACK SAMPLE DATA (when Supabase is empty/fails)
// ============================================

const SAMPLE_VEHICLES: AdminVehicle[] = [
  { id: 1, name: 'Clio 5 Noir', brand: 'Renault', model: 'Clio 5', category: 'Économique', transmission: 'Manuelle', fuel: 'Essence', seats: 5, pricePerDay: 3500, image: '/images/cars/clio5.jpg', status: 'available' },
  { id: 2, name: 'Clio 5 Blanc', brand: 'Renault', model: 'Clio 5', category: 'Économique', transmission: 'Manuelle', fuel: 'Essence', seats: 5, pricePerDay: 3500, image: '/images/cars/clio5.jpg', status: 'available' },
  { id: 3, name: 'Clio 5 Gris', brand: 'Renault', model: 'Clio 5', category: 'Économique', transmission: 'Manuelle', fuel: 'Essence', seats: 5, pricePerDay: 3500, image: '/images/cars/clio5.jpg', status: 'available' },
  { id: 4, name: 'Symbol Noir', brand: 'Renault', model: 'Symbol', category: 'Compacte', transmission: 'Manuelle', fuel: 'Diesel', seats: 5, pricePerDay: 4000, image: '/images/cars/symbol.jpg', status: 'available' },
  { id: 5, name: 'Symbol Blanc', brand: 'Renault', model: 'Symbol', category: 'Compacte', transmission: 'Manuelle', fuel: 'Diesel', seats: 5, pricePerDay: 4000, image: '/images/cars/symbol.jpg', status: 'available' },
  { id: 6, name: 'Symbol Gris', brand: 'Renault', model: 'Symbol', category: 'Compacte', transmission: 'Manuelle', fuel: 'Diesel', seats: 5, pricePerDay: 4000, image: '/images/cars/symbol.jpg', status: 'maintenance' },
  { id: 7, name: 'Peugeot 301 Noir', brand: 'Peugeot', model: '301', category: 'Berline', transmission: 'Manuelle', fuel: 'Diesel', seats: 5, pricePerDay: 4500, image: '/images/cars/301.jpg', status: 'available' },
  { id: 8, name: 'Peugeot 301 Blanc', brand: 'Peugeot', model: '301', category: 'Berline', transmission: 'Manuelle', fuel: 'Diesel', seats: 5, pricePerDay: 4500, image: '/images/cars/301.jpg', status: 'available' },
  { id: 9, name: 'Peugeot 301 Gris', brand: 'Peugeot', model: '301', category: 'Berline', transmission: 'Manuelle', fuel: 'Diesel', seats: 5, pricePerDay: 4500, image: '/images/cars/301.jpg', status: 'available' },
  { id: 10, name: 'Dacia Logan MCV Noir', brand: 'Dacia', model: 'Logan MCV', category: 'Familiale', transmission: 'Manuelle', fuel: 'Diesel', seats: 7, pricePerDay: 5000, image: '/images/cars/logan-mcv.jpg', status: 'available' },
  { id: 11, name: 'Dacia Logan MCV Blanc', brand: 'Dacia', model: 'Logan MCV', category: 'Familiale', transmission: 'Manuelle', fuel: 'Diesel', seats: 7, pricePerDay: 5000, image: '/images/cars/logan-mcv.jpg', status: 'available' },
  { id: 12, name: 'Dacia Logan MCV Gris', brand: 'Dacia', model: 'Logan MCV', category: 'Familiale', transmission: 'Manuelle', fuel: 'Diesel', seats: 7, pricePerDay: 5000, image: '/images/cars/logan-mcv.jpg', status: 'available' },
  { id: 13, name: 'Dacia Duster Noir', brand: 'Dacia', model: 'Duster', category: 'SUV', transmission: 'Manuelle', fuel: 'Diesel', seats: 5, pricePerDay: 6000, image: '/images/cars/duster.jpg', status: 'available' },
  { id: 14, name: 'Dacia Duster Blanc', brand: 'Dacia', model: 'Duster', category: 'SUV', transmission: 'Manuelle', fuel: 'Diesel', seats: 5, pricePerDay: 6000, image: '/images/cars/duster.jpg', status: 'available' },
  { id: 15, name: 'Dacia Duster Gris', brand: 'Dacia', model: 'Duster', category: 'SUV', transmission: 'Manuelle', fuel: 'Diesel', seats: 5, pricePerDay: 6000, image: '/images/cars/duster.jpg', status: 'available' },
  { id: 16, name: 'Peugeot 3008 Noir', brand: 'Peugeot', model: '3008', category: 'Premium', transmission: 'Automatique', fuel: 'Diesel', seats: 5, pricePerDay: 8000, image: '/images/cars/3008.jpg', status: 'available' },
  { id: 17, name: 'Peugeot 3008 Blanc', brand: 'Peugeot', model: '3008', category: 'Premium', transmission: 'Automatique', fuel: 'Diesel', seats: 5, pricePerDay: 8000, image: '/images/cars/3008.jpg', status: 'available' },
  { id: 18, name: 'Peugeot 3008 Gris', brand: 'Peugeot', model: '3008', category: 'Premium', transmission: 'Automatique', fuel: 'Diesel', seats: 5, pricePerDay: 8000, image: '/images/cars/3008.jpg', status: 'available' },
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
    { vehicleId: 1, daysFromToday: -2, duration: 5, status: 'confirmed' as const },
    { vehicleId: 3, daysFromToday: 1, duration: 3, status: 'confirmed' as const },
    { vehicleId: 5, daysFromToday: 0, duration: 4, status: 'confirmed' as const },
    { vehicleId: 7, daysFromToday: 3, duration: 2, status: 'pending' as const },
    { vehicleId: 10, daysFromToday: -1, duration: 6, status: 'confirmed' as const },
    { vehicleId: 13, daysFromToday: 2, duration: 3, status: 'pending' as const },
    { vehicleId: 16, daysFromToday: 4, duration: 5, status: 'confirmed' as const },
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
      status: 'confirmed',
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
      totalPrice: days * vehicle.pricePerDay,
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
