import { useState } from 'react';
import { Calendar, Search, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../store/bookingStore';

export const Hero = () => {
    const navigate = useNavigate();
    const { setDepartureDate, setReturnDate, setPickupLocation } = useBookingStore();

    // Separate date and time states
    const [departureDay, setDepartureDay] = useState('');
    const [departureTime, setDepartureTime] = useState('10:00');
    const [returnDay, setReturnDay] = useState('');
    const [returnTime, setReturnTime] = useState('10:00');
    const [location, setLocation] = useState('Aéroport International Doran Ahmed Ben Bella');

    const handleSearch = () => {
        // Combine date and time into datetime-local format
        const fullDepartureDate = `${departureDay}T${departureTime}`;
        const fullReturnDate = `${returnDay}T${returnTime}`;

        // Save to store
        setDepartureDate(fullDepartureDate);
        setReturnDate(fullReturnDate);
        setPickupLocation(location);

        console.log('Saving dates:', { fullDepartureDate, fullReturnDate, location });

        // Navigate to booking page
        navigate('/booking');
    };

    return (
        <div className="relative h-screen min-h-[600px] flex items-center justify-center">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1473186505569-9c61870c11f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                        Explorez en toute liberté
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
                        Votre partenaire de confiance pour la location de voitures.
                        Profitez de nos tarifs exceptionnels et d'un service premium.
                    </p>
                </motion.div>

                {/* Booking Widget */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-6xl mx-auto"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Departure Date & Time */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Calendar size={16} className="text-primary" />
                                Date de départ
                            </label>
                            <input
                                type="date"
                                value={departureDay}
                                onChange={(e) => setDepartureDay(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-primary" />
                                <input
                                    type="time"
                                    value={departureTime}
                                    onChange={(e) => setDepartureTime(e.target.value)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Return Date & Time */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Calendar size={16} className="text-primary" />
                                Date de retour
                            </label>
                            <input
                                type="date"
                                value={returnDay}
                                onChange={(e) => setReturnDay(e.target.value)}
                                min={departureDay || new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-primary" />
                                <input
                                    type="time"
                                    value={returnTime}
                                    onChange={(e) => setReturnTime(e.target.value)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Pickup Location */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Lieu de ramassage
                            </label>
                            <select
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white h-[52px]"
                            >
                                <option value="Aéroport International Doran Ahmed Ben Bella">Aéroport Oran</option>
                                <option value="Wilaya Oran">Wilaya Oran</option>
                            </select>
                        </div>

                        {/* Search Button */}
                        <div className="flex items-end">
                            <button
                                onClick={handleSearch}
                                disabled={!departureDay || !returnDay}
                                className="w-full bg-primary hover:bg-primary-hover disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30 flex items-center justify-center gap-2 h-[52px]"
                            >
                                <Search size={20} />
                                Voir les disponibilités
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
