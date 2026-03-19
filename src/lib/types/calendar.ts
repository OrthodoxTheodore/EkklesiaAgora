export interface ReadingRef {
  book: string;       // e.g., "John", "Romans"
  chapter: number;    // e.g., 3
  verseStart: number; // e.g., 16
  verseEnd: number;   // e.g., 21
  display: string;    // e.g., "John 3:16-21"
}

export interface SaintStory {
  title: string;       // e.g., "Forty-two Martyrs of Ammoria (845)"
  story: string;       // HTML narrative from Synaxarion
}

export interface OrthodocalDay {
  year: number;
  month: number;
  day: number;
  weekday: number;
  tone: number;
  titles: string[];
  summary_title: string;
  feast_level: number;
  feast_level_description: string;
  feasts: string[];
  fast_level: number;
  fast_level_desc: string;
  fast_exception: number;
  fast_exception_desc: string;
  saints: string[];
  stories: SaintStory[];
  readings: Array<{
    source: string;
    book: string;
    display: string;
    short_display: string;
    passage: Array<{
      book: string;
      chapter: number;
      verse: number;
      content: string;
    }>;
  }>;
  pascha_distance: number;
}

export type CalendarSystem = 'new_julian' | 'old_julian';
