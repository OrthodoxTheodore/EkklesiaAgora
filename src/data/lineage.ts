// The direct male line from Major Joseph McGarraugh to Charles McGarraugh,
// who founded this site. Source: Charles McGarraugh, "From Carrick to the
// Frontier" (family history), and the family tree on FamilySearch.
//
// Living people are listed by name only, without birth dates.

export type Evidence = "verified" | "tradition";

export type Generation = {
  name: string;
  born?: string;
  died?: string;
  living?: boolean;
  spouse?: string;
  spouseBorn?: string;
  spouseDied?: string;
  spouseLiving?: boolean;
  note?: string;
  evidence: Evidence;
  source?: string;
};

export const familyHistoryUrl = "https://ekklesia-agora-publishing.vercel.app/mcgarraugh-family-history";

// Joseph's parents, as the family tree records them. No independent record
// has yet been found for them.
export const immigrantParents = {
  names: "Alexander McGarraugh & Mary McGarraugh",
  dates: "c. 1715 – 1790",
  note: "Remembered by the family as the couple who crossed from Ulster to colonial Pennsylvania.",
};

export const lineage: Generation[] = [
  {
    name: "Major Joseph McGarraugh",
    born: "1738",
    died: "1810",
    spouse: "Elizabeth K. Pennock",
    spouseBorn: "1735",
    note: "Major, 3rd Battalion, Westmoreland County Militia, 1778.",
    evidence: "verified",
    source: "Pennsylvania State Archives, Westmoreland County Revolutionary War Militia (spelled “McGerraugh”)",
  },
  {
    name: "Rev. Robert McGarraugh",
    born: "1777",
    died: "1839",
    spouse: "Lavina Jane Stille",
    spouseBorn: "1773",
    spouseDied: "1837",
    note: "Presbyterian missionary of the Presbytery of Redstone to the Stump Creek country (Clarion and Jefferson Counties), active 1831–32.",
    evidence: "verified",
    source: "History of the Presbytery of Clarion of the Presbyterian Church",
  },
  {
    name: "Joseph McGarraugh",
    born: "1792",
    spouse: "Hannah Milligan",
    spouseBorn: "1797",
    spouseDied: "1859",
    evidence: "tradition",
  },
  {
    name: "Lyanias McGarraugh",
    born: "1824",
    died: "1869",
    spouse: "Elizabeth Ann Anderson",
    spouseBorn: "1827",
    spouseDied: "1867",
    evidence: "tradition",
  },
  {
    name: "J. Albert McGarraugh",
    born: "1865",
    died: "1929",
    spouse: "Sarah Elizabeth Sands",
    spouseBorn: "1870",
    spouseDied: "1943",
    evidence: "tradition",
  },
  {
    name: "Clyde Edward McGarraugh",
    born: "1889",
    died: "1952",
    spouse: "Bessie Kaup",
    spouseBorn: "1893",
    spouseDied: "1953",
    evidence: "tradition",
  },
  {
    name: "Lloyd Edward McGarraugh",
    born: "1915",
    died: "1997",
    spouse: "Sylvia Marie Wing",
    spouseBorn: "1918",
    spouseDied: "2014",
    evidence: "tradition",
  },
  {
    name: "Ronald McGarraugh",
    born: "1942",
    died: "2025",
    spouse: "Carolyn Sherrill McGarraugh",
    spouseLiving: true,
    evidence: "tradition",
  },
  {
    name: "Steven McGarraugh",
    living: true,
    spouse: "Sandra McCutchen",
    spouseLiving: true,
    evidence: "tradition",
  },
  {
    name: "Charles McGarraugh",
    born: "1995",
    living: true,
    note: "Founder of this website and compiler of the family history.",
    evidence: "tradition",
  },
];

export function lifespan(born?: string, died?: string, living?: boolean) {
  if (living) return born ? `b. ${born}` : "living";
  if (!born && !died) return "";
  return `${born ?? "?"} – ${died ?? "?"}`;
}
