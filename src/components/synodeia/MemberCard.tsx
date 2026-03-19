import { Card } from '@/components/ui/Card';
import { getJurisdictionLabel } from '@/lib/constants/jurisdictions';
import type { SynodeiaMember } from '@/lib/firestore/synodeia';

export function MemberCard({ member }: { member: SynodeiaMember }) {
  const locationText = member.city && member.stateRegion
    ? `${member.city}, ${member.stateRegion}`
    : member.city
      ? member.city
      : member.stateRegion
        ? member.stateRegion
        : null;

  return (
    <Card className="flex items-center gap-4 p-4">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-gold-dim border border-gold/40 flex items-center justify-center font-cinzel text-navy text-lg font-bold shrink-0 overflow-hidden">
        {member.avatarUrl ? (
          <img src={member.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
        ) : (
          member.displayName?.[0]?.toUpperCase() ?? '?'
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 min-w-0">
        <span className="font-cinzel text-sm text-text-light truncate">
          {member.displayName}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-cinzel uppercase tracking-widest text-text-mid border border-gold/[0.30] rounded w-fit">
          {getJurisdictionLabel(member.jurisdictionId)}
        </span>
        {locationText && (
          <span
            className="font-garamond text-xs text-text-mid"
            aria-label={locationText}
          >
            {locationText}
          </span>
        )}
      </div>
    </Card>
  );
}
