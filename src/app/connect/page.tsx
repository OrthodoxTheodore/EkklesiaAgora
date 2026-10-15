import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ShareForm } from "@/components/ShareForm";

export const metadata: Metadata = { title: "Share Your Line" };

const wanted = [
  "Family Bible pages with births, marriages, and deaths",
  "Photographs, especially ones with names written on the back",
  "Wills, deeds, and land warrants",
  "Military records from any war",
  "Obituaries and funeral cards",
  "The stories your grandparents told",
];

export default function ConnectPage() {
  return (
    <>
      <PageHeader
        eyebrow="Join the Gathering"
        title="Share Your Line"
        intro="Every cousin who writes in fills in another piece of the tree."
      />

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-[1fr_22rem]">
        <ShareForm />

        <aside>
          <p className="eyebrow">What We Are Looking For</p>
          <h2 className="mt-2 text-2xl text-continental">Treasures in the attic</h2>
          <ul className="mt-5 space-y-3 text-ink-soft">
            {wanted.map((w) => (
              <li key={w} className="flex gap-2">
                <span aria-hidden="true" className="text-claret">
                  ✦
                </span>
                {w}
              </li>
            ))}
          </ul>
          <p className="mt-8 border-t border-buff pt-6 text-sm italic text-ink-soft">
            Please don&rsquo;t mail original documents. A clear phone photo or scan is all we need, and the original
            stays safe with you.
          </p>
        </aside>
      </section>
    </>
  );
}
