import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Phone, Calendar, Car, MapPin, MessageCircle, Check, Clock, XCircle,
  Edit3, Save, Mail, CreditCard, FileText, Image, Shield, Baby, Users, ChevronRight,
  Globe, MapPinned, Cake
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { AdminBooking, BookingStatus, FullBookingDetails } from '../../types/admin';
import { fetchFullBookingDetails } from '../../services/adminService';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: AdminBooking | null;
  onStatusChange: (bookingId: string, newStatus: BookingStatus) => void;
  onBookingUpdate: (bookingId: string, updates: Partial<AdminBooking>) => void;
}

type TabType = 'overview' | 'client' | 'documents';

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
      setEditData({
        clientName: booking.clientName,
        clientPhone: booking.clientPhone || '',
        departureDate: booking.departureDate,
        returnDate: booking.returnDate,
      });
      setIsEditing(false);
      setActiveTab('overview');
    }
  }, [booking]);

  if (!booking) return null;

  const status = statusConfig[booking.status];
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
    const pricePerDay = booking.totalPrice / booking.rentalDays;

    onBookingUpdate(booking.id, {
      clientName: editData.clientName,
      clientPhone: editData.clientPhone,
      departureDate: editData.departureDate,
      returnDate: editData.returnDate,
      rentalDays: days,
      totalPrice: Math.round(days * pricePerDay),
    });
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
            <Car className="w-5 h-5 text-gray-400" />
            <span className="text-gray-900">{booking.vehicleName}</span>
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
