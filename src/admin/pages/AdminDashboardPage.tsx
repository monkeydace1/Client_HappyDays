import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { GanttChart } from '../components/calendar/GanttChart';
import { QuickAddModal } from '../components/calendar/QuickAddModal';
import { BookingDetailsModal } from '../components/calendar/BookingDetailsModal';
import { ReservationList } from '../components/reservations/ReservationList';
import { VehicleGrid } from '../components/vehicles/VehicleGrid';
import { useAdminStore } from '../store/adminStore';
import { useAdminData } from '../hooks/useAdminData';
import type { DashboardKPIs, QuickAddData, BookingStatus } from '../types/admin';

export function AdminDashboardPage() {
  const { activeTab, quickAddModalOpen, quickAddDate, quickAddVehicleId,
          bookingDetailsModalOpen, selectedBookingId, openQuickAdd, closeQuickAdd,
          openBookingDetails, closeBookingDetails } = useAdminStore();

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
  } = useAdminData();

  // Calculate KPIs
  const kpis: DashboardKPIs = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const availableVehicles = vehicles.filter(v => v.status === 'available');

    // Get vehicles that are booked today
    const bookedVehicleIds = bookings
      .filter(b => b.status === 'confirmed' && b.departureDate <= today && b.returnDate >= today)
      .map(b => b.assignedVehicleId || b.vehicleId);

    const actuallyAvailable = availableVehicles.filter(v => !bookedVehicleIds.includes(v.id));

    return {
      totalCars: vehicles.length,
      availableCars: actuallyAvailable.length,
      activeReservations: bookings.filter(b => b.status === 'confirmed').length,
      pendingReservations: bookings.filter(b => b.status === 'pending').length,
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

  const handleAssignVehicle = useCallback(async (bookingId: string, vehicleId: number) => {
    await assignVehicle(bookingId, vehicleId);
  }, [assignVehicle]);

  const handleToggleMaintenance = useCallback(async (vehicleId: number) => {
    await toggleVehicleMaintenance(vehicleId);
  }, [toggleVehicleMaintenance]);

  const handleBookingUpdate = useCallback(async (bookingId: string, updates: Partial<{ clientName: string; clientPhone: string; departureDate: string; returnDate: string; rentalDays: number; totalPrice: number }>) => {
    await updateBookingDetails(bookingId, updates);
  }, [updateBookingDetails]);

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
          />
        );
      case 'reservations':
        return (
          <ReservationList
            bookings={bookings}
            onBookingClick={handleBookingClick}
          />
        );
      case 'vehicles':
        return (
          <VehicleGrid
            vehicles={vehicles}
            onToggleMaintenance={handleToggleMaintenance}
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
        vehicles={vehicles}
        onStatusChange={handleStatusChange}
        onBookingUpdate={handleBookingUpdate}
        onAssignVehicle={handleAssignVehicle}
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
