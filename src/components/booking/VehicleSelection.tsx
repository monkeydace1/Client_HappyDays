import React, { useEffect, useState } from 'react';
import { Fuel, Settings, Users, Gauge, ArrowLeft, Calendar, CheckCircle, AlertCircle, XCircle, Wrench, MessageCircle, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookingStore } from '../../store/bookingStore';
import { vehicles } from '../../data/vehicleData';
import { ImageCarousel } from '../ImageCarousel';
import type { Vehicle } from '../../types';
import {
    checkVehicleAvailability,
    formatConflictDates,
    getAvailabilityBadgeText,
    getAvailabilityBadgeColor,
    type VehicleAvailability,
    type AvailabilityStatus
} from '../../lib/availabilityService';

export const VehicleSelection: React.FC = () => {
    const {
        departureDate,
        returnDate,
        rentalDays,
        setSelectedVehicle,
        nextStep,
        previousStep
    } = useBookingStore();

    const [availabilities, setAvailabilities] = useState<VehicleAvailability[]>([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [contactModal, setContactModal] = useState<{ open: boolean; vehicle: Vehicle | null; conflicts: string }>({
        open: false,
        vehicle: null,
        conflicts: ''
    });
    const [transmissionFilter, setTransmissionFilter] = useState<'all' | 'Manuelle' | 'Automatique'>('all');

    // Fetch availability when dates are set
    useEffect(() => {
        const fetchAvailability = async () => {
            if (departureDate && returnDate) {
                setLoadingAvailability(true);
                try {
                    const result = await checkVehicleAvailability(departureDate, returnDate);
                    setAvailabilities(result);
                } catch (error) {
                    console.error('Error fetching availability:', error);
                }
                setLoadingAvailability(false);
            }
        };

        fetchAvailability();
    }, [departureDate, returnDate]);

    // Get availability status for a vehicle
    const getVehicleAvailability = (vehicleId: number): VehicleAvailability | undefined => {
        return availabilities.find(a => a.vehicleId === vehicleId);
    };

    // Get availability icon
    const getAvailabilityIcon = (status: AvailabilityStatus) => {
        switch (status) {
            case 'available':
                return <CheckCircle size={14} className="text-green-600" />;
            case 'partial_conflict':
                return <AlertCircle size={14} className="text-amber-600" />;
            case 'unavailable':
                return <XCircle size={14} className="text-red-600" />;
            case 'maintenance':
                return <Wrench size={14} className="text-gray-500" />;
            default:
                return <CheckCircle size={14} className="text-green-600" />;
        }
    };

    const handleVehicleBook = (vehicle: Vehicle, availability?: VehicleAvailability) => {
        // If vehicle has conflicts, show contact modal instead
        if (availability && (availability.status === 'partial_conflict' || availability.status === 'unavailable')) {
            const conflictDates = formatConflictDates(availability.conflicts);
            setContactModal({
                open: true,
                vehicle,
                conflicts: conflictDates
            });
            return;
        }

        // If maintenance, don't allow booking
        if (availability?.status === 'maintenance') {
            return;
        }

        setSelectedVehicle(vehicle);
        // Go to next step immediately
        setTimeout(() => {
            nextStep();
        }, 300);
    };

    const calculateTotalPrice = (pricePerDay: number) => {
        const days = rentalDays || 1;
        return pricePerDay * days;
    };

    // WhatsApp contact for unavailable vehicles
    const handleWhatsAppContact = (vehicle: Vehicle, conflicts: string) => {
        const message = encodeURIComponent(
            `Bonjour Happy Days! Je suis intéressé par le ${vehicle.name} pour la période du ${new Date(departureDate).toLocaleDateString('fr-FR')} au ${new Date(returnDate).toLocaleDateString('fr-FR')}. J'ai vu que ce véhicule est réservé (${conflicts}). Serait-il possible de discuter d'alternatives ou d'ajuster les dates?`
        );
        window.open(`https://wa.me/213550000000?text=${message}`, '_blank');
        setContactModal({ open: false, vehicle: null, conflicts: '' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
        >
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-secondary mb-2">
                    Choisissez votre véhicule
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                    Sélectionnez le véhicule qui correspond à vos besoins
                    {rentalDays > 0 && ` pour ${rentalDays} jour${rentalDays > 1 ? 's' : ''}`}
                </p>
            </div>

            {/* Transmission Filter */}
            <div className="flex flex-wrap gap-2 justify-center">
                <button
                    onClick={() => setTransmissionFilter('all')}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                        transmissionFilter === 'all'
                            ? 'bg-primary text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    Tous
                </button>
                <button
                    onClick={() => setTransmissionFilter('Manuelle')}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                        transmissionFilter === 'Manuelle'
                            ? 'bg-primary text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    Manuelle
                </button>
                <button
                    onClick={() => setTransmissionFilter('Automatique')}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                        transmissionFilter === 'Automatique'
                            ? 'bg-primary text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    Automatique
                </button>
            </div>

            {/* Loading indicator */}
            {loadingAvailability && (
                <div className="text-center py-4">
                    <div className="inline-flex items-center gap-2 text-gray-500">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span>Vérification des disponibilités...</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {vehicles
                    .filter(v => transmissionFilter === 'all' || v.transmission === transmissionFilter)
                    .sort((a, b) => a.pricePerDay - b.pricePerDay)
                    .map((vehicle, index) => {
                    const totalPrice = calculateTotalPrice(vehicle.pricePerDay);
                    const availability = getVehicleAvailability(vehicle.id);
                    const status = availability?.status || 'available';
                    const hasConflict = status === 'partial_conflict' || status === 'unavailable';

                    return (
                        <motion.div
                            key={vehicle.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all ${
                                status === 'maintenance' ? 'opacity-60' : ''
                            }`}
                        >
                            {/* Image Carousel */}
                            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                <ImageCarousel
                                    images={vehicle.images || [vehicle.image]}
                                    alt={vehicle.name}
                                />
                                <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white/95 backdrop-blur px-2 py-1 sm:px-3 sm:py-1.5 rounded-full z-20">
                                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                                        {vehicle.pricePerDay}€/jour
                                    </span>
                                </div>

                                {/* Availability Badge */}
                                {departureDate && returnDate && (
                                    <div className={`absolute top-2 left-2 sm:top-4 sm:left-4 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium z-20 ${getAvailabilityBadgeColor(status)}`}>
                                        {getAvailabilityIcon(status)}
                                        <span className="hidden sm:inline">{getAvailabilityBadgeText(status)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-3 sm:p-4 md:p-6">
                                <div className="mb-3 sm:mb-4">
                                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-secondary mb-1 truncate">
                                        {vehicle.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                        <span className="inline-block bg-gray-100 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm text-gray-600">
                                            {vehicle.category}
                                        </span>
                                        {/* Show conflict dates if any */}
                                        {hasConflict && availability?.conflicts && availability.conflicts.length > 0 && (
                                            <span className="inline-block bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[10px] sm:text-xs">
                                                Réservé: {formatConflictDates(availability.conflicts)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Specifications */}
                                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-3 mb-3 sm:mb-4">
                                    <div className="flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm">
                                        <Settings size={14} className="text-primary flex-shrink-0" />
                                        <span className="truncate">{vehicle.transmission}</span>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm">
                                        <Fuel size={14} className="text-primary flex-shrink-0" />
                                        <span className="truncate">{vehicle.fuel}</span>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm">
                                        <Users size={14} className="text-primary flex-shrink-0" />
                                        <span>{vehicle.seats} pl.</span>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm">
                                        <Gauge size={14} className="text-primary flex-shrink-0" />
                                        <span>Illimité</span>
                                    </div>
                                </div>

                                {/* Price */}
                                {rentalDays > 0 && (
                                    <div className="pt-3 sm:pt-4 border-t border-gray-100 mb-3 sm:mb-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 text-xs sm:text-sm">Total:</span>
                                            <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary">
                                                {totalPrice}€
                                            </span>
                                        </div>
                                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1 text-right">
                                            {vehicle.pricePerDay}€ × {rentalDays} j.
                                        </p>
                                    </div>
                                )}

                                {/* Book Button - changes based on availability */}
                                {status === 'available' ? (
                                    <button
                                        onClick={() => handleVehicleBook(vehicle, availability)}
                                        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2.5 sm:py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30 flex items-center justify-center gap-2 text-sm sm:text-base"
                                    >
                                        <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
                                        Réserver
                                    </button>
                                ) : status === 'maintenance' ? (
                                    <button
                                        disabled
                                        className="w-full bg-gray-300 text-gray-500 font-bold py-2.5 sm:py-3 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                                    >
                                        <Wrench size={16} className="sm:w-[18px] sm:h-[18px]" />
                                        Indisponible
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleVehicleBook(vehicle, availability)}
                                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 sm:py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 text-sm sm:text-base"
                                    >
                                        <MessageCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                                        Contacter
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Contact Modal for unavailable vehicles */}
            <AnimatePresence>
                {contactModal.open && contactModal.vehicle && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setContactModal({ open: false, vehicle: null, conflicts: '' })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={32} className="text-amber-600" />
                                </div>
                                <h3 className="text-xl font-bold text-secondary mb-2">
                                    Véhicule partiellement réservé
                                </h3>
                                <p className="text-gray-600">
                                    Le <strong>{contactModal.vehicle.name}</strong> est réservé pour la période du <strong>{contactModal.conflicts}</strong>.
                                </p>
                                <p className="text-gray-600 mt-2">
                                    Contactez-nous pour discuter d'alternatives ou ajuster vos dates!
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => handleWhatsAppContact(contactModal.vehicle!, contactModal.conflicts)}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageCircle size={20} />
                                    Contacter via WhatsApp
                                </button>
                                <a
                                    href="tel:+213550000000"
                                    className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Phone size={20} />
                                    Appeler directement
                                </a>
                                <button
                                    onClick={() => setContactModal({ open: false, vehicle: null, conflicts: '' })}
                                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-lg transition-all"
                                >
                                    Fermer
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Back Button */}
            <div className="flex justify-start">
                <button
                    onClick={previousStep}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-8 rounded-lg transition-all flex items-center gap-2"
                >
                    <ArrowLeft size={20} />
                    Retour
                </button>
            </div>
        </motion.div>
    );
};
