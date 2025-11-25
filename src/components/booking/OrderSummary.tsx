import React from 'react';
import { Calendar, MapPin, Car, Shield, Baby, UserPlus, Euro } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBookingStore } from '../../store/bookingStore';
import type { Insurance } from '../../types';

export const OrderSummary: React.FC = () => {
    const {
        departureDate,
        returnDate,
        pickupLocation,
        rentalDays,
        selectedVehicle,
        supplements,
        additionalDriver,
        getTotalPrice,
        getSupplementsTotal
    } = useBookingStore();

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const vehicleTotal = selectedVehicle ? selectedVehicle.pricePerDay * (rentalDays || 1) : 0;
    const supplementsTotal = getSupplementsTotal();
    const totalPrice = getTotalPrice();

    // Get selected insurance
    const selectedInsurance = supplements.find(s => s.type === 'insurance') as Insurance | undefined;

    // Get child seats with quantities
    const childSeatsWithQty = supplements.filter(s => s.type === 'child_seat' && (s.quantity || 0) > 0);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-2xl p-6 lg:sticky lg:top-6 space-y-6"
        >
            <div className="border-b border-gray-200 pb-4">
                <h3 className="text-xl font-bold text-secondary flex items-center gap-2">
                    <Euro size={24} className="text-primary" />
                    Récapitulatif
                </h3>
            </div>

            {/* Dates & Location */}
            {departureDate && returnDate && (
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <Calendar size={18} className="text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 text-sm">
                            <p className="text-gray-600">Départ</p>
                            <p className="font-medium text-secondary">{formatDate(departureDate)}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Calendar size={18} className="text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 text-sm">
                            <p className="text-gray-600">Retour</p>
                            <p className="font-medium text-secondary">{formatDate(returnDate)}</p>
                        </div>
                    </div>
                    {rentalDays > 0 && (
                        <div className="bg-primary/5 rounded-lg px-3 py-2">
                            <p className="text-primary font-bold text-center">
                                {rentalDays} jour{rentalDays > 1 ? 's' : ''}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Pickup Location */}
            {pickupLocation && (
                <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
                    <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 text-sm">
                        <p className="text-gray-600">Lieu de ramassage</p>
                        <p className="font-medium text-secondary">{pickupLocation}</p>
                    </div>
                </div>
            )}

            {/* Selected Vehicle */}
            {selectedVehicle && (
                <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                        <Car size={18} className="text-primary flex-shrink-0" />
                        <h4 className="font-bold text-secondary">Véhicule</h4>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex gap-3">
                            <img
                                src={selectedVehicle.image}
                                alt={selectedVehicle.name}
                                className="w-20 h-16 object-cover rounded flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-secondary text-sm truncate">
                                    {selectedVehicle.name}
                                </p>
                                <p className="text-xs text-gray-600">{selectedVehicle.transmission}</p>
                                <p className="text-xs text-gray-600">{selectedVehicle.category}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="text-sm text-gray-600">
                                {selectedVehicle.pricePerDay}€ × {rentalDays || 1} jour{(rentalDays || 1) > 1 ? 's' : ''}
                            </span>
                            <span className="font-bold text-primary">{vehicleTotal}€</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Supplements */}
            {(additionalDriver || selectedInsurance || childSeatsWithQty.length > 0) && (
                <div className="pt-3 border-t border-gray-100 space-y-3">
                    <h4 className="font-bold text-secondary text-sm">Suppléments</h4>

                    {/* Additional Driver */}
                    {additionalDriver && (
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <UserPlus size={16} className="text-primary" />
                                <span className="text-gray-700">Conducteur sup.</span>
                            </div>
                            <span className="font-medium text-secondary">
                                {8 * (rentalDays || 1)}€
                            </span>
                        </div>
                    )}

                    {/* Child Seats */}
                    {childSeatsWithQty.map((seat) => (
                        <div key={seat.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <Baby size={16} className="text-primary" />
                                <span className="text-gray-700 truncate">
                                    {seat.name} (×{seat.quantity})
                                </span>
                            </div>
                            <span className="font-medium text-secondary">
                                {seat.pricePerDay * (seat.quantity || 1) * (rentalDays || 1)}€
                            </span>
                        </div>
                    ))}

                    {/* Insurance */}
                    {selectedInsurance && selectedInsurance.pricePerDay > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <Shield size={16} className="text-primary" />
                                <span className="text-gray-700 truncate">{selectedInsurance.name}</span>
                            </div>
                            <span className="font-medium text-secondary">
                                {selectedInsurance.pricePerDay * (rentalDays || 1)}€
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-sm">
                        <span className="text-gray-600">Sous-total suppléments</span>
                        <span className="font-bold text-primary">{supplementsTotal}€</span>
                    </div>
                </div>
            )}

            {/* Total */}
            <div className="pt-4 border-t-2 border-gray-300">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-secondary">Total</span>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-primary">{totalPrice}€</p>
                        {rentalDays > 0 && (
                            <p className="text-xs text-gray-500">TTC</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                    💡 Le prix inclut le kilométrage illimité et l'assurance de base.
                </p>
            </div>
        </motion.div>
    );
};
