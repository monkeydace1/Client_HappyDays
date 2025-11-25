import { motion } from 'framer-motion';

const sections = [
    {
        title: "Réservation",
        content: [
            "La réservation peut être effectuée en ligne via notre site web ou par téléphone.",
            "Une confirmation de réservation vous sera envoyée par email ou WhatsApp.",
            "La réservation devient définitive après réception de l'acompte ou validation de la caution."
        ]
    },
    {
        title: "Caution",
        content: [
            "Une caution est demandée à la prise en charge du véhicule.",
            "Le montant de la caution varie selon la catégorie du véhicule (à partir de 20 000 DA).",
            "La caution est restituée intégralement à la restitution du véhicule, sous réserve d'absence de dommages."
        ]
    },
    {
        title: "Documents Requis",
        content: [
            "Pièce d'identité valide (passeport ou carte d'identité nationale)",
            "Permis de conduire valide depuis au moins 2 ans",
            "Justificatif de domicile (pour les résidents algériens)"
        ]
    },
    {
        title: "Âge Minimum et Permis",
        content: [
            "L'âge minimum requis est de 21 ans.",
            "Le permis de conduire doit être valide depuis au moins 2 ans.",
            "Pour certaines catégories de véhicules (SUV, véhicules premium), l'âge minimum peut être porté à 25 ans."
        ]
    },
    {
        title: "Paiement",
        content: [
            "Nous acceptons les paiements en espèces (DA), par carte bancaire et par virement.",
            "Le paiement total est dû à la prise en charge du véhicule.",
            "Un acompte peut être demandé pour confirmer la réservation."
        ]
    },
    {
        title: "Kilométrage",
        content: [
            "Tous nos véhicules sont proposés avec un kilométrage illimité.",
            "Aucun frais supplémentaire ne sera facturé pour les kilomètres parcourus."
        ]
    },
    {
        title: "Assurance",
        content: [
            "Une assurance tous risques de base est incluse dans le tarif de location.",
            "Des options d'assurance complémentaires sont disponibles (franchise réduite, protection personnelle).",
            "En cas d'accident, le client doit remplir un constat amiable et contacter immédiatement l'agence."
        ]
    },
    {
        title: "Carburant",
        content: [
            "Le véhicule est remis avec le plein de carburant.",
            "Le véhicule doit être restitué avec le même niveau de carburant.",
            "En cas de restitution avec un niveau de carburant inférieur, des frais de remplissage seront facturés."
        ]
    },
    {
        title: "Restitution",
        content: [
            "Le véhicule doit être restitué à la date et à l'heure convenues.",
            "Tout retard de restitution sera facturé selon le tarif journalier en vigueur.",
            "Le véhicule doit être restitué dans le même état qu'à la prise en charge (propre et sans dommages)."
        ]
    },
    {
        title: "Assistance et Dépannage",
        content: [
            "Une assistance 24h/24 et 7j/7 est incluse.",
            "En cas de panne ou d'accident, contactez-nous immédiatement au +1 514 452 6332.",
            "Le remorquage est pris en charge en cas de panne mécanique (hors négligence du conducteur)."
        ]
    }
];

export const ConditionsPage = () => {
    return (
        <div className="min-h-screen pt-20 md:pt-24 pb-12 bg-white">
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
                        href="https://wa.me/15144526332"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Nous contacter
                    </a>
                </motion.div>
            </div>
        </div>
    );
};
