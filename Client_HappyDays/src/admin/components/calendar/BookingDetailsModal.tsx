import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Phone, Calendar, Car, MapPin, MessageCircle, Check, Clock, XCircle,
  Edit3, Save, Mail, CreditCard, FileText, Image, Shield, Baby, Users, ChevronRight,
  Globe, MapPinned, Cake, Sparkles, RefreshCw, Euro, Trash2,
  IdCard, Wallet, Plus, Minus, Truck, AlertTriangle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { AdminBooking, BookingStatus, FullBookingDetails } from '../../types/admin';
import { fetchFullBookingDetails } from '../../services/adminService';
import { vehicles as vehicleData } from '../../../data/vehicleData';
import { additionalDriverSupplement, childSeats, insuranceOptions } from '../../../data/supplementData';
import { PICKUP_LOCATIONS, OTHER_LOCATION, isCustomLocation } from '../../../types';
import {
  computeRentalUnitsFromDateTime,
  computeVehicleSubtotal,
  computeExtrasSubtotal,
  computeBookingTotal,
  deriveDailyRate,
  formatRentalDuration,
  type BookingExtra,
} from '../../../lib/pricing';
import { formatTime24h } from '../../../utils/timeFormat';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: AdminBooking | null;
  onStatusChange: (bookingId: string, newStatus: BookingStatus) => void;
  onBookingUpdate: (bookingId: string, updates: Partial<AdminBooking>) => void;
  onDelete?: (bookingId: string) => void;
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

// Upsell presets of the "Suppléments" section (same rates as the website) + a free-form entry
const EXTRA_PRESETS: Array<Omit<BookingExtra, 'quantity'>> = [
  { id: additionalDriverSupplement.id, name: additionalDriverSupplement.name, mode: 'per_day', price: additionalDriverSupplement.pricePerDay },
  ...childSeats.map((s) => ({ id: s.id, name: s.name, mode: 'per_day' as const, price: s.pricePerDay })),
  ...insuranceOptions.filter((i) => i.pricePerDay > 0).map((i) => ({ id: i.id, name: i.name, mode: 'per_day' as const, price: i.pricePerDay })),
];
const CUSTOM_PRESET_ID = 'custom';

function extraIcon(extra: BookingExtra) {
  if (extra.id === additionalDriverSupplement.id) return <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />;
  if (extra.id.startsWith('child_seat')) return <Baby className="w-5 h-5 text-gray-400 flex-shrink-0" />;
  if (extra.id.startsWith('insurance')) return <Shield className="w-5 h-5 text-gray-400 flex-shrink-0" />;
  return <Sparkles className="w-5 h-5 text-gray-400 flex-shrink-0" />;
}

// Walk-ins are stored with pickup_location = 'Direct'; web bookings use PICKUP_LOCATIONS
const BASE_LOCATION_OPTIONS: string[] = ['Direct', ...PICKUP_LOCATIONS];
function locationOptions(current: string): string[] {
  return current && !BASE_LOCATION_OPTIONS.includes(current)
    ? [...BASE_LOCATION_OPTIONS, current]
    : BASE_LOCATION_OPTIONS;
}

type EditData = {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  departureDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
  vehicleId: number;
  vehicleName: string;
  pricePerDay: number;
  pickupLocation: string;
  customPickupLocation: string;
  returnLocation: string;        // '' = same place as pickup
  customReturnLocation: string;
};

// Daily rate of a booking: stored since migration 008, derived from the total before that
function bookingDailyRate(booking: AdminBooking): number {
  return booking.pricePerDay ?? deriveDailyRate(booking.totalPrice, booking.rentalDays, booking.extraHours || 0);
}

function buildEditData(booking: AdminBooking): EditData {
  return {
    clientName: booking.clientName,
    clientPhone: booking.clientPhone || '',
    clientEmail: booking.clientEmail || '',
    departureDate: booking.departureDate,
    returnDate: booking.returnDate,
    pickupTime: booking.pickupTime || '',
    returnTime: booking.returnTime || '',
    vehicleId: booking.vehicleId,
    vehicleName: booking.vehicleName,
    pricePerDay: bookingDailyRate(booking),
    pickupLocation: booking.pickupLocation,
    customPickupLocation: booking.customPickupLocation || '',
    returnLocation: booking.returnLocation || '',
    customReturnLocation: booking.customReturnLocation || '',
  };
}

