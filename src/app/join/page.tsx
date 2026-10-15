import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { JoinFlow } from "./JoinFlow";

export const metadata: Metadata = { title: "Join the Family" };

const steps = [
  { title: "Create an account", body: "Free, with your email or Google account." },
  { title: "Show your connection", body: "Write out your line to the McGarraugh family, and attach any documents you have." },
  { title: "Welcome home", body: "Once an admin confirms your connection, you can add to the family tree." },
];

export default function JoinPage() {
  return (
    <>
      <PageHeader
        eyebrow="Family Membership"
        title="Join the Family"
        intro="Membership is free and open to every descendant of the McGarraugh family, and to those who married into it."
      />
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-[1fr_22rem]">
        <div>
          <JoinFlow />
        </div>
        <aside>
          <p className="eyebrow">How It Works</p>
          <ol className="mt-4 space-y-5">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="font-display text-3xl leading-none text-buff">{["I", "II", "III"][i]}</span>
                <span>
                  <span className="block font-display text-lg text-continental">{s.title}</span>
                  <span className="block text-ink-soft">{s.body}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-8 border-t border-buff pt-6 text-sm italic text-ink-soft">
            For now, membership is limited to McGarraugh family members, so that we can build this as a family
            community first. Your documents are seen only by site admins.
          </p>
        </aside>
      </section>
    </>
  );
}
