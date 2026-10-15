import type { Person } from "@/data/family";

function lifespan(p: Person) {
  if (!p.born && !p.died) return null;
  return `${p.born ?? "?"} – ${p.died ?? ""}`;
}

function PersonCard({ person, root = false }: { person: Person; root?: boolean }) {
  const span = lifespan(person);
  return (
    <div
      className={`inline-block border bg-parchment px-5 py-4 text-left shadow-sm ${
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
      {person.note && <p className="mt-2 max-w-xs text-sm text-ink-soft">{person.note}</p>}
    </div>
  );
}

function Branch({ person }: { person: Person }) {
  const kids = person.children ?? [];
  return (
    <li className="relative pl-6 before:absolute before:left-0 before:top-0 before:h-full before:border-l before:border-buff last:before:h-8 after:absolute after:left-0 after:top-8 after:w-5 after:border-t after:border-buff">
      {kids.length > 0 ? (
        <details open className="group">
          <summary className="cursor-pointer list-none">
            <PersonCard person={person} />
            <span className="ml-3 text-xs text-ink-soft group-open:hidden">
              ({kids.length} {kids.length === 1 ? "child" : "children"})
            </span>
          </summary>
          <ul className="mt-3 space-y-3">
            {kids.map((c) => (
              <Branch key={c.id} person={c} />
            ))}
          </ul>
        </details>
      ) : (
        <PersonCard person={person} />
      )}
    </li>
  );
}

export function FamilyTree({ root }: { root: Person }) {
  const kids = root.children ?? [];
  return (
    <div className="overflow-x-auto pb-4">
      <PersonCard person={root} root />
      {kids.length > 0 && (
        <ul className="ml-6 mt-3 space-y-3">
          {kids.map((c) => (
            <Branch key={c.id} person={c} />
          ))}
        </ul>
      )}
    </div>
  );
}
