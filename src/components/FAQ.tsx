import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
    {
        question: "Quels documents sont nécessaires pour louer une voiture ?",
        answer: "Pour louer une voiture chez Happy Days, vous aurez besoin d'une pièce d'identité valide (passeport ou carte d'identité), d'un permis de conduire valide depuis au moins 2 ans, et d'une carte bancaire pour la caution."
    },
    {
        question: "Quel est l'âge minimum pour louer un véhicule ?",
        answer: "L'âge minimum requis est de 21 ans avec un permis de conduire valide depuis au moins 2 ans. Pour certaines catégories de véhicules (SUV, voitures de luxe), l'âge minimum peut être de 25 ans."
    },
    {
        question: "Le kilométrage est-il vraiment illimité ?",
        answer: "Oui, tous nos véhicules sont proposés avec un kilométrage illimité. Vous pouvez explorer l'Algérie sans vous soucier des kilomètres parcourus."
    },
    {
        question: "Proposez-vous la livraison à l'aéroport ?",
        answer: "Oui, nous proposons un service de livraison gratuit à l'Aéroport International Ahmed Ben Bella d'Oran. Nous pouvons également livrer votre véhicule à votre hôtel ou à une adresse de votre choix."
    },
    {
        question: "Quels modes de paiement acceptez-vous ?",
        answer: "Nous acceptons les paiements en espèces, par carte bancaire et par virement. Une caution est demandée au moment de la prise en charge du véhicule."
    },
    {
        question: "Que faire en cas de panne ou d'accident ?",
        answer: "Notre assistance est disponible 24h/24 et 7j/7. En cas de panne ou d'accident, contactez-nous immédiatement et nous interviendrons dans les plus brefs délais. Tous nos véhicules sont couverts par une assurance complète."
    }
];

export const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-12 md:py-20 bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-secondary mb-3 md:mb-4">
                        Questions Fréquentes
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 px-4">
                        Tout ce que vous devez savoir avant de réserver
                    </p>
                </div>

                {/* FAQ Items */}
                <div className="space-y-3 md:space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-xl shadow-sm overflow-hidden"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-medium text-secondary text-sm md:text-base pr-4">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`w-5 h-5 text-accent flex-shrink-0 transition-transform duration-300 ${
                                        openIndex === index ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 md:px-5 pb-4 md:pb-5 text-gray-600 text-sm md:text-base leading-relaxed border-t border-gray-100 pt-4">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="text-center mt-8 md:mt-10">
                    <p className="text-gray-600 text-sm md:text-base mb-3">
                        Vous avez d'autres questions ?
                    </p>
                    <a
                        href="#contact"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium transition-colors"
                    >
                        Contactez-nous
                    </a>
                </div>
            </div>
        </section>
    );
};
