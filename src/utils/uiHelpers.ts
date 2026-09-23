/**
 * Musafir Clean Humanized UI & Formatting Utilities
 * Eliminates repetitive boilerplate across components with clean, reusable helper methods.
 */

/**
 * Formats Indian Currency with clean standard ₹ symbol
 */
export function formatCurrency(amountInr: number): string {
  if (isNaN(amountInr)) return '₹0';
  return `₹${Math.round(amountInr)}`;
}

/**
 * Formats human-friendly travel duration
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '0 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hrs = Math.floor(minutes / 60);
  const remMins = Math.round(minutes % 60);
  return remMins > 0 ? `${hrs} hr ${remMins} min` : `${hrs} hr`;
}

/**
 * Formats distance in either meters or kilometers
 */
export function formatDistance(distanceKm: number): string {
  if (isNaN(distanceKm) || distanceKm <= 0) return '0 km';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Returns humanized crowd status badges and styling classes
 */
export interface CrowdBadgeConfig {
  label: string;
  badgeClass: string;
  dotColor: string;
  isPacked: boolean;
}

export function getCrowdBadgeConfig(occupancyPercent: number): CrowdBadgeConfig {
  if (occupancyPercent >= 85) {
    return {
      label: 'Packed / Standing Only',
      badgeClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
      dotColor: 'bg-rose-500',
      isPacked: true,
    };
  }
  if (occupancyPercent >= 60) {
    return {
      label: 'Moderate (Few Seats)',
      badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      dotColor: 'bg-amber-500',
      isPacked: false,
    };
  }
  return {
    label: 'Comfortable (Seats Available)',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    dotColor: 'bg-emerald-500',
    isPacked: false,
  };
}

/**
 * Formats stop names by stripping redundant suffixes
 */
export function cleanStopName(rawName: string): string {
  if (!rawName) return '';
  return rawName
    .replace('Pinned Location ', '')
    .replace(' (Verified Transit Bay)', '')
    .replace(' (Terminal Bay)', '')
    .trim();
}

/**
 * Reusable Musafir card styles helper
 */
export const musafirCardStyles = {
  card: 'bg-white dark:bg-[#132827] border border-[#E5E7EB] dark:border-[#1E3836] shadow-sm dark:shadow-[0_8px_30px_rgba(4,15,14,0.4)] transition-all duration-200',
  cardHover: 'hover:border-[#0F766E] dark:hover:border-[#2DD4BF] hover:shadow-md dark:hover:shadow-[0_12px_36px_rgba(15,118,110,0.15)]',
  accentPill: 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
  primaryButton: 'bg-[#0F766E] hover:bg-[#115E59] active:scale-95 text-white font-extrabold shadow-md shadow-teal-700/25',
};

export const purplishCardStyles = musafirCardStyles;

