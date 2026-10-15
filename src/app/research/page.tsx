import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Research & Sources" };

const archives = [
  {
    name: "Pennsylvania State Archives",
    url: "https://www.phmc.pa.gov/Archives/",
    body: "Revolutionary War military abstract cards, militia rolls, and land records for Pennsylvania soldiers and officers.",
  },
  {
    name: "U.S. National Archives",
    url: "https://www.archives.gov/research/military/war-of-independence",
    body: "Revolutionary War pension and bounty-land warrant files, compiled service records, and muster rolls.",
  },
  {
    name: "FamilySearch",
    url: "https://www.familysearch.org/",
    body: "Free census, probate, church, and land records, including Fayette County wills and deeds.",
  },
  {
    name: "Find a Grave",
    url: "https://www.findagrave.com/",
    body: "Burial records and gravestone photographs. Search every spelling of the surname in Fayette and neighboring counties.",
  },
  {
    name: "Public Record Office of Northern Ireland",
    url: "https://www.nidirect.gov.uk/proni",
    body: "Ulster church registers, estate papers, and tithe records, for tracing the family before the crossing.",
  },
];

const societies = [
  {
    name: "Daughters of the American Revolution",
    url: "https://www.dar.org/",
    body: "Open to women who can prove descent from a patriot of the Revolution. Its Genealogical Research System may already hold lineages that run back to Joseph.",
  },
  {
    name: "Sons of the American Revolution",
    url: "https://www.sar.org/",
    body: "The men's counterpart to the DAR. Its patriot research database records ancestors whose service has already been documented.",
  },
  {
    name: "Children of the American Revolution",
    url: "https://www.nscar.org/",
    body: "For descendants under 22. A good way to pass the story to the youngest generation.",
  },
];

function ResourceList({ items }: { items: { name: string; url: string; body: string }[] }) {
  return (
    <ul className="mt-8 grid gap-5 md:grid-cols-2">
      {items.map((r) => (
        <li key={r.name} className="border border-buff/70 bg-parchment p-6 shadow-sm">
          <a href={r.url} target="_blank" rel="noopener noreferrer" className="group">
            <h3 className="text-xl text-continental group-hover:text-claret">
              {r.name} <span aria-hidden="true" className="text-sm">↗</span>
            </h3>
          </a>
          <p className="mt-2 text-ink-soft">{r.body}</p>
        </li>
      ))}
    </ul>
  );
}

export default function ResearchPage() {
  return (
    <>
      <PageHeader
        eyebrow="The Records"
        title="Research & Sources"
        intro="Good genealogy rests on good records. Here is where to look, and how to prove your descent."
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="eyebrow">Where to Look</p>
        <h2 className="mt-2 text-3xl text-continental">Archives and record collections</h2>
        <ResourceList items={archives} />
      </section>

      <section className="border-y border-buff/50 bg-parchment-deep/60 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow">Honoring His Service</p>
          <h2 className="mt-2 text-3xl text-continental">Lineage societies</h2>
          <p className="mt-3 max-w-3xl text-ink-soft">
            As descendants of a Revolutionary War officer, members of this family may be eligible to join the
            hereditary societies that honor the patriots. Once one cousin&rsquo;s application proves a line, it becomes
            much easier for others on the same branch to follow.
          </p>
          <div className="mt-6 max-w-3xl border-l-4 border-ulster bg-parchment px-5 py-4">
            <p className="font-display text-xl text-continental">Joseph is already an established patriot</p>
            <p className="mt-1 text-ink-soft">
              The DAR lists him as Patriot Ancestor <strong className="font-normal text-continental">A076882</strong>{" "}
              (as &ldquo;McGarrah&rdquo;), and the SAR as Patriot <strong className="font-normal text-continental">P-244671</strong>.
              His service does not need to be proven again. An applicant only needs to document their own line of
              descent back to him. Mention these numbers when you contact a chapter registrar.
            </p>
          </div>
          <ResourceList items={societies} />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <p className="eyebrow">A Family Standard</p>
        <h2 className="mt-2 text-3xl text-continental">How we keep the record trustworthy</h2>
        <ul className="mt-6 space-y-4 text-lg">
          <li>
            <strong className="font-display text-continental">Every fact needs a source.</strong>{" "}
            <span className="text-ink-soft">A census line, a will, a gravestone, a Bible page. Family stories are welcome, and we label them as stories.</span>
          </li>
          <li>
            <strong className="font-display text-continental">Living relatives stay private.</strong>{" "}
            <span className="text-ink-soft">We publish names and dates of living people only with their permission.</span>
          </li>
          <li>
            <strong className="font-display text-continental">Copy carefully, cite fully.</strong>{" "}
            <span className="text-ink-soft">Online trees often repeat each other&rsquo;s mistakes. We trust the original document over the copy.</span>
          </li>
        </ul>
      </section>
    </>
  );
}
