import { useState } from 'react';
import { Search, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../store/bookingStore';
import { DateRangePicker } from './DateRangePicker';
import heroBackground from '../assets/photo-1656978310683-d415ee895c2c.jpg';

export const Hero = () => {
    const navigate = useNavigate();
    const { setDepartureDate, setReturnDate, setPickupLocation } = useBookingStore();

    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: undefined,
        to: undefined
    });
    const [departureTime, setDepartureTime] = useState('10:00');
    const [returnTime, setReturnTime] = useState('10:00');
    const [location, setLocation] = useState('Aéroport International Doran Ahmed Ben Bella');

    const handleDateRangeSelect = (range: { from: Date | undefined; to: Date | undefined }) => {
        setDateRange(range);
    };

    const handleSearch = () => {
        if (!dateRange.from || !dateRange.to) return;

        // Format dates with times
        const formatDateWithTime = (date: Date, time: string) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}T${time}`;
        };

        const fullDepartureDate = formatDateWithTime(dateRange.from, departureTime);
        const fullReturnDate = formatDateWithTime(dateRange.to, returnTime);

        // Save to store
        setDepartureDate(fullDepartureDate);
        setReturnDate(fullReturnDate);
        setPickupLocation(location);

        // Navigate to booking page
        navigate('/booking');
    };

    const isFormValid = dateRange.from && dateRange.to;

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
                    className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-4xl mx-auto"
                >
                    <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
                        {/* Date Range Picker */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="block text-sm font-medium text-secondary">
                                Dates de location
                            </label>
                            <DateRangePicker
                                onRangeSelect={handleDateRangeSelect}
                                initialFrom={dateRange.from}
                                initialTo={dateRange.to}
                            />

                            {/* Time selectors - show only after dates selected */}
                            {dateRange.from && dateRange.to && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="grid grid-cols-2 gap-3 pt-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-accent flex-shrink-0" />
                                        <div className="flex-1">
                                            <span className="text-xs text-gray-500 block">Départ</span>
                                            <input
                                                type="time"
                                                value={departureTime}
                                                onChange={(e) => setDepartureTime(e.target.value)}
                                                className="w-full px-2 py-1.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-accent flex-shrink-0" />
                                        <div className="flex-1">
                                            <span className="text-xs text-gray-500 block">Retour</span>
                                            <input
                                                type="time"
                                                value={returnTime}
                                                onChange={(e) => setReturnTime(e.target.value)}
                                                className="w-full px-2 py-1.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
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
                            <p className="text-xs text-gray-500">Livraison gratuite</p>
                        </div>
                    </div>

                    {/* Search Button */}
                    <div className="mt-6">
                        <button
                            onClick={handleSearch}
                            disabled={!isFormValid}
                            className="w-full bg-gradient-to-r from-accent to-orange-500 hover:from-orange-500 hover:to-accent disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-3.5 md:py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-accent/40 hover:shadow-2xl hover:shadow-accent/50 flex items-center justify-center gap-2 text-base md:text-lg"
                        >
                            <Search size={20} />
                            Rechercher un véhicule
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
