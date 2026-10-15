"use client";

import { useState } from "react";
import { site } from "@/data/site";

// No server needed: the form opens the sender's own email app with the
// message filled in, addressed to the family inbox in data/site.ts.
export function ShareForm() {
  const [sent, setSent] = useState(false);
  const ready = site.contactEmail.length > 0;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = [
      `Name: ${f.get("name")}`,
      `Email: ${f.get("email")}`,
      `Location: ${f.get("location")}`,
      "",
      "My line back to Major Joseph:",
      String(f.get("line")),
      "",
      "Records, photos, or stories I can share:",
      String(f.get("records")),
    ].join("\n");
    window.location.href = `mailto:${site.contactEmail}?subject=${encodeURIComponent(
      `Family line from ${f.get("name")}`,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  const field = "mt-1 w-full border border-buff bg-parchment px-3 py-2 text-ink placeholder:text-ink-soft/60";

  return (
    <form onSubmit={onSubmit} className="space-y-5 border-2 border-buff bg-parchment p-6 shadow-sm sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm uppercase tracking-[0.15em] text-ink-soft">Your name</span>
          <input name="name" required className={field} />
        </label>
        <label className="block">
          <span className="text-sm uppercase tracking-[0.15em] text-ink-soft">Your email</span>
          <input name="email" type="email" required className={field} />
        </label>
      </div>
      <label className="block">
        <span className="text-sm uppercase tracking-[0.15em] text-ink-soft">Where you live now</span>
        <input name="location" placeholder="City, State" className={field} />
      </label>
      <label className="block">
        <span className="text-sm uppercase tracking-[0.15em] text-ink-soft">Your line, as far back as you know it</span>
        <textarea
          name="line"
          required
          rows={6}
          placeholder={"Me → my father, John McGarraugh (b. 1950, Ohio)\n→ his father, ...\n→ ... → Major Joseph"}
          className={field}
        />
      </label>
      <label className="block">
        <span className="text-sm uppercase tracking-[0.15em] text-ink-soft">Records, photos, or stories you could share</span>
        <textarea name="records" rows={3} className={field} />
      </label>

      {ready ? (
        <button
          type="submit"
          className="w-full bg-continental px-6 py-3 font-display text-lg text-parchment transition hover:bg-continental-deep sm:w-auto"
        >
          Send to the Family
        </button>
      ) : (
        <p className="border-l-4 border-claret bg-parchment-deep/60 px-4 py-3 text-sm text-ink-soft">
          The family inbox is still being set up. Check back soon, or keep your notes ready to send.
        </p>
      )}
      {sent && <p className="text-sm italic text-ulster">Your email app should now be open with your message. Thank you, cousin.</p>}
    </form>
  );
}
