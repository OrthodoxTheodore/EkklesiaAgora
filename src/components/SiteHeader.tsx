"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { Crest } from "./Crest";
import { firebaseReady } from "@/lib/firebase";
import { nav, site } from "@/data/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { ready, user, isAdmin } = useAuth();
  const account = !firebaseReady || !ready
    ? null
    : user
      ? [{ href: "/account/", label: "My Account" }, ...(isAdmin ? [{ href: "/admin/", label: "Admin" }] : [])]
      : [{ href: "/signin/", label: "Sign In" }, { href: "/join/", label: "Join" }];
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b-2 border-buff bg-continental text-parchment shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Crest className="h-11 w-11 text-buff" />
          <span className="leading-tight">
            <span className="block font-display text-xl tracking-wide">{site.name}</span>
            <span className="block text-[0.7rem] uppercase tracking-[0.2em] text-buff-soft">Est. 1738 · Ulster</span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`rounded px-3 py-2 text-sm tracking-wide transition-colors hover:text-buff ${
                    isActive(item.href) ? "text-buff underline decoration-buff/70 underline-offset-8" : "text-parchment"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {account?.map((item, i) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={
                    i === account.length - 1
                      ? "ml-2 border border-buff px-3 py-1.5 text-sm text-buff transition-colors hover:bg-buff hover:text-continental-deep"
                      : "rounded px-3 py-2 text-sm tracking-wide text-parchment hover:text-buff"
                  }
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="rounded border border-buff/50 px-3 py-1.5 text-sm text-buff xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-buff/30 bg-continental-deep xl:hidden">
          <ul className="mx-auto max-w-6xl px-4 py-2">
            {[...nav, ...(account ?? [])].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`block border-b border-buff/10 py-3 ${isActive(item.href) ? "text-buff" : "text-parchment"}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
