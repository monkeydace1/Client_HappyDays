import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar, Car, Phone, Clock, Check, XCircle, Sparkles, Plus, Trash2, CheckSquare, Square, MinusSquare } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { AdminBooking, BookingStatus, ReservationFilters } from '../../types/admin';

interface ReservationListProps {
  bookings: AdminBooking[];
  onBookingClick: (bookingId: string) => void;
  onAddClick?: () => void;
  onBulkDelete?: (bookingIds: string[]) => Promise<void>;
  onBulkStatusChange?: (bookingIds: string[], status: BookingStatus) => Promise<void>;
}

// Status config
// new = purple, pending = orange, active = green, completed = blue, cancelled = red
const statusConfig: Record<BookingStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  new: {
    label: 'Nouveau',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: <Sparkles className="w-4 h-4" />,
  },
  pending: {
    label: 'En attente',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: <Clock className="w-4 h-4" />,
  },
  active: {
    label: 'En cours',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: <Car className="w-4 h-4" />,
  },
  completed: {
    label: 'Terminée',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: <Check className="w-4 h-4" />,
  },
  cancelled: {
    label: 'Annulée',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: <XCircle className="w-4 h-4" />,
  },
};

export function ReservationList({ bookings, onBookingClick, onAddClick, onBulkDelete, onBulkStatusChange }: ReservationListProps) {
  const [filters, setFilters] = useState<ReservationFilters>({
    search: '',
    status: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Selection helpers
  const allSelected = sortedBookings.length > 0 && selectedIds.size === sortedBookings.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < sortedBookings.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedBookings.map(b => b.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (!onBulkDelete || selectedIds.size === 0) return;

    const confirmed = window.confirm(`Supprimer ${selectedIds.size} réservation(s) ?`);
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      await onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
      setIsSelectionMode(false);
    } catch (err) {
      console.error('Bulk delete error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkStatusChange = async (status: BookingStatus) => {
    if (!onBulkStatusChange || selectedIds.size === 0) return;

    setIsProcessing(true);
    try {
      await onBulkStatusChange(Array.from(selectedIds), status);
      setSelectedIds(new Set());
      setIsSelectionMode(false);
    } catch (err) {
      console.error('Bulk status change error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Bulk Action Bar - Shows when items are selected */}
      <AnimatePresence>
        {isSelectionMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-primary text-white border-b border-primary-dark overflow-hidden"
          >
            <div className="px-3 sm:px-4 py-3 space-y-3">
              {/* Selection header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleSelectAll}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    {allSelected ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : someSelected ? (
                      <MinusSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                  <span className="font-medium">
                    {selectedIds.size} sélectionné{selectedIds.size > 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  onClick={exitSelectionMode}
                  className="text-sm hover:underline"
                >
                  Annuler
                </button>
              </div>

              {/* Action buttons */}
              {selectedIds.size > 0 && (
                <div className="flex flex-wrap gap-2">
                  {/* Status change buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {(['active', 'pending', 'completed', 'cancelled'] as BookingStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleBulkStatusChange(status)}
                        disabled={isProcessing}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors
                          ${statusConfig[status].bgColor} ${statusConfig[status].color}
                          hover:opacity-80 disabled:opacity-50`}
                      >
                        {statusConfig[status].label}
                      </button>
                    ))}
                  </div>

                  {/* Delete button */}
                  {onBulkDelete && (
                    <button
                      onClick={handleBulkDelete}
                      disabled={isProcessing}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600
                               text-white rounded-lg text-xs font-medium transition-colors
                               disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Supprimer
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filter Bar */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3 space-y-2 sm:space-y-3">
        {/* Search with Add Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Rechercher..."
              className="w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 rounded-xl border border-gray-200
                       focus:border-primary focus:ring-2 focus:ring-primary/20
                       outline-none transition-all text-sm sm:text-base"
            />
          </div>
          {!isSelectionMode && (
            <>
              {/* Selection mode toggle */}
              <button
                onClick={() => setIsSelectionMode(true)}
                className="flex items-center justify-center p-2.5 sm:p-3 bg-gray-100 hover:bg-gray-200
                         text-gray-600 rounded-xl transition-all touch-manipulation"
                title="Mode sélection"
              >
                <CheckSquare className="w-5 h-5" />
              </button>
              {onAddClick && (
                <button
                  onClick={onAddClick}
                  className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 bg-primary hover:bg-primary-hover
                           text-white font-medium rounded-xl transition-all touch-manipulation whitespace-nowrap text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Ajouter</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors touch-manipulation
              ${showFilters ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filtres
          </button>

          <span className="text-xs sm:text-sm text-gray-500">
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
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Statut</label>
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'new', 'pending', 'active', 'completed', 'cancelled'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilters({ ...filters, status })}
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation
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
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Du</label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200
                           focus:border-primary focus:ring-2 focus:ring-primary/20
                           outline-none transition-all text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Au</label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200
                           focus:border-primary focus:ring-2 focus:ring-primary/20
                           outline-none transition-all text-xs sm:text-sm"
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
            const status = statusConfig[booking.status] || statusConfig['active'];
            const isSelected = selectedIds.has(booking.id);

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`relative bg-white rounded-xl shadow-sm border transition-all
                  ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100 hover:shadow-md'}`}
              >
                <div className="flex">
                  {/* Checkbox area - only in selection mode */}
                  {isSelectionMode && (
                    <button
                      onClick={() => toggleSelect(booking.id)}
                      className="flex items-center justify-center w-12 border-r border-gray-100
                               hover:bg-gray-50 transition-colors touch-manipulation"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-primary" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  )}

                  {/* Booking content */}
                  <button
                    onClick={() => isSelectionMode ? toggleSelect(booking.id) : onBookingClick(booking.id)}
                    className="flex-1 p-4 text-left touch-manipulation"
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
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
