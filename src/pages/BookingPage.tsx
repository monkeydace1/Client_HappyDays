import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBookingStore } from '../store/bookingStore';
import { DateSelection } from '../components/booking/DateSelection';
import { VehicleSelection } from '../components/booking/VehicleSelection';
import { Supplements } from '../components/booking/Supplements';
import { ClientInformation } from '../components/booking/ClientInformation';
import { OrderSummary } from '../components/booking/OrderSummary';

export const BookingPage: React.FC = () => {
    const { currentStep, departureDate, returnDate, pickupLocation, goToStep } = useBookingStore();

    // If user came from homepage with dates already filled, skip to step 2
    useEffect(() => {
        if (currentStep === 1 && departureDate && returnDate && pickupLocation) {
            goToStep(2);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const steps = [
        { number: 1, title: 'Dates' },
        { number: 2, title: 'Véhicule' },
        { number: 3, title: 'Options' },
        { number: 4, title: 'Informations' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-3">
                        Réservez votre véhicule
                    </h1>
                    <p className="text-lg text-gray-600">
                        Complétez votre réservation en 4 étapes simples
                    </p>
                </motion.div>

                {/* Step Indicator */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-12"
                >
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center justify-between relative">
                            {/* Progress Line */}
                            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 -z-10">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>

                            {/* Step Circles - CLICKABLE */}
                            {steps.map((step) => {
                                const isActive = currentStep === step.number;
                                const isCompleted = currentStep > step.number;
                                const canClick = isCompleted || isActive;

                                return (
                                    <button
                                        key={step.number}
                                        onClick={() => canClick && goToStep(step.number)}
                                        disabled={!canClick}
                                        className={`flex flex-col items-center relative bg-gray-50 px-2 ${canClick ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'
                                            } transition-all`}
                                    >
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${isActive
                                                ? 'bg-primary text-white ring-4 ring-primary/20 scale-110'
                                                : isCompleted
                                                    ? 'bg-primary text-white hover:ring-2 hover:ring-primary/30'
                                                    : 'bg-gray-200 text-gray-500'
                                                }`}
                                        >
                                            {isCompleted ? '✓' : step.number}
                                        </div>
                                        <span
                                            className={`text-sm font-medium mt-2 transition-colors ${isActive ? 'text-primary' : isCompleted ? 'text-secondary' : 'text-gray-500'
                                                }`}
                                        >
                                            {step.title}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Step Content */}
                    <div className="lg:col-span-2">
                        {currentStep === 1 && <DateSelection />}
                        {currentStep === 2 && <VehicleSelection />}
                        {currentStep === 3 && <Supplements />}
                        {currentStep === 4 && <ClientInformation />}
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="hidden lg:block">
                            <OrderSummary />
                        </div>

                        {/* Mobile Order Summary - Collapsible */}
                        <div className="lg:hidden">
                            <details className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                <summary className="px-6 py-4 cursor-pointer font-bold text-secondary flex items-center justify-between">
                                    <span>Voir le récapitulatif</span>
                                    <span className="text-2xl font-bold text-primary">
                                        {useBookingStore.getState().getTotalPrice()}€
                                    </span>
                                </summary>
                                <div className="px-6 pb-6">
                                    <OrderSummary />
                                </div>
                            </details>
                        </div>
                    </div>
                </div>

                {/* Help Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 text-center"
                >
                    <p className="text-gray-600 mb-2">Besoin d'aide ?</p>
                    <a
                        href="https://wa.me/1234567890"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        Contactez-nous sur WhatsApp
                    </a>
                </motion.div>
            </div>
        </div>
    );
};
