import React from 'react';
import { Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
    return (
        <footer id="contact" className="bg-secondary-dark text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    {/* Brand Info */}
                    <div>
                        <h3 className="text-2xl font-bold text-primary mb-6">Happy Days</h3>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Votre partenaire de confiance pour la location de voitures.
                            Qualité, service et prix transparents pour des vacances inoubliables.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                                <Facebook size={24} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                                <Instagram size={24} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6">Navigation Rapide</h4>
                        <ul className="space-y-4">
                            <li>
                                <a href="#" className="text-gray-400 hover:text-primary transition-colors">Accueil</a>
                            </li>
                            <li>
                                <a href="#fleet" className="text-gray-400 hover:text-primary transition-colors">Nos Véhicules</a>
                            </li>
                            <li>
                                <a href="#services" className="text-gray-400 hover:text-primary transition-colors">Services</a>
                            </li>
                            <li>
                                <a href="#contact" className="text-gray-400 hover:text-primary transition-colors">Contact</a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6">Contactez-nous</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-gray-400">
                                <MapPin size={20} className="text-primary flex-shrink-0 mt-1" />
                                <span>123 Avenue de la Plage,<br />40000 Ville, Pays</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <Phone size={20} className="text-primary flex-shrink-0" />
                                <span>+33 1 23 45 67 89</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <Mail size={20} className="text-primary flex-shrink-0" />
                                <span>contact@happydays.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Happy Days Location. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    );
};
