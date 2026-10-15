// The family tree. Each person may list their children, which nest to any depth.
//
// Only add facts that can be backed by a record (Bible entry, will, census,
// pension file, gravestone). Put the record in `sources` so cousins can verify it.
// Do not publish details of living people without their permission.

export type Person = {
  id: string;
  name: string;
  born?: string;
  bornPlace?: string;
  died?: string;
  diedPlace?: string;
  spouse?: string;
  note?: string;
  sources?: string[];
  children?: Person[];
};

export const patriarch: Person = {
  id: "joseph-1738",
  name: "Major Joseph McGarraugh",
  born: "1738",
  bornPlace: "Ulster, Ireland",
  died: "1809",
  diedPlace: "Fayette County, Pennsylvania",
  note: "Officer in the American Revolutionary War. Our common ancestor.",
  children: [],
};

// Spellings of the surname seen in early records. Clerks wrote names as they
// heard them, so the same family can appear under several of these.
export const spellingVariants = [
  "McGarraugh",
  "McGarrah",
  "McGarragh",
  "McGaraugh",
  "McGarra",
  "MacGarraugh",
  "Magarraugh",
];
