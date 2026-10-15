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
  spouseParents?: string;
  note?: string;
  evidence: Evidence;
  sources?: string[];
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
    note: "Major, Westmoreland County Militia and Rangers on the frontier, 1778–1783; Justice of the Peace. Lived in Rostraver Township; died before 7 March 1810, Washington Township, Fayette County.",
    evidence: "verified",
    sources: [
      "Pennsylvania State Archives, Westmoreland County Revolutionary War Militia (spelled “McGerraugh”)",
      "DAR Patriot Ancestor A076882",
      "SAR Patriot P-244671",
    ],
  },
  {
    name: "Rev. Robert McGarraugh",
    born: "1777",
    died: "1839",
    spouse: "Lavina Jane Stille",
    spouseBorn: "1773",
    spouseDied: "1837",
    note: "Born in Westmoreland County; married 1798 at Canonsburg. Presbyterian missionary of the Presbytery of Redstone to the Stump Creek country (Clarion and Jefferson Counties), active 1831–32. Died in Clarion County; buried Old Concord Cemetery, Washington County.",
    evidence: "verified",
    sources: ["History of the Presbytery of Clarion of the Presbyterian Church"],
  },
  {
    name: "Joseph McGarraugh",
    born: "c. 1792",
    died: "1823",
    note: "Died in Fayette County, Pennsylvania, by the family tree. The least-documented link in the line; the tree also records a marriage to Margaret Callen.",
    spouse: "Hannah Milligan",
    spouseBorn: "1797",
    spouseDied: "1859",
    evidence: "tradition",
  },
  {
    name: "Lyanias McGarraugh",
    born: "1824",
    died: "1869",
    note: "Born in Chillicothe, Ohio; married 1846 in Highland County, Ohio; buried at Avon, Fulton County, Illinois.",
    spouse: "Elizabeth Ann Anderson",
    spouseParents: "Benjamin Franklin Anderson (1794–1876) & Rhoda Marie Dimmitt (1796–1853)",
    spouseBorn: "1827",
    spouseDied: "1867",
    evidence: "tradition",
  },
  {
    name: "J. Albert McGarraugh",
    born: "1865",
    died: "1929",
    note: "Born in Illinois; died in Enid, Oklahoma, and buried in Enid Cemetery.",
    spouse: "Sarah Elizabeth Sands",
    spouseBorn: "1870",
    spouseDied: "1943",
    evidence: "tradition",
  },
  {
    name: "Clyde Edward McGarraugh",
    born: "1889",
    died: "1952",
    note: "Born in Rice County, Kansas; married 1911 in Harper County; farmed near Perryton, Texas, from 1920; buried in Ochiltree Cemetery, Perryton.",
    spouse: "Bessie Kaup",
    spouseParents: "David Kaup (1858–1924) & Jadah Zeddah Griffin (1865–1954)",
    spouseBorn: "1893",
    spouseDied: "1953",
    evidence: "tradition",
  },
  {
    name: "Lloyd Edward McGarraugh",
    born: "1915",
    died: "1997",
    note: "Born in Corwin, Harper County, Kansas; married 1939 in Liberal, Kansas; died in Perryton, Texas.",
    spouse: "Sylvia Marie Wing",
    spouseParents: "George Edward Wing (1894–1960) & Alida May Murray (1899–1926)",
    spouseBorn: "1918",
    spouseDied: "2014",
    evidence: "tradition",
  },
  {
    name: "Ronald McGarraugh",
    born: "1942",
    died: "2025",
    note: "Born in Ochiltree County, Texas.",
    spouse: "Carolyn Sherrill McGarraugh",
    spouseParents: "Charles Neely Sherrill (1910–1979) & Shelan Juanita Stephens (1909–1995)",
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
