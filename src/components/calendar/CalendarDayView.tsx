'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SaintCard } from '@/components/calendar/SaintCard';
import { ReadingRef } from '@/components/calendar/ReadingRef';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/components/auth/AuthProvider';
import { updateCalendarPreference } from '@/app/actions/profile';
import { extractReadingRefs, formatCalendarDate } from '@/lib/calendar/orthocal';
import type { OrthodocalDay, CalendarSystem } from '@/lib/types/calendar';

interface CalendarDayViewProps {
  initialDay: OrthodocalDay;
  initialCalendar: CalendarSystem;
  isLoggedIn: boolean;
}

function toDateStr(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function adjustDate(year: number, month: number, day: number, delta: number): Date {
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + delta);
  return d;
}

function getFeastTitleClass(feastLevel: number): string {
  if (feastLevel >= 5) return 'text-gold-bright font-cinzel font-semibold text-base';
  if (feastLevel >= 3) return 'text-gold font-cinzel font-semibold text-base';
  if (feastLevel >= 1) return 'text-gold-dim font-cinzel text-base';
  return 'text-text-light font-garamond text-base';
}

const sectionHeaderClass =
  'font-cinzel text-xs uppercase tracking-widest text-gold-dim mb-3 border-b border-gold/[0.10] pb-2';

export function CalendarDayView({ initialDay, initialCalendar, isLoggedIn }: CalendarDayViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [calendar, setCalendar] = useState<CalendarSystem>(initialCalendar);
  const [togglingCalendar, setTogglingCalendar] = useState(false);
  const [error] = useState<string | null>(null);

  const dayData = initialDay;

  const currentDateStr = toDateStr(dayData.year, dayData.month, dayData.day);
  const formattedDate = formatCalendarDate(dayData, calendar);
  const { gospel, epistle } = extractReadingRefs(dayData);

  function navigateDay(delta: number) {
    const next = adjustDate(dayData.year, dayData.month, dayData.day, delta);
    const y = next.getFullYear();
    const m = String(next.getMonth() + 1).padStart(2, '0');
    const d = String(next.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    router.push(`/calendar?date=${dateStr}&cal=${calendar}`);
  }

  async function handleCalendarToggle(newPref: CalendarSystem) {
    if (newPref === calendar) return;
    setCalendar(newPref);
    setTogglingCalendar(true);
    try {
      if (isLoggedIn && user) {
        await updateCalendarPreference(user.uid, newPref);
      }
      router.push(`/calendar?date=${currentDateStr}&cal=${newPref}`);
    } finally {
      setTogglingCalendar(false);
    }
  }

  if (error) {
    return (
      <Card>
        <p className="font-garamond text-text-mid text-center">
          Unable to load today&apos;s calendar. Please try again.
        </p>
        <div className="text-center mt-4">
          <button
            onClick={() => router.refresh()}
            className="font-cinzel text-xs uppercase tracking-widest text-gold hover:text-gold-bright transition-colors"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  const feastHeader =
    dayData.feasts.length === 1 ? 'Feast of the Day' : 'Feasts of the Day';

  return (
    <div className="space-y-6">
      {/* Calendar system toggle */}
      <div
        role="group"
        aria-label="Calendar system"
        className="flex items-center gap-2"
      >
        <button
          onClick={() => handleCalendarToggle('new_julian')}
          aria-pressed={calendar === 'new_julian'}
          disabled={togglingCalendar}
          className={`font-cinzel text-xs uppercase tracking-widest px-3 py-1.5 rounded border transition-colors ${
            calendar === 'new_julian'
              ? 'bg-navy-light border-gold text-gold'
              : 'border-transparent text-text-mid hover:text-text-light'
          }`}
        >
          New Calendar
        </button>
        <button
          onClick={() => handleCalendarToggle('old_julian')}
          aria-pressed={calendar === 'old_julian'}
          disabled={togglingCalendar}
          className={`font-cinzel text-xs uppercase tracking-widest px-3 py-1.5 rounded border transition-colors ${
            calendar === 'old_julian'
              ? 'bg-navy-light border-gold text-gold'
              : 'border-transparent text-text-mid hover:text-text-light'
          }`}
        >
          Old Calendar (O.S.)
        </button>
      </div>

      {/* Date header with prev/next navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigateDay(-1)}
          aria-label="Previous Day"
          className="w-11 h-11 flex items-center justify-center text-gold hover:text-gold-bright transition-colors"
        >
          <ChevronLeft size={24} aria-hidden="true" />
        </button>

        <div className="flex-1 text-center">
          <h2 className="text-4xl font-cinzel font-semibold text-text-light">
            {formattedDate}
          </h2>
          {dayData.summary_title ? (
            <p className="font-garamond text-base text-text-mid mt-1">
              {dayData.summary_title}
            </p>
          ) : null}
        </div>

        <button
          onClick={() => navigateDay(1)}
          aria-label="Next Day"
          className="w-11 h-11 flex items-center justify-center text-gold hover:text-gold-bright transition-colors"
        >
          <ChevronRight size={24} aria-hidden="true" />
        </button>
      </div>

      {/* Feasts section */}
      <section>
        <h2 className={sectionHeaderClass}>{feastHeader}</h2>
        {dayData.feasts.length === 0 ? (
          <p className="font-garamond text-sm text-text-mid">No major feast today</p>
        ) : (
          <ul className="space-y-1">
            {dayData.feasts.map((feast, i) => (
              <li key={i}>
                <span
                  className={getFeastTitleClass(dayData.feast_level)}
                  {...(dayData.feast_level >= 5
                    ? { 'aria-label': `Great Feast: ${feast}` }
                    : {})}
                >
                  {feast}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Saints section */}
      <section>
        <h2 className={sectionHeaderClass}>Saints of the Day</h2>
        {dayData.stories.length === 0 ? (
          <p className="font-garamond text-sm text-text-mid">No saint commemoration today</p>
        ) : (
          <div className="space-y-3">
            {dayData.stories.map((story, i) => (
              <SaintCard key={i} story={story} feastLevel={dayData.feast_level} />
            ))}
          </div>
        )}
      </section>

      {/* Fasting section */}
      <section>
        <h2 className={sectionHeaderClass}>Fasting Rule</h2>
        <p className="font-garamond text-base text-text-light">{dayData.fast_level_desc}</p>
        {dayData.fast_exception_desc ? (
          <p className="font-garamond text-sm text-text-mid mt-1">{dayData.fast_exception_desc}</p>
        ) : null}
      </section>

      {/* Daily Readings section */}
      <section>
        <h2 className={sectionHeaderClass}>Daily Readings</h2>
        {gospel.length === 0 && epistle.length === 0 ? (
          <p className="font-garamond text-sm text-text-mid">No readings listed for today</p>
        ) : (
          <div className="space-y-2">
            {gospel.map((ref, i) => (
              <ReadingRef key={`gospel-${i}`} ref={ref} label="Holy Gospel" />
            ))}
            {epistle.map((ref, i) => (
              <ReadingRef key={`epistle-${i}`} ref={ref} label="Epistle" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
