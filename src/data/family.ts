// The family tree. Each person may list their children, which nest to any depth.
//
// Only add facts that can be backed by a record (Bible entry, will, census,
// pension file, gravestone) or the family's own tree, and say which.
// Do not publish details of living people without their permission.

import { lifespan, lineage, type Generation } from "./lineage";

export type Person = {
  id: string;
  name: string;
  born?: string;
  bornPlace?: string;
  died?: string;
  diedPlace?: string;
  dates?: string;
  spouse?: string;
  spouseParents?: string;
  note?: string;
  sources?: string[];
  children?: Person[];
};

function spouseLabel(g: Generation) {
  if (!g.spouse) return undefined;
  const span = lifespan(g.spouseBorn, g.spouseDied, g.spouseLiving);
  return span ? `${g.spouse} (${span})` : g.spouse;
}

// Builds the direct line (after Joseph) as a chain of single children.
function chain(gens: Generation[]): Person[] {
  if (gens.length === 0) return [];
  const [g, ...rest] = gens;
  return [
    {
      id: g.name.toLowerCase().replace(/[^a-z]+/g, "-") + (g.born ?? ""),
      name: g.name,
      dates: lifespan(g.born, g.died, g.living),
      spouse: spouseLabel(g),
      spouseParents: g.spouseParents && g.spouse ? `${g.spouse.split(" ")[0]}'s parents: ${g.spouseParents}` : undefined,
      note: g.note,
      sources: g.sources,
      children: chain(rest),
    },
  ];
}

const joseph = lineage[0];

export const patriarch: Person = {
  id: "joseph-1738",
  name: joseph.name,
  born: "1738",
  bornPlace: "Ulster, Ireland",
  died: "1810",
  spouse: spouseLabel(joseph),
  diedPlace: "Washington Township, Fayette County, Pennsylvania",
  note: "Major, Westmoreland County Militia and Rangers, 1778–1783; Justice of the Peace. Married about 1770. Our common ancestor.",
  sources: joseph.sources,
  // Joseph and Elizabeth's four children, per the family tree on FamilySearch.
  // The line traced on this site runs through Robert.
  children: [
    { id: "joseph-1775", name: "Joseph McGarraugh", dates: "b. 1775" },
    ...chain(lineage.slice(1)),
    { id: "elizabeth-1777", name: "Elizabeth McGarraugh", dates: "1777 – 1855" },
    { id: "thomas-1780", name: "Thomas McGarraugh", dates: "b. 1780" },
  ],
};

// Spellings of the surname found in records cited in the family history. Clerks wrote names as they
// heard them, so the same family can appear under several of these.
export const spellingVariants = [
  "McGarraugh",
  "McGerraugh",
  "McGarrough",
  "M'Garrough",
  "McGarrah",
  "McGarroch",
];
