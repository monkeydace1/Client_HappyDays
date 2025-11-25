import { Fuel, Gauge, Settings, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const vehicles = [
    {
        id: 1,
        name: 'Renault Clio 5',
        category: 'Citadine',
        image: 'https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Placeholder
        transmission: 'Manuelle',
        fuel: 'Essence',
        seats: 5,
        price: 35,
        featured: true
    },
    {
        id: 2,
        name: 'Dacia Sandero Stepway',
        category: 'Citadine',
        image: 'https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Placeholder
        transmission: 'Manuelle',
        fuel: 'Essence',
        seats: 5,
        price: 40,
        featured: true
    },
    {
        id: 3,
        name: 'Peugeot 208',
        category: 'Citadine',
        image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Placeholder
        transmission: 'Automatique',
        fuel: 'Essence',
        seats: 5,
        price: 45,
        featured: true
    },
    {
        id: 4,
        name: 'Hyundai Tucson',
        category: 'SUV',
        image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Placeholder
        transmission: 'Automatique',
        fuel: 'Diesel',
        seats: 5,
        price: 80,
        featured: true
    }
];

export const Fleet = () => {
    return (
        <section id="fleet" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                        Nos Véhicules
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Une flotte récente et entretenue pour tous vos besoins, de la citadine économique au SUV familial.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {vehicles.map((car, index) => (
                        <motion.div
                            key={car.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={car.image}
                                    alt={car.name}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-primary">
                                    {car.price}€ / jour
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold text-secondary mb-2">{car.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                    <span className="bg-gray-100 px-2 py-1 rounded">{car.category}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                        <Settings size={16} className="text-primary" />
                                        <span>{car.transmission}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                        <Fuel size={16} className="text-primary" />
                                        <span>{car.fuel}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                        <Users size={16} className="text-primary" />
                                        <span>{car.seats} places</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                        <Gauge size={16} className="text-primary" />
                                        <span>Illimité</span>
                                    </div>
                                </div>

                                <a
                                    href={`https://wa.me/1234567890?text=Bonjour, je souhaite réserver le véhicule ${car.name}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-secondary hover:bg-secondary-dark text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white"
                                >
                                    Réserver
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <button className="text-primary hover:text-primary-hover font-semibold text-lg flex items-center justify-center gap-2 mx-auto">
                        Voir toute la flotte
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
};
