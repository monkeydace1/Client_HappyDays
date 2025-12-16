import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Calendar, Car, MapPin, MessageCircle, Check, Clock, XCircle, Edit3, Save } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { AdminBooking, BookingStatus, AdminVehicle } from '../../types/admin';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: AdminBooking | null;
  vehicles: AdminVehicle[];
  onStatusChange: (bookingId: string, newStatus: BookingStatus) => void;
  onBookingUpdate: (bookingId: string, updates: Partial<AdminBooking>) => void;
  onAssignVehicle: (bookingId: string, vehicleId: number) => void;
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

export function BookingDetailsModal({
  isOpen,
  onClose,
  booking,
  vehicles,
  onStatusChange,
  onBookingUpdate,
  onAssignVehicle,
}: BookingDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    clientName: '',
    clientPhone: '',
    departureDate: '',
    returnDate: '',
  });
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  // Reset edit state when booking changes
  useEffect(() => {
    if (booking) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditData({
        clientName: booking.clientName,
        clientPhone: booking.clientPhone || '',
        departureDate: booking.departureDate,
        returnDate: booking.returnDate,
      });
      setSelectedVehicleId(booking.assignedVehicleId || booking.vehicleId);
      setIsEditing(false);
    }
  }, [booking]);

  if (!booking) return null;

  const status = statusConfig[booking.status];

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Bonjour ${booking.clientName}, concernant votre réservation ${booking.bookingReference} du ${format(parseISO(booking.departureDate), 'dd/MM/yyyy')} au ${format(parseISO(booking.returnDate), 'dd/MM/yyyy')} pour ${booking.vehicleName}.`
    );
    window.open(`https://wa.me/${booking.clientPhone?.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleSave = () => {
    // Calculate new rental days and price
    const departure = new Date(editData.departureDate);
    const returnDate = new Date(editData.returnDate);
    const days = Math.ceil((returnDate.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    const pricePerDay = booking.totalPrice / booking.rentalDays;

    onBookingUpdate(booking.id, {
      clientName: editData.clientName,
      clientPhone: editData.clientPhone,
      departureDate: editData.departureDate,
      returnDate: editData.returnDate,
      rentalDays: days,
      totalPrice: Math.round(days * pricePerDay),
    });

    // Update assigned vehicle if changed
    if (selectedVehicleId && selectedVehicleId !== (booking.assignedVehicleId || booking.vehicleId)) {
      onAssignVehicle(booking.id, selectedVehicleId);
    }

    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      clientName: booking.clientName,
      clientPhone: booking.clientPhone || '',
      departureDate: booking.departureDate,
      returnDate: booking.returnDate,
    });
    setIsEditing(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal - Bottom sheet on mobile */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2
                     md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full
                     bg-white rounded-t-2xl md:rounded-2xl z-50 max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{booking.bookingReference}</h2>
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${status.bgColor} ${status.color}`}>
                  {status.icon}
                  {status.label}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
                    title="Modifier"
                  >
                    <Edit3 className="w-5 h-5 text-primary" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
                      title="Annuler"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                    <button
                      onClick={handleSave}
                      className="p-2 hover:bg-green-100 rounded-full transition-colors touch-manipulation"
                      title="Enregistrer"
                    >
                      <Save className="w-5 h-5 text-green-600" />
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
              {/* Client Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Client</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.clientName}
                        onChange={(e) => setEditData({ ...editData, clientName: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                        placeholder="Nom du client"
                      />
                    ) : (
                      <span className="text-gray-900">{booking.clientName}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.clientPhone}
                        onChange={(e) => setEditData({ ...editData, clientPhone: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                        placeholder="Téléphone"
                      />
                    ) : booking.clientPhone ? (
                      <a
                        href={`tel:${booking.clientPhone}`}
                        className="text-primary hover:underline"
                      >
                        {booking.clientPhone}
                      </a>
                    ) : (
                      <span className="text-gray-400">Non renseigné</span>
                    )}
                  </div>
                  {booking.clientEmail && !isEditing && (
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 text-gray-400 text-center">@</span>
                      <a
                        href={`mailto:${booking.clientEmail}`}
                        className="text-primary hover:underline"
                      >
                        {booking.clientEmail}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Vehicle & Dates */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Réservation</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Car className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-gray-900 mb-1">{booking.vehicleName}</div>
                      {isEditing && (
                        <select
                          value={selectedVehicleId || ''}
                          onChange={(e) => setSelectedVehicleId(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                        >
                          <option value="">Sélectionner un véhicule</option>
                          {vehicles
                            .filter(v => v.status === 'available')
                            .map(v => (
                              <option key={v.id} value={v.id}>
                                #{v.id} - {v.name} ({v.pricePerDay}€/j)
                              </option>
                            ))}
                        </select>
                      )}
                      {!isEditing && booking.assignedVehicleId && booking.assignedVehicleId !== booking.vehicleId && (
                        <div className="text-xs text-primary mt-1">
                          Assigné: #{booking.assignedVehicleId}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {isEditing ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="date"
                          value={editData.departureDate}
                          onChange={(e) => setEditData({ ...editData, departureDate: e.target.value })}
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                        />
                        <span className="text-gray-400 self-center">→</span>
                        <input
                          type="date"
                          value={editData.returnDate}
                          onChange={(e) => setEditData({ ...editData, returnDate: e.target.value })}
                          min={editData.departureDate}
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                        />
                      </div>
                    ) : (
                      <span className="text-gray-900">
                        {format(parseISO(booking.departureDate), 'dd MMM yyyy', { locale: fr })} →{' '}
                        {format(parseISO(booking.returnDate), 'dd MMM yyyy', { locale: fr })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{booking.pickupLocation}</span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex justify-between items-center bg-primary-light rounded-xl p-4">
                <span className="font-medium text-gray-700">Total</span>
                <div className="text-right">
                  {isEditing && editData.departureDate && editData.returnDate ? (
                    <>
                      <span className="text-2xl font-bold text-primary">
                        {(() => {
                          const days = Math.ceil(
                            (new Date(editData.returnDate).getTime() - new Date(editData.departureDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                          ) || 1;
                          const pricePerDay = booking.totalPrice / booking.rentalDays;
                          return Math.round(days * pricePerDay);
                        })()}€
                      </span>
                      <p className="text-xs text-gray-500">
                        {Math.ceil(
                          (new Date(editData.returnDate).getTime() - new Date(editData.departureDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                        ) || 1} jours
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-primary">{booking.totalPrice}€</span>
                      <p className="text-xs text-gray-500">{booking.rentalDays} jours</p>
                    </>
                  )}
                </div>
              </div>

              {/* Status Actions - Only show when not editing */}
              {!isEditing && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Changer le statut</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => onStatusChange(booking.id, 'confirmed')}
                        className="py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium
                                 rounded-xl transition-all touch-manipulation flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        Confirmer
                      </button>
                    )}
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button
                        onClick={() => onStatusChange(booking.id, 'cancelled')}
                        className="py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium
                                 rounded-xl transition-all touch-manipulation flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Annuler
                      </button>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => onStatusChange(booking.id, 'completed')}
                        className="py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-medium
                                 rounded-xl transition-all touch-manipulation flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        Terminer
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* WhatsApp Button - Only show when not editing */}
              {!isEditing && booking.clientPhone && (
                <button
                  onClick={handleWhatsApp}
                  className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold
                           rounded-xl transition-all duration-200 active:scale-[0.98]
                           touch-manipulation flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contacter sur WhatsApp
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
