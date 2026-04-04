import type { OrthodocalDay, ReadingRef, CalendarSystem } from '@/lib/types/calendar';

/**
 * Fetch liturgical day data from orthocal.info API.
 *
 * Endpoint mapping (CRITICAL — do not swap):
 *   'new_julian' -> /api/gregorian/ (Revised Julian fixed feasts align with civil dates)
 *   'old_julian' -> /api/julian/   (Old Julian — currently 13 days behind civil date)
 *
 * ALWAYS use response.month/day/year for display date, NOT the civil date.
 */
export async function fetchDayData(
  civilDate: Date,
  calendar: CalendarSystem
): Promise<OrthodocalDay> {
  const y = civilDate.getFullYear();
  const m = civilDate.getMonth() + 1;
  const d = civilDate.getDate();
  const endpoint = calendar === 'old_julian' ? 'julian' : 'gregorian';
  const url = `https://orthocal.info/api/${endpoint}/${y}/${m}/${d}/`;

  const res = await fetch(url, {
    next: { revalidate: 86400 }, // cache 24 hours
  });
  if (!res.ok) throw new Error(`orthocal.info fetch failed: ${res.status}`);
  return res.json() as Promise<OrthodocalDay>;
}

/**
 * Extract Gospel and Epistle ReadingRef objects from an OrthodocalDay.
 * Filters readings by source containing "Liturgy" or by book type.
 * Gospel books: Matthew, Mark, Luke, John
 * Everything else in readings is treated as Epistle.
 */
export function extractReadingRefs(day: OrthodocalDay): {
  gospel: ReadingRef[];
  epistle: ReadingRef[];
} {
  const GOSPEL_BOOKS = ['matt', 'matthew', 'mark', 'luke', 'john', 'jn'];
  const gospel: ReadingRef[] = [];
  const epistle: ReadingRef[] = [];

  for (const reading of day.readings) {
    if (!reading.passage || reading.passage.length === 0) continue;

    const firstVerse = reading.passage[0];
    const lastVerse = reading.passage[reading.passage.length - 1];

    const ref: ReadingRef = {
      book: firstVerse.book, // full book name from API (e.g., "John", "Hebrews", "1 Corinthians")
      chapter: firstVerse.chapter,
      verseStart: firstVerse.verse,
      verseEnd: lastVerse.verse,
      display: reading.display,
    };

    const bookLower = firstVerse.book.toLowerCase();
    if (GOSPEL_BOOKS.some(g => bookLower.includes(g))) {
      gospel.push(ref);
    } else {
      epistle.push(ref);
    }
  }

  return { gospel, epistle };
}

/**
 * Fetch all liturgical days for a given month in parallel.
 * Returns an array of OrthodocalDay objects in day order (day 1 first).
 */
export async function fetchMonthData(
  year: number,
  month: number,
  calendar: CalendarSystem
): Promise<OrthodocalDay[]> {
  const daysInMonth = new Date(year, month, 0).getDate(); // month is 1-indexed here
  const endpoint = calendar === 'old_julian' ? 'julian' : 'gregorian';

  const fetches = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const url = `https://orthocal.info/api/${endpoint}/${year}/${month}/${day}/`;
    return fetch(url, { next: { revalidate: 86400 } }).then(res => {
      if (!res.ok) throw new Error(`orthocal.info fetch failed for ${year}/${month}/${day}: ${res.status}`);
      return res.json() as Promise<OrthodocalDay>;
    });
  });

  return Promise.all(fetches);
}

/**
 * Format the display date string from OrthodocalDay fields.
 */
export function formatCalendarDate(day: OrthodocalDay, calendar: CalendarSystem): string {
  const months = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthName = months[day.month] ?? '';
  const base = `${day.day} ${monthName} ${day.year}`;
  return calendar === 'old_julian' ? `${base} (O.S.)` : base;
}
