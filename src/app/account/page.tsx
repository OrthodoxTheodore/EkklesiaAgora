import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { AccountView } from "./AccountView";

export const metadata: Metadata = { title: "My Account" };

export default function AccountPage() {
  return (
    <>
      <PageHeader eyebrow="Family Membership" title="My Account" />
      <section className="mx-auto max-w-3xl px-4 py-16">
        <AccountView />
      </section>
    </>
  );
}
