import { useState } from 'react';
import { Fuel, Gauge, Settings, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { vehicles } from '../data/vehicleData';

type TransmissionFilter = 'all' | 'Manuelle' | 'Automatique';

export const FleetPage = () => {
    const [filter, setFilter] = useState<TransmissionFilter>('all');

    const filteredVehicles = filter === 'all'
        ? vehicles
        : vehicles.filter(v => v.transmission === filter);

    return (
        <div className="min-h-screen pt-28 md:pt-32 pb-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8 md:mb-12">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-secondary mb-3 md:mb-4">
                        Notre Flotte
                    </h1>
                    <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                        Découvrez tous nos véhicules disponibles à la location. De la citadine au SUV, trouvez la voiture idéale pour votre séjour.
                    </p>
                </div>

                {/* Filter */}
                <div className="flex justify-center mb-8 md:mb-10">
                    <div className="inline-flex bg-white rounded-lg p-1 shadow-md">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 md:px-6 py-2 md:py-2.5 rounded-md text-sm md:text-base font-medium transition-all ${
                                filter === 'all'
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-gray-600 hover:text-primary'
                            }`}
                        >
                            Tous
                        </button>
                        <button
                            onClick={() => setFilter('Manuelle')}
                            className={`px-4 md:px-6 py-2 md:py-2.5 rounded-md text-sm md:text-base font-medium transition-all ${
                                filter === 'Manuelle'
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-gray-600 hover:text-primary'
                            }`}
                        >
                            Manuelle
                        </button>
                        <button
                            onClick={() => setFilter('Automatique')}
                            className={`px-4 md:px-6 py-2 md:py-2.5 rounded-md text-sm md:text-base font-medium transition-all ${
                                filter === 'Automatique'
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-gray-600 hover:text-primary'
                            }`}
                        >
                            Automatique
                        </button>
                    </div>
                </div>

                {/* Vehicles Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredVehicles.map((car, index) => (
                        <motion.div
                            key={car.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
                        >
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <img
                                    src={car.image}
                                    alt={car.name}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-accent text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                                    {car.pricePerDay}€/jour
                                </div>
                            </div>

                            <div className="p-3 sm:p-4 md:p-5">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-secondary truncate">{car.name}</h3>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2 text-sm text-gray-500 mb-3 sm:mb-4">
                                    <span className="bg-primary-light text-primary px-2 py-0.5 rounded text-xs font-medium">
                                        {car.category}
                                    </span>
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                                        {car.brand}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-3 mb-4 sm:mb-5">
                                    <div className="flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm">
                                        <Settings size={14} className="text-accent flex-shrink-0" />
                                        <span className="truncate">{car.transmission}</span>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm">
                                        <Fuel size={14} className="text-accent flex-shrink-0" />
                                        <span className="truncate">{car.fuel}</span>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm">
                                        <Users size={14} className="text-accent flex-shrink-0" />
                                        <span>{car.seats} places</span>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm">
                                        <Gauge size={14} className="text-accent flex-shrink-0" />
                                        <span>Km illimité</span>
                                    </div>
                                </div>

                                <Link
                                    to="/booking"
                                    className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 sm:py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                                >
                                    Réserver
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* No results */}
                {filteredVehicles.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">Aucun véhicule trouvé avec ce filtre.</p>
                    </div>
                )}

                {/* Back to home */}
                <div className="text-center mt-10 md:mt-12">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium transition-colors"
                    >
                        <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        </div>
    );
};
