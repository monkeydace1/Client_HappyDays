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

  // Initial data fetch
  const loadData = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setIsRefreshing(true);
      setError(null);

      const [vehiclesData, bookingsData] = await Promise.all([
        fetchVehicles(),
        fetchBookings(),
      ]);

      setVehicles(vehiclesData);
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error loading admin data:', err);
      setError('Erreur lors du chargement des données');
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
