import { Ornament } from "./Ornament";

export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <header className="border-b border-buff/60 bg-continental-deep px-4 pb-14 pt-16 text-center text-parchment sm:pt-20">
      <p className="eyebrow !text-buff">{eyebrow}</p>
      <h1 className="mx-auto mt-4 max-w-3xl text-4xl sm:text-5xl">{title}</h1>
      <Ornament className="mt-6" />
      {intro && <p className="mx-auto mt-6 max-w-2xl text-lg italic text-buff-soft">{intro}</p>}
    </header>
  );
}
