import React from 'react';
import { Fuel, Settings, Users, Gauge, ArrowLeft, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBookingStore } from '../../store/bookingStore';
import { vehicles } from '../../data/vehicleData';
import type { Vehicle } from '../../types';

export const VehicleSelection: React.FC = () => {
    const {
        rentalDays,
        setSelectedVehicle,
        nextStep,
        previousStep
    } = useBookingStore();

    const handleVehicleBook = (vehicle: Vehicle) => {
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
        >
            <div>
                <h2 className="text-3xl font-bold text-secondary mb-2">
                    Choisissez votre véhicule
                </h2>
                <p className="text-gray-600">
                    Sélectionnez le véhicule qui correspond à vos besoins
                    {rentalDays > 0 && ` pour ${rentalDays} jour${rentalDays > 1 ? 's' : ''}`}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vehicles.map((vehicle, index) => {
                    const totalPrice = calculateTotalPrice(vehicle.pricePerDay);

                    return (
                        <motion.div
                            key={vehicle.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
                        >
                            {/* Image */}
                            <div className="relative h-48 overflow-hidden bg-gray-100">
                                <img
                                    src={vehicle.image}
                                    alt={vehicle.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full">
                                    <span className="text-sm font-medium text-gray-700">
                                        {vehicle.pricePerDay}€/jour
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-secondary mb-1">
                                        {vehicle.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                                            {vehicle.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Specifications */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                        <Settings size={16} className="text-primary flex-shrink-0" />
                                        <span>{vehicle.transmission}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                        <Fuel size={16} className="text-primary flex-shrink-0" />
                                        <span>{vehicle.fuel}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                        <Users size={16} className="text-primary flex-shrink-0" />
                                        <span>{vehicle.seats} places</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                        <Gauge size={16} className="text-primary flex-shrink-0" />
                                        <span>Illimité</span>
                                    </div>
                                </div>

                                {/* Price */}
                                {rentalDays > 0 && (
                                    <div className="pt-4 border-t border-gray-100 mb-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 text-sm">Prix total:</span>
                                            <span className="text-2xl font-bold text-primary">
                                                {totalPrice}€
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 text-right">
                                            {vehicle.pricePerDay}€ × {rentalDays} jour{rentalDays > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                )}

                                {/* Book Button */}
                                <button
                                    onClick={() => handleVehicleBook(vehicle)}
                                    className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
                                >
                                    <Calendar size={18} />
                                    Réserver ce véhicule
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
