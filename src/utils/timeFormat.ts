/**
 * Time formatting utilities for 12-hour AM/PM display
 */

/**
 * Convert 24-hour time string to 12-hour AM/PM format
 * @param time24 - Time in "HH:MM" format (e.g., "14:30")
 * @returns Time in 12-hour format (e.g., "2:30 PM")
 */
export function formatTime12h(time24: string | undefined | null): string {
  if (!time24) return '';

  const [hoursStr, minutesStr] = time24.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = minutesStr || '00';

  if (isNaN(hours)) return time24;

  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;

  return `${hours12}:${minutes} ${period}`;
}

/**
 * Convert 12-hour time string to 24-hour format
 * @param time12 - Time in "H:MM AM/PM" format (e.g., "2:30 PM")
 * @returns Time in 24-hour format (e.g., "14:30")
 */
export function formatTime24h(time12: string): string {
  if (!time12) return '';

  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return time12;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

/**
 * Format date and time together for display
 * @param date - Date string in "YYYY-MM-DD" format
 * @param time - Time string in "HH:MM" format
 * @returns Formatted date/time string
 */
export function formatDateTime(date: string, time?: string): string {
  const dateObj = new Date(date);
  const dateStr = dateObj.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  if (time) {
    return `${dateStr} à ${formatTime12h(time)}`;
  }

  return dateStr;
}
