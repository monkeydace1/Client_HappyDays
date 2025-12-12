import { Calendar, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TopBanner = () => {
    const phoneNumber = '213055959955';
    const message = encodeURIComponent('Bonjour, je vous contacte depuis votre site web pour une question.');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    return (
        <div className="fixed w-full top-0 z-50 bg-gradient-to-r from-primary to-primary-hover text-white py-2 px-4">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 md:gap-4 text-xs md:text-sm font-medium">
                <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-accent" />
                    <span className="hidden sm:inline">Réservation</span>
                    <Link to="/booking" className="underline hover:text-accent transition-colors">
                        en ligne
                    </Link>
                </span>
                <span className="text-white/60">ou</span>
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-green-400 transition-colors"
                >
                    <MessageCircle size={14} className="text-green-400" />
                    <span>WhatsApp</span>
                </a>
            </div>
        </div>
    );
};
