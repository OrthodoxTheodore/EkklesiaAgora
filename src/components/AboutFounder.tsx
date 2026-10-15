import { familyHistoryUrl, immigrantParents, lifespan, lineage } from "@/data/lineage";

export function AboutFounder() {
  return (
    <section id="about" className="scroll-mt-24 px-4 py-20">
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1fr_26rem]">
        <div>
          <p className="eyebrow">About This Site</p>
          <h2 className="mt-3 text-3xl text-continental sm:text-4xl">Why this site exists</h2>
          <div className="prose-family mt-8 text-lg">
            <p className="drop-cap">
              This website was created by Charles McGarraugh for the whole McGarraugh family. It is for every American
              descendant of Major Joseph McGarraugh, whether you carry the name yourself or it came down to you through a
              mother or grandmother.
            </p>
            <p>
              For a long time almost nothing could be found online about this family. Joseph&rsquo;s service on the
              Pennsylvania frontier, his son&rsquo;s work as a missionary preacher, and the eleven generations since
              were kept in a family tree and in family memory, and almost nowhere else. This site exists to change
              that: to put our family on the record, keep the evidence where anyone can check it, and help scattered
              cousins find each other.
            </p>
            <p>
              Charles is Joseph&rsquo;s seventh-great-grandson. His line runs through Joseph&rsquo;s son, the Rev.
              Robert McGarraugh, and is shown here generation by generation. The full story, from the family&rsquo;s
              Scottish origins in Carrick through Ulster to the Pennsylvania frontier, is told in his family history.
            </p>
          </div>

          <a
            href={familyHistoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-10 flex max-w-xl items-center gap-5 border-2 border-buff bg-parchment-deep/50 p-6 transition hover:border-claret/60 hover:bg-parchment-deep"
          >
            <span aria-hidden="true" className="font-display text-5xl leading-none text-buff">
              ❦
            </span>
            <span>
              <span className="eyebrow block">Read the Family History</span>
              <span className="mt-1 block font-display text-2xl text-continental group-hover:text-claret">
                From Carrick to the Frontier
              </span>
              <span className="mt-1 block text-sm italic text-ink-soft">
                A history of the McGarraugh family, 1607 to the present, by Charles McGarraugh ↗
              </span>
            </span>
          </a>
        </div>

        <aside aria-labelledby="lineage-heading" className="border-2 border-buff bg-parchment p-6 shadow-sm sm:p-8">
          <p className="eyebrow">A Line of Descent</p>
          <h3 id="lineage-heading" className="mt-2 text-2xl text-continental">
            From Major Joseph to Charles
          </h3>

          <p className="mt-5 border-b border-dashed border-buff pb-4 text-sm text-ink-soft">
            <span className="font-display text-base text-continental">{immigrantParents.names}</span>
            <span className="italic"> ({immigrantParents.dates})</span>, Joseph&rsquo;s parents by family tradition.
          </p>

          <ol className="mt-2">
            {lineage.map((g, i) => {
              const span = lifespan(g.born, g.died, g.living);
              const last = i === lineage.length - 1;
              return (
                <li key={g.name + i} className="relative flex gap-4 pt-4">
                  {!last && (
                    <span aria-hidden="true" className="absolute left-[13px] top-11 bottom-[-1rem] border-l-2 border-buff" />
                  )}
                  <span
                    className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${
                      i === 0 ? "bg-claret text-parchment" : last ? "bg-continental text-parchment" : "border-2 border-buff bg-parchment text-ink-soft"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="pb-1">
                    <span className="block font-display text-lg leading-snug text-continental">{g.name}</span>
                    {span && <span className="block text-sm italic text-claret">{span}</span>}
                    {g.spouse && <span className="block text-sm text-ink-soft">m. {g.spouse}</span>}
                    {g.evidence === "verified" && (
                      <span className="mt-0.5 block text-xs text-ulster">✓ Verified in historical records</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        </aside>
      </div>
    </section>
  );
}
