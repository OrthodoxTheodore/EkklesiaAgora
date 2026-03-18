export const ORTHODOX_CATEGORIES = [
  'Divine Liturgy',
  'Holy Scripture',
  'Holy Fathers',
  'Iconography',
  'Holy Trinity',
  'Chanting & Music',
  'Feast Days/Fast Days',
  'Church History',
  'Apologetics',
  'Spiritual Life',
] as const;

export type OrthodoxCategory = (typeof ORTHODOX_CATEGORIES)[number];
