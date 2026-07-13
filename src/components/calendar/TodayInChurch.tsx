import Link from 'next/link';
import { formatCalendarDate } from '@/lib/calendar/orthocal';
import { getLiturgicalAccent } from '@/lib/calendar/liturgicalAccent';
import type { OrthodocalDay } from '@/lib/types/calendar';

interface TodayInChurchProps {
  day: OrthodocalDay;
}

export function TodayInChurch({ day }: TodayInChurchProps) {
  const formattedDate = formatCalendarDate(day, 'new_julian');
  const feastText = day.feasts.length > 0 ? day.feasts.join(', ') : 'No major feast today';
  const saintTitles = day.stories.map((s) => s.title);
  const saintsText = saintTitles.length > 0 ? saintTitles.join('; ') : 'No saint commemoration today';
  const accent = getLiturgicalAccent(day);

  return (
    <section className="px-4 pb-16 max-w-3xl mx-auto">
      <div
        className="bg-navy-mid border border-gold/20 rounded-[6px] p-6 md:p-8 text-center"
        style={accent ? { borderColor: accent.colorVar } : undefined}
      >
        <p className="font-cinzel text-xs uppercase tracking-widest text-gold-dim mb-2">
          Today in the Church
        </p>
        <h2 className="font-cinzel text-gold text-xl mb-1">{formattedDate}</h2>
        {day.summary_title && (
          <p className="font-garamond italic text-text-mid text-sm mb-3">{day.summary_title}</p>
        )}
        {accent && (
          <p
            className="inline-block font-cinzel text-xs uppercase tracking-widest px-3 py-1 rounded-full border mb-3"
            style={{ color: accent.colorVar, borderColor: accent.colorVar }}
          >
            {accent.label}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-2 text-left">
          <div>
            <p className="font-cinzel text-xs uppercase tracking-widest text-gold-dim mb-1">
              Feast
            </p>
            <p className="font-garamond text-sm text-text-light">{feastText}</p>
          </div>
          <div>
            <p className="font-cinzel text-xs uppercase tracking-widest text-gold-dim mb-1">
              Commemorated
            </p>
            <p className="font-garamond text-sm text-text-light">{saintsText}</p>
          </div>
          <div>
            <p className="font-cinzel text-xs uppercase tracking-widest text-gold-dim mb-1">
              Fasting Rule
            </p>
            <p className="font-garamond text-sm text-text-light">{day.fast_level_desc}</p>
          </div>
        </div>

        <Link
          href="/calendar"
          className="inline-block mt-6 font-cinzel text-xs uppercase tracking-widest text-gold hover:text-gold-bright transition-colors"
        >
          View Full Calendar &rarr;
        </Link>
      </div>
    </section>
  );
}
