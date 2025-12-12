import { useState } from 'react';
import { Search, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../store/bookingStore';
import { PICKUP_LOCATIONS } from '../types';
import { HeroDatePicker } from './HeroDatePicker';
import { format } from 'date-fns';
import heroBackground from '../assets/photo-1656978310683-d415ee895c2c.jpg';

export const Hero = () => {
    const navigate = useNavigate();
    const { setDepartureDate, setReturnDate, setPickupLocation } = useBookingStore();

    const [departureDay, setDepartureDay] = useState('');
    const [departureTime, setDepartureTime] = useState('10:00');
    const [returnDay, setReturnDay] = useState('');
    const [returnTime, setReturnTime] = useState('10:00');
    const [location, setLocation] = useState<string>(PICKUP_LOCATIONS[0]);

    const handleDateConfirm = (from: Date, to: Date) => {
        setDepartureDay(format(from, 'yyyy-MM-dd'));
        setReturnDay(format(to, 'yyyy-MM-dd'));
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

    return (
        <div className="relative min-h-[70vh] md:min-h-[75vh] flex items-center justify-center pt-24 md:pt-28">
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
                        HappyDays Car - Location de voitures à Oran
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
                    <div className="space-y-4 md:space-y-6">
                        {/* Row 1: Date Picker (wide) */}
                        <HeroDatePicker
                            onConfirm={handleDateConfirm}
                            initialFrom={departureDay}
                            initialTo={returnDay}
                        />

                        {/* Row 2: Time pickers, Location, and Search */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                            {/* Departure Time */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-secondary flex items-center gap-2">
                                    <Clock size={14} className="text-accent" />
                                    Heure départ
                                </label>
                                <input
                                    type="time"
                                    value={departureTime}
                                    onChange={(e) => setDepartureTime(e.target.value)}
                                    className="w-full px-3 py-2.5 md:py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm md:text-base"
                                />
                            </div>

                            {/* Return Time */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-secondary flex items-center gap-2">
                                    <Clock size={14} className="text-accent" />
                                    Heure retour
                                </label>
                                <input
                                    type="time"
                                    value={returnTime}
                                    onChange={(e) => setReturnTime(e.target.value)}
                                    className="w-full px-3 py-2.5 md:py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm md:text-base"
                                />
                            </div>

                            {/* Pickup Location */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-secondary flex items-center gap-2">
                                    <MapPin size={14} className="text-accent" />
                                    Lieu de prise en charge
                                </label>
                                <select
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full px-3 py-2.5 md:py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white text-xs md:text-sm"
                                >
                                    {PICKUP_LOCATIONS.filter(loc => loc !== 'Autre (préciser)').map((loc) => (
                                        <option key={loc} value={loc}>
                                            {loc}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Search Button */}
                            <div className="flex items-end">
                                <button
                                    type="button"
                                    onClick={handleSearch}
                                    disabled={!departureDay || !returnDay}
                                    className="w-full bg-gradient-to-r from-accent to-orange-500 hover:from-orange-500 hover:to-accent disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-2.5 md:py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent/30 flex items-center justify-center gap-2 text-sm md:text-base"
                                >
                                    <Search size={18} />
                                    <span className="hidden sm:inline">Voir véhicules</span>
                                    <span className="sm:hidden">Rechercher</span>
                                </button>
                            </div>
                        </div>

                        {/* Info text */}
                        <p className="text-xs text-gray-500 text-center">
                            Livraison gratuite à l'aéroport et dans tout Oran
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
