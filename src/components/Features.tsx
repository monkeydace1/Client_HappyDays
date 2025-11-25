import { ShieldCheck, Truck, Clock, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
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
        <section id="services" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="text-center p-6 rounded-xl hover:bg-amber-50 transition-colors"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                                <feature.icon size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-secondary mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
