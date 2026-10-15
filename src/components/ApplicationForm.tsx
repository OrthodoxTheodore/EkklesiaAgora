"use client";

import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import { site } from "@/data/site";
import { friendlyError } from "@/lib/account";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthProvider";
import { Button, inputClass, Label, Notice } from "./ui";

export function ApplicationForm() {
  const { user, profile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await setDoc(doc(db(), "applications", user.uid), {
        name: String(f.get("name")).trim(),
        email: user.email ?? "",
        location: String(f.get("location")).trim(),
        connection: String(f.get("connection")),
        lineage: String(f.get("lineage")).trim(),
        evidence: String(f.get("evidence")).trim(),
        status: "pending",
        submittedAt: serverTimestamp(),
      });
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Label text="Your full name">
        <input name="name" required maxLength={120} defaultValue={profile?.displayName ?? ""} className={inputClass} />
      </Label>
      <Label text="Where you live now">
        <input name="location" maxLength={120} placeholder="City, State" className={inputClass} />
      </Label>
      <Label text="How are you connected to the family?">
        <select name="connection" required className={inputClass} defaultValue="">
          <option value="" disabled>
            Choose one
          </option>
          <option>I carry the McGarraugh name</option>
          <option>My parent or grandparent was a McGarraugh</option>
          <option>I descend from a McGarraugh further back</option>
          <option>I married into the family</option>
        </select>
      </Label>
      <Label
        text="Your line back to the family"
        hint="Start with yourself and work back, as far as you know. Names, years, and places help most."
      >
        <textarea
          name="lineage"
          required
          minLength={20}
          maxLength={5000}
          rows={7}
          placeholder={"Me, Jane Smith (b. 1980, Denver)\n→ my mother, Mary McGarraugh Smith (b. 1955)\n→ her father, Robert McGarraugh (1925–1990)\n→ …"}
          className={inputClass}
        />
      </Label>
      <Label
        text="Records that show the connection (optional)"
        hint="Paste links to anything that helps: a FamilySearch person page, a Find a Grave memorial, an online obituary."
      >
        <textarea name="evidence" rows={3} maxLength={2000} className={inputClass} />
      </Label>
      <Notice>
        Have a document that isn&rsquo;t online, like a family Bible page or a birth record? Email a photo of it to{" "}
        <a href={`mailto:${site.contactEmail}`} className="text-claret underline">
          {site.contactEmail}
        </a>{" "}
        and mention your name.
      </Notice>
      {error && <Notice tone="error">{error}</Notice>}
      <Button type="submit" disabled={busy}>
        {busy ? "Sending…" : "Submit Application"}
      </Button>
    </form>
  );
}
