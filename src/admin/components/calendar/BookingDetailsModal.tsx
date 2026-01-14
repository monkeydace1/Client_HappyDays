import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Phone, Calendar, Car, MapPin, MessageCircle, Check, Clock, XCircle,
  Edit3, Save, Mail, CreditCard, FileText, Image, Shield, Baby, Users, ChevronRight,
  Globe, MapPinned, Cake, Sparkles, RefreshCw
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { AdminBooking, BookingStatus, FullBookingDetails } from '../../types/admin';
import { fetchFullBookingDetails } from '../../services/adminService';
import { vehicles as vehicleData } from '../../../data/vehicleData';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: AdminBooking | null;
  onStatusChange: (bookingId: string, newStatus: BookingStatus) => void;
  onBookingUpdate: (bookingId: string, updates: Partial<AdminBooking>) => void;
}

type TabType = 'overview' | 'client' | 'documents';

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

// Payment method labels
const paymentMethodLabels: Record<string, string> = {
  cash: 'Espèces',
  card: 'Carte bancaire',
  transfer: 'Virement bancaire',
};

export function BookingDetailsModal({
  isOpen,
  onClose,
  booking,
  onStatusChange,
  onBookingUpdate,
}: BookingDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [fullDetails, setFullDetails] = useState<FullBookingDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    clientName: '',
    clientPhone: '',
    departureDate: '',
    returnDate: '',
    pickupTime: '',
    returnTime: '',
    vehicleId: 0,
    vehicleName: '',
    pricePerDay: 0,
  });

  // Fetch full details when booking changes and it's a web booking
  useEffect(() => {
    if (booking && booking.source === 'web') {
      setIsLoadingDetails(true);
      fetchFullBookingDetails(booking.bookingReference)
        .then((details) => {
          setFullDetails(details);
        })
        .finally(() => {
          setIsLoadingDetails(false);
        });
    } else {
      setFullDetails(null);
    }
  }, [booking]);

  // Reset edit state when booking changes
  useEffect(() => {
    if (booking) {
      // Get vehicle info from static data
      const vehicleInfo = vehicleData.find(v => v.id === booking.vehicleId);
      const pricePerDay = vehicleInfo?.pricePerDay || (booking.totalPrice / booking.rentalDays);
      setEditData({
        clientName: booking.clientName,
        clientPhone: booking.clientPhone || '',
        departureDate: booking.departureDate,
        returnDate: booking.returnDate,
        pickupTime: booking.pickupTime || '',
        returnTime: booking.returnTime || '',
        vehicleId: booking.vehicleId,
        vehicleName: booking.vehicleName,
        pricePerDay: pricePerDay,
      });
      setIsEditing(false);
      setActiveTab('overview');
    }
  }, [booking]);

  if (!booking) return null;

  // Get status config with fallback for legacy 'confirmed' status
  const status = statusConfig[booking.status] || statusConfig['active'];
  const isWebBooking = booking.source === 'web';

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Bonjour ${booking.clientName}, concernant votre réservation ${booking.bookingReference} du ${format(parseISO(booking.departureDate), 'dd/MM/yyyy')} au ${format(parseISO(booking.returnDate), 'dd/MM/yyyy')} pour ${booking.vehicleName}.`
    );
    window.open(`https://wa.me/${booking.clientPhone?.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleSave = () => {
    const departure = new Date(editData.departureDate);
    const returnDate = new Date(editData.returnDate);
    const days = Math.ceil((returnDate.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24)) || 1;

    onBookingUpdate(booking.id, {
      clientName: editData.clientName,
      clientPhone: editData.clientPhone,
      departureDate: editData.departureDate,
      returnDate: editData.returnDate,
      pickupTime: editData.pickupTime || undefined,
      returnTime: editData.returnTime || undefined,
      rentalDays: days,
      vehicleId: editData.vehicleId,
      vehicleName: editData.vehicleName,
      totalPrice: Math.round(days * editData.pricePerDay),
    });
    setIsEditing(false);
  };

  // Handle vehicle change with automatic price update
  const handleVehicleChange = (vehicleId: number) => {
    const selectedVehicle = vehicleData.find(v => v.id === vehicleId);
    if (selectedVehicle) {
      setEditData({
        ...editData,
        vehicleId: selectedVehicle.id,
        vehicleName: selectedVehicle.name,
        pricePerDay: selectedVehicle.pricePerDay,
      });
    }
  };

  const handleCancel = () => {
    const vehicleInfo = vehicleData.find(v => v.id === booking.vehicleId);
    const pricePerDay = vehicleInfo?.pricePerDay || (booking.totalPrice / booking.rentalDays);
    setEditData({
      clientName: booking.clientName,
      clientPhone: booking.clientPhone || '',
      departureDate: booking.departureDate,
      returnDate: booking.returnDate,
      pickupTime: booking.pickupTime || '',
      returnTime: booking.returnTime || '',
      vehicleId: booking.vehicleId,
      vehicleName: booking.vehicleName,
      pricePerDay: pricePerDay,
    });
    setIsEditing(false);
  };

  // Helper to format time to 12h AM/PM
  const formatTime12h = (time24: string | undefined): string => {
    if (!time24) return '';
    const [hoursStr, minutesStr] = time24.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = minutesStr || '00';
    if (isNaN(hours)) return time24;
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes} ${period}`;
  };

  // Tab content components
  const OverviewTab = () => (
    <div className="space-y-4">
      {/* Client Info (basic) */}
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
              <a href={`tel:${booking.clientPhone}`} className="text-primary hover:underline">
                {booking.clientPhone}
              </a>
            ) : (
              <span className="text-gray-400">Non renseigné</span>
            )}
          </div>
          {booking.clientEmail && !isEditing && (
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <a href={`mailto:${booking.clientEmail}`} className="text-primary hover:underline">
                {booking.clientEmail}
              </a>
            </div>
          )}
          {/* Show link to full details if web booking */}
          {isWebBooking && fullDetails && !isEditing && (
            <button
              onClick={() => setActiveTab('client')}
              className="flex items-center gap-2 text-sm text-primary hover:underline mt-2"
            >
              Voir tous les détails client
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Vehicle & Dates */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Réservation</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Car className="w-5 h-5 text-gray-400 flex-shrink-0" />
            {isEditing ? (
              <div className="flex-1">
                <select
                  value={editData.vehicleId}
                  onChange={(e) => handleVehicleChange(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm appearance-none bg-white"
                >
                  {vehicleData.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} - {vehicle.year} - #{vehicle.id} ({vehicle.pricePerDay}€/j)
                    </option>
                  ))}
                </select>
                {editData.vehicleId !== booking.vehicleId && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                    <RefreshCw className="w-3 h-3" />
                    <span>Prix mis à jour: {editData.pricePerDay}€/jour</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center gap-2">
                <span className="bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded text-sm">
                  #{booking.vehicleId}
                </span>
                <span className="text-gray-900">{booking.vehicleName}</span>
                {(() => {
                  const vehicleInfo = vehicleData.find(v => v.id === booking.vehicleId);
                  return vehicleInfo ? (
                    <span className="text-gray-500 text-sm">
                      ({vehicleInfo.year})
                    </span>
                  ) : null;
                })()}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
            {isEditing ? (
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
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
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Heure départ</label>
                    <input
                      type="time"
                      value={editData.pickupTime}
                      onChange={(e) => setEditData({ ...editData, pickupTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Heure retour</label>
                    <input
                      type="time"
                      value={editData.returnTime}
                      onChange={(e) => setEditData({ ...editData, returnTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <div className="text-gray-900">
                  {format(parseISO(booking.departureDate), 'dd MMM yyyy', { locale: fr })}
                  {booking.pickupTime && <span className="text-primary ml-1">à {formatTime12h(booking.pickupTime)}</span>}
                  {' → '}
                  {format(parseISO(booking.returnDate), 'dd MMM yyyy', { locale: fr })}
                  {booking.returnTime && <span className="text-primary ml-1">à {formatTime12h(booking.returnTime)}</span>}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <span className="text-gray-900">{booking.pickupLocation}</span>
          </div>
        </div>
      </div>

      {/* Supplements (if web booking) */}
      {isWebBooking && fullDetails && (fullDetails.supplements.length > 0 || fullDetails.additionalDriver) && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Suppléments</h3>
          <div className="space-y-2">
            {fullDetails.additionalDriver && (
              <div className="flex items-center gap-3 text-gray-700">
                <Users className="w-5 h-5 text-gray-400" />
                <span>Conducteur additionnel</span>
                <span className="ml-auto text-sm text-gray-500">8€/jour</span>
              </div>
            )}
            {fullDetails.supplements.map((supp, idx) => (
              <div key={idx} className="flex items-center gap-3 text-gray-700">
                {supp.name.toLowerCase().includes('siège') || supp.name.toLowerCase().includes('bébé') ? (
                  <Baby className="w-5 h-5 text-gray-400" />
                ) : (
                  <Shield className="w-5 h-5 text-gray-400" />
                )}
                <span>{supp.name} {supp.quantity && supp.quantity > 1 ? `(x${supp.quantity})` : ''}</span>
                <span className="ml-auto text-sm text-gray-500">{supp.pricePerDay}€/jour</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Method (if web booking) */}
      {isWebBooking && fullDetails && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Paiement</h3>
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-gray-400" />
            <span className="text-gray-900">{paymentMethodLabels[fullDetails.paymentMethod] || fullDetails.paymentMethod}</span>
          </div>
        </div>
      )}

      {/* Price - Use fullDetails.totalPrice for web bookings (more accurate) */}
      <div className="bg-primary-light rounded-xl p-4">
        <div className="flex justify-between items-center">
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
                    return Math.round(days * editData.pricePerDay);
                  })()}€
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    value={editData.pricePerDay}
                    onChange={(e) => setEditData({ ...editData, pricePerDay: Number(e.target.value) })}
                    className="w-20 px-2 py-1 text-sm text-right rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    min="0"
                  />
                  <span className="text-xs text-gray-500">
                    €/jour × {Math.ceil(
                      (new Date(editData.returnDate).getTime() - new Date(editData.departureDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                    ) || 1} jours
                  </span>
                </div>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold text-primary">
                  {isWebBooking && fullDetails ? fullDetails.totalPrice : booking.totalPrice}€
                </span>
                <p className="text-xs text-gray-500">{booking.rentalDays} jours</p>
              </>
            )}
          </div>
        </div>
        {/* Price breakdown for web bookings */}
        {isWebBooking && fullDetails && !isEditing && (
          <div className="mt-3 pt-3 border-t border-primary/20 text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Véhicule ({booking.rentalDays} jours)</span>
              <span>{fullDetails.vehicleTotal}€</span>
            </div>
            {fullDetails.supplementsTotal > 0 && (
              <div className="flex justify-between">
                <span>Suppléments</span>
                <span>{fullDetails.supplementsTotal}€</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Created time */}
      {!isEditing && (
        <div className="text-center text-xs text-gray-400">
          Créée le {format(parseISO(isWebBooking && fullDetails ? fullDetails.createdAt : booking.createdAt), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
        </div>
      )}

      {/* Status Actions */}
      {!isEditing && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Changer le statut</h3>
          <div className="grid grid-cols-2 gap-2">
            {/* New -> Pending */}
            {booking.status === 'new' && (
              <button
                onClick={() => onStatusChange(booking.id, 'pending')}
                className="py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium
                         rounded-xl transition-all touch-manipulation flex items-center justify-center gap-2"
              >
                <Clock className="w-5 h-5" />
                Contacter
              </button>
            )}
            {/* Pending -> Active */}
            {booking.status === 'pending' && (
              <button
                onClick={() => onStatusChange(booking.id, 'active')}
                className="py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-medium
                         rounded-xl transition-all touch-manipulation flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Confirmer
              </button>
            )}
            {/* New/Pending/Active -> Cancelled */}
            {(booking.status === 'new' || booking.status === 'pending' || booking.status === 'active') && (
              <button
                onClick={() => onStatusChange(booking.id, 'cancelled')}
                className="py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium
                         rounded-xl transition-all touch-manipulation flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Annuler
              </button>
            )}
            {/* Active -> Completed */}
            {booking.status === 'active' && (
              <button
                onClick={() => onStatusChange(booking.id, 'completed')}
                className="py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium
                         rounded-xl transition-all touch-manipulation flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Terminer
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Extend - Only for active reservations */}
      {!isEditing && booking.status === 'active' && (
        <div className="bg-amber-50 rounded-xl p-4">
          <h3 className="font-semibold text-amber-800 mb-3">Prolonger la réservation</h3>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const currentReturn = new Date(booking.returnDate);
                currentReturn.setDate(currentReturn.getDate() + 1);
                const newReturnDate = currentReturn.toISOString().split('T')[0];
                const vehicleInfo = vehicleData.find(v => v.id === booking.vehicleId);
                const pricePerDay = vehicleInfo?.pricePerDay || (booking.totalPrice / booking.rentalDays);
                const newDays = booking.rentalDays + 1;
                onBookingUpdate(booking.id, {
                  returnDate: newReturnDate,
                  rentalDays: newDays,
                  totalPrice: Math.round(newDays * pricePerDay),
                });
              }}
              className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-medium
                       rounded-lg transition-all touch-manipulation text-sm"
            >
              +1 jour
            </button>
            <button
              onClick={() => {
                const currentReturn = new Date(booking.returnDate);
                currentReturn.setDate(currentReturn.getDate() + 3);
                const newReturnDate = currentReturn.toISOString().split('T')[0];
                const vehicleInfo = vehicleData.find(v => v.id === booking.vehicleId);
                const pricePerDay = vehicleInfo?.pricePerDay || (booking.totalPrice / booking.rentalDays);
                const newDays = booking.rentalDays + 3;
                onBookingUpdate(booking.id, {
                  returnDate: newReturnDate,
                  rentalDays: newDays,
                  totalPrice: Math.round(newDays * pricePerDay),
                });
              }}
              className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-medium
                       rounded-lg transition-all touch-manipulation text-sm"
            >
              +3 jours
            </button>
            <button
              onClick={() => {
                const currentReturn = new Date(booking.returnDate);
                currentReturn.setDate(currentReturn.getDate() + 7);
                const newReturnDate = currentReturn.toISOString().split('T')[0];
                const vehicleInfo = vehicleData.find(v => v.id === booking.vehicleId);
                const pricePerDay = vehicleInfo?.pricePerDay || (booking.totalPrice / booking.rentalDays);
                const newDays = booking.rentalDays + 7;
                onBookingUpdate(booking.id, {
                  returnDate: newReturnDate,
                  rentalDays: newDays,
                  totalPrice: Math.round(newDays * pricePerDay),
                });
              }}
              className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-medium
                       rounded-lg transition-all touch-manipulation text-sm"
            >
              +7 jours
            </button>
          </div>
          <p className="text-xs text-amber-700 mt-2">
            Le prix sera automatiquement recalculé
          </p>
        </div>
      )}

      {/* WhatsApp Button */}
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
  );

  const ClientTab = () => {
    if (!fullDetails) {
      return (
        <div className="text-center py-8 text-gray-500">
          <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Détails client non disponibles</p>
          <p className="text-sm mt-1">Réservation créée manuellement</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Personal Information */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Informations personnelles</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <span className="text-gray-900 font-medium">{fullDetails.firstName} {fullDetails.lastName}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <a href={`mailto:${fullDetails.email}`} className="text-primary hover:underline">
                {fullDetails.email}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <a href={`tel:${fullDetails.phone}`} className="text-primary hover:underline">
                {fullDetails.phone}
              </a>
            </div>
            {fullDetails.dateOfBirth && (
              <div className="flex items-center gap-3">
                <Cake className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">
                  {format(parseISO(fullDetails.dateOfBirth), 'dd MMMM yyyy', { locale: fr })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Adresse</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">{fullDetails.country}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPinned className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">{fullDetails.city}</span>
            </div>
            {fullDetails.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-900">{fullDetails.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {(fullDetails.extraInformation || fullDetails.notes) && (
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Notes & Informations</h3>
            {fullDetails.extraInformation && (
              <div className="mb-3">
                <p className="text-sm text-gray-500 mb-1">Informations supplémentaires:</p>
                <p className="text-gray-900">{fullDetails.extraInformation}</p>
              </div>
            )}
            {fullDetails.notes && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Notes:</p>
                <p className="text-gray-900">{fullDetails.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const DocumentsTab = () => {
    if (!fullDetails) {
      return (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Documents non disponibles</p>
          <p className="text-sm mt-1">Réservation créée manuellement</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Driver's License Info */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Permis de conduire</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Numéro</p>
                <p className="text-gray-900 font-medium">{fullDetails.licenseNumber || 'Non renseigné'}</p>
              </div>
            </div>
            {fullDetails.licenseIssueDate && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date d'émission</p>
                  <p className="text-gray-900">
                    {format(parseISO(fullDetails.licenseIssueDate), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
            )}
            {fullDetails.licenseExpirationDate && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date d'expiration</p>
                  <p className="text-gray-900">
                    {format(parseISO(fullDetails.licenseExpirationDate), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* License Photo */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Photo du permis</h3>
          {fullDetails.licensePhotoUrl ? (
            <div>
              <button
                onClick={() => setImageModalOpen(true)}
                className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-200 hover:opacity-90 transition-opacity"
              >
                <img
                  src={fullDetails.licensePhotoUrl}
                  alt="Permis de conduire"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                  <Image className="w-8 h-8 text-white" />
                </div>
              </button>
              <p className="text-sm text-gray-500 mt-2 text-center">Cliquez pour agrandir</p>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Image className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Aucune photo fournie</p>
            </div>
          )}
        </div>
      </div>
    );
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

          {/* Modal */}
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
                <div className="flex items-center gap-2 mt-1">
                  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                    {status.icon}
                    {status.label}
                  </div>
                  {booking.source !== 'web' && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {booking.source === 'walk_in' ? 'Direct' : 'Téléphone'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeTab === 'overview' && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
                    title="Modifier"
                  >
                    <Edit3 className="w-5 h-5 text-primary" />
                  </button>
                )}
                {isEditing && (
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

            {/* Tabs (only show for web bookings) */}
            {isWebBooking && !isEditing && (
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'overview'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Aperçu
                </button>
                <button
                  onClick={() => setActiveTab('client')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'client'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Client
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'documents'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Documents
                </button>
              </div>
            )}

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {isLoadingDetails ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {activeTab === 'overview' && <OverviewTab />}
                  {activeTab === 'client' && <ClientTab />}
                  {activeTab === 'documents' && <DocumentsTab />}
                </>
              )}
            </div>
          </motion.div>

          {/* Image Modal */}
          {imageModalOpen && fullDetails?.licensePhotoUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
              onClick={() => setImageModalOpen(false)}
            >
              <button
                onClick={() => setImageModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <img
                src={fullDetails.licensePhotoUrl}
                alt="Permis de conduire"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
