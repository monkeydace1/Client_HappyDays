import { Star, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const reviews = [
    {
        id: 1,
        name: "H. v.d. S",
        date: "il y a 2 mois",
        rating: 5,
        text: "Great service!! Does not speak English but immediately took his phone to translate everything so we could communicate! Nice people...",
        avatar: null
    },
    {
        id: 2,
        name: "Sofiane Iagais",
        date: "il y a 2 mois",
        rating: 5,
        text: "Franchement une agence au top. Deuxième location chez eux et rien à dire sur le professionnalisme.",
        avatar: null
    },
    {
        id: 3,
        name: "Hemza Fenniche",
        date: "il y a 2 mois",
        rating: 5,
        text: "La meilleure agence de location je conseille Amine",
        avatar: null
    },
    {
        id: 4,
        name: "James26 Armans",
        date: "il y a 2 mois",
        rating: 5,
        text: "Reservation qui s'est bien passé, voiture propre, service client agréable et courtois. A recommander.",
        avatar: null
    },
    {
        id: 5,
        name: "Sarah Briber",
        date: "il y a 2 mois",
        rating: 5,
        text: "Service au top, ils sont super réactifs et les voitures sont au top, je recommande !",
        avatar: null
    }
];

export const GoogleReviews = () => {
    return (
        <section className="py-12 md:py-20 bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mb-8 md:mb-12"
                >
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-secondary mb-3">
                        EXCELLENT
                    </h2>
                    <div className="flex justify-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 md:w-6 md:h-6 fill-yellow-400 text-yellow-400" />
                        ))}
                    </div>
                    <p className="text-gray-600 text-sm md:text-base mb-3">
                        Basée sur 478 avis
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <svg className="h-6 md:h-8" viewBox="0 0 272 92" xmlns="http://www.w3.org/2000/svg">
                            <path fill="#4285F4" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
                            <path fill="#EA4335" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
                            <path fill="#FBBC05" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"/>
                            <path fill="#4285F4" d="M225 3v65h-9.5V3h9.5z"/>
                            <path fill="#34A853" d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"/>
                            <path fill="#EA4335" d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"/>
                        </svg>
                    </div>
                </motion.div>

                {/* Reviews Carousel */}
                <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                    <div className="flex gap-4 md:gap-6 min-w-max">
                        {reviews.map((review, index) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white shadow-lg rounded-xl p-4 md:p-5 w-64 md:w-72 flex-shrink-0"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                                            {review.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-secondary font-medium text-sm">{review.name}</p>
                                            <p className="text-gray-400 text-xs">{review.date}</p>
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                    </svg>
                                </div>
                                <div className="flex gap-0.5 mb-3">
                                    {[...Array(review.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                    {review.text}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* CTA to Google */}
                <div className="text-center mt-6 md:mt-8">
                    <a
                        href="https://maps.app.goo.gl/xQbUXyfYwKtoP1DF6"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors text-sm md:text-base"
                    >
                        Voir tous les avis sur Google
                        <ExternalLink size={16} />
                    </a>
                </div>
            </div>
        </section>
    );
};
