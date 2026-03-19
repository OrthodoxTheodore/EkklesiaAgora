// Mock fetch globally
const mockFetchResponse = {
  year: 2026, month: 3, day: 6, weekday: 4, tone: 7,
  titles: ['Thursday of the Fourth Week of Lent'],
  summary_title: 'Thursday of the Fourth Week of Lent',
  feast_level: 0, feast_level_description: 'Liturgy',
  feasts: [], fast_level: 2, fast_level_desc: 'Lenten Fast',
  fast_exception: 0, fast_exception_desc: '',
  saints: ['Forty-two Martyrs of Ammoria'],
  stories: [{ title: 'Forty-two Martyrs of Ammoria (845)', story: '<p>These holy martyrs...</p>' }],
  readings: [
    {
      source: 'Liturgy', book: 'Gospel', display: 'John 3.16-21', short_display: 'Jn 3.16-21',
      passage: [
        { book: 'John', chapter: 3, verse: 16, content: 'For God so loved...' },
        { book: 'John', chapter: 3, verse: 21, content: '...comes to the light.' },
      ],
    },
    {
      source: 'Liturgy', book: 'Epistle', display: 'Romans 8.28-39', short_display: 'Rom 8.28-39',
      passage: [
        { book: 'Romans', chapter: 8, verse: 28, content: 'And we know...' },
        { book: 'Romans', chapter: 8, verse: 39, content: '...in Christ Jesus.' },
      ],
    },
  ],
  pascha_distance: -24,
};

// Tests for extractReadingRefs
import { extractReadingRefs, formatCalendarDate } from '@/lib/calendar/orthocal';
import type { OrthodocalDay } from '@/lib/types/calendar';

describe('extractReadingRefs', () => {
  it('separates gospel and epistle readings from orthocal response', () => {
    const result = extractReadingRefs(mockFetchResponse as OrthodocalDay);
    expect(result.gospel).toHaveLength(1);
    expect(result.gospel[0].book).toBe('John');
    expect(result.gospel[0].chapter).toBe(3);
    expect(result.gospel[0].verseStart).toBe(16);
    expect(result.gospel[0].verseEnd).toBe(21);
    expect(result.epistle).toHaveLength(1);
    expect(result.epistle[0].book).toBe('Romans');
  });
});

describe('formatCalendarDate', () => {
  it('appends (O.S.) suffix for old_julian calendar', () => {
    const result = formatCalendarDate(mockFetchResponse as OrthodocalDay, 'old_julian');
    expect(result).toBe('6 March 2026 (O.S.)');
  });

  it('does not append suffix for new_julian calendar', () => {
    const dayData = { ...mockFetchResponse, day: 19 } as OrthodocalDay;
    const result = formatCalendarDate(dayData, 'new_julian');
    expect(result).toBe('19 March 2026');
    expect(result).not.toContain('O.S.');
  });
});
