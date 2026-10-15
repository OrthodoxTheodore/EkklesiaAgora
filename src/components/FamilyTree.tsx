import type { Person } from "@/data/family";

function lifespan(p: Person) {
  if (p.dates !== undefined) return p.dates || null;
  if (!p.born && !p.died) return null;
  return `${p.born ?? "?"} – ${p.died ?? ""}`;
}

function PersonCard({ person, root = false }: { person: Person; root?: boolean }) {
  const span = lifespan(person);
  return (
    <div
      className={`inline-block max-w-md border bg-parchment px-5 py-4 text-left shadow-sm ${
        root ? "border-2 border-claret" : "border-buff"
      }`}
    >
      <p className={`font-display text-continental ${root ? "text-2xl" : "text-lg"}`}>{person.name}</p>
      {span && <p className="text-sm italic text-claret">{span}</p>}
      {(person.bornPlace || person.diedPlace) && (
        <p className="mt-1 text-sm text-ink-soft">
          {person.bornPlace}
          {person.bornPlace && person.diedPlace && " → "}
          {person.diedPlace}
        </p>
      )}
      {person.spouse && <p className="mt-1 text-sm text-ink-soft">m. {person.spouse}</p>}
      {person.note && <p className="mt-2 text-sm text-ink-soft">{person.note}</p>}
      {person.sources?.map((s) => (
        <p key={s} className="mt-2 border-t border-buff/50 pt-2 text-xs text-ulster">
          ✓ Verified: {s}
        </p>
      ))}
    </div>
  );
}

// A single line of descent runs straight down; the tree only indents where
// a family actually branches into more than one child.
function Descendants({ people }: { people: Person[] }) {
  if (people.length === 0) return null;
  if (people.length === 1) {
    const [p] = people;
    return (
      <div className="flex flex-col items-start">
        <span aria-hidden="true" className="ml-8 h-6 border-l-2 border-buff" />
        <PersonCard person={p} />
        <Descendants people={p.children ?? []} />
      </div>
    );
  }
  return (
    <ul className="ml-8 mt-3 space-y-3 border-l-2 border-buff">
      {people.map((p) => (
        <li key={p.id} className="relative pl-6 before:absolute before:left-0 before:top-8 before:w-5 before:border-t-2 before:border-buff">
          <PersonCard person={p} />
          <div className="ml-0">
            <Descendants people={p.children ?? []} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function FamilyTree({ root }: { root: Person }) {
  return (
    <div className="overflow-x-auto pb-4">
      <PersonCard person={root} root />
      <Descendants people={root.children ?? []} />
    </div>
  );
}
