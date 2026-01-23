import { useMemo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { GanttChart } from '../components/calendar/GanttChart';
import { QuickAddModal } from '../components/calendar/QuickAddModal';
import { BookingDetailsModal } from '../components/calendar/BookingDetailsModal';
import { ReservationList } from '../components/reservations/ReservationList';
import { VehicleGrid } from '../components/vehicles/VehicleGrid';
import { VehicleAddModal } from '../components/vehicles/VehicleAddModal';
import { useAdminStore } from '../store/adminStore';
import { useAdminData } from '../hooks/useAdminData';
import type { DashboardKPIs, QuickAddData, BookingStatus, AdminVehicle } from '../types/admin';

export function AdminDashboardPage() {
  const { activeTab, quickAddModalOpen, quickAddDate, quickAddVehicleId,
          bookingDetailsModalOpen, selectedBookingId, openQuickAdd, closeQuickAdd,
          openBookingDetails, closeBookingDetails } = useAdminStore();

  // Vehicle add modal state
  const [vehicleAddModalOpen, setVehicleAddModalOpen] = useState(false);

  // Use real data from Supabase
  const {
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
    addVehicle,
    deleteVehicle,
    bulkDeleteBookings,
    bulkChangeStatus,
  } = useAdminData();

  // Calculate KPIs
  const kpis: DashboardKPIs = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const availableVehicles = vehicles.filter(v => v.status === 'available');

    // Get vehicles that are booked today
    const bookedVehicleIds = bookings
      .filter(b => b.status === 'active' && b.departureDate <= today && b.returnDate >= today)
      .map(b => b.assignedVehicleId || b.vehicleId);

    const actuallyAvailable = availableVehicles.filter(v => !bookedVehicleIds.includes(v.id));

    return {
      totalCars: vehicles.length,
      availableCars: actuallyAvailable.length,
      activeReservations: bookings.filter(b => b.status === 'active').length,
      pendingReservations: bookings.filter(b => b.status === 'pending' || b.status === 'new').length,
    };
  }, [bookings, vehicles]);

  // Get selected booking for details modal
  const selectedBooking = useMemo(
    () => bookings.find(b => b.id === selectedBookingId) || null,
    [bookings, selectedBookingId]
  );

  // Handlers
  const handleCellClick = useCallback((date: string, vehicleId: number) => {
    openQuickAdd(date, vehicleId);
  }, [openQuickAdd]);

  const handleBookingClick = useCallback((bookingId: string) => {
    openBookingDetails(bookingId);
  }, [openBookingDetails]);

  const handleQuickAddSubmit = useCallback(async (data: QuickAddData) => {
    try {
      await addWalkInBooking(data, vehicles);
    } catch (err) {
      console.error('Error adding booking:', err);
    }
  }, [addWalkInBooking, vehicles]);

  const handleStatusChange = useCallback(async (bookingId: string, newStatus: BookingStatus) => {
    await changeBookingStatus(bookingId, newStatus);
    closeBookingDetails();
  }, [changeBookingStatus, closeBookingDetails]);

  // Status change from calendar (doesn't close modal)
  const handleCalendarStatusChange = useCallback(async (bookingId: string, newStatus: BookingStatus) => {
    await changeBookingStatus(bookingId, newStatus);
  }, [changeBookingStatus]);

  const handleAssignVehicle = useCallback(async (bookingId: string, vehicleId: number) => {
    await assignVehicle(bookingId, vehicleId);
  }, [assignVehicle]);

  const handleToggleMaintenance = useCallback(async (vehicleId: number) => {
    await toggleVehicleMaintenance(vehicleId);
  }, [toggleVehicleMaintenance]);

  const handleAddVehicle = useCallback(async (vehicle: Omit<AdminVehicle, 'id'>) => {
    await addVehicle(vehicle);
  }, [addVehicle]);

  const handleDeleteVehicle = useCallback(async (vehicleId: number) => {
    await deleteVehicle(vehicleId);
  }, [deleteVehicle]);

  const handleBookingUpdate = useCallback(async (bookingId: string, updates: Partial<{ clientName: string; clientPhone: string; departureDate: string; returnDate: string; rentalDays: number; totalPrice: number }>) => {
    await updateBookingDetails(bookingId, updates);
  }, [updateBookingDetails]);

  // Handle booking move from drag and drop in calendar
  const handleBookingMove = useCallback(async (
    bookingId: string,
    newDepartureDate: string,
    newReturnDate: string,
    newVehicleId?: number
  ) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Calculate new rental days
    const departure = new Date(newDepartureDate);
    const returnDate = new Date(newReturnDate);
    const newDays = Math.ceil((returnDate.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24)) || 1;

    // Calculate new total price (keep same daily rate)
    const dailyRate = Math.round(booking.totalPrice / booking.rentalDays);
    const newTotalPrice = dailyRate * newDays;

    // Prepare updates
    const updates: Partial<typeof booking> = {
      departureDate: newDepartureDate,
      returnDate: newReturnDate,
      rentalDays: newDays,
      totalPrice: newTotalPrice,
    };

    // If vehicle changed, update assigned vehicle
    if (newVehicleId) {
      updates.assignedVehicleId = newVehicleId;
      // Update vehicle name too
      const newVehicle = vehicles.find(v => v.id === newVehicleId);
      if (newVehicle) {
        updates.vehicleName = newVehicle.name;
      }
    }

    await updateBookingDetails(bookingId, updates);
  }, [bookings, vehicles, updateBookingDetails]);

  // Handle single booking deletion from calendar
  const handleDeleteBooking = useCallback(async (bookingId: string) => {
    await bulkDeleteBookings([bookingId]);
  }, [bulkDeleteBookings]);

  const handleNewReservation = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    openQuickAdd(today, 0);
  }, [openQuickAdd]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-4">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'calendar':
        return (
          <GanttChart
            vehicles={vehicles}
            bookings={bookings}
            onCellClick={handleCellClick}
            onBookingClick={handleBookingClick}
            onAssignVehicle={handleAssignVehicle}
            onStatusChange={handleCalendarStatusChange}
            onBookingMove={handleBookingMove}
            onDeleteBooking={handleDeleteBooking}
          />
        );
      case 'reservations':
        return (
          <ReservationList
            bookings={bookings}
            onBookingClick={handleBookingClick}
            onAddClick={handleNewReservation}
            onBulkDelete={bulkDeleteBookings}
            onBulkStatusChange={bulkChangeStatus}
            onStatusChange={handleCalendarStatusChange}
          />
        );
      case 'vehicles':
        return (
          <VehicleGrid
            vehicles={vehicles}
            onToggleMaintenance={handleToggleMaintenance}
            onAddVehicle={() => setVehicleAddModalOpen(true)}
            onDeleteVehicle={handleDeleteVehicle}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout kpis={kpis} onRefresh={refresh} isRefreshing={isRefreshing}>
      {renderContent()}

      {/* QuickAdd Modal */}
      <QuickAddModal
        isOpen={quickAddModalOpen}
        onClose={closeQuickAdd}
        onSubmit={handleQuickAddSubmit}
        initialDate={quickAddDate}
        initialVehicleId={quickAddVehicleId}
        vehicles={vehicles}
      />

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={bookingDetailsModalOpen}
        onClose={closeBookingDetails}
        booking={selectedBooking}
        onStatusChange={handleStatusChange}
        onBookingUpdate={handleBookingUpdate}
        onDelete={handleDeleteBooking}
      />

      {/* Vehicle Add Modal */}
      <VehicleAddModal
        isOpen={vehicleAddModalOpen}
        onClose={() => setVehicleAddModalOpen(false)}
        onSubmit={handleAddVehicle}
      />

      {/* Floating Action Button - New Reservation */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleNewReservation}
        className="fixed right-4 bottom-20 md:bottom-6 w-14 h-14 bg-accent hover:bg-accent-hover
                 text-white rounded-full shadow-lg shadow-accent/40 flex items-center justify-center
                 z-40 touch-manipulation"
        title="Nouvelle réservation"
      >
        <Plus className="w-7 h-7" />
      </motion.button>
    </AdminLayout>
  );
}
