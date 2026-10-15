import type { Timestamp } from "firebase/firestore";

export type MemberStatus = "pending" | "member" | "rejected";

// users/{uid}
export type Profile = {
  displayName: string;
  email: string;
  status: MemberStatus;
  role: "member" | "admin";
  createdAt: Timestamp | null;
};

// applications/{uid}
export type Application = {
  name: string;
  email: string;
  location: string;
  connection: string;
  lineage: string;
  files: { name: string; path: string }[];
  status: "pending" | "approved" | "rejected";
  submittedAt: Timestamp | null;
  reviewedBy?: string;
  reviewedAt?: Timestamp | null;
  reviewNote?: string;
};

// people/{id}: people added to the tree by members. parentId points either
// at a person in src/data/family.ts (e.g. "joseph-1738") or at another doc here.
export type TreePerson = {
  parentId: string;
  name: string;
  born: string;
  died: string;
  bornPlace: string;
  diedPlace: string;
  spouse: string;
  note: string;
  source: string;
  living: boolean;
  reviewed: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: Timestamp | null;
};
