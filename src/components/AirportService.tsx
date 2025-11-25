import { Plane, Clock, MapPin, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const AirportService = () => {
    const benefits = [
        'Livraison gratuite à l\'aéroport',
        'Disponible 24h/24, 7j/7',
        'Véhicule prêt à votre arrivée',
        'Retour flexible selon votre vol',
    ];

    return (
        <section className="relative py-20 overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary">

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                                <Plane className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-accent font-semibold text-lg">Service Aéroport</span>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Aéroport International Ahmed Ben Bella
                        </h2>

                        <p className="text-white/90 text-lg mb-8">
                            Nous vous attendons directement à l'aéroport d'Oran pour vous remettre votre véhicule.
                            Service de livraison et récupération gratuit pour tous nos clients.
                        </p>

                        <ul className="space-y-4 mb-8">
                            {benefits.map((benefit, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="flex items-center gap-3 text-white"
                                >
                                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                                    <span>{benefit}</span>
                                </motion.li>
                            ))}
                        </ul>

                        <div className="flex flex-wrap gap-6 text-white/80 text-sm">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-accent" />
                                <span>Service 24/7</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-accent" />
                                <span>Oran, Algérie</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats/Info Cards */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-2 gap-4"
                    >
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                            <div className="text-4xl font-bold text-accent mb-2">5 min</div>
                            <div className="text-white/80 text-sm">Temps d'attente moyen</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                            <div className="text-4xl font-bold text-accent mb-2">0 DZD</div>
                            <div className="text-white/80 text-sm">Frais de livraison</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                            <div className="text-4xl font-bold text-accent mb-2">24/7</div>
                            <div className="text-white/80 text-sm">Disponibilité</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                            <div className="text-4xl font-bold text-accent mb-2">100%</div>
                            <div className="text-white/80 text-sm">Clients satisfaits</div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
