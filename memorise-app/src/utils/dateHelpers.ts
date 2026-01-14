import {
  format,
  isToday,
  isYesterday,
  differenceInDays,
  startOfDay,
  addDays,
  isSameDay as dateFnsSameDay
} from 'date-fns';

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
  if (isToday(date)) {
    return 'Today';
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  return format(date, 'MMM d, yyyy');
}

/**
 * Format a date with time
 */
export function formatDateTime(date: Date): string {
  return format(date, 'MMM d, yyyy HH:mm');
}

/**
 * Get number of days until a date (negative if past)
 */
export function getDaysUntil(date: Date): number {
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  return differenceInDays(target, today);
}

/**
 * Check if a date is in the past (before today)
 */
export function isDatePast(date: Date): boolean {
  return getDaysUntil(date) < 0;
}

/**
 * Check if a date is today
 */
export function isDateToday(date: Date): boolean {
  return isToday(date);
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return dateFnsSameDay(date1, date2);
}

/**
 * Get an array of dates for a range
 */
export function getDateRange(startDate: Date, days: number): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < days; i++) {
    dates.push(addDays(startDate, i));
  }
  return dates;
}

/**
 * Get all days in current year
 */
export function getDaysInYear(): Date[] {
  const start = new Date(new Date().getFullYear(), 0, 1);
  const end = new Date(new Date().getFullYear(), 11, 31);
  const days: Date[] = [];
  let current = start;
  while (current <= end) {
    days.push(new Date(current));
    current = addDays(current, 1);
  }
  return days;
}

/**
 * Format time duration in seconds to mm:ss
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get start of today
 */
export function getToday(): Date {
  return startOfDay(new Date());
}
