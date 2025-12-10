import { useState } from 'react';
import { Menu, X, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import logo from '../assets/123.png';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: 'Accueil', href: '/' },
        { name: 'Véhicules', href: '/fleet' },
        { name: 'Conditions', href: '/conditions' },
        { name: 'Contact', href: '/#contact' },
    ];

    return (
        <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 md:h-20">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex-shrink-0"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <img
                            src={logo}
                            alt="Happy Days Cars"
                            className="h-12 md:h-16 w-auto"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            link.href.startsWith('/') && !link.href.includes('#') ? (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className="text-secondary hover:text-primary transition-colors font-medium"
                                >
                                    {link.name}
                                </Link>
                            ) : (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-secondary hover:text-primary transition-colors font-medium"
                                >
                                    {link.name}
                                </a>
                            )
                        ))}
                        <Link
                            to="/booking"
                            className="flex items-center gap-2 bg-gradient-to-r from-accent to-orange-500 hover:from-orange-500 hover:to-accent text-white px-6 py-2.5 rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-accent/40 hover:shadow-xl"
                        >
                            <Calendar size={18} />
                            <span>Réserver</span>
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center gap-3">
                        <Link
                            to="/booking"
                            className="flex items-center gap-1.5 bg-gradient-to-r from-accent to-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm transition-all shadow-lg shadow-accent/30"
                        >
                            <Calendar size={16} />
                            <span>Réserver</span>
                        </Link>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-secondary hover:text-primary transition-colors p-1"
                            aria-label="Menu"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-1">
                            {navLinks.map((link) => (
                                link.href.startsWith('/') && !link.href.includes('#') ? (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        className="block px-3 py-3 text-base font-medium text-secondary hover:text-primary hover:bg-gray-50 rounded-md"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                ) : (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        className="block px-3 py-3 text-base font-medium text-secondary hover:text-primary hover:bg-gray-50 rounded-md"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.name}
                                    </a>
                                )
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
