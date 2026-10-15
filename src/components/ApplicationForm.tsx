"use client";

import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import { friendlyError } from "@/lib/account";
import { MAX_FILE_BYTES, MAX_FILES, uploadApplicationFile } from "@/lib/files";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthProvider";
import { Button, inputClass, Label, Notice } from "./ui";

const okType = (f: File) => f.type.startsWith("image/") || f.type === "application/pdf";

export function ApplicationForm() {
  const { user, profile } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  function pickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    const all = [...files, ...picked];
    const bad = picked.find((f) => !okType(f));
    // Large photos are shrunk on upload, so only PDFs are held to the size limit here.
    const tooBig = picked.find((f) => f.type === "application/pdf" && f.size > MAX_FILE_BYTES);
    if (bad) return setError(`"${bad.name}" can't be used. Please attach photos or PDFs.`);
    if (tooBig) return setError(`"${tooBig.name}" is larger than 5 MB. Try scanning it at a lower resolution.`);
    if (all.length > MAX_FILES) return setError(`Please attach no more than ${MAX_FILES} files.`);
    setError("");
    setFiles(all);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      for (const [i, file] of files.entries()) {
        setProgress(`Uploading ${i + 1} of ${files.length}: ${file.name}`);
        await uploadApplicationFile(user.uid, file);
      }
      setProgress("Sending your application…");
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
      setError(err instanceof Error && !("code" in err) ? err.message : friendlyError(err));
      setProgress("");
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
        text="Links to records (optional)"
        hint="A FamilySearch person page, a Find a Grave memorial, an online obituary."
      >
        <textarea name="evidence" rows={3} maxLength={2000} className={inputClass} />
      </Label>
      <div>
        <Label
          text="Documents and photos (optional)"
          hint="Up to 5 photos or PDFs: a family Bible page, a birth record, an obituary clipping. A phone photo is fine. Only site admins can see these."
        >
          <input
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={pickFiles}
            disabled={busy || files.length >= MAX_FILES}
            className="mt-2 block w-full text-sm text-ink-soft file:mr-4 file:border file:border-continental file:bg-parchment file:px-4 file:py-2 file:font-display file:text-continental"
          />
        </Label>
        {files.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-ink-soft">
            {files.map((file, i) => (
              <li key={file.name + i} className="flex items-center gap-3">
                <span>📎 {file.name}</span>
                {!busy && (
                  <button
                    type="button"
                    onClick={() => setFiles(files.filter((_, j) => j !== i))}
                    className="text-xs italic text-claret underline"
                  >
                    remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      {progress && <Notice>{progress}</Notice>}
      <Button type="submit" disabled={busy}>
        {busy ? "Sending…" : "Submit Application"}
      </Button>
    </form>
  );
}
