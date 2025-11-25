import { useState, useRef } from 'react';
import { Calendar, Search, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../store/bookingStore';
import heroBackground from '../assets/photo-1656978310683-d415ee895c2c.jpg';

export const Hero = () => {
    const navigate = useNavigate();
    const { setDepartureDate, setReturnDate, setPickupLocation } = useBookingStore();

    const [departureDay, setDepartureDay] = useState('');
    const [departureTime, setDepartureTime] = useState('10:00');
    const [returnDay, setReturnDay] = useState('');
    const [returnTime, setReturnTime] = useState('10:00');
    const [location, setLocation] = useState('Aéroport International Doran Ahmed Ben Bella');

    const returnDateRef = useRef<HTMLInputElement>(null);

    const handleDepartureDateChange = (value: string) => {
        setDepartureDay(value);
        // Auto-focus return date input after selecting departure
        if (value && returnDateRef.current) {
            setTimeout(() => {
                returnDateRef.current?.focus();
                returnDateRef.current?.showPicker?.();
            }, 100);
        }
    };

    const handleSearch = () => {
        if (!departureDay || !returnDay) return;

        const fullDepartureDate = `${departureDay}T${departureTime}`;
        const fullReturnDate = `${returnDay}T${returnTime}`;

        setDepartureDate(fullDepartureDate);
        setReturnDate(fullReturnDate);
        setPickupLocation(location);

        navigate('/booking');
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="relative min-h-[70vh] md:min-h-[75vh] flex items-center justify-center pt-16 md:pt-20">
            {/* Background Image - Oran */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url(${heroBackground})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-6 md:mb-10"
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 leading-tight drop-shadow-2xl">
                        Location de voitures à Oran
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto px-4 drop-shadow-lg">
                        Louez votre voiture en toute simplicité - Tarifs exceptionnels et service premium
                    </p>
                </motion.div>

                {/* Booking Widget */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-5xl mx-auto"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {/* Departure Date & Time */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-secondary flex items-center gap-2">
                                <Calendar size={16} className="text-accent" />
                                Date de départ
                            </label>
                            <input
                                type="date"
                                value={departureDay}
                                onChange={(e) => handleDepartureDateChange(e.target.value)}
                                min={today}
                                className="w-full px-3 py-2.5 md:py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm md:text-base"
                            />
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-accent flex-shrink-0" />
                                <input
                                    type="time"
                                    value={departureTime}
                                    onChange={(e) => setDepartureTime(e.target.value)}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                />
                            </div>
                        </div>

                        {/* Return Date & Time */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-secondary flex items-center gap-2">
                                <Calendar size={16} className="text-accent" />
                                Date de retour
                            </label>
                            <input
                                ref={returnDateRef}
                                type="date"
                                value={returnDay}
                                onChange={(e) => setReturnDay(e.target.value)}
                                min={departureDay || today}
                                className="w-full px-3 py-2.5 md:py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm md:text-base"
                            />
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-accent flex-shrink-0" />
                                <input
                                    type="time"
                                    value={returnTime}
                                    onChange={(e) => setReturnTime(e.target.value)}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                />
                            </div>
                        </div>

                        {/* Pickup Location */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-secondary flex items-center gap-2">
                                <MapPin size={16} className="text-accent" />
                                Lieu de prise en charge
                            </label>
                            <select
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full px-3 py-2.5 md:py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white text-sm md:text-base"
                            >
                                <option value="Aéroport International Doran Ahmed Ben Bella">Aéroport Oran</option>
                                <option value="Wilaya Oran">Centre Oran</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Livraison gratuite</p>
                        </div>

                        {/* Search Button */}
                        <div className="flex items-end sm:col-span-2 lg:col-span-1">
                            <button
                                type="button"
                                onClick={handleSearch}
                                disabled={!departureDay || !returnDay}
                                className="w-full bg-gradient-to-r from-accent to-orange-500 hover:from-orange-500 hover:to-accent disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 md:py-3.5 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent/30 flex items-center justify-center gap-2 text-sm md:text-base"
                            >
                                <Search size={18} />
                                Rechercher
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
