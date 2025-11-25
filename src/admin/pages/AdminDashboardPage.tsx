import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { GanttChart } from '../components/calendar/GanttChart';
import { QuickAddModal } from '../components/calendar/QuickAddModal';
import { BookingDetailsModal } from '../components/calendar/BookingDetailsModal';
import { ReservationList } from '../components/reservations/ReservationList';
import { VehicleGrid } from '../components/vehicles/VehicleGrid';
import { useAdminStore } from '../store/adminStore';
import { adminVehicles } from '../data/adminVehicleData';
import type { AdminBooking, DashboardKPIs, QuickAddData, BookingStatus, AdminVehicle } from '../types/admin';

// Sample bookings data for demo
const generateSampleBookings = (): AdminBooking[] => {
  const today = new Date();
  const bookings: AdminBooking[] = [];

  // Generate some sample bookings
  const sampleData = [
    { clientName: 'Mohamed Ben Ali', vehicleId: 1, daysFromNow: 0, duration: 3, status: 'confirmed' as const },
    { clientName: 'Karim Hadj', vehicleId: 2, daysFromNow: 1, duration: 5, status: 'pending' as const },
    { clientName: 'Sarah Boumediene', vehicleId: 4, daysFromNow: 2, duration: 2, status: 'confirmed' as const },
    { clientName: 'Ahmed Mansouri', vehicleId: 7, daysFromNow: -1, duration: 4, status: 'confirmed' as const },
    { clientName: 'Fatima Zerhouni', vehicleId: 10, daysFromNow: 3, duration: 7, status: 'pending' as const },
    { clientName: 'Youssef Benali', vehicleId: 13, daysFromNow: 5, duration: 3, status: 'confirmed' as const },
    { clientName: 'Nadia Khelifi', vehicleId: 5, daysFromNow: 0, duration: 2, status: 'confirmed' as const },
    { clientName: 'Omar Saidi', vehicleId: 8, daysFromNow: 4, duration: 4, status: 'pending' as const },
  ];

  sampleData.forEach((data, index) => {
    const departureDate = new Date(today);
    departureDate.setDate(departureDate.getDate() + data.daysFromNow);
    const returnDate = new Date(departureDate);
    returnDate.setDate(returnDate.getDate() + data.duration);

    const vehicle = adminVehicles.find(v => v.id === data.vehicleId);
    if (!vehicle) return;

    bookings.push({
      id: `booking-${index + 1}`,
      bookingReference: `HD-2024-11-${String(index + 1).padStart(4, '0')}`,
      status: data.status,
      source: index % 3 === 0 ? 'walk_in' : 'web',
      departureDate: departureDate.toISOString().split('T')[0],
      returnDate: returnDate.toISOString().split('T')[0],
      rentalDays: data.duration,
      pickupLocation: 'Aéroport International d\'Oran Ahmed Ben Bella',
      vehicleId: data.vehicleId,
      vehicleName: vehicle.name,
      assignedVehicleId: data.status === 'pending' && index % 2 === 0 ? undefined : data.vehicleId,
      clientName: data.clientName,
      clientPhone: `055${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      clientEmail: `${data.clientName.toLowerCase().replace(' ', '.')}@email.com`,
      totalPrice: data.duration * vehicle.pricePerDay,
      createdAt: new Date(today.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  return bookings;
};

export function AdminDashboardPage() {
  const { activeTab, quickAddModalOpen, quickAddDate, quickAddVehicleId,
          bookingDetailsModalOpen, selectedBookingId, openQuickAdd, closeQuickAdd,
          openBookingDetails, closeBookingDetails } = useAdminStore();

  // Local state for data (in real app, this would come from Supabase)
  const [bookings, setBookings] = useState<AdminBooking[]>(generateSampleBookings);
  const [vehicles, setVehicles] = useState<AdminVehicle[]>(adminVehicles);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, []);

  const handleCellClick = useCallback((date: string, vehicleId: number) => {
    openQuickAdd(date, vehicleId);
  }, [openQuickAdd]);

  const handleBookingClick = useCallback((bookingId: string) => {
    openBookingDetails(bookingId);
  }, [openBookingDetails]);

  const handleQuickAddSubmit = useCallback((data: QuickAddData) => {
    const vehicle = vehicles.find(v => v.id === data.vehicleId);
    if (!vehicle) return;

    const departureDate = new Date(data.departureDate);
    const returnDate = new Date(data.returnDate);
    const days = Math.ceil((returnDate.getTime() - departureDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;

    const newBooking: AdminBooking = {
      id: `booking-${Date.now()}`,
      bookingReference: `HD-2024-11-${String(bookings.length + 1).padStart(4, '0')}`,
      status: 'confirmed', // Walk-ins are directly confirmed
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBookings(prev => [...prev, newBooking]);
  }, [bookings.length, vehicles]);

  const handleStatusChange = useCallback((bookingId: string, newStatus: BookingStatus) => {
    setBookings(prev => prev.map(b =>
      b.id === bookingId ? { ...b, status: newStatus, updatedAt: new Date().toISOString() } : b
    ));
    closeBookingDetails();
  }, [closeBookingDetails]);

  const handleAssignVehicle = useCallback((bookingId: string, vehicleId: number) => {
    setBookings(prev => prev.map(b =>
      b.id === bookingId ? { ...b, assignedVehicleId: vehicleId, updatedAt: new Date().toISOString() } : b
    ));
  }, []);

  const handleToggleMaintenance = useCallback((vehicleId: number) => {
    setVehicles(prev => prev.map(v =>
      v.id === vehicleId
        ? { ...v, status: v.status === 'maintenance' ? 'available' : 'maintenance' }
        : v
    ));
  }, []);

  const handleBookingUpdate = useCallback((bookingId: string, updates: Partial<AdminBooking>) => {
    setBookings(prev => prev.map(b =>
      b.id === bookingId ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
    ));
  }, []);

  const handleNewReservation = useCallback(() => {
    // Open QuickAdd with today's date and no pre-selected vehicle
    const today = new Date().toISOString().split('T')[0];
    openQuickAdd(today, 0);
  }, [openQuickAdd]);

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
    <AdminLayout kpis={kpis} onRefresh={handleRefresh} isRefreshing={isRefreshing}>
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
