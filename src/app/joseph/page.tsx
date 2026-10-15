import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Ornament } from "@/components/Ornament";

export const metadata: Metadata = { title: "Major Joseph McGarraugh" };

const facts = [
  { label: "Born", value: "1738, Ulster, Ireland" },
  { label: "Rank", value: "Major" },
  { label: "Service", value: "American Revolutionary War" },
  { label: "Died", value: "1809, Fayette County, Pennsylvania" },
];

const openQuestions = [
  "When did Joseph leave Ulster, and from which county? Antrim, Down, Londonderry, Tyrone?",
  "Did he hold his commission in a Pennsylvania militia battalion or in a Continental regiment?",
  "Who was his wife, and when and where did they marry?",
  "What were the names of his children, and in what order were they born?",
  "Where exactly in Fayette County did he live, and where is he buried?",
  "Did he leave a will, a land warrant, or a pension application?",
];

export default function JosephPage() {
  return (
    <>
      <PageHeader
        eyebrow="The Patriarch"
        title="Major Joseph McGarraugh"
        intro="Ulsterman, soldier, frontiersman, and the common ancestor of every family on this site."
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

          <h2 className="text-3xl text-continental">A Major in the Revolution</h2>
          <p>
            Joseph served in the American Revolutionary War with the rank of Major, an officer&rsquo;s commission that
            would have placed him among the leaders of the men of his community. Pennsylvania fielded both regiments of
            the Continental Line and county militia battalions. The militia were organized county by county and were
            called out in turns to guard the frontier and reinforce the army. Which of these Joseph served in, and
            where, is one of the questions this family is working to answer.
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
            Joseph McGarraugh died there in 1809. From that corner of Pennsylvania his descendants spread out across
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
