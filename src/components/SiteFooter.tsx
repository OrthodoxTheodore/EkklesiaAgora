import Link from "next/link";
import { Crest } from "./Crest";
import { nav, site } from "@/data/site";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t-2 border-buff bg-continental-deep text-parchment">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-[1.5fr_1fr]">
        <div className="flex gap-4">
          <Crest className="h-14 w-14 shrink-0 text-buff" />
          <div>
            <p className="font-display text-xl">{site.name}</p>
            <p className="mt-2 max-w-md text-sm text-buff-soft">
              For every American descendant of Major Joseph McGarraugh, born in Ulster in 1738, patriot of the
              Revolution, at rest in Fayette County, Pennsylvania since 1810.
            </p>
          </div>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-parchment/85 hover:text-buff">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-buff/20 px-4 py-4 text-center text-xs tracking-wider text-buff-soft/80">
        Kept by the family, for the family · {new Date().getFullYear()}
      </div>
    </footer>
  );
}
