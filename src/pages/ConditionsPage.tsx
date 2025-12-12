import { motion } from 'framer-motion';

const sections = [
    {
        title: "Règles d'utilisation",
        content: [
            "En prendre soin comme si c'était le sien",
            "Interdit de fumer dans la voiture",
            "Interdit de le sous-louer, de le prêter ou de s'en servir à titre professionnel",
            "Le rendre dans le même état que vous l'avez trouvé"
        ]
    },
    {
        title: "Carburant et Propreté",
        content: [
            "Rendre le véhicule avec le même niveau d'essence et de propreté qu'à la prise du véhicule",
            "Sinon 2000 dinars pour le lavage et 1000 dinars en plus pour l'essence à remplir",
            "Le plein du véhicule est à 2500 dinars"
        ]
    },
    {
        title: "État du Véhicule",
        content: [
            "En cas d'impact sur la carrosserie, rayures, dégradation de la voiture, etc… la totalité des réparations sera à votre charge"
        ]
    },
    {
        title: "Kilométrage",
        content: [
            "250 km par jour inclus",
            "Au-delà : 25 dinars par kilomètre dépassé"
        ]
    },
    {
        title: "Documents Requis",
        content: [
            "Le passeport sera demandé"
        ]
    },
    {
        title: "Âge Minimum",
        content: [
            "Le locataire doit être âgé de plus de 28 ans"
        ]
    },
    {
        title: "Caution",
        content: [
            "Une caution à partir de 60 000 dinars ou 300€ selon le type de véhicule sera demandée",
            "La caution est restituée directement après la location"
        ]
    },
    {
        title: "Paiement",
        content: [
            "La totalité du paiement se fera le 1er jour de la remise des clés"
        ]
    },
    {
        title: "Livraison",
        content: [
            "Possibilité de livraison et restitution depuis l'aéroport d'Oran"
        ]
    }
];

export const ConditionsPage = () => {
    return (
        <div className="min-h-screen pt-28 md:pt-32 pb-12 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10 md:mb-14"
                >
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-secondary mb-4">
                        Conditions de Location
                    </h1>
                    <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                        Tout ce que vous devez savoir pour louer un véhicule chez Happy Days
                    </p>
                </motion.div>

                {/* Sections */}
                <div className="space-y-8 md:space-y-10">
                    {sections.map((section, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className="border-b border-gray-100 pb-8"
                        >
                            <h2 className="text-lg md:text-xl font-bold text-primary mb-4">
                                {section.title}
                            </h2>
                            <ul className="space-y-2">
                                {section.content.map((item, itemIndex) => (
                                    <li
                                        key={itemIndex}
                                        className="flex items-start gap-3 text-gray-600 text-sm md:text-base"
                                    >
                                        <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                {/* Contact CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-12 p-6 md:p-8 bg-primary-light rounded-2xl text-center"
                >
                    <h3 className="text-lg md:text-xl font-bold text-secondary mb-3">
                        Des questions ?
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm md:text-base">
                        Notre équipe est à votre disposition pour répondre à toutes vos questions.
                    </p>
                    <a
                        href="https://wa.me/213055959955?text=Bonjour%2C%20je%20vous%20contacte%20depuis%20votre%20site%20web%20pour%20une%20question."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Nous contacter
                    </a>
                </motion.div>

                {/* Footer message */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="text-center mt-8 text-gray-500 italic text-sm"
                >
                    Qu'Allah nous préserve et nous facilite
                </motion.p>
            </div>
        </div>
    );
};
