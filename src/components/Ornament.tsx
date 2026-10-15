// Printer's-flourish divider, in the manner of 18th-century broadsides.
export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-buff ${className}`} aria-hidden="true">
      <span className="h-px w-16 bg-current sm:w-24" />
      <svg viewBox="0 0 40 12" className="h-3 w-10" fill="currentColor">
        <path d="M20 0l3 6-3 6-3-6z" />
        <circle cx="10" cy="6" r="1.6" />
        <circle cx="30" cy="6" r="1.6" />
        <circle cx="3" cy="6" r="1" />
        <circle cx="37" cy="6" r="1" />
      </svg>
      <span className="h-px w-16 bg-current sm:w-24" />
    </div>
  );
}
