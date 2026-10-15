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
    year: "c. 1770",
    title: "Joseph marries Elizabeth Pennock",
    body: "Joseph marries Elizabeth K. Pennock. Their children are Joseph (b. 1775), Robert (1777), Elizabeth (1777), and Thomas (1780).",
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
    body: "Joseph and Elizabeth's son Robert is born on 7 January in Westmoreland County. He will become a Presbyterian minister.",
    kind: "family",
  },
  {
    year: "1778",
    title: "Major on the Westmoreland frontier",
    body: "Joseph is listed as Major among the field officers of the 3rd Battalion, Westmoreland County Militia (Pennsylvania State Archives). The DAR and SAR credit him with service in the Westmoreland County Rangers on the frontier from 1778 to 1783, and later as a Justice of the Peace.",
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
    body: "Major Joseph McGarraugh dies before 7 March 1810 in Washington Township, Fayette County, Pennsylvania.",
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
    body: "Robert dies on 13 July in Clarion County, two years after his wife, Lavina Jane Stille, and is buried in the Old Concord Cemetery, Washington County. The family line continues through their son Joseph, born about 1792.",
    kind: "family",
  },
  {
    year: "1824",
    title: "West to Ohio",
    body: "Lyanias McGarraugh is born on 4 May in Chillicothe, Ross County, Ohio. In 1846 he marries Elizabeth Ann Anderson in Highland County.",
    kind: "family",
  },
  {
    year: "1865",
    title: "On to Illinois",
    body: "J. Albert McGarraugh is born on 20 December in Illinois. His father Lyanias dies in 1869 and is buried at Avon, Fulton County.",
    kind: "family",
  },
  {
    year: "1889",
    title: "Kansas",
    body: "Clyde Edward McGarraugh is born on 20 November in Rice County, Kansas. In 1911 he marries Bessie Kaup in Harper County, where their son Lloyd is born in 1915.",
    kind: "family",
  },
  {
    year: "1920",
    title: "The Texas Panhandle",
    body: "Clyde takes up farming near Perryton, Ochiltree County, Texas, where the family puts down roots. His father J. Albert dies in Enid, Oklahoma, in 1929.",
    kind: "family",
  },
  {
    year: "1942",
    title: "A new generation in Perryton",
    body: "Ronald McGarraugh, son of Lloyd and Sylvia, is born on 3 March in Ochiltree County, Texas.",
    kind: "family",
  },
];
