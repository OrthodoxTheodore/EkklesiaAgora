import Link from "next/link";
import { Crest } from "@/components/Crest";
import { Journey } from "@/components/Journey";
import { Ornament } from "@/components/Ornament";

const sections = [
  {
    href: "/joseph/",
    eyebrow: "The Patriarch",
    title: "Major Joseph McGarraugh",
    body: "Born in Ulster, he crossed the ocean, took up arms for independence, and died on the western Pennsylvania frontier. This is his story as far as we know it so far.",
  },
  {
    href: "/family/",
    eyebrow: "The Branches",
    title: "The Family Tree",
    body: "Two centuries of sons and daughters, from Fayette County outward across America. Find where your line joins the trunk.",
  },
  {
    href: "/research/",
    eyebrow: "The Records",
    title: "Research & Sources",
    body: "Pension files, county deeds, church registers, gravestones. Where to look, what we have found, and how to join the lineage societies.",
  },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-continental-deep px-4 pb-20 pt-16 text-center text-parchment sm:pb-28 sm:pt-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #d6c08f 0 1px, transparent 1px 22px), repeating-linear-gradient(-45deg, #d6c08f 0 1px, transparent 1px 22px)",
          }}
        />
        <div className="relative mx-auto max-w-4xl">
          <Crest className="mx-auto h-24 w-24 text-buff sm:h-28 sm:w-28" />
          <p className="eyebrow mt-8 !text-buff">The Descendants of</p>
          <h1 className="mt-4 text-5xl leading-[1.05] sm:text-7xl">
            Major Joseph
            <br />
            McGarraugh
          </h1>
          <p className="mt-5 font-display text-2xl italic text-buff sm:text-3xl">1738 – 1809</p>
          <Ornament className="mt-8" />
          <p className="mx-auto mt-8 max-w-2xl text-lg text-buff-soft sm:text-xl">
            Born in Ulster. Patriot of the American Revolution. Laid to rest in Fayette County, Pennsylvania. And the
            father of a family that now reaches across the whole of the country he fought to found.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/family/"
              className="w-full rounded-sm bg-buff px-7 py-3 font-display text-lg text-continental-deep transition hover:bg-buff-soft sm:w-auto"
            >
              Explore the Family Tree
            </Link>
            <Link
              href="/connect/"
              className="w-full rounded-sm border border-buff px-7 py-3 font-display text-lg text-buff transition hover:bg-buff/10 sm:w-auto"
            >
              Add Your Branch
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20">
        <p className="eyebrow text-center">Welcome, Cousin</p>
        <h2 className="mt-3 text-center text-3xl text-continental sm:text-4xl">One name, many households</h2>
        <div className="prose-family mt-8 text-lg">
          <p className="drop-cap">
            If you carry the McGarraugh name, or if your grandmother or great-grandfather did, you belong to a family
            whose American story begins with one man. Joseph McGarraugh came out of Ulster in the eighteenth century,
            stood with the colonies when they declared their independence, and ended his days in Fayette County,
            Pennsylvania, in 1809.
          </p>
          <p>
            This site is our common hearth: a place to piece together his life, trace each branch that grew from it,
            keep the records safe, and find the cousins we have never met. It belongs to all of us, and it grows each
            time someone shares a name, a date, a photograph, or a story.
          </p>
        </div>
      </section>

      <section className="border-y border-buff/50 bg-parchment-deep/60 px-4 py-16">
        <p className="eyebrow text-center">From the Old World to the New</p>
        <h2 className="mt-3 text-center text-3xl text-continental">The Road from Ulster</h2>
        <div className="mt-12">
          <Journey />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group flex flex-col border border-buff/70 bg-parchment p-7 shadow-sm transition hover:-translate-y-0.5 hover:border-claret/60 hover:shadow-md"
            >
              <p className="eyebrow">{s.eyebrow}</p>
              <h3 className="mt-2 text-2xl text-continental">{s.title}</h3>
              <p className="mt-3 flex-1 text-ink-soft">{s.body}</p>
              <span className="mt-5 text-sm italic text-claret group-hover:underline">Read more →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4">
        <blockquote className="mx-auto max-w-3xl border-l-4 border-claret bg-parchment-deep/50 px-6 py-8 sm:px-10">
          <p className="font-display text-2xl italic leading-snug text-continental sm:text-3xl">
            “We mutually pledge to each other our Lives, our Fortunes, and our sacred Honor.”
          </p>
          <footer className="mt-4 text-sm uppercase tracking-[0.18em] text-ink-soft">
            Declaration of Independence, 1776
          </footer>
        </blockquote>
      </section>
    </>
  );
}
