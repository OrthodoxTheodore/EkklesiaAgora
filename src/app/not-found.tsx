import Link from "next/link";
import { Ornament } from "@/components/Ornament";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-28 text-center">
      <p className="eyebrow">Page Not Found</p>
      <h1 className="mt-4 text-4xl text-continental sm:text-5xl">This branch has gone missing</h1>
      <Ornament className="mt-6" />
      <p className="mt-6 text-lg text-ink-soft">
        Like a name lost from an old census, this page could not be found. Let us get you back on the right road.
      </p>
      <Link href="/" className="mt-8 inline-block bg-continental px-6 py-3 font-display text-lg text-parchment hover:bg-continental-deep">
        Return Home
      </Link>
    </section>
  );
}