const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white';

export function BookingDetailsModal({
  isOpen,
  onClose,
  booking,
  onStatusChange,
  onBookingUpdate,
  onDelete,
}: BookingDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [fullDetails, setFullDetails] = useState<FullBookingDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [editData, setEditData] = useState<EditData>({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    departureDate: '',
    returnDate: '',
    pickupTime: '',
    returnTime: '',
    vehicleId: 0,
    vehicleName: '',
    pricePerDay: 0,
    pickupLocation: PICKUP_LOCATIONS[0],
    customPickupLocation: '',
    returnLocation: '',
    customReturnLocation: '',
  });
  // Fields edited inline (outside edit mode) and saved on blur
  const [deliveryFeeDraft, setDeliveryFeeDraft] = useState('');
  const [depositAmountDraft, setDepositAmountDraft] = useState('');
  // "+ Ajouter" form of the Suppléments section
  const [addingExtra, setAddingExtra] = useState(false);
  const [newExtra, setNewExtra] = useState<{ presetId: string; name: string; price: string; mode: BookingExtra['mode'] }>({
    presetId: EXTRA_PRESETS[0].id,
    name: '',
    price: '',
    mode: 'per_day',
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

  // Reset edit state when booking changes (also runs after every inline save,
  // which is what closes the "+ Ajouter" form and re-syncs the drafts)
  useEffect(() => {
    if (booking) {
      setEditData(buildEditData(booking));
      setDeliveryFeeDraft(booking.deliveryFee ? String(booking.deliveryFee) : '');
      setDepositAmountDraft(booking.depositAmount ? String(booking.depositAmount) : '');
      setIsEditing(false);
      setActiveTab('overview');
      setAddingExtra(false);
    }
  }, [booking]);

  if (!booking) return null;

  // Get status config with fallback for legacy 'confirmed' status
  const status = statusConfig[booking.status] || statusConfig['active'];
  const isWebBooking = booking.source === 'web';

  // The web flow stores the extra-driver flag but not its rate, and the rate changed
  // (8€ → 3€/day on 2026-10-01). Back it out of the stored supplements subtotal so
  // older bookings keep showing what the client actually paid.
  const additionalDriverRate = (() => {
    if (!fullDetails?.additionalDriver || booking.rentalDays <= 0) {
      return additionalDriverSupplement.pricePerDay;
    }
    const otherPerDay = fullDetails.supplements.reduce(
      (sum, s) => sum + s.pricePerDay * (s.quantity || 1),
      0
    );
    const derived = fullDetails.supplementsTotal / booking.rentalDays - otherPerDay;
    return Number.isInteger(derived) && derived > 0 ? derived : additionalDriverSupplement.pricePerDay;
  })();

  const bookingUnits = { fullDays: booking.rentalDays, extraHours: booking.extraHours || 0 };
  const dailyRate = bookingDailyRate(booking);
  const durationLabel = formatRentalDuration(bookingUnits) || `${booking.rentalDays} jours`;
  const extrasSubtotal = computeExtrasSubtotal(booking.extras, bookingUnits);
  const hasCustomLocation = isCustomLocation(booking.pickupLocation) || isCustomLocation(booking.returnLocation);
  // Web bookings written by the pre-008 frontend: their supplements only exist in `bookings`
  const isLegacyWeb = booking.pricePerDay == null && !!fullDetails;
  const legacyWebSupplements = isLegacyWeb && fullDetails
    ? [
        ...(fullDetails.additionalDriver
          ? [{ label: 'Conducteur additionnel', rate: additionalDriverRate, icon: <Users className="w-5 h-5 text-gray-400" /> }]
          : []),
        ...fullDetails.supplements.map((supp) => ({
          label: `${supp.name}${supp.quantity && supp.quantity > 1 ? ` (x${supp.quantity})` : ''}`,
          rate: supp.pricePerDay,
          icon: supp.name.toLowerCase().includes('siège') || supp.name.toLowerCase().includes('bébé')
            ? <Baby className="w-5 h-5 text-gray-400" />
            : <Shield className="w-5 h-5 text-gray-400" />,
        })),
      ]
    : [];

  // --- inline saves (outside edit mode): extras, delivery fee, deposit ---
  const saveExtras = (nextExtras: BookingExtra[]) => {
    onBookingUpdate(booking.id, {
      extras: nextExtras,
      pricePerDay: dailyRate,
      totalPrice: computeBookingTotal({ pricePerDay: dailyRate, units: bookingUnits, extras: nextExtras, deliveryFee: booking.deliveryFee }),
    });
  };
  const removeExtra = (index: number) => saveExtras(booking.extras.filter((_, i) => i !== index));
  const updateExtraQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeExtra(index);
      return;
    }
    saveExtras(booking.extras.map((e, i) => (i === index ? { ...e, quantity } : e)));
  };
  const handlePresetChange = (presetId: string) => {
    const preset = EXTRA_PRESETS.find((p) => p.id === presetId);
    setNewExtra({
      presetId,
      name: preset?.name ?? '',
      price: preset ? String(preset.price) : '',
      mode: preset?.mode ?? 'per_day',
    });
  };
  const addExtra = () => {
    const preset = EXTRA_PRESETS.find((p) => p.id === newExtra.presetId);
    const name = preset ? preset.name : newExtra.name.trim();
    const price = preset ? preset.price : Number(newExtra.price);
    const mode = preset ? preset.mode : newExtra.mode;
    if (!name || !Number.isFinite(price) || price < 0) {
      alert('Indiquez un nom et un prix pour le supplément');
      return;
    }
    const existingIndex = preset ? booking.extras.findIndex((e) => e.id === preset.id) : -1;
    // Free-form items get a deterministic id (list keys also include the index, so duplicates are fine)
    const customId = `custom-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${mode}-${price}`;
    const nextExtras = existingIndex >= 0
      ? booking.extras.map((e, i) => (i === existingIndex ? { ...e, quantity: e.quantity + 1 } : e))
      : [...booking.extras, { id: preset?.id ?? customId, name, mode, price, quantity: 1 }];
    saveExtras(nextExtras);
    setAddingExtra(false);
  };
  const saveDeliveryFee = () => {
    const fee = deliveryFeeDraft === '' ? 0 : Math.max(0, Math.round(Number(deliveryFeeDraft) || 0));
    if (fee === (booking.deliveryFee || 0)) return;
    onBookingUpdate(booking.id, {
      deliveryFee: fee,
      pricePerDay: dailyRate,
      totalPrice: computeBookingTotal({ pricePerDay: dailyRate, units: bookingUnits, extras: booking.extras, deliveryFee: fee }),
    });
  };
  const saveDepositAmount = () => {
    const amount = depositAmountDraft === '' ? null : Math.max(0, Math.round(Number(depositAmountDraft) || 0));
    if (amount === (booking.depositAmount ?? null)) return;
    onBookingUpdate(booking.id, { depositAmount: amount });
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Bonjour ${booking.clientName}, concernant votre réservation ${booking.bookingReference} du ${format(parseISO(booking.departureDate), 'dd/MM/yyyy')} au ${format(parseISO(booking.returnDate), 'dd/MM/yyyy')} pour ${booking.vehicleName}.`
    );
    const phone = booking.clientPhone?.replace(/\D/g, '').replace(/^00/, '') || '';
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleSave = () => {
    if (editData.returnDate < editData.departureDate) {
      alert('La date de retour doit être après la date de départ');
      return;
    }

    const units = computeRentalUnitsFromDateTime(
      editData.departureDate,
      editData.pickupTime,
      editData.returnDate,
      editData.returnTime
    );

    if (units.fullDays === 0 && units.extraHours === 0) {
      alert('La date/heure de retour doit être après la date/heure de départ');
      return;
    }

    if (editData.pickupLocation === OTHER_LOCATION && !editData.customPickupLocation.trim()) {
      alert("Précisez l'adresse de prise en charge");
      return;
    }

    const totalPrice = computeBookingTotal({
      pricePerDay: editData.pricePerDay,
      units,
      extras: booking.extras,
      deliveryFee: booking.deliveryFee,
    });

    onBookingUpdate(booking.id, {
      clientName: editData.clientName,
      clientPhone: editData.clientPhone,
      clientEmail: editData.clientEmail || undefined,
      departureDate: editData.departureDate,
      returnDate: editData.returnDate,
      pickupTime: editData.pickupTime !== '' ? editData.pickupTime : undefined,
      returnTime: editData.returnTime !== '' ? editData.returnTime : undefined,
      rentalDays: units.fullDays,
      extraHours: units.extraHours,
      vehicleId: editData.vehicleId,
      assignedVehicleId: editData.vehicleId,
      vehicleName: editData.vehicleName,
      pricePerDay: editData.pricePerDay,
      pickupLocation: editData.pickupLocation,
      customPickupLocation: editData.pickupLocation === OTHER_LOCATION ? editData.customPickupLocation.trim() : undefined,
      returnLocation: editData.returnLocation || undefined,
      customReturnLocation: editData.returnLocation === OTHER_LOCATION ? editData.customReturnLocation.trim() : undefined,
      totalPrice,
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
    setEditData(buildEditData(booking));
    setIsEditing(false);
  };

  // Tab content - inline JSX (not component functions, to preserve input focus on re-render)
  const overviewContent = (
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
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
            {isEditing ? (
              <input
                type="email"
                value={editData.clientEmail}
                onChange={(e) => setEditData({ ...editData, clientEmail: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                placeholder="Email"
              />
            ) : booking.clientEmail ? (
              <a href={`mailto:${booking.clientEmail}`} className="text-primary hover:underline">
                {booking.clientEmail}
              </a>
            ) : (
              <span className="text-gray-400">Non renseigné</span>
            )}
          </div>
          {/* Passport / deposit held during the rental — toggles save immediately */}
          {!isEditing && (
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Gardé pendant la location</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onBookingUpdate(booking.id, { passportKept: !booking.passportKept })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors touch-manipulation active:scale-95
                    ${booking.passportKept
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400'}`}
                >
                  <IdCard className="w-4 h-4" />
                  Passeport
                  {booking.passportKept && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => onBookingUpdate(booking.id, {
                    depositKept: !booking.depositKept,
                    ...(booking.depositKept ? { depositAmount: null } : {}),
                  })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors touch-manipulation active:scale-95
                    ${booking.depositKept
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : 'bg-white border-gray-300 text-gray-600 hover:border-amber-400'}`}
                >
                  <Wallet className="w-4 h-4" />
                  Caution
                  {booking.depositKept && <Check className="w-3.5 h-3.5" />}
                </button>
                {booking.depositKept && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={depositAmountDraft}
                      onChange={(e) => setDepositAmountDraft(e.target.value)}
                      onBlur={saveDepositAmount}
                      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                      placeholder="Montant"
                      className="w-24 px-2 py-1.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-primary bg-white"
                    />
                    <span className="text-sm text-gray-500">€</span>
                  </div>
                )}
              </div>
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
                  {booking.pickupTime && <span className="text-primary ml-1">à {formatTime24h(booking.pickupTime)}</span>}
                  {' → '}
                  {format(parseISO(booking.returnDate), 'dd MMM yyyy', { locale: fr })}
                  {booking.returnTime && <span className="text-primary ml-1">à {formatTime24h(booking.returnTime)}</span>}
                </div>
              </div>
            )}
          </div>
          {/* Pickup / return locations */}
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
            {isEditing ? (
              <div className="flex-1 space-y-2">
                <div>
                  <label className="text-xs text-gray-500">Prise en charge</label>
                  <select
                    value={editData.pickupLocation}
                    onChange={(e) => setEditData({ ...editData, pickupLocation: e.target.value })}
                    className={`${inputClass} appearance-none`}
                  >
                    {locationOptions(editData.pickupLocation).map((loc) => (
                      <option key={loc} value={loc}>{loc === 'Direct' ? 'Direct (agence)' : loc}</option>
                    ))}
                  </select>
                  {editData.pickupLocation === OTHER_LOCATION && (
                    <input
                      type="text"
                      value={editData.customPickupLocation}
                      onChange={(e) => setEditData({ ...editData, customPickupLocation: e.target.value })}
                      placeholder="Adresse de prise en charge"
                      className={`${inputClass} mt-1`}
                    />
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500">Retour</label>
                  <select
                    value={editData.returnLocation}
                    onChange={(e) => setEditData({ ...editData, returnLocation: e.target.value })}
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="">Même lieu que la prise en charge</option>
                    {locationOptions(editData.returnLocation).map((loc) => (
                      <option key={loc} value={loc}>{loc === 'Direct' ? 'Direct (agence)' : loc}</option>
                    ))}
                  </select>
                  {editData.returnLocation === OTHER_LOCATION && (
                    <input
                      type="text"
                      value={editData.customReturnLocation}
                      onChange={(e) => setEditData({ ...editData, customReturnLocation: e.target.value })}
                      placeholder="Adresse de retour"
                      className={`${inputClass} mt-1`}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 text-sm">
                <p className="text-gray-900">
                  {booking.pickupLocation}
                  {booking.customPickupLocation && (
                    <span className="text-gray-600"> — {booking.customPickupLocation}</span>
                  )}
                </p>
                {booking.returnLocation && (
                  <p className="text-gray-600 mt-0.5">
                    Retour : {booking.returnLocation}
                    {booking.customReturnLocation && ` — ${booking.customReturnLocation}`}
                  </p>
                )}
              </div>
            )}
          </div>
          {/* One-time delivery fee for custom locations — saved on blur */}
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-700">Frais de déplacement</span>
              {isEditing ? (
                <span className="text-sm text-gray-900">{booking.deliveryFee || 0}€</span>
              ) : (
                <>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={deliveryFeeDraft}
                    onChange={(e) => setDeliveryFeeDraft(e.target.value)}
                    onBlur={saveDeliveryFee}
                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                    placeholder="0"
                    className="w-20 px-2 py-1 rounded-lg border border-gray-300 text-sm text-right outline-none focus:border-primary bg-white"
                  />
                  <span className="text-sm text-gray-500">€</span>
                </>
              )}
              {hasCustomLocation && !booking.deliveryFee && (
                <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  <AlertTriangle className="w-3 h-3" />
                  frais à définir
                </span>
              )}
            </div>
          </div>
          {/* Price per day - Editable */}
          <div className="flex items-center gap-3">
            <Euro className="w-5 h-5 text-gray-400 flex-shrink-0" />
            {isEditing ? (
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editData.pricePerDay}
                    onChange={(e) => setEditData({ ...editData, pricePerDay: Number(e.target.value) })}
                    className="w-24 px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    min="0"
                    placeholder="Prix"
                  />
                  <span className="text-gray-500 text-sm">€/jour</span>
                </div>
                {(() => {
                  const vehicleInfo = vehicleData.find(v => v.id === editData.vehicleId);
                  const defaultPrice = vehicleInfo?.pricePerDay || 0;
                  if (editData.pricePerDay !== defaultPrice) {
                    return (
                      <div className="flex items-center gap-1 mt-1 text-xs text-orange-600">
                        <span>Prix modifié (défaut: {defaultPrice}€)</span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-gray-900">{dailyRate}€/jour</span>
                {(() => {
                  const vehicleInfo = vehicleData.find(v => v.id === booking.vehicleId);
                  const defaultPrice = vehicleInfo?.pricePerDay || 0;
                  if (dailyRate !== defaultPrice) {
                    return (
                      <span className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded">
                        prix modifié
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Suppléments — editable on every booking, each change saves immediately */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Suppléments</h3>
          {!isEditing && !addingExtra && (
            <button
              type="button"
              onClick={() => setAddingExtra(true)}
              className="flex items-center gap-1 text-sm text-primary font-medium hover:underline touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          )}
        </div>
        <div className="space-y-2">
          {booking.extras.length === 0 && legacyWebSupplements.length === 0 && !addingExtra && (
            <p className="text-sm text-gray-400">Aucun supplément</p>
          )}
          {booking.extras.map((extra, idx) => (
            <div key={`${extra.id}-${idx}`} className="flex items-center gap-2 text-gray-700">
              {extraIcon(extra)}
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{extra.name}</p>
                <p className="text-xs text-gray-500">
                  {extra.price}€{extra.mode === 'per_day' ? '/jour' : ' (une fois)'}
                  {extra.quantity > 1 && ` × ${extra.quantity}`}
                </p>
              </div>
              <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                {computeExtrasSubtotal([extra], bookingUnits)}€
              </span>
              {!isEditing && (
                <div className="flex items-center gap-1 ml-1">
                  <button type="button" onClick={() => updateExtraQuantity(idx, extra.quantity - 1)} aria-label="Moins"
                    className="w-7 h-7 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center touch-manipulation">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => updateExtraQuantity(idx, extra.quantity + 1)} aria-label="Plus"
                    className="w-7 h-7 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center touch-manipulation">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => removeExtra(idx)} aria-label="Supprimer"
                    className="w-7 h-7 rounded-md bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center touch-manipulation">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
          {/* Pre-008 web bookings: the client's order, read-only (re-run the 008 backfill to make it editable) */}
          {legacyWebSupplements.map((supp, idx) => (
            <div key={`legacy-${idx}`} className="flex items-center gap-3 text-gray-700">
              {supp.icon}
              <span className="text-sm">{supp.label}</span>
              <span className="ml-auto text-sm text-gray-500">{supp.rate}€/jour</span>
            </div>
          ))}
          {addingExtra && (
            <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200 space-y-2">
              <select
                value={newExtra.presetId}
                onChange={(e) => handlePresetChange(e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                {EXTRA_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — {p.price}€/jour</option>
                ))}
                <option value={CUSTOM_PRESET_ID}>Autre (libre)…</option>
              </select>
              {newExtra.presetId === CUSTOM_PRESET_ID && (
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newExtra.name}
                    onChange={(e) => setNewExtra({ ...newExtra, name: e.target.value })}
                    placeholder="Nom (ex. GPS, livraison hôtel…)"
                    className={`${inputClass} col-span-3`}
                  />
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={newExtra.price}
                    onChange={(e) => setNewExtra({ ...newExtra, price: e.target.value })}
                    placeholder="Prix €"
                    className={inputClass}
                  />
                  <select
                    value={newExtra.mode}
                    onChange={(e) => setNewExtra({ ...newExtra, mode: e.target.value as BookingExtra['mode'] })}
                    className={`${inputClass} col-span-2 appearance-none`}
                  >
                    <option value="per_day">par jour</option>
                    <option value="one_time">une seule fois</option>
                  </select>
                </div>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={() => setAddingExtra(false)}
                  className="flex-1 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 touch-manipulation">
                  Annuler
                </button>
                <button type="button" onClick={addExtra}
                  className="flex-1 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover touch-manipulation">
                  Ajouter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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

      {/* Total = vehicle + extras + delivery fee (computeBookingTotal) */}
      <div className="bg-primary-light rounded-xl p-4">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">Total</span>
          <div className="text-right">
            {isEditing && editData.departureDate && editData.returnDate ? (
              (() => {
                const units = computeRentalUnitsFromDateTime(
                  editData.departureDate,
                  editData.pickupTime,
                  editData.returnDate,
                  editData.returnTime
                );
                const previewTotal = computeBookingTotal({
                  pricePerDay: editData.pricePerDay,
                  units,
                  extras: booking.extras,
                  deliveryFee: booking.deliveryFee,
                });
                return (
                  <>
                    <span className="text-2xl font-bold text-primary">{previewTotal}€</span>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        value={editData.pricePerDay}
                        onChange={(e) => setEditData({ ...editData, pricePerDay: Number(e.target.value) })}
                        className="w-20 px-2 py-1 text-sm text-right rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                        min="0"
                      />
                      <span className="text-xs text-gray-500">
                        €/jour × {formatRentalDuration(units) || '0 jour'}
                      </span>
                    </div>
                  </>
                );
              })()
            ) : (
              <>
                <span className="text-2xl font-bold text-primary">{booking.totalPrice}€</span>
                <p className="text-xs text-gray-500">{durationLabel}</p>
              </>
            )}
          </div>
        </div>
        {/* Breakdown (pre-008 web bookings fall back to the client's original order) */}
        {!isEditing && (
          <div className="mt-3 pt-3 border-t border-primary/20 text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Véhicule ({durationLabel})</span>
              <span>{isLegacyWeb && fullDetails ? fullDetails.vehicleTotal : computeVehicleSubtotal(dailyRate, bookingUnits)}€</span>
            </div>
            {(isLegacyWeb && fullDetails ? fullDetails.supplementsTotal : extrasSubtotal) > 0 && (
              <div className="flex justify-between">
                <span>Suppléments</span>
                <span>{isLegacyWeb && fullDetails ? fullDetails.supplementsTotal : extrasSubtotal}€</span>
              </div>
            )}
            {booking.deliveryFee > 0 && (
              <div className="flex justify-between">
                <span>Frais de déplacement</span>
                <span>{booking.deliveryFee}€</span>
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

      {/* Status Actions - All statuses available */}
      {!isEditing && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Changer le statut</h3>
          <div className="flex flex-wrap gap-2">
            {(['new', 'pending', 'active', 'completed', 'cancelled'] as BookingStatus[])
              .filter(s => s !== booking.status)
              .map((newStatus) => {
                const config = statusConfig[newStatus];
                return (
                  <button
                    key={newStatus}
                    onClick={() => onStatusChange(booking.id, newStatus)}
                    className={`flex-1 min-w-[calc(50%-0.25rem)] py-3 px-4 font-medium rounded-xl
                              transition-all touch-manipulation flex items-center justify-center gap-2
                              ${config.bgColor} ${config.color} hover:opacity-80 active:scale-95`}
                  >
                    {config.icon}
                    {config.label}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Delete Button */}
      {!isEditing && onDelete && (
        <div className="pt-2">
          <button
            onClick={() => {
              if (confirm(`Supprimer la réservation et le contact de ${booking.clientName} ?`)) {
                onDelete(booking.id);
                onClose();
              }
            }}
            className="w-full py-3 px-4 bg-red-100 hover:bg-red-200 text-red-600 font-medium rounded-xl
                      transition-all touch-manipulation flex items-center justify-center gap-2
                      active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer réservation et contact
          </button>
        </div>
      )}

      {/* Quick Extend - Only for active reservations */}
      {!isEditing && booking.status === 'active' && (
        <div className="bg-amber-50 rounded-xl p-4">
          <h3 className="font-semibold text-amber-800 mb-3">Prolonger la réservation</h3>
          <div className="flex gap-2">
            {[1, 3, 7].map((addDaysCount) => (
              <button
                key={addDaysCount}
                onClick={() => {
                  const currentReturn = new Date(booking.returnDate);
                  currentReturn.setDate(currentReturn.getDate() + addDaysCount);
                  const newReturnDate = currentReturn.toISOString().split('T')[0];
                  // Same rate as the rest of the booking; extras and delivery fee are re-billed on the new length
                  const newDays = booking.rentalDays + addDaysCount;
                  const newTotal = computeBookingTotal({
                    pricePerDay: dailyRate,
                    units: { fullDays: newDays, extraHours: booking.extraHours || 0 },
                    extras: booking.extras,
                    deliveryFee: booking.deliveryFee,
                  });
                  onBookingUpdate(booking.id, {
                    returnDate: newReturnDate,
                    rentalDays: newDays,
                    extraHours: booking.extraHours || 0,
                    pricePerDay: dailyRate,
                    totalPrice: newTotal,
                  });
                }}
                className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-medium
                         rounded-lg transition-all touch-manipulation text-sm"
              >
                +{addDaysCount} jour{addDaysCount > 1 ? 's' : ''}
              </button>
            ))}
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

  const clientContent = !fullDetails ? (
    <div className="text-center py-8 text-gray-500">
      <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
      <p>Détails client non disponibles</p>
      <p className="text-sm mt-1">Réservation créée manuellement</p>
    </div>
  ) : (
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

  const documentsContent = !fullDetails ? (
    <div className="text-center py-8 text-gray-500">
      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
      <p>Documents non disponibles</p>
      <p className="text-sm mt-1">Réservation créée manuellement</p>
    </div>
  ) : (
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (isEditing) {
                if (confirm('Vous avez des modifications non enregistrées. Fermer quand même ?')) {
                  setIsEditing(false);
                  onClose();
                }
              } else {
                onClose();
              }
            }}
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
                  onClick={() => {
                    if (isEditing) {
                      if (confirm('Vous avez des modifications non enregistrées. Fermer quand même ?')) {
                        setIsEditing(false);
                        onClose();
                      }
                    } else {
                      onClose();
                    }
                  }}
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
                  {activeTab === 'overview' && overviewContent}
                  {activeTab === 'client' && clientContent}
                  {activeTab === 'documents' && documentsContent}
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
