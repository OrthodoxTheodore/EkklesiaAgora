import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Ornament } from "@/components/Ornament";

export const metadata: Metadata = { title: "Major Joseph McGarraugh" };

const facts = [
  { label: "Born", value: "1738, Ulster, Ireland" },
  { label: "Parents", value: "Alexander & Mary McGarraugh (family tradition)" },
  { label: "Wife", value: "Elizabeth K. Pennock" },
  { label: "Service", value: "Major, 3rd Battalion, Westmoreland County Militia, 1778" },
  { label: "Son", value: "Rev. Robert McGarraugh (1777–1839)" },
  { label: "Died", value: "1810, Fayette County, Pennsylvania" },
];

const openQuestions = [
  "When did the family leave Ulster, and from which county? Antrim, Down, Londonderry?",
  "Is there a ship list, land warrant, or naturalization record for Alexander and Mary?",
  "When and where did Joseph marry Elizabeth K. Pennock, and when did she die?",
  "Besides Robert, what other children did Joseph and Elizabeth have?",
  "Where exactly in Fayette County did he live, and where is he buried?",
  "Did he leave a will, a land warrant, or a pension application?",
];

function Source({ children }: { children: React.ReactNode }) {
  return (
    <p className="!mt-3 border-l-2 border-ulster pl-3 text-sm text-ulster">
      <span className="font-bold">✓ Verified record:</span> {children}
    </p>
  );
}

export default function JosephPage() {
  return (
    <>
      <PageHeader
        eyebrow="The Patriarch"
        title="Major Joseph McGarraugh"
        intro="Ulsterman, militia officer, frontiersman, and the common ancestor of every family on this site."
      />

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-[1fr_20rem]">
        <article className="prose-family max-w-none text-lg">
          <h2 className="!mt-0 text-3xl text-continental">The world he was born into</h2>
          <p className="drop-cap">
            Joseph McGarraugh was born in 1738 in Ulster, the northern province of Ireland. Through the eighteenth
            century Ulster sent wave after wave of its people across the Atlantic. Most were Presbyterians whose
            families had come over from the Scottish Lowlands in the generations before. Hard harvests, rising rents,
            and the legal disadvantages placed on dissenters from the established church pushed them to leave. In
            America they became known as the Scots-Irish.
          </p>
          <p>
            Many of them landed at Philadelphia and kept moving west, past the settled farmland of the east, to the
            edge of the frontier. There they cleared land, built log churches and meeting-houses, and gained a name
            for toughness and independence. When the quarrel with Britain came to war, the Scots-Irish of
            Pennsylvania were among the most ready to fight.
          </p>

          <Ornament className="my-10" />

          <h2 className="text-3xl text-continental">A Major on the frontier</h2>
          <p>
            In 1778 the Westmoreland County militia rolls list <em>Major Joseph McGerraugh</em> among the field
            officers of the county&rsquo;s 3rd Battalion. That is our Joseph, under one of the many spellings clerks
            gave the name. Westmoreland was then the raw western edge of Pennsylvania. Its county seat at Hannastown
            was burned by British-allied raiders in 1782. A militia major there was not filling an honorary post. He
            was organizing his neighbors to defend their own farms, while the war against Britain was fought, for these
            families, on two fronts at once.
          </p>
          <Source>Pennsylvania State Archives, Westmoreland County Revolutionary War Militia</Source>

          <Ornament className="my-10" />

          <h2 className="text-3xl text-continental">Family</h2>
          <p>
            Joseph married Elizabeth K. Pennock. Their son <strong className="font-normal text-continental">Robert</strong>,
            born in 1777, became a Presbyterian minister. A generation after his father defended the frontier, the
            Rev. Robert McGarraugh went out from the Presbytery of Redstone as a missionary to the Stump Creek country,
            now Clarion and Jefferson Counties, and was still making regular visits to the Beechwoods settlement in
            1831 and 1832. He married Lavina Jane Stille and died in 1839.
          </p>
          <Source>History of the Presbytery of Clarion of the Presbyterian Church (as “Dr. Robert M&rsquo;Garrough”)</Source>
          <p>
            Joseph&rsquo;s parents are remembered in the family tree as Alexander and Mary McGarraugh, who crossed from
            Ulster to Pennsylvania. No record naming them has been found yet, so for now they stand as family
            tradition.
          </p>

          <Ornament className="my-10" />

          <h2 className="text-3xl text-continental">The Fayette County years</h2>
          <p>
            In 1783, the year the war ended, Pennsylvania carved Fayette County out of Westmoreland County. It lies in
            the southwest corner of the state, along the Monongahela and Youghiogheny rivers, and was named in honor of
            the Marquis de Lafayette. It was rough country then, a place of new farms, mills, and river towns where
            veterans of the war settled and raised their families.
          </p>
          <p>
            Joseph McGarraugh died there in 1810. From that corner of Pennsylvania his descendants spread out across
            the young republic, and they are spread across it still.
          </p>
        </article>

        <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
          <div className="border-2 border-buff bg-parchment p-6 shadow-sm">
            <p className="eyebrow">At a Glance</p>
            <dl className="mt-4 divide-y divide-buff/50">
              {facts.map((f) => (
                <div key={f.label} className="py-3">
                  <dt className="text-xs uppercase tracking-[0.18em] text-ink-soft">{f.label}</dt>
                  <dd className="mt-0.5 font-display text-lg text-continental">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="border border-claret/40 bg-parchment-deep/60 p-6">
            <p className="eyebrow">Still Searching</p>
            <h3 className="mt-2 text-xl text-continental">Questions the family is working on</h3>
            <ul className="mt-4 space-y-3 text-[0.95rem] text-ink-soft">
              {openQuestions.map((q) => (
                <li key={q} className="flex gap-2">
                  <span aria-hidden="true" className="text-claret">
                    ✦
                  </span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
            <Link href="/connect/" className="mt-5 inline-block text-sm italic text-claret hover:underline">
              Know an answer? Share it →
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
