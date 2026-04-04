'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { SaintCard } from '@/components/calendar/SaintCard';
import { ReadingRef } from '@/components/calendar/ReadingRef';
import { useAuth } from '@/components/auth/AuthProvider';
import { updateCalendarPreference } from '@/app/actions/profile';
import { extractReadingRefs, formatCalendarDate } from '@/lib/calendar/orthocal';
import type { OrthodocalDay, CalendarSystem } from '@/lib/types/calendar';

// ─── helpers ────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function cellBorderClass(feastLevel: number, isToday: boolean): string {
  if (isToday) return 'border-gold bg-gold/[0.10]';
  if (feastLevel >= 5) return 'border-gold/60 bg-gold/[0.05]';
  if (feastLevel >= 3) return 'border-gold/30';
  return 'border-navy-light';
}

function feastTextClass(feastLevel: number): string {
  if (feastLevel >= 5) return 'text-gold-bright';
  if (feastLevel >= 3) return 'text-gold';
  if (feastLevel >= 1) return 'text-gold-dim';
  return 'text-text-mid';
}

function sectionHead(label: string) {
  return (
    <h3 className="font-cinzel text-xs uppercase tracking-widest text-gold-dim mb-2 border-b border-gold/10 pb-2">
      {label}
    </h3>
  );
}

// ─── Day-detail modal ────────────────────────────────────────────────────────

interface DayModalProps {
  day: OrthodocalDay;
  calendar: CalendarSystem;
  onClose: () => void;
}

