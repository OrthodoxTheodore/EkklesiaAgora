"use client";

import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import { db, storage } from "@/lib/firebase";
import { friendlyError } from "@/lib/account";
import { useAuth } from "./AuthProvider";
import { Button, inputClass, Label, Notice } from "./ui";

const MAX_FILES = 5;
const MAX_BYTES = 10 * 1024 * 1024;

export function ApplicationForm() {
  const { user, profile } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function pickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    const bad = picked.find((f) => f.size > MAX_BYTES || !(f.type.startsWith("image/") || f.type === "application/pdf"));
    if (bad) {
      setError(`"${bad.name}" can't be used. Please attach photos or PDFs under 10 MB.`);
      e.target.value = "";
      return;
    }
    if (picked.length > MAX_FILES) {
      setError(`Please attach no more than ${MAX_FILES} files.`);
      e.target.value = "";
      return;
    }
    setError("");
    setFiles(picked);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const uploaded = [];
      for (const file of files) {
        const safe = file.name.replace(/[^\w.\-]+/g, "_");
        const path = `applications/${user.uid}/${Date.now()}-${safe}`;
        await uploadBytes(ref(storage(), path), file, { contentType: file.type });
        uploaded.push({ name: file.name, path });
      }
      await setDoc(doc(db(), "applications", user.uid), {
        name: String(f.get("name")).trim(),
        email: user.email ?? "",
        location: String(f.get("location")).trim(),
        connection: String(f.get("connection")),
        lineage: String(f.get("lineage")).trim(),
        files: uploaded,
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
        <input name="name" required defaultValue={profile?.displayName ?? ""} className={inputClass} />
      </Label>
      <Label text="Where you live now">
        <input name="location" placeholder="City, State" className={inputClass} />
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
          rows={7}
          placeholder={"Me, Jane Smith (b. 1980, Denver)\n→ my mother, Mary McGarraugh Smith (b. 1955)\n→ her father, Robert McGarraugh (1925–1990)\n→ …"}
          className={inputClass}
        />
      </Label>
      <Label
        text="Supporting documents (optional)"
        hint="Up to 5 photos or PDFs: an obituary, a family Bible page, a birth record, or a FamilySearch screenshot. Only site admins can see these."
      >
        <input
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={pickFiles}
          className="mt-2 block w-full text-sm text-ink-soft file:mr-4 file:border file:border-continental file:bg-parchment file:px-4 file:py-2 file:font-display file:text-continental"
        />
      </Label>
      {files.length > 0 && (
        <ul className="text-sm text-ink-soft">
          {files.map((f) => (
            <li key={f.name}>📎 {f.name}</li>
          ))}
        </ul>
      )}
      {error && <Notice tone="error">{error}</Notice>}
      <Button type="submit" disabled={busy}>
        {busy ? "Sending…" : "Submit Application"}
      </Button>
    </form>
  );
}
