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
    year: "1775–1783",
    title: "Joseph serves the cause of independence",
    body: "Joseph serves in the American Revolutionary War, holding the rank of Major. The details of his unit and service are still being gathered. If you hold records, please share them.",
    kind: "family",
  },
  {
    year: "1783",
    title: "Peace, and a new county",
    body: "The Treaty of Paris ends the war. The same year Pennsylvania creates Fayette County from Westmoreland County, naming it for the Marquis de Lafayette.",
    kind: "history",
  },
  {
    year: "1809",
    title: "Joseph dies in Fayette County",
    body: "Major Joseph McGarraugh dies in Fayette County, Pennsylvania, leaving the descendants who now spread across America.",
    kind: "family",
  },
];
