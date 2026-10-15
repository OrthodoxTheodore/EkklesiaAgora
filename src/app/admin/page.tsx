import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { AdminConsole } from "./AdminConsole";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default function AdminPage() {
  return (
    <>
      <PageHeader eyebrow="Site Admin" title="Family Admin" />
      <section className="mx-auto max-w-5xl px-4 py-12">
        <AdminConsole />
      </section>
    </>
  );
}
