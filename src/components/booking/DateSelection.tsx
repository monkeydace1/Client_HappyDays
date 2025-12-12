import React, { useState, useRef, useEffect } from 'react';
import { Calendar, MapPin, ArrowRight, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBookingStore } from '../../store/bookingStore';
import { PICKUP_LOCATIONS } from '../../types';

export const DateSelection: React.FC = () => {
    const {
        departureDate,
        returnDate,
        pickupLocation,
        customPickupLocation,
        returnLocation,
        differentReturnLocation,
        rentalDays,
        setDepartureDate,
        setReturnDate,
        setPickupLocation,
        setCustomPickupLocation,
        setReturnLocation,
        setDifferentReturnLocation,
        nextStep
    } = useBookingStore();

    // Split date and time for better control
    const [departureDay, setDepartureDay] = useState('');
    const [departureTime, setDepartureTime] = useState('10:00');
    const [returnDay, setReturnDay] = useState('');
    const [returnTime, setReturnTime] = useState('10:00');

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const departureDateRef = useRef<HTMLInputElement>(null);
    const returnDateRef = useRef<HTMLInputElement>(null);

    // Initialize from store values if they exist
    useEffect(() => {
        if (departureDate && departureDate.includes('T')) {
            const [day, time] = departureDate.split('T');
            setDepartureDay(day);
            setDepartureTime(time || '10:00');
        }
        if (returnDate && returnDate.includes('T')) {
            const [day, time] = returnDate.split('T');
            setReturnDay(day);
            setReturnTime(time || '10:00');
        }
    }, []);

    const validateDates = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!departureDay) {
            newErrors.departureDate = 'Veuillez sélectionner une date de départ';
        }

        if (!returnDay) {
            newErrors.returnDate = 'Veuillez sélectionner une date de retour';
        }

        if (!pickupLocation) {
            newErrors.pickupLocation = 'Veuillez sélectionner un lieu de ramassage';
        }

        if (pickupLocation === 'Autre (préciser)' && !customPickupLocation) {
            newErrors.customPickupLocation = 'Veuillez préciser le lieu de ramassage';
        }

        if (differentReturnLocation && !returnLocation) {
            newErrors.returnLocation = 'Veuillez préciser le lieu de retour';
        }

        if (departureDay && returnDay) {
            const fullDeparture = `${departureDay}T${departureTime}`;
            const fullReturn = `${returnDay}T${returnTime}`;
            const departure = new Date(fullDeparture);
            const returnD = new Date(fullReturn);

            if (returnD <= departure) {
                newErrors.returnDate = 'La date de retour doit être après la date de départ';
            }

            // Check if departure is in the past
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            if (departure < now) {
                newErrors.departureDate = 'La date de départ ne peut pas être dans le passé';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleContinue = () => {
        // Update store with combined date+time before validation
        if (departureDay) {
            setDepartureDate(`${departureDay}T${departureTime}`);
        }
        if (returnDay) {
            setReturnDate(`${returnDay}T${returnTime}`);
        }

        if (validateDates()) {
            nextStep();
        }
    };

    const handleDepartureDayChange = (value: string) => {
        setDepartureDay(value);
        if (value) {
            setDepartureDate(`${value}T${departureTime}`);
            // Auto-focus return date after departure is selected
            if (returnDateRef.current) {
                setTimeout(() => {
                    returnDateRef.current?.focus();
                    returnDateRef.current?.showPicker?.();
                }, 100);
            }
        }
    };

    const handleDepartureTimeChange = (value: string) => {
        setDepartureTime(value);
        if (departureDay) {
            setDepartureDate(`${departureDay}T${value}`);
        }
    };

    const handleReturnDayChange = (value: string) => {
        setReturnDay(value);
        if (value) {
            setReturnDate(`${value}T${returnTime}`);
        }
    };

    const handleReturnTimeChange = (value: string) => {
        setReturnTime(value);
        if (returnDay) {
            setReturnDate(`${returnDay}T${value}`);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                    Choisissez vos dates
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                    Sélectionnez vos dates de location et le lieu de ramassage
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
                {/* Departure Date & Time */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                        Date et heure de départ
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <div
                            className="relative cursor-pointer"
                            onClick={() => departureDateRef.current?.showPicker?.()}
                        >
                            <Calendar
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
                            />
                            <input
                                ref={departureDateRef}
                                type="date"
                                value={departureDay}
                                onChange={(e) => handleDepartureDayChange(e.target.value)}
                                onClick={(e) => e.currentTarget.showPicker?.()}
                                min={new Date().toISOString().split('T')[0]}
                                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.departureDate ? 'border-red-500' : 'border-gray-200'
                                    } focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base cursor-pointer`}
                            />
                        </div>
                        <div className="relative flex items-center gap-2">
                            <Clock size={18} className="text-primary flex-shrink-0" />
                            <input
                                type="time"
                                value={departureTime}
                                onChange={(e) => handleDepartureTimeChange(e.target.value)}
                                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base"
                            />
                        </div>
                    </div>
                    {errors.departureDate && (
                        <div className="flex items-center gap-2 text-red-500 text-sm">
                            <AlertCircle size={16} />
                            <span>{errors.departureDate}</span>
                        </div>
                    )}
                </div>

                {/* Return Date & Time */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                        Date et heure de retour
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <div
                            className="relative cursor-pointer"
                            onClick={() => returnDateRef.current?.showPicker?.()}
                        >
                            <Calendar
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
                            />
                            <input
                                ref={returnDateRef}
                                type="date"
                                value={returnDay}
                                onChange={(e) => handleReturnDayChange(e.target.value)}
                                onClick={(e) => e.currentTarget.showPicker?.()}
                                min={departureDay || new Date().toISOString().split('T')[0]}
                                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.returnDate ? 'border-red-500' : 'border-gray-200'
                                    } focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base cursor-pointer`}
                            />
                        </div>
                        <div className="relative flex items-center gap-2">
                            <Clock size={18} className="text-primary flex-shrink-0" />
                            <input
                                type="time"
                                value={returnTime}
                                onChange={(e) => handleReturnTimeChange(e.target.value)}
                                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base"
                            />
                        </div>
                    </div>
                    {errors.returnDate && (
                        <div className="flex items-center gap-2 text-red-500 text-sm">
                            <AlertCircle size={16} />
                            <span>{errors.returnDate}</span>
                        </div>
                    )}
                </div>

                {/* Pickup Location */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                        <MapPin size={18} className="text-primary" />
                        Lieu de ramassage
                    </label>
                    <select
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        className={`w-full px-3 sm:px-4 py-3 rounded-lg border ${errors.pickupLocation ? 'border-red-500' : 'border-gray-200'
                            } focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm sm:text-base bg-white`}
                    >
                        {PICKUP_LOCATIONS.map((location) => (
                            <option key={location} value={location}>
                                {location}
                            </option>
                        ))}
                    </select>
                    {errors.pickupLocation && (
                        <div className="flex items-center gap-2 text-red-500 text-sm">
                            <AlertCircle size={16} />
                            <span>{errors.pickupLocation}</span>
                        </div>
                    )}
                </div>

                {/* Custom Pickup Location */}
                {pickupLocation === 'Autre (préciser)' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                    >
                        <label className="block text-sm font-medium text-gray-700">
                            Précisez le lieu de ramassage
                        </label>
                        <input
                            type="text"
                            value={customPickupLocation}
                            onChange={(e) => setCustomPickupLocation(e.target.value)}
                            placeholder="Entrez l'adresse complète"
                            className={`w-full px-4 py-3 rounded-lg border ${errors.customPickupLocation ? 'border-red-500' : 'border-gray-200'
                                } focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                        />
                        {errors.customPickupLocation && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle size={16} />
                                <span>{errors.customPickupLocation}</span>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Different Return Location */}
                <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={differentReturnLocation}
                            onChange={(e) => setDifferentReturnLocation(e.target.checked)}
                            className="w-5 h-5 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700 font-medium">
                            Retourner le véhicule à un autre endroit
                        </span>
                    </label>

                    {differentReturnLocation && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-2"
                        >
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <MapPin size={18} className="text-primary" />
                                Lieu de retour
                            </label>
                            <input
                                type="text"
                                value={returnLocation}
                                onChange={(e) => setReturnLocation(e.target.value)}
                                placeholder="Entrez le lieu de retour"
                                className={`w-full px-4 py-3 rounded-lg border ${errors.returnLocation ? 'border-red-500' : 'border-gray-200'
                                    } focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                            />
                            {errors.returnLocation && (
                                <div className="flex items-center gap-2 text-red-500 text-sm">
                                    <AlertCircle size={16} />
                                    <span>{errors.returnLocation}</span>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Summary */}
                {departureDate && returnDate && rentalDays > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2"
                    >
                        <div className="text-sm text-gray-700">
                            <p className="font-medium">Récapitulatif:</p>
                            <p className="mt-1">{formatDate(departureDate)}</p>
                            <p>{formatDate(returnDate)}</p>
                            <p className="mt-2 text-primary font-bold text-lg">
                                Durée: {rentalDays} jour{rentalDays > 1 ? 's' : ''}
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Continue Button */}
                <button
                    onClick={handleContinue}
                    className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30 flex items-center justify-center gap-2 text-lg"
                >
                    Continuer
                    <ArrowRight size={20} />
                </button>
            </div>
        </motion.div>
    );
};
