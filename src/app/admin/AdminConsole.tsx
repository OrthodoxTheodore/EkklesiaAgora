"use client";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button, inputClass, Loading, MembershipComingSoon, Notice, Panel } from "@/components/ui";
import { patriarch } from "@/data/family";
import { friendlyError } from "@/lib/account";
import { db, firebaseReady } from "@/lib/firebase";
import { deleteApplicationFiles, listApplicationFiles, openApplicationFile, type StoredFile } from "@/lib/files";
import { indexNames, type TreeDoc } from "@/lib/tree";
import type { Application, Profile, TreePerson } from "@/lib/types";

type Tab = "applications" | "tree" | "members";
type AppRow = Application & { id: string };
type UserRow = Profile & { id: string };

const when = (t: { toDate: () => Date } | null | undefined) => (t ? t.toDate().toLocaleDateString() : "");

export function AdminConsole() {
  const { ready, isAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>("applications");
  const [apps, setApps] = useState<AppRow[]>([]);
  const [additions, setAdditions] = useState<TreeDoc[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    const stops = [
      onSnapshot(collection(db(), "applications"), (s) =>
        setApps(s.docs.map((d) => ({ id: d.id, ...(d.data() as Application) }))),
      ),
      onSnapshot(query(collection(db(), "people"), where("reviewed", "==", false)), (s) =>
        setAdditions(s.docs.map((d) => ({ id: d.id, ...(d.data() as TreePerson) }))),
      ),
      onSnapshot(collection(db(), "users"), (s) => setUsers(s.docs.map((d) => ({ id: d.id, ...(d.data() as Profile) })))),
    ];
    return () => stops.forEach((stop) => stop());
  }, [isAdmin]);

  if (!firebaseReady) return <MembershipComingSoon />;
  if (!ready) return <Loading />;
  if (!isAdmin) {
    return (
      <Panel>
        <p className="font-display text-2xl text-continental">Admins only</p>
        <p className="mt-2 text-ink-soft">This page is for site admins. Sign in with an admin account to continue.</p>
      </Panel>
    );
  }

  const pending = apps.filter((a) => a.status === "pending");
  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "applications", label: "Applications", count: pending.length },
    { id: "tree", label: "Tree Additions", count: additions.length },
    { id: "members", label: "Members" },
  ];

  return (
    <div>
      <div role="tablist" className="mb-8 flex flex-wrap gap-2 border-b-2 border-buff">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-0.5 border-b-2 px-4 py-2 font-display text-lg ${
              tab === t.id ? "border-claret text-continental" : "border-transparent text-ink-soft hover:text-continental"
            }`}
          >
            {t.label}
            {!!t.count && <span className="ml-2 rounded-full bg-claret px-2 py-0.5 text-xs text-parchment">{t.count}</span>}
          </button>
        ))}
      </div>

      {tab === "applications" && <Applications apps={apps} />}
      {tab === "tree" && <TreeAdditions additions={additions} />}
      {tab === "members" && <Members users={users} />}
    </div>
  );
}

function Applications({ apps }: { apps: AppRow[] }) {
  const sorted = [...apps].sort((a, b) => (b.submittedAt?.toMillis() ?? 0) - (a.submittedAt?.toMillis() ?? 0));
  const pending = sorted.filter((a) => a.status === "pending");
  const decided = sorted.filter((a) => a.status !== "pending");

  return (
    <div className="space-y-6">
      {pending.length === 0 && <Notice>No applications are waiting for review.</Notice>}
      {pending.map((a) => (
        <ApplicationCard key={a.id} app={a} />
      ))}
      {decided.length > 0 && (
        <details className="pt-6">
          <summary className="cursor-pointer font-display text-xl text-continental">
            Past decisions ({decided.length})
          </summary>
          <div className="mt-4 space-y-4">
            {decided.map((a) => (
              <ApplicationCard key={a.id} app={a} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function ApplicationCard({ app }: { app: AppRow }) {
  const { user } = useAuth();
  const [note, setNote] = useState(app.reviewNote ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<StoredFile[]>([]);

  useEffect(() => {
    listApplicationFiles(app.id).then(setFiles, () => setFiles([]));
  }, [app.id]);

  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  const decide = (approved: boolean) =>
    act(async () => {
      const batch = writeBatch(db());
      batch.update(doc(db(), "applications", app.id), {
        status: approved ? "approved" : "rejected",
        reviewNote: note.trim(),
        reviewedBy: user?.uid ?? "",
        reviewedAt: serverTimestamp(),
      });
      batch.update(doc(db(), "users", app.id), { status: approved ? "member" : "rejected" });
      await batch.commit();
    });

  const statusStyle = {
    pending: "bg-buff/40 text-continental",
    approved: "bg-ulster/15 text-ulster",
    rejected: "bg-claret/10 text-claret",
  }[app.status];

  // Once a decision is made the documents have done their job; admins can
  // delete them so the family's private papers are not kept longer than needed.
  const deleteFiles = () =>
    act(async () => {
      await deleteApplicationFiles(app.id);
      setFiles([]);
    });

  return (
    <Panel className="!p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-2xl text-continental">{app.name}</p>
          <p className="text-sm text-ink-soft">
            {app.email}
            {app.location && ` · ${app.location}`} · applied {when(app.submittedAt)}
          </p>
        </div>
        <span className={`px-3 py-1 text-xs uppercase tracking-[0.15em] ${statusStyle}`}>{app.status}</span>
      </div>
      <p className="mt-4 text-sm uppercase tracking-[0.15em] text-ink-soft">{app.connection}</p>
      <p className="mt-2 whitespace-pre-wrap border-l-2 border-buff pl-4">{app.lineage}</p>

      {app.evidence && (
        <div className="mt-4">
          <p className="text-sm uppercase tracking-[0.15em] text-ink-soft">Records given</p>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm [&_a]:text-claret">
            {app.evidence.split(/(https?:\/\/\S+)/g).map((part, i) =>
              /^https?:\/\//.test(part) ? (
                <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline">
                  {part}
                </a>
              ) : (
                part
              ),
            )}
          </p>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {files.map((f) => (
            <button
              key={f.id}
              onClick={() => act(() => openApplicationFile(app.id, f))}
              disabled={busy}
              className="border border-buff px-3 py-1 text-sm text-continental hover:border-claret"
            >
              📎 {f.name} <span className="text-ink-soft">({Math.max(1, Math.round(f.size / 1024))} KB)</span>
            </button>
          ))}
          {app.status !== "pending" && (
            <button onClick={deleteFiles} disabled={busy} className="text-sm italic text-claret underline">
              Delete documents
            </button>
          )}
        </div>
      )}

      {app.status === "pending" ? (
        <div className="mt-5 space-y-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Optional note to the applicant (shown to them if declined)"
            className={inputClass}
          />
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => decide(true)} disabled={busy}>
              Approve as Member
            </Button>
            <Button variant="danger" onClick={() => decide(false)} disabled={busy}>
              Decline
            </Button>
          </div>
        </div>
      ) : (
        app.reviewNote && <p className="mt-3 text-sm italic text-ink-soft">Note: {app.reviewNote}</p>
      )}
      {error && (
        <div className="mt-3">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
    </Panel>
  );
}

function TreeAdditions({ additions }: { additions: TreeDoc[] }) {
  const { user } = useAuth();
  const [error, setError] = useState("");
  const names = useMemo(() => indexNames(patriarch, additions), [additions]);
  const sorted = [...additions].sort((a, b) => (a.createdAt?.toMillis() ?? 0) - (b.createdAt?.toMillis() ?? 0));

  async function act(fn: () => Promise<unknown>) {
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(friendlyError(err));
    }
  }

  if (sorted.length === 0) return <Notice>Every tree addition has been reviewed.</Notice>;

  return (
    <div className="space-y-4">
      {error && <Notice tone="error">{error}</Notice>}
      {sorted.map((p) => (
        <Panel key={p.id} className="!p-5">
          <p className="font-display text-xl text-continental">
            {p.name}
            {p.living && <span className="ml-2 text-xs uppercase tracking-[0.15em] text-claret">living</span>}
          </p>
          <p className="text-sm text-ink-soft">
            Child of <strong className="font-normal text-continental">{names.get(p.parentId) ?? "(a person since removed)"}</strong>
            {" · "}added by {p.createdByName || "a member"} on {when(p.createdAt)}
          </p>
          <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            {[
              ["Born", [p.born, p.bornPlace].filter(Boolean).join(", ")],
              ["Died", [p.died, p.diedPlace].filter(Boolean).join(", ")],
              ["Spouse", p.spouse],
              ["Source", p.source],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="inline text-ink-soft">{k}: </dt>
                  <dd className="inline">{v}</dd>
                </div>
              ))}
          </dl>
          {p.note && <p className="mt-2 text-sm text-ink-soft">{p.note}</p>}
          {!p.source && <p className="mt-2 text-sm italic text-claret">No source given.</p>}
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              onClick={() =>
                act(() => updateDoc(doc(db(), "people", p.id), { reviewed: true, reviewedBy: user?.uid ?? "", reviewedAt: serverTimestamp() }))
              }
            >
              Mark Reviewed
            </Button>
            <Button variant="danger" onClick={() => act(() => deleteDoc(doc(db(), "people", p.id)))}>
              Remove
            </Button>
          </div>
        </Panel>
      ))}
    </div>
  );
}

function Members({ users }: { users: UserRow[] }) {
  const { user } = useAuth();
  const [error, setError] = useState("");
  const order = { member: 0, pending: 1, rejected: 2 };
  const sorted = [...users].sort(
    (a, b) => order[a.status] - order[b.status] || a.displayName.localeCompare(b.displayName),
  );

  async function setRole(u: UserRow, role: "admin" | "member") {
    setError("");
    try {
      await updateDoc(doc(db(), "users", u.id), { role });
    } catch (err) {
      setError(friendlyError(err));
    }
  }

  return (
    <div>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left">
          <thead>
            <tr className="border-b-2 border-buff text-xs uppercase tracking-[0.15em] text-ink-soft">
              <th className="py-2 pr-4 font-normal">Name</th>
              <th className="py-2 pr-4 font-normal">Email</th>
              <th className="py-2 pr-4 font-normal">Status</th>
              <th className="py-2 font-normal">Role</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((u) => (
              <tr key={u.id} className="border-b border-buff/50">
                <td className="py-3 pr-4 font-display text-continental">{u.displayName || "(no name)"}</td>
                <td className="py-3 pr-4 text-sm text-ink-soft">{u.email}</td>
                <td className="py-3 pr-4 text-sm">{u.status}</td>
                <td className="py-3 text-sm">
                  {u.role === "admin" ? "Admin" : "Member"}
                  {u.status === "member" && u.id !== user?.uid && (
                    <button
                      onClick={() => setRole(u, u.role === "admin" ? "member" : "admin")}
                      className="ml-3 italic text-claret underline"
                    >
                      {u.role === "admin" ? "Remove admin" : "Make admin"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
