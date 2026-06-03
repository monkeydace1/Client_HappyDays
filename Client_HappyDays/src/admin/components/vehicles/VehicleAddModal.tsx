import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Car, Euro, Image, Calendar, Users, Fuel, Settings } from 'lucide-react';
import type { AdminVehicle } from '../../types/admin';

interface VehicleAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vehicle: Omit<AdminVehicle, 'id'>) => void;
}

const CATEGORIES = ['Citadine', 'Berline', 'SUV', 'Mini', 'Compacte'];
const TRANSMISSIONS: AdminVehicle['transmission'][] = ['Manuelle', 'Automatique'];
const FUELS: AdminVehicle['fuel'][] = ['Essence', 'Diesel', 'Hybride', 'Électrique'];

export function VehicleAddModal({ isOpen, onClose, onSubmit }: VehicleAddModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    category: 'Citadine',
    transmission: 'Manuelle' as AdminVehicle['transmission'],
    fuel: 'Essence' as AdminVehicle['fuel'],
    seats: 5,
    pricePerDay: 25,
    image: '/vehicles/default.jpg',
    licensePlate: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.model) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        status: 'available',
      });
      // Reset form
      setFormData({
        name: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        category: 'Citadine',
        transmission: 'Manuelle',
        fuel: 'Essence',
        seats: 5,
        pricePerDay: 25,
        image: '/vehicles/default.jpg',
        licensePlate: '',
      });
      onClose();
    } catch (err) {
      console.error('Error adding vehicle:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-generate name from brand and model
  const updateName = (brand: string, model: string, year: number) => {
    if (brand && model) {
      setFormData(prev => ({ ...prev, name: `${brand} ${model} ${year}` }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2
                     md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full
                     bg-white rounded-t-2xl md:rounded-2xl z-50 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-gray-900">Nouveau véhicule</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                {/* Brand & Model */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marque *
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => {
                        setFormData({ ...formData, brand: e.target.value });
                        updateName(e.target.value, formData.model, formData.year);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200
                               focus:border-primary focus:ring-2 focus:ring-primary/20
                               outline-none transition-all text-sm"
                      placeholder="Renault, Peugeot..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modèle *
                    </label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => {
                        setFormData({ ...formData, model: e.target.value });
                        updateName(formData.brand, e.target.value, formData.year);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200
                               focus:border-primary focus:ring-2 focus:ring-primary/20
                               outline-none transition-all text-sm"
                      placeholder="Clio, 208..."
                      required
                    />
                  </div>
                </div>

                {/* Name (auto-generated) & Year */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200
                               focus:border-primary focus:ring-2 focus:ring-primary/20
                               outline-none transition-all text-sm"
                      placeholder="Renault Clio 5 2022"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-3.5 h-3.5 inline mr-1" />
                      Année
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => {
                        const year = Number(e.target.value);
                        setFormData({ ...formData, year });
                        updateName(formData.brand, formData.model, year);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200
                               focus:border-primary focus:ring-2 focus:ring-primary/20
                               outline-none transition-all text-sm"
                      min="2000"
                      max="2030"
                    />
                  </div>
                </div>

                {/* Category & Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200
                               focus:border-primary focus:ring-2 focus:ring-primary/20
                               outline-none transition-all text-sm appearance-none bg-white"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Euro className="w-3.5 h-3.5 inline mr-1" />
                      Prix/jour *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.pricePerDay}
                        onChange={(e) => setFormData({ ...formData, pricePerDay: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200
                                 focus:border-primary focus:ring-2 focus:ring-primary/20
                                 outline-none transition-all text-sm pr-8"
                        min="1"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                    </div>
                  </div>
                </div>

                {/* Transmission & Fuel */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Settings className="w-3.5 h-3.5 inline mr-1" />
                      Transmission
                    </label>
                    <select
                      value={formData.transmission}
                      onChange={(e) => setFormData({ ...formData, transmission: e.target.value as AdminVehicle['transmission'] })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200
                               focus:border-primary focus:ring-2 focus:ring-primary/20
                               outline-none transition-all text-sm appearance-none bg-white"
                    >
                      {TRANSMISSIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Fuel className="w-3.5 h-3.5 inline mr-1" />
                      Carburant
                    </label>
                    <select
                      value={formData.fuel}
                      onChange={(e) => setFormData({ ...formData, fuel: e.target.value as AdminVehicle['fuel'] })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200
                               focus:border-primary focus:ring-2 focus:ring-primary/20
                               outline-none transition-all text-sm appearance-none bg-white"
                    >
                      {FUELS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Seats & License Plate */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Users className="w-3.5 h-3.5 inline mr-1" />
                      Places
                    </label>
                    <input
                      type="number"
                      value={formData.seats}
                      onChange={(e) => setFormData({ ...formData, seats: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200
                               focus:border-primary focus:ring-2 focus:ring-primary/20
                               outline-none transition-all text-sm"
                      min="2"
                      max="9"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Immatriculation
                    </label>
                    <input
                      type="text"
                      value={formData.licensePlate}
                      onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200
                               focus:border-primary focus:ring-2 focus:ring-primary/20
                               outline-none transition-all text-sm"
                      placeholder="AB-123-CD"
                    />
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Image className="w-3.5 h-3.5 inline mr-1" />
                    Image (URL)
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200
                             focus:border-primary focus:ring-2 focus:ring-primary/20
                             outline-none transition-all text-sm"
                    placeholder="/vehicles/mon-vehicule/main.jpg"
                  />
                  {formData.image && (
                    <div className="mt-2 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={formData.image}
                        alt="Aperçu"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/vehicles/default.jpg';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-white">
                <button
                  type="submit"
                  disabled={!formData.name || !formData.brand || !formData.model || isSubmitting}
                  className={`w-full py-3 font-bold rounded-xl transition-all duration-200
                           touch-manipulation flex items-center justify-center gap-2
                           ${formData.name && formData.brand && formData.model && !isSubmitting
                             ? 'bg-primary hover:bg-primary-hover text-white active:scale-[0.98]'
                             : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Ajout en cours...
                    </>
                  ) : (
                    <>
                      <Car className="w-5 h-5" />
                      Ajouter le véhicule
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
