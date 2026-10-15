// Two kinds of entries:
//   "family"  : facts about Major Joseph and his descendants
//   "history" : the wider events that shaped their lives, for context
export type TimelineEntry = {
  year: string;
  title: string;
  body: string;
  kind: "family" | "history";
};

export const timeline: TimelineEntry[] = [
  {
    year: "1718–1775",
    title: "The Great Migration from Ulster",
    body: "Over these decades a large migration of Ulster Presbyterians, the people Americans came to call the Scots-Irish, crossed the Atlantic, many landing at Philadelphia and pushing west to the Pennsylvania frontier.",
    kind: "history",
  },
  {
    year: "1738",
    title: "Joseph McGarraugh is born",
    body: "Joseph is born in Ulster, in the north of Ireland.",
    kind: "family",
  },
  {
    year: "1775",
    title: "War comes to the colonies",
    body: "Fighting breaks out at Lexington and Concord in April. Pennsylvania raises Continental regiments and county militia battalions.",
    kind: "history",
  },
  {
    year: "1776",
    title: "Independence declared",
    body: "On July 4 the Continental Congress, sitting in Philadelphia, adopts the Declaration of Independence.",
    kind: "history",
  },
  {
    year: "1777",
    title: "Robert McGarraugh is born",
    body: "Joseph and Elizabeth's son Robert is born. He will become a Presbyterian minister.",
    kind: "family",
  },
  {
    year: "1778",
    title: "Major of the Westmoreland County militia",
    body: "Joseph is listed as Major among the field officers of the 3rd Battalion, Westmoreland County Militia, defending the Pennsylvania frontier. (Pennsylvania State Archives)",
    kind: "family",
  },
  {
    year: "1782",
    title: "Hannastown burned",
    body: "British-allied raiders burn Hannastown, the Westmoreland County seat, one of the last major raids of the war on the Pennsylvania frontier.",
    kind: "history",
  },
  {
    year: "1783",
    title: "Peace, and a new county",
    body: "The Treaty of Paris ends the war. The same year Pennsylvania creates Fayette County from Westmoreland County, naming it for the Marquis de Lafayette.",
    kind: "history",
  },
  {
    year: "1810",
    title: "Joseph dies in Fayette County",
    body: "Major Joseph McGarraugh dies in Fayette County, Pennsylvania, leaving the descendants who now spread across America.",
    kind: "family",
  },
  {
    year: "1831–1832",
    title: "Rev. Robert McGarraugh, missionary",
    body: "Robert, sent out by the Presbytery of Redstone, makes regular visits to the Beechwoods settlement in the Stump Creek country, now Clarion and Jefferson Counties. (History of the Presbytery of Clarion)",
    kind: "family",
  },
  {
    year: "1839",
    title: "Rev. Robert McGarraugh dies",
    body: "Robert dies, two years after his wife, Lavina Jane Stille. The family line continues through their son Joseph, born 1792.",
    kind: "family",
  },
];
