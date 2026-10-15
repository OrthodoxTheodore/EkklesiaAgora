import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  signInWithPopup,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// Every account starts as a pending, non-admin profile. The security rules
// refuse any other starting values, so only an admin can grant membership.
export async function ensureProfile(user: User, displayName?: string) {
  const ref = doc(db(), "users", user.uid);
  if ((await getDoc(ref)).exists()) return;
  await setDoc(ref, {
    displayName: displayName || user.displayName || "",
    email: user.email ?? "",
    status: "pending",
    role: "member",
    createdAt: serverTimestamp(),
  });
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  const { user } = await createUserWithEmailAndPassword(auth(), email, password);
  await updateProfile(user, { displayName: name });
  await ensureProfile(user, name);
  await sendEmailVerification(user).catch(() => {});
}

export async function signInWithGoogle() {
  const { user } = await signInWithPopup(auth(), new GoogleAuthProvider());
  await ensureProfile(user);
}

// Turns Firebase's error codes into plain sentences.
export function friendlyError(err: unknown) {
  const code = (err as { code?: string })?.code ?? "";
  const messages: Record<string, string> = {
    "auth/email-already-in-use": "An account with that email already exists. Try signing in instead.",
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/weak-password": "Please choose a password of at least 8 characters.",
    "auth/invalid-credential": "That email and password don't match our records.",
    "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
    "auth/popup-closed-by-user": "The Google sign-in window was closed before finishing.",
    "permission-denied": "You don't have permission to do that.",
  };
  return messages[code] ?? "Something went wrong. Please try again.";
}
