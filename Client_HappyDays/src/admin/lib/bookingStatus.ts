import type { BookingStatus, BookingSource } from '../types/admin';

// Same labels/colours as the statusConfig copies in ReservationList,
// BookingDetailsModal and GanttChart. Flow: new -> pending -> active -> completed/cancelled.
export const STATUS_LABELS: Record<BookingStatus, string> = {
  new: 'Nouveau',
  pending: 'En attente',
  active: 'En cours',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

export const STATUS_BADGE_CLASSES: Record<BookingStatus, string> = {
  new: 'bg-purple-100 text-purple-600',
  pending: 'bg-orange-100 text-orange-600',
  active: 'bg-green-100 text-green-600',
  completed: 'bg-blue-100 text-blue-600',
  cancelled: 'bg-red-100 text-red-600',
};

export const SOURCE_LABELS: Record<BookingSource, string> = {
  web: 'Site web',
  walk_in: 'Sur place',
  phone: 'Téléphone',
};
