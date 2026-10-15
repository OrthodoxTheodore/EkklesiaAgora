"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import type { Person } from "@/data/family";
import { friendlyError } from "@/lib/account";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthProvider";
import { Button, inputClass, Label, Notice } from "./ui";

export function AddPersonDialog({ parent, onClose }: { parent: Person; onClose: () => void }) {
  const { user, profile } = useAuth();
  const dialog = useRef<HTMLDialogElement>(null);
  const [living, setLiving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const f = new FormData(e.currentTarget);
    const text = (k: string) => String(f.get(k) ?? "").trim();
    setBusy(true);
    setError("");
    try {
      await addDoc(collection(db(), "people"), {
        parentId: parent.id,
        name: text("name"),
        born: text("born"),
        bornPlace: text("bornPlace"),
        died: living ? "" : text("died"),
        diedPlace: living ? "" : text("diedPlace"),
        spouse: text("spouse"),
        note: text("note"),
        source: text("source"),
        living,
        reviewed: false,
        createdBy: user.uid,
        createdByName: profile?.displayName || user.displayName || "",
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      className="m-auto w-[min(40rem,calc(100vw-2rem))] border-2 border-buff bg-parchment p-0 text-ink backdrop:bg-continental-deep/60"
    >
      <form onSubmit={onSubmit} className="max-h-[85vh] space-y-4 overflow-y-auto p-6 sm:p-8">
        <p className="eyebrow">Add to the Family Tree</p>
        <h2 className="text-2xl text-continental">A child of {parent.name}</h2>

        <Label text="Full name" hint="Use maiden names for women where known.">
          <input name="name" required maxLength={120} className={inputClass} autoFocus />
        </Label>

        <label className="flex items-center gap-3 text-ink-soft">
          <input type="checkbox" checked={living} onChange={(e) => setLiving(e.target.checked)} className="h-4 w-4" />
          This person is living (shown to members only)
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <Label text="Born" hint="Year or full date">
            <input name="born" maxLength={40} className={inputClass} />
          </Label>
          <Label text="Birthplace">
            <input name="bornPlace" maxLength={120} placeholder="Town, County, State" className={inputClass} />
          </Label>
          {!living && (
            <>
              <Label text="Died">
                <input name="died" maxLength={40} className={inputClass} />
              </Label>
              <Label text="Place of death or burial">
                <input name="diedPlace" maxLength={120} className={inputClass} />
              </Label>
            </>
          )}
        </div>

        <Label text="Spouse" hint="Name and years, if known">
          <input name="spouse" maxLength={160} className={inputClass} />
        </Label>
        <Label text="Notes" hint="Occupation, military service, where they lived, a story worth keeping">
          <textarea name="note" rows={3} maxLength={1000} className={inputClass} />
        </Label>
        <Label text="Source" hint="Where this comes from: a census, obituary, Bible page, FamilySearch ID, or family memory">
          <input name="source" maxLength={300} className={inputClass} />
        </Label>

        <Notice>
          Your addition appears on the tree right away, marked &ldquo;Not yet reviewed&rdquo; until an admin checks it.
        </Notice>
        {error && <Notice tone="error">{error}</Notice>}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={busy}>
            {busy ? "Adding…" : "Add to Tree"}
          </Button>
          <Button type="button" variant="outline" onClick={() => dialog.current?.close()}>
            Cancel
          </Button>
        </div>
      </form>
    </dialog>
  );
}
