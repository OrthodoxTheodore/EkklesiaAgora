// The family's road: Ulster, across the Atlantic, to the Pennsylvania frontier.
const stops = [
  { place: "Ulster", detail: "Birthplace, 1738" },
  { place: "The Atlantic", detail: "The crossing" },
  { place: "Pennsylvania", detail: "A new country" },
  { place: "Fayette County", detail: "Resting place, 1809" },
];

export function Journey() {
  return (
    <ol className="relative mx-auto grid max-w-4xl gap-8 sm:grid-cols-4 sm:gap-4">
      <span aria-hidden="true" className="absolute left-[11px] top-3 h-[calc(100%-1.5rem)] w-px border-l-2 border-dashed border-buff sm:left-[12.5%] sm:right-[12.5%] sm:top-[11px] sm:h-px sm:w-auto sm:border-l-0 sm:border-t-2" />
      {stops.map((s, i) => (
        <li key={s.place} className="relative flex items-start gap-4 sm:flex-col sm:items-center sm:text-center">
          <span
            className={`relative z-10 mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 sm:mt-0 ${
              i === 0 ? "border-ulster bg-ulster" : i === stops.length - 1 ? "border-claret bg-claret" : "border-buff bg-parchment"
            }`}
          />
          <span>
            <span className="block font-display text-xl text-continental">{s.place}</span>
            <span className="block text-sm italic text-ink-soft">{s.detail}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
