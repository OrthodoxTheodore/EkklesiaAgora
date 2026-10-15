"use client";

import { doc, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import type { Application } from "@/lib/types";
import { site } from "@/data/site";
import { ApplicationForm } from "./ApplicationForm";
import { useAuth } from "./AuthProvider";
import { Loading, Notice, Panel } from "./ui";

// Shows a signed-in person where they stand: apply, waiting, approved, or declined.
export function MembershipStatus() {
  const { user, isMember } = useAuth();
  const [application, setApplication] = useState<Application | null | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      doc(db(), "applications", user.uid),
      (snap) => setApplication(snap.exists() ? (snap.data() as Application) : null),
      () => setApplication(null),
    );
  }, [user]);

  if (isMember) {
    return (
      <Panel>
        <p className="eyebrow">Welcome, Cousin</p>
        <p className="mt-2 font-display text-2xl text-continental">You are a member of the McGarraugh family site</p>
        <p className="mt-2 text-ink-soft">You can now add relatives to the family tree and see living family members.</p>
        <Link href="/family/" className="mt-5 inline-block bg-continental px-5 py-2.5 font-display text-lg text-parchment hover:bg-continental-deep">
          Go to the Family Tree
        </Link>
      </Panel>
    );
  }

  if (application === undefined) return <Loading />;

  if (application === null) {
    return (
      <Panel>
        <p className="eyebrow">Step 2 of 2</p>
        <h2 className="mt-2 text-2xl text-continental">Tell us how you are connected</h2>
        <p className="mt-2 mb-6 text-ink-soft">
          A site admin will read your application and check it against the family records. Most applications are
          reviewed within a few days.
        </p>
        <ApplicationForm />
      </Panel>
    );
  }

  if (application.status === "rejected") {
    return (
      <Panel>
        <p className="font-display text-2xl text-continental">We couldn&rsquo;t confirm your connection yet</p>
        {application.reviewNote && (
          <div className="mt-4">
            <Notice>{application.reviewNote}</Notice>
          </div>
        )}
        <p className="mt-4 text-ink-soft">
          This usually just means we need a little more information. Please write to{" "}
          <a href={`mailto:${site.contactEmail}`} className="text-claret underline">
            {site.contactEmail}
          </a>{" "}
          and we&rsquo;ll help you find the link.
        </p>
      </Panel>
    );
  }

  return (
    <Panel>
      <p className="eyebrow">Application Received</p>
      <p className="mt-2 font-display text-2xl text-continental">Thank you, {application.name.split(" ")[0]}</p>
      <p className="mt-2 text-ink-soft">
        Your application is waiting for review by a site admin. This page will update on its own once you are
        approved. Questions? Write to{" "}
        <a href={`mailto:${site.contactEmail}`} className="text-claret underline">
          {site.contactEmail}
        </a>
        .
      </p>
      <details className="mt-5 text-sm text-ink-soft">
        <summary className="cursor-pointer italic text-claret">What you sent</summary>
        <p className="mt-3 whitespace-pre-wrap border-l-2 border-buff pl-3">{application.lineage}</p>
        {application.files.length > 0 && (
          <p className="mt-2">Attached: {application.files.map((f) => f.name).join(", ")}</p>
        )}
      </details>
    </Panel>
  );
}
