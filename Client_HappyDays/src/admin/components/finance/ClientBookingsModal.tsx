import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Mail } from 'lucide-react';
import type { ClientRow, Period } from '../../lib/finance';
import { formatEuro, formatDay, isRevenueBooking, inPeriod } from '../../lib/finance';
import { STATUS_LABELS, STATUS_BADGE_CLASSES, SOURCE_LABELS } from '../../lib/bookingStatus';

interface ClientBookingsModalProps {
  client: ClientRow | null;
  period: Period;
  onClose: () => void;
}

export function ClientBookingsModal({ client, period, onClose }: ClientBookingsModalProps) {
  useEffect(() => {
    if (!client) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [client, onClose]);

  return (
    <AnimatePresence>
      {client && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 bottom-0 md:inset-0 md:m-auto md:max-w-2xl md:h-fit md:max-h-[85vh] max-h-[90vh] bg-white rounded-t-2xl md:rounded-2xl shadow-xl z-50 flex flex-col"
          >
            <div className="flex items-start justify-between p-4 border-b border-gray-200">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900 truncate">{client.name}</h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                  {client.phone && (
                    <a href={`tel:${client.phone}`} className="inline-flex items-center gap-1 hover:text-primary">
                      <Phone className="w-3.5 h-3.5" /> {client.phone}
                    </a>
                  )}
                  {client.email && (
                    <a href={`mailto:${client.email}`} className="inline-flex items-center gap-1 hover:text-primary truncate">
                      <Mail className="w-3.5 h-3.5" /> {client.email}
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 -m-2 text-gray-400 hover:text-gray-600 touch-manipulation"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              <ul className="divide-y divide-gray-100">
                {client.bookings.map((b) => {
                  const counted = isRevenueBooking(b) && inPeriod(b, period);
                  return (
                    <li key={b.id} className={`py-3 flex items-start gap-3 ${counted ? '' : 'opacity-60'}`}>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-gray-900">{b.vehicleName}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE_CLASSES[b.status]}`}>
                            {STATUS_LABELS[b.status]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {formatDay(b.departureDate)} → {formatDay(b.returnDate)} · {b.rentalDays} j
                          {b.extraHours ? ` + ${b.extraHours}h` : ''}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {b.bookingReference} · {SOURCE_LABELS[b.source]}
                        </p>
                      </div>
                      <span className="font-semibold text-gray-900 tabular-nums whitespace-nowrap">
                        {formatEuro(b.totalPrice)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-2xl text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Payé sur la période ({client.periodCount} rés.)</span>
                <span className="font-bold text-gray-900 tabular-nums">{formatEuro(client.periodTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Total toutes périodes ({client.lifetimeCount} rés. terminées)</span>
                <span className="tabular-nums">{formatEuro(client.lifetimeTotal)}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
