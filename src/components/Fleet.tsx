import { Fuel, Gauge, Settings, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getFeaturedVehicles } from '../data/vehicleData';

export const Fleet = () => {
    const featuredVehicles = getFeaturedVehicles();

    return (
        <section id="fleet" className="py-12 md:py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10 md:mb-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-secondary mb-3 md:mb-4">
                        Nos Véhicules
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                        Une flotte récente et entretenue pour tous vos besoins, de la citadine économique au SUV familial.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {featuredVehicles.map((car, index) => (
                        <motion.div
                            key={car.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
                        >
                            <div className="relative h-40 sm:h-48 overflow-hidden">
                                <img
                                    src={car.image}
                                    alt={car.name}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-3 right-3 bg-accent text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                    {car.pricePerDay}€ / jour
                                </div>
                            </div>

                            <div className="p-4 md:p-5">
                                <h3 className="text-lg md:text-xl font-bold text-secondary mb-2">{car.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                    <span className="bg-primary-light text-primary px-2 py-0.5 rounded text-xs font-medium">{car.category}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4">
                                    <div className="flex items-center gap-1.5 text-gray-600 text-xs md:text-sm">
                                        <Settings size={14} className="text-accent" />
                                        <span>{car.transmission}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-600 text-xs md:text-sm">
                                        <Fuel size={14} className="text-accent" />
                                        <span>{car.fuel}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-600 text-xs md:text-sm">
                                        <Users size={14} className="text-accent" />
                                        <span>{car.seats} places</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-600 text-xs md:text-sm">
                                        <Gauge size={14} className="text-accent" />
                                        <span>Illimité</span>
                                    </div>
                                </div>

                                <Link
                                    to="/booking"
                                    className="w-full bg-gradient-to-r from-accent to-orange-500 hover:from-orange-500 hover:to-accent text-white font-bold py-2.5 md:py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transform hover:scale-[1.02]"
                                >
                                    Réserver
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mt-8 md:mt-12">
                    <Link
                        to="/fleet"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold text-base md:text-lg transition-colors group"
                    >
                        Voir toute la flotte
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
};
