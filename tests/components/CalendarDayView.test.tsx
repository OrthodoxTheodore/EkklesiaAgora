import { render, screen } from '@testing-library/react';
import { CalendarDayView } from '@/components/calendar/CalendarDayView';
import type { OrthodocalDay } from '@/lib/types/calendar';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock AuthProvider
jest.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => ({ user: null, loading: false, roleLevel: 0 }),
}));

// Mock Server Action
jest.mock('@/app/actions/profile', () => ({
  updateCalendarPreference: jest.fn().mockResolvedValue({ success: true }),
}));

// Mock orthocal utilities with real implementations (pass-through)
jest.mock('@/lib/calendar/orthocal', () => {
  const actual = jest.requireActual('@/lib/calendar/orthocal');
  return {
    extractReadingRefs: actual.extractReadingRefs,
    formatCalendarDate: actual.formatCalendarDate,
  };
});

const baseDayData: OrthodocalDay = {
  year: 2026, month: 3, day: 19, weekday: 4, tone: 7,
  titles: ['Thursday of the Fourth Week of Lent'],
  summary_title: 'Thursday of the Fourth Week of Lent',
  feast_level: 0, feast_level_description: 'Liturgy',
  feasts: [],
  fast_level: 2, fast_level_desc: 'Lenten Fast',
  fast_exception: 0, fast_exception_desc: '',
  saints: ['Forty-two Martyrs of Ammoria'],
  stories: [{ title: 'Forty-two Martyrs of Ammoria (845)', story: '<p>Story text here.</p>' }],
  readings: [
    {
      source: 'Liturgy', book: 'Gospel', display: 'John 3.16-21', short_display: 'Jn 3.16-21',
      passage: [
        { book: 'John', chapter: 3, verse: 16, content: 'For God so loved...' },
        { book: 'John', chapter: 3, verse: 21, content: '...comes to the light.' },
      ],
    },
  ],
  pascha_distance: -24,
};

describe('CalendarDayView', () => {
  it('renders feast day title from API response (CAL-02)', () => {
    const dayData = { ...baseDayData, feasts: ['Annunciation'] };
    render(
      <CalendarDayView initialDay={dayData} initialCalendar="new_julian" isLoggedIn={false} />,
    );
    expect(screen.getByText('Annunciation')).toBeInTheDocument();
  });

  it('renders fasting rule text from fast_level_desc (CAL-03)', () => {
    render(
      <CalendarDayView initialDay={baseDayData} initialCalendar="new_julian" isLoggedIn={false} />,
    );
    expect(screen.getByText('Lenten Fast')).toBeInTheDocument();
  });

  it('renders date header with correct format', () => {
    render(
      <CalendarDayView initialDay={baseDayData} initialCalendar="new_julian" isLoggedIn={false} />,
    );
    // formatCalendarDate returns "19 March 2026" for new_julian
    expect(screen.getByText('19 March 2026')).toBeInTheDocument();
  });

  it('renders prev/next day navigation arrows', () => {
    render(
      <CalendarDayView initialDay={baseDayData} initialCalendar="new_julian" isLoggedIn={false} />,
    );
    expect(screen.getByLabelText('Previous Day')).toBeInTheDocument();
    expect(screen.getByLabelText('Next Day')).toBeInTheDocument();
  });

  it("shows 'No major feast today' when feasts array is empty", () => {
    const dayData = { ...baseDayData, feasts: [] };
    render(
      <CalendarDayView initialDay={dayData} initialCalendar="new_julian" isLoggedIn={false} />,
    );
    expect(screen.getByText('No major feast today')).toBeInTheDocument();
  });
});
