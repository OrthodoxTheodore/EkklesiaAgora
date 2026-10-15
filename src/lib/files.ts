import {
  Bytes,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

// Firebase's free plan has no file storage, so documents are kept in
// Firestore itself: each file is split into chunks small enough for one
// document (the limit is 1 MiB). Layout:
//   applications/{uid}/files/{fileId}            name, type, size, chunkCount
//   applications/{uid}/files/{fileId}/chunks/{n} data (bytes)

export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
const CHUNK_BYTES = 700 * 1024;
const MAX_IMAGE_EDGE = 2000;

export type StoredFile = { id: string; name: string; type: string; size: number; chunkCount: number };

const filesOf = (uid: string) => collection(db(), "applications", uid, "files");

// Phone photos are often 5–10 MB; shrinking them to a readable 2000px JPEG
// keeps them well inside the free database allowance.
async function shrinkImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.size < 900 * 1024) return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.85));
  return blob && blob.size < file.size ? blob : file;
}

export async function uploadApplicationFile(uid: string, file: File) {
  const blob = await shrinkImage(file);
  if (blob.size > MAX_FILE_BYTES) throw new Error(`"${file.name}" is larger than 5 MB.`);
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const chunkCount = Math.max(1, Math.ceil(bytes.length / CHUNK_BYTES));
  const fileRef = doc(filesOf(uid));
  const type = blob === file ? file.type : "image/jpeg";
  const name = blob === file ? file.name : file.name.replace(/\.\w+$/, "") + ".jpg";

  // One chunk per batch keeps every write request under Firestore's size limit.
  for (let n = 0; n < chunkCount; n++) {
    const batch = writeBatch(db());
    batch.set(doc(fileRef, "chunks", String(n)), {
      data: Bytes.fromUint8Array(bytes.subarray(n * CHUNK_BYTES, (n + 1) * CHUNK_BYTES)),
    });
    await batch.commit();
  }
  // The file record is written last, so it only appears once every chunk is in.
  const batch = writeBatch(db());
  batch.set(fileRef, { name, type, size: bytes.length, chunkCount, uploadedAt: serverTimestamp() });
  await batch.commit();
}

export async function listApplicationFiles(uid: string): Promise<StoredFile[]> {
  const snap = await getDocs(query(filesOf(uid), orderBy("uploadedAt")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StoredFile, "id">) }));
}

export async function openApplicationFile(uid: string, file: StoredFile) {
  // Open the tab first, while the click still counts as a user action, so
  // popup blockers allow it; fill it once the file is assembled.
  const win = window.open("", "_blank");
  const snap = await getDocs(query(collection(doc(filesOf(uid), file.id), "chunks")));
  const parts = snap.docs
    .sort((a, b) => Number(a.id) - Number(b.id))
    .map((d) => (d.data().data as Bytes).toUint8Array());
  const url = URL.createObjectURL(new Blob(parts as BlobPart[], { type: file.type }));
  if (win) win.location.href = url;
  else window.location.href = url;
}

export async function deleteApplicationFiles(uid: string) {
  const files = await getDocs(filesOf(uid));
  for (const f of files.docs) {
    const chunks = await getDocs(collection(f.ref, "chunks"));
    const batch = writeBatch(db());
    chunks.docs.forEach((c) => batch.delete(c.ref));
    batch.delete(f.ref);
    await batch.commit();
  }
}
