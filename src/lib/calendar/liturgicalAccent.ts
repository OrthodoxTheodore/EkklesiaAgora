import type { OrthodocalDay } from '@/lib/types/calendar';

export interface LiturgicalAccent {
  label: string;
  colorVar: string;
}

// orthocal.info fast_level is stable across the year (verified against the
// live API): 0 No Fast, 1 the routine Wed/Fri fast, 2 Great Lent,
// 3 Apostles Fast, 4 Dormition Fast, 5 Nativity Fast.
const NAMED_FAST_LABELS: Record<number, string> = {
  3: 'Apostles Fast',
  4: 'Dormition Fast',
  5: 'Nativity Fast',
};

/**
 * Returns a subtle seasonal accent for days that carry real liturgical
 * weight — a major feast (feast_level >= 7, verified for Pascha, Nativity,
 * Theophany, and Theotokos feasts) or one of the four named fasting
 * seasons. Ordinary days, including the routine weekly fast, return null
 * so the site's normal navy/gold identity holds most of the year and the
 * accent stays a meaningful, occasional signal rather than daily noise.
 */
export function getLiturgicalAccent(day: OrthodocalDay): LiturgicalAccent | null {
  if (day.feast_level >= 7) {
    return { label: 'Major Feast', colorVar: 'var(--color-gold-bright)' };
  }
  if (day.fast_level === 2) {
    return { label: 'Great Lent', colorVar: 'var(--color-lenten)' };
  }
  const namedFast = NAMED_FAST_LABELS[day.fast_level];
  if (namedFast) {
    return { label: namedFast, colorVar: 'var(--color-crimson)' };
  }
  return null;
}
