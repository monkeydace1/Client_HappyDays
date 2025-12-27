import React, { useState } from 'react';
import { Fuel, Settings, Users, Gauge, ArrowLeft, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBookingStore } from '../../store/bookingStore';
import { vehicles } from '../../data/vehicleData';
import { ImageCarousel } from '../ImageCarousel';
import type { Vehicle } from '../../types';

export const VehicleSelection: React.FC = () => {
    const {
        rentalDays,
        setSelectedVehicle,
        nextStep,
        previousStep
    } = useBookingStore();

    const [transmissionFilter, setTransmissionFilter] = useState<'all' | 'Manuelle' | 'Automatique'>('all');

    const handleVehicleBook = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        const totalPrice = calculateTotalPrice(vehicle.pricePerDay);

        // Track Meta Pixel InitiateCheckout event
        if (typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('track', 'InitiateCheckout', {
                content_name: vehicle.name,
                content_category: vehicle.category,
                currency: 'EUR',
                value: totalPrice,
            });
        }

        // Track Google Analytics begin_checkout event
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'begin_checkout', {
                currency: 'EUR',
                value: totalPrice,
                items: [{
                    item_id: vehicle.id,
                    item_name: vehicle.name,
                    item_category: vehicle.category,
                    price: vehicle.pricePerDay,
                    quantity: rentalDays || 1
                }]
            });
        }

        // Go to next step immediately
        setTimeout(() => {
            nextStep();
        }, 300);
    };

    const calculateTotalPrice = (pricePerDay: number) => {
        const days = rentalDays || 1;
        return pricePerDay * days;
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {vehicles
                    .filter(v => transmissionFilter === 'all' || v.transmission === transmissionFilter)
                    .sort((a, b) => a.pricePerDay - b.pricePerDay)
                    .map((vehicle, index) => {
                    const totalPrice = calculateTotalPrice(vehicle.pricePerDay);

                    return (
                        <motion.div
                            key={vehicle.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
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

                            </div>

                            {/* Content */}
                            <div className="p-3 sm:p-4 md:p-6">
                                <div className="mb-3 sm:mb-4">
                                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-secondary mb-1 truncate">
                                        {vehicle.name}
                                    </h3>
                                    <span className="inline-block bg-gray-100 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm text-gray-600">
                                        {vehicle.category}
                                    </span>
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

                                <button
                                    onClick={() => handleVehicleBook(vehicle)}
                                    className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2.5 sm:py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30 flex items-center justify-center gap-2 text-sm sm:text-base"
                                >
                                    <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
                                    Réserver
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

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
