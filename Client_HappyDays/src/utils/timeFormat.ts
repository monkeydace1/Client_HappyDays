// French-style 24h time formatting helpers.
// We display times as "9h", "15h30" (not "9:00 AM" / "3:30 PM").

/**
 * Format an "HH:MM" 24h string for display: "9h", "15h30", "9h05".
 * Returns empty string for falsy input. Returns input as-is if unparseable.
 */
export function formatTime24h(time: string | undefined | null): string {
  if (!time) return '';

  const [hStr, mStr] = time.split(':');
  const hours = parseInt(hStr, 10);
  if (isNaN(hours)) return time;

  const minutes = mStr ? parseInt(mStr, 10) : 0;
  if (isNaN(minutes) || minutes === 0) return `${hours}h`;

  return `${hours}h${String(minutes).padStart(2, '0')}`;
}

/**
 * Format a YYYY-MM-DD date plus optional HH:MM time as a French-locale string,
 * with the time in 24h format (e.g. "20 nov. 2024 à 14h30").
 */
export function formatDateTime(date: string, time?: string): string {
  const dateObj = new Date(date);
  const dateStr = dateObj.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  if (time) {
    return `${dateStr} à ${formatTime24h(time)}`;
  }

  return dateStr;
}
