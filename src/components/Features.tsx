import { ShieldCheck, Truck, Clock, Gauge, Award, ParkingCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
    {
        icon: Award,
        title: "+3 Ans d'Expérience",
        description: "Plus de 3 ans d'expertise au service de votre satisfaction."
    },
    {
        icon: ShieldCheck,
        title: "Assurance Complète",
        description: "Roulez l'esprit tranquille avec notre couverture tous risques incluse."
    },
    {
        icon: Truck,
        title: "Livraison Gratuite",
        description: "Nous vous livrons le véhicule à l'aéroport ou à votre hôtel."
    },
    {
        icon: ParkingCircle,
        title: "Ticket Parking Aéroport",
        description: "Parking aéroport inclus pour faciliter votre voyage."
    },
    {
        icon: Clock,
        title: "Assistance 24/7",
        description: "Une équipe dédiée à votre écoute à tout moment de votre séjour."
    },
    {
        icon: Gauge,
        title: "Kilométrage Illimité",
        description: "Explorez sans compter, profitez de chaque kilomètre."
    }
];

export const Features = () => {
    return (
        <section id="services" className="py-12 md:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Title */}
                <div className="text-center mb-10 md:mb-14">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-secondary mb-3 md:mb-4">
                        Pourquoi Choisir HappyDays Car
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                        Des services de qualité pour une expérience de location sans souci
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="text-center p-4 md:p-6 rounded-xl hover:bg-primary-light transition-colors"
                        >
                            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-accent/10 text-accent mb-4 md:mb-6">
                                <feature.icon size={24} className="md:w-8 md:h-8" />
                            </div>
                            <h3 className="text-base md:text-xl font-bold text-secondary mb-2 md:mb-3">{feature.title}</h3>
                            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
