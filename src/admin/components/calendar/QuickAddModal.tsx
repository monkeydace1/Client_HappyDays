import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Calendar, Car } from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';
import type { AdminVehicle, QuickAddData } from '../../types/admin';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuickAddData) => void;
  initialDate: string | null;
  initialVehicleId: number | null;
  vehicles: AdminVehicle[];
}

export function QuickAddModal({
  isOpen,
  onClose,
  onSubmit,
  initialDate,
  initialVehicleId,
  vehicles,
}: QuickAddModalProps) {
  const [formData, setFormData] = useState<QuickAddData>({
    clientName: '',
    clientPhone: '',
    vehicleId: initialVehicleId || 0,
    departureDate: initialDate || '',
    returnDate: initialDate ? format(addDays(parseISO(initialDate), 1), 'yyyy-MM-dd') : '',
    notes: '',
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        clientName: '',
        clientPhone: '',
        vehicleId: initialVehicleId || 0,
        departureDate: initialDate || '',
        returnDate: initialDate ? format(addDays(parseISO(initialDate), 1), 'yyyy-MM-dd') : '',
        notes: '',
      });
    }
  }, [isOpen, initialDate, initialVehicleId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.clientName && formData.vehicleId && formData.departureDate && formData.returnDate) {
      onSubmit(formData);
      onClose();
    }
  };

  const selectedVehicle = vehicles.find((v) => v.id === formData.vehicleId);

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

          {/* Modal - Bottom sheet on mobile */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2
                     md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md md:w-full
                     bg-white rounded-t-2xl md:rounded-2xl z-50 max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Nouvelle réservation</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
              {/* Client Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom du client *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200
                             focus:border-primary focus:ring-2 focus:ring-primary/20
                             outline-none transition-all text-base"
                    placeholder="Nom complet"
                    required
                  />
                </div>
              </div>

              {/* Phone (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200
                             focus:border-primary focus:ring-2 focus:ring-primary/20
                             outline-none transition-all text-base"
                    placeholder="0555 00 00 00"
                  />
                </div>
              </div>

              {/* Vehicle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Véhicule *
                </label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: Number(e.target.value) })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200
                             focus:border-primary focus:ring-2 focus:ring-primary/20
                             outline-none transition-all text-base appearance-none bg-white"
                    required
                  >
                    <option value={0}>Sélectionner un véhicule</option>
                    {vehicles
                      .filter((v) => v.status === 'available')
                      .map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.name} - {vehicle.pricePerDay}€/j
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Départ *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.departureDate}
                      onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                      className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200
                               focus:border-primary focus:ring-2 focus:ring-primary/20
                               outline-none transition-all text-base"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Retour *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.returnDate}
                      onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                      min={formData.departureDate}
                      className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200
                               focus:border-primary focus:ring-2 focus:ring-primary/20
                               outline-none transition-all text-base"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Price Preview */}
              {selectedVehicle && formData.departureDate && formData.returnDate && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total estimé</span>
                    <span className="text-xl font-bold text-primary">
                      {(() => {
                        const days = Math.ceil(
                          (new Date(formData.returnDate).getTime() -
                            new Date(formData.departureDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        ) || 1;
                        return `${days * selectedVehicle.pricePerDay}€`;
                      })()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedVehicle.pricePerDay}€/jour
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold
                         rounded-xl transition-all duration-200 active:scale-[0.98]
                         touch-manipulation mt-2"
              >
                Créer la réservation
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
