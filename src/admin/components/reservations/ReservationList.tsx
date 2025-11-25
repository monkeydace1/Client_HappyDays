import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, Car, Phone, Clock, Check, XCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { AdminBooking, BookingStatus, ReservationFilters } from '../../types/admin';

interface ReservationListProps {
  bookings: AdminBooking[];
  onBookingClick: (bookingId: string) => void;
}

// Status config
const statusConfig: Record<BookingStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  pending: {
    label: 'En attente',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    icon: <Clock className="w-4 h-4" />,
  },
  confirmed: {
    label: 'Confirmée',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: <Check className="w-4 h-4" />,
  },
  completed: {
    label: 'Terminée',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: <Check className="w-4 h-4" />,
  },
  cancelled: {
    label: 'Annulée',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    icon: <XCircle className="w-4 h-4" />,
  },
};

export function ReservationList({ bookings, onBookingClick }: ReservationListProps) {
  const [filters, setFilters] = useState<ReservationFilters>({
    search: '',
    status: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          booking.clientName.toLowerCase().includes(searchLower) ||
          booking.bookingReference.toLowerCase().includes(searchLower) ||
          booking.vehicleName.toLowerCase().includes(searchLower) ||
          booking.clientPhone?.includes(filters.search);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== 'all' && booking.status !== filters.status) {
        return false;
      }

      // Date filters
      if (filters.dateFrom) {
        if (booking.departureDate < filters.dateFrom) return false;
      }
      if (filters.dateTo) {
        if (booking.departureDate > filters.dateTo) return false;
      }

      return true;
    });
  }, [bookings, filters]);

  // Sort by date (newest first)
  const sortedBookings = useMemo(() => {
    return [...filteredBookings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filteredBookings]);

  return (
    <div className="flex flex-col h-full">
      {/* Search & Filter Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Rechercher par nom, référence, véhicule..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200
                     focus:border-primary focus:ring-2 focus:ring-primary/20
                     outline-none transition-all text-base"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors touch-manipulation
              ${showFilters ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            <Filter className="w-4 h-4" />
            Filtres
          </button>

          <span className="text-sm text-gray-500">
            {sortedBookings.length} réservation{sortedBookings.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-3 pt-2"
          >
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Statut</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilters({ ...filters, status })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors touch-manipulation
                      ${filters.status === status
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {status === 'all' ? 'Tous' : statusConfig[status].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Du</label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200
                           focus:border-primary focus:ring-2 focus:ring-primary/20
                           outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Au</label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200
                           focus:border-primary focus:ring-2 focus:ring-primary/20
                           outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => setFilters({ search: '', status: 'all' })}
              className="text-sm text-primary hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </motion.div>
        )}
      </div>

      {/* Booking List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucune réservation trouvée</p>
          </div>
        ) : (
          sortedBookings.map((booking, index) => {
            const status = statusConfig[booking.status];
            return (
              <motion.button
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onBookingClick(booking.id)}
                className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100
                         hover:shadow-md transition-all text-left touch-manipulation"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs font-mono text-gray-400">{booking.bookingReference}</span>
                    <h3 className="font-semibold text-gray-900">{booking.clientName}</h3>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                    {status.icon}
                    {status.label}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-gray-400" />
                    <span>{booking.vehicleName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                      {format(parseISO(booking.departureDate), 'dd MMM', { locale: fr })} →{' '}
                      {format(parseISO(booking.returnDate), 'dd MMM', { locale: fr })}
                    </span>
                  </div>
                  {booking.clientPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{booking.clientPhone}</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {booking.source === 'web' ? 'Site web' : booking.source === 'walk_in' ? 'Direct' : 'Téléphone'}
                  </span>
                  <span className="font-bold text-primary">{booking.totalPrice}€</span>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}
