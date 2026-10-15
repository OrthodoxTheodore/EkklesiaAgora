import type { Person } from "@/data/family";
import type { TreePerson } from "./types";

export type TreeDoc = TreePerson & { id: string };

function lifespan(p: TreeDoc) {
  if (p.living) return p.born ? `b. ${p.born}` : "living";
  if (!p.born && !p.died) return "";
  return `${p.born || "?"} – ${p.died || "?"}`;
}

export function docToPerson(d: TreeDoc): Person {
  return {
    id: d.id,
    name: d.name,
    dates: lifespan(d),
    bornPlace: d.bornPlace || undefined,
    diedPlace: d.diedPlace || undefined,
    spouse: d.spouse || undefined,
    note: d.note || undefined,
    contributedSource: d.source || undefined,
    unreviewed: !d.reviewed,
    addedBy: d.createdByName || undefined,
  };
}

// Hangs member-added people under their parents, whether the parent is part
// of the curated tree in src/data/family.ts or was itself added by a member.
export function mergeTree(root: Person, docs: TreeDoc[]): Person {
  const byParent = new Map<string, TreeDoc[]>();
  for (const d of docs) {
    const list = byParent.get(d.parentId) ?? [];
    list.push(d);
    byParent.set(d.parentId, list);
  }
  const attach = (p: Person, depth: number): Person => {
    if (depth > 60) return p; // guards against a bad parentId loop
    const added = (byParent.get(p.id) ?? [])
      .sort((a, b) => (a.born || "9999").localeCompare(b.born || "9999"))
      .map(docToPerson);
    return { ...p, children: [...(p.children ?? []), ...added].map((c) => attach(c, depth + 1)) };
  };
  return attach(root, 0);
}

export function indexNames(root: Person, docs: TreeDoc[] = []) {
  const names = new Map<string, string>();
  const walk = (p: Person) => {
    names.set(p.id, p.name);
    p.children?.forEach(walk);
  };
  walk(root);
  docs.forEach((d) => names.set(d.id, d.name));
  return names;
}