function DayModal({ day, calendar, onClose }: DayModalProps) {
  const { gospel, epistle } = extractReadingRefs(day);
  const formattedDate = formatCalendarDate(day, calendar);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={formattedDate}
      onClick={onClose}
    >
      <div
        className="bg-navy border border-gold/30 rounded-lg w-full max-w-2xl max-h-[88vh] overflow-y-auto p-6 space-y-5 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-cinzel text-xl font-semibold text-text-light">{formattedDate}</h2>
            {day.summary_title ? (
              <p className="font-garamond text-text-mid text-sm mt-1">{day.summary_title}</p>
            ) : null}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 text-gold hover:text-gold-bright transition-colors mt-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 rounded"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Fasting rule */}
        <section>
          {sectionHead('Fasting Rule')}
          <p className="font-garamond text-base text-text-light">{day.fast_level_desc || 'No fasting rule'}</p>
          {day.fast_exception_desc ? (
            <p className="font-garamond text-sm text-text-mid mt-1">{day.fast_exception_desc}</p>
          ) : null}
        </section>

        {/* Feasts */}
        {day.feasts.length > 0 && (
          <section>
            {sectionHead(day.feasts.length === 1 ? 'Feast of the Day' : 'Feasts of the Day')}
            <ul className="space-y-1">
              {day.feasts.map((feast, i) => (
                <li
                  key={i}
                  className={`font-cinzel text-sm ${
                    day.feast_level >= 5
                      ? 'text-gold-bright font-semibold'
                      : day.feast_level >= 3
                      ? 'text-gold'
                      : 'text-gold-dim'
                  }`}
                >
                  {feast}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Daily readings */}
        {(gospel.length > 0 || epistle.length > 0) && (
          <section>
            {sectionHead('Daily Readings')}
            <div className="space-y-2">
              {gospel.map((ref, i) => (
                <ReadingRef key={`gospel-${i}`} reading={ref} label="Holy Gospel" />
              ))}
              {epistle.map((ref, i) => (
                <ReadingRef key={`epistle-${i}`} reading={ref} label="Epistle" />
              ))}
            </div>
          </section>
        )}

        {/* Saints */}
        {day.stories.length > 0 && (
          <section>
            {sectionHead('Saints of the Day')}
            <div className="space-y-3">
              {day.stories.map((story, i) => (
                <SaintCard key={i} story={story} feastLevel={day.feast_level} />
              ))}
            </div>
          </section>
        )}

        {/* If no saints but saints[] list exists */}
        {day.stories.length === 0 && day.saints.length > 0 && (
          <section>
            {sectionHead('Saints of the Day')}
            <ul className="space-y-1">
              {day.saints.map((saint, i) => (
                <li key={i} className="font-garamond text-sm text-text-light">{saint}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

// ─── Main month view ─────────────────────────────────────────────────────────

interface CalendarMonthViewProps {
  monthData: OrthodocalDay[];
  year: number;
  month: number;
  calendar: CalendarSystem;
  isLoggedIn: boolean;
}

export function CalendarMonthView({
  monthData,
  year,
  month,
  calendar,
  isLoggedIn,
}: CalendarMonthViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [calPref, setCalPref] = useState<CalendarSystem>(calendar);
  const [selectedDay, setSelectedDay] = useState<OrthodocalDay | null>(null);
  const [togglingCalendar, setTogglingCalendar] = useState(false);

  const closeModal = useCallback(() => setSelectedDay(null), []);

  function navigateMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    router.push(`/calendar?year=${y}&month=${m}&cal=${calPref}`);
  }

  async function handleCalendarToggle(newPref: CalendarSystem) {
    if (newPref === calPref) return;
    setCalPref(newPref);
    setTogglingCalendar(true);
    try {
      if (isLoggedIn && user) {
        await updateCalendarPreference(user.uid, newPref);
      }
      router.push(`/calendar?year=${year}&month=${month}&cal=${newPref}`);
    } finally {
      setTogglingCalendar(false);
    }
  }

  // Build grid: leading empty cells + day cells + trailing empty cells
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0=Sun … 6=Sat
  const gridCells: (OrthodocalDay | null)[] = [
    ...Array<null>(firstDayOfWeek).fill(null),
    ...monthData,
  ];
  while (gridCells.length % 7 !== 0) gridCells.push(null);

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayDay = today.getDate();

  return (
    <>
      {/* Calendar system toggle */}
      <div role="group" aria-label="Calendar system" className="flex items-center gap-2 mb-5">
        {(['new_julian', 'old_julian'] as CalendarSystem[]).map(pref => (
          <button
            key={pref}
            onClick={() => handleCalendarToggle(pref)}
            aria-pressed={calPref === pref}
            disabled={togglingCalendar}
            className={`font-cinzel text-xs uppercase tracking-widest px-3 py-1.5 rounded border transition-colors ${
              calPref === pref
                ? 'bg-navy-light border-gold text-gold'
                : 'border-transparent text-text-mid hover:text-text-light'
            }`}
          >
            {pref === 'new_julian' ? 'New Calendar' : 'Old Calendar (O.S.)'}
          </button>
        ))}
      </div>

      {/* Month / year header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          aria-label="Previous month"
          className="w-10 h-10 flex items-center justify-center text-gold hover:text-gold-bright transition-colors"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <h2 className="font-cinzel text-2xl font-semibold text-text-light tracking-wide">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button
          onClick={() => navigateMonth(1)}
          aria-label="Next month"
          className="w-10 h-10 flex items-center justify-center text-gold hover:text-gold-bright transition-colors"
        >
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      </div>

      {/* Day-of-week column headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map(label => (
          <div
            key={label}
            className="text-center font-cinzel text-[10px] uppercase tracking-widest text-gold-dim py-1"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-navy-light rounded-lg overflow-hidden border border-navy-light">
        {gridCells.map((day, idx) => {
          if (!day) {
            return (
              <div
                key={`pad-${idx}`}
                className="bg-navy min-h-[80px] sm:min-h-[100px]"
                aria-hidden="true"
              />
            );
          }

          const isToday = isCurrentMonth && day.day === todayDay;
          const briefTitle = day.summary_title || day.feasts[0] || day.saints[0] || '';
          const hasFast = day.fast_level > 0;

          return (
            <button
              key={day.day}
              onClick={() => setSelectedDay(day)}
              aria-label={`${MONTH_NAMES[month]} ${day.day}${briefTitle ? ': ' + briefTitle : ''}`}
              className={`
                bg-navy min-h-[80px] sm:min-h-[100px] p-1.5 text-left flex flex-col gap-0.5
                border transition-colors hover:bg-navy-mid focus:outline-none focus-visible:ring-2
                focus-visible:ring-gold/60
                ${cellBorderClass(day.feast_level, isToday)}
              `}
            >
              {/* Day number row */}
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`font-cinzel text-xs font-semibold leading-none ${
                    isToday ? 'text-gold-bright' : 'text-text-light'
                  }`}
                >
                  {day.day}
                </span>
                {hasFast && (
                  <span
                    className="text-[9px] leading-none text-blue-400"
                    title={day.fast_level_desc}
                    aria-label={day.fast_level_desc}
                  >
                    ✦
                  </span>
                )}
              </div>

              {/* Brief feast / saint title */}
              {briefTitle ? (
                <p
                  className={`text-[9px] sm:text-[10px] leading-tight line-clamp-3 ${feastTextClass(
                    day.feast_level
                  )}`}
                >
                  {briefTitle}
                </p>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 font-garamond text-xs text-text-mid">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 border border-gold/60 bg-gold/[0.05] rounded-sm" />
          Great Feast
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 border border-gold/30 rounded-sm" />
          Feast
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 border border-gold bg-gold/[0.10] rounded-sm" />
          Today
        </span>
        <span className="flex items-center gap-1">
          <span className="text-blue-400 leading-none">✦</span>
          Fasting day
        </span>
      </div>

      {/* Day detail modal */}
      {selectedDay && (
        <DayModal day={selectedDay} calendar={calPref} onClose={closeModal} />
      )}
    </>
  );
}
