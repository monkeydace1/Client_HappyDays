import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, UserPlus, Baby, Shield, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookingStore } from '../../store/bookingStore';
import { childSeats, insuranceOptions, additionalDriverSupplement } from '../../data/supplementData';
import type { Insurance } from '../../types';

export const Supplements: React.FC = () => {
    const {
        additionalDriver,
        supplements,
        rentalDays,
        setAdditionalDriver,
        addSupplement,
        removeSupplement,
        updateSupplementQuantity,
        nextStep,
        previousStep
    } = useBookingStore();

    const [expandedInsurance, setExpandedInsurance] = useState<string | null>(null);

    // Get selected insurance
    const selectedInsurance = supplements.find(s => s.type === 'insurance') as Insurance | undefined;

    // Handle additional driver toggle
    const handleAdditionalDriverToggle = (checked: boolean) => {
        setAdditionalDriver(checked);
    };

    // Handle child seat quantity change
    const handleChildSeatQuantity = (seatId: string, quantity: number) => {
        const existingSeat = supplements.find(s => s.id === seatId);

        if (quantity === 0) {
            if (existingSeat) {
                removeSupplement(seatId);
            }
        } else {
            if (existingSeat) {
                updateSupplementQuantity(seatId, quantity);
            } else {
                const seat = childSeats.find(s => s.id === seatId);
                if (seat) {
                    addSupplement({ ...seat, quantity });
                }
            }
        }
    };

    // Handle insurance selection
    const handleInsuranceSelect = (insurance: Insurance) => {
        // Remove any existing insurance
        const existingInsurance = supplements.find(s => s.type === 'insurance');
        if (existingInsurance) {
            removeSupplement(existingInsurance.id);
        }

        // Add new insurance if not basic (basic is free/default)
        if (insurance.id !== 'insurance_basic') {
            addSupplement(insurance);
        }
    };

    const getChildSeatQuantity = (seatId: string): number => {
        const seat = supplements.find(s => s.id === seatId);
        return seat?.quantity || 0;
    };

    const calculateSupplementPrice = (pricePerDay: number, quantity: number = 1) => {
        const days = rentalDays || 1;
        return pricePerDay * quantity * days;
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
                    Options et suppléments
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                    Personnalisez votre location avec nos options
                </p>
            </div>

            <div className="space-y-6">
                {/* Additional Driver */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-xl shadow-lg p-4 sm:p-6"
                >
                    <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                            <UserPlus size={24} className="text-primary" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-secondary mb-1">
                                        {additionalDriverSupplement.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        {additionalDriverSupplement.description}
                                    </p>
                                    <p className="text-primary font-bold">
                                        {additionalDriverSupplement.pricePerDay}€/jour
                                        {rentalDays > 0 && (
                                            <span className="text-sm text-gray-600 font-normal ml-2">
                                                ({calculateSupplementPrice(additionalDriverSupplement.pricePerDay)}€ total)
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={additionalDriver}
                                        onChange={(e) => handleAdditionalDriverToggle(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Child Seats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl shadow-lg p-4 sm:p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                            <Baby size={24} className="text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-secondary">Sièges enfants</h3>
                    </div>

                    <div className="space-y-4">
                        {childSeats.map((seat) => {
                            const quantity = getChildSeatQuantity(seat.id);
                            return (
                                <div key={seat.id} className="flex items-center justify-between border-t border-gray-100 pt-4 first:border-0 first:pt-0">
                                    <div className="flex-1">
                                        <p className="font-medium text-secondary">{seat.name}</p>
                                        <p className="text-sm text-gray-600">{seat.description}</p>
                                        <p className="text-sm text-primary font-semibold mt-1">
                                            {seat.pricePerDay}€/jour
                                            {quantity > 0 && rentalDays > 0 && (
                                                <span className="text-gray-600 font-normal ml-2">
                                                    ({calculateSupplementPrice(seat.pricePerDay, quantity)}€ total)
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleChildSeatQuantity(seat.id, Math.max(0, quantity - 1))}
                                            className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold transition-colors"
                                        >
                                            −
                                        </button>
                                        <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                                        <button
                                            onClick={() => handleChildSeatQuantity(seat.id, quantity + 1)}
                                            className="w-8 h-8 rounded-lg bg-primary hover:bg-primary-hover text-white flex items-center justify-center font-bold transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Insurance Options */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-lg p-4 sm:p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                            <Shield size={24} className="text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-secondary">Assurance</h3>
                    </div>

                    <div className="space-y-3">
                        {insuranceOptions.map((insurance) => {
                            const isSelected = selectedInsurance?.id === insurance.id ||
                                (!selectedInsurance && insurance.id === 'insurance_basic');
                            const isExpanded = expandedInsurance === insurance.id;

                            return (
                                <div
                                    key={insurance.id}
                                    className={`border-2 rounded-lg transition-all ${isSelected
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div
                                        onClick={() => handleInsuranceSelect(insurance)}
                                        className="p-4 cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="radio"
                                                    checked={isSelected}
                                                    onChange={() => handleInsuranceSelect(insurance)}
                                                    className="mt-1 w-5 h-5 text-primary focus:ring-primary"
                                                />
                                                <div>
                                                    <h4 className="font-bold text-secondary">{insurance.name}</h4>
                                                    <p className="text-sm text-gray-600 mt-0.5">{insurance.description}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-primary">
                                                    {insurance.pricePerDay === 0 ? 'Inclus' : `${insurance.pricePerDay}€/jour`}
                                                </p>
                                                {insurance.pricePerDay > 0 && rentalDays > 0 && (
                                                    <p className="text-xs text-gray-600">
                                                        {calculateSupplementPrice(insurance.pricePerDay)}€ total
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Coverage Details */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setExpandedInsurance(isExpanded ? null : insurance.id);
                                        }}
                                        className="w-full px-4 pb-3 text-left flex items-center gap-2 text-sm text-primary hover:text-primary-hover"
                                    >
                                        <span>Voir les détails</span>
                                        <ChevronDown
                                            size={16}
                                            className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="px-4 pb-4 overflow-hidden"
                                            >
                                                <ul className="space-y-1 bg-gray-50 rounded-lg p-3">
                                                    {insurance.coverageDetails.map((detail, idx) => (
                                                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                                            <span className="text-primary mt-0.5">✓</span>
                                                            <span>{detail}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={previousStep}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={20} />
                    Retour
                </button>
                <button
                    onClick={nextStep}
                    className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
                >
                    Continuer
                    <ArrowRight size={20} />
                </button>
            </div>
        </motion.div>
    );
};
