// Family mark: a monogram in a laurel ring with the patriarch's years.
// A placeholder until the family settles on its own device.
export function Crest({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="25" fill="none" stroke="currentColor" strokeWidth="0.75" />
      {[...Array(9)].map((_, i) => {
        const a = (Math.PI * (200 + i * 15)) / 180;
        const b = (Math.PI * (-20 - i * 15)) / 180;
        return (
          <g key={i} fill="currentColor" opacity="0.85">
            <ellipse cx={32 + 27.5 * Math.cos(a)} cy={32 - 27.5 * Math.sin(a)} rx="2.2" ry="1" transform={`rotate(${-(200 + i * 15) + 90} ${32 + 27.5 * Math.cos(a)} ${32 - 27.5 * Math.sin(a)})`} />
            <ellipse cx={32 + 27.5 * Math.cos(b)} cy={32 - 27.5 * Math.sin(b)} rx="2.2" ry="1" transform={`rotate(${20 + i * 15 + 90} ${32 + 27.5 * Math.cos(b)} ${32 - 27.5 * Math.sin(b)})`} />
          </g>
        );
      })}
      <text x="32" y="38" textAnchor="middle" fontFamily="var(--font-fell), Georgia, serif" fontSize="17" fill="currentColor">
        McG
      </text>
    </svg>
  );
}
