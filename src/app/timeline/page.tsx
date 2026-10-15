import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { timeline } from "@/data/timeline";

export const metadata: Metadata = { title: "Timeline" };

export default function TimelinePage() {
  return (
    <>
      <PageHeader
        eyebrow="Through the Years"
        title="A Family Timeline"
        intro="Joseph's life set against the great events of his age."
      />

      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-10 flex flex-wrap justify-center gap-6 text-sm text-ink-soft">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-claret" /> Our family
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-continental bg-parchment" /> The wider world
          </span>
        </div>

        <ol className="relative border-l-2 border-buff sm:ml-32">
          {timeline.map((e) => (
            <li key={e.year + e.title} className="relative mb-10 pl-8 last:mb-0">
              <span
                aria-hidden="true"
                className={`absolute -left-[9px] top-2 h-4 w-4 rounded-full ${
                  e.kind === "family" ? "bg-claret ring-4 ring-parchment" : "border-2 border-continental bg-parchment"
                }`}
              />
              <p className="font-display text-xl text-claret sm:absolute sm:-left-36 sm:top-0.5 sm:w-28 sm:text-right">
                {e.year}
              </p>
              <div
                className={
                  e.kind === "family" ? "border border-buff bg-parchment p-5 shadow-sm" : "py-1"
                }
              >
                <h2 className={`text-continental ${e.kind === "family" ? "text-2xl" : "text-xl italic"}`}>{e.title}</h2>
                <p className="mt-2 text-ink-soft">{e.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
