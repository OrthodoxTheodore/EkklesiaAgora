import type { Metadata } from "next";
import Link from "next/link";
import { FamilyTree } from "@/components/FamilyTree";
import { PageHeader } from "@/components/PageHeader";
import { patriarch, spellingVariants } from "@/data/family";

export const metadata: Metadata = { title: "Family Tree" };

const steps = [
  {
    title: "Start with yourself",
    body: "Write down your parents, grandparents, and great-grandparents, with dates and places as far as you know them.",
  },
  {
    title: "Work backward to Fayette County",
    body: "Look for the generation that lived in or near southwestern Pennsylvania in the early 1800s. That is usually where a line meets the trunk.",
  },
  {
    title: "Share it with the family",
    body: "Send your line, with whatever records support it, and we will add your branch to the tree.",
  },
];

export default function FamilyPage() {
  return (
    <>
      <PageHeader
        eyebrow="The Branches"
        title="The Family Tree"
        intro="Every branch here grows from one root. Find your place among them, or help us add the branches still missing."
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <FamilyTree root={patriarch} />

        <div className="mt-10 max-w-xl border border-dashed border-buff bg-parchment-deep/40 px-6 py-5">
          <p className="font-display text-xl text-continental">Is your line here yet?</p>
          <p className="mt-2 text-ink-soft">
            So far the tree shows one line of descent, through Rev. Robert McGarraugh. Joseph&rsquo;s other children and
            their descendants will be added as cousins send in their lines and the records behind them.
          </p>
          <Link href="/connect/" className="mt-3 inline-block text-sm italic text-claret hover:underline">
            Add your branch →
          </Link>
        </div>
      </section>

      <section className="border-y border-buff/50 bg-parchment-deep/60 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow text-center">Finding Your Place</p>
          <h2 className="mt-3 text-center text-3xl text-continental">How to trace your line back to Joseph</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="border border-buff/70 bg-parchment p-6">
                <span className="font-display text-4xl text-buff">{["I", "II", "III"][i]}</span>
                <h3 className="mt-2 text-xl text-continental">{s.title}</h3>
                <p className="mt-2 text-ink-soft">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="eyebrow">One Name, Many Spellings</p>
        <h2 className="mt-3 text-3xl text-continental">Look for all of these</h2>
        <p className="mt-4 text-ink-soft">
          Early clerks and census takers wrote names the way they heard them. Your ancestors may appear under any of
          these spellings, sometimes several in a single lifetime.
        </p>
        <ul className="mt-8 flex flex-wrap justify-center gap-3">
          {spellingVariants.map((v) => (
            <li key={v} className="border border-buff bg-parchment px-4 py-1.5 font-display text-lg text-continental">
              {v}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
