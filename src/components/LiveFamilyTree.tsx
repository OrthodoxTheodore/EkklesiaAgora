"use client";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { patriarch, type Person } from "@/data/family";
import { db, firebaseReady } from "@/lib/firebase";
import { mergeTree, type TreeDoc } from "@/lib/tree";
import type { TreePerson } from "@/lib/types";
import { AddPersonDialog } from "./AddPersonDialog";
import { useAuth } from "./AuthProvider";
import { FamilyTree } from "./FamilyTree";

// The curated tree plus everything members have added. Visitors see deceased
// people only; the security rules hold living people back for members.
export function LiveFamilyTree() {
  const { ready, user, isMember } = useAuth();
  const [docs, setDocs] = useState<TreeDoc[]>([]);
  const [addingTo, setAddingTo] = useState<Person | null>(null);

  useEffect(() => {
    if (!firebaseReady || !ready) return;
    const people = collection(db(), "people");
    const q = isMember ? people : query(people, where("living", "==", false));
    return onSnapshot(
      q,
      (snap) => setDocs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as TreePerson) }))),
      () => setDocs([]),
    );
  }, [ready, isMember]);

  const root = useMemo(() => mergeTree(patriarch, docs), [docs]);

  return (
    <>
      {firebaseReady && ready && !isMember && (
        <div className="mb-8 max-w-2xl border-l-4 border-buff bg-parchment-deep/50 px-5 py-3 text-ink-soft">
          {user ? (
            <>
              Your membership is waiting for review. Once approved, you can add relatives here.{" "}
              <Link href="/account/" className="text-claret underline">
                Check your status
              </Link>
            </>
          ) : (
            <>
              Family members can add relatives to this tree.{" "}
              <Link href="/join/" className="text-claret underline">
                Join the family
              </Link>{" "}
              or{" "}
              <Link href="/signin/" className="text-claret underline">
                sign in
              </Link>
              . Living relatives are shown to members only.
            </>
          )}
        </div>
      )}
      <FamilyTree root={root} onAdd={isMember ? setAddingTo : undefined} />
      {addingTo && <AddPersonDialog parent={addingTo} onClose={() => setAddingTo(null)} />}
    </>
  );
}
