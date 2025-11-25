import { Facebook, Instagram, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/123.png';

export const Footer = () => {
    return (
        <footer id="contact" className="bg-secondary-dark text-white pt-12 md:pt-16 pb-6 md:pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-12">
                    {/* Brand Info */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <div className="mb-4 md:mb-6">
                            <img
                                src={logo}
                                alt="Happy Days Cars"
                                className="h-16 w-auto"
                            />
                        </div>
                        <p className="text-gray-400 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                            Votre partenaire de confiance pour la location de voitures à Oran. Qualité, service et prix transparents.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-accent transition-colors" aria-label="Facebook">
                                <Facebook size={22} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-accent transition-colors" aria-label="Instagram">
                                <Instagram size={22} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-base md:text-lg font-semibold mb-4 md:mb-6">Navigation</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/" className="text-gray-400 hover:text-accent transition-colors text-sm md:text-base">Accueil</Link>
                            </li>
                            <li>
                                <Link to="/fleet" className="text-gray-400 hover:text-accent transition-colors text-sm md:text-base">Nos Véhicules</Link>
                            </li>
                            <li>
                                <Link to="/conditions" className="text-gray-400 hover:text-accent transition-colors text-sm md:text-base">Conditions de Location</Link>
                            </li>
                            <li>
                                <Link to="/booking" className="text-gray-400 hover:text-accent transition-colors text-sm md:text-base">Réserver</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-base md:text-lg font-semibold mb-4 md:mb-6">Contact</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-gray-400">
                                <MapPin size={18} className="text-accent flex-shrink-0 mt-0.5" />
                                <span className="text-sm md:text-base">Oran, Algérie</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <Phone size={18} className="text-accent flex-shrink-0" />
                                <a href="tel:+15144526332" className="text-sm md:text-base hover:text-accent transition-colors">
                                    +1 514 452 6332
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <Mail size={18} className="text-accent flex-shrink-0" />
                                <span className="text-sm md:text-base">contact@happydays-dz.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* WhatsApp CTA */}
                    <div>
                        <h4 className="text-base md:text-lg font-semibold mb-4 md:mb-6">Besoin d'aide ?</h4>
                        <p className="text-gray-400 text-sm md:text-base mb-4">
                            Notre équipe est disponible pour répondre à vos questions.
                        </p>
                        <a
                            href="https://wa.me/15144526332"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm md:text-base"
                        >
                            <MessageCircle size={18} />
                            Nous contacter sur WhatsApp
                        </a>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-6 md:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-xs md:text-sm">
                    <p>&copy; {new Date().getFullYear()} Happy Days Location. Tous droits réservés.</p>
                    <div className="flex gap-4">
                        <Link to="/conditions" className="hover:text-accent transition-colors">
                            Conditions générales
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
