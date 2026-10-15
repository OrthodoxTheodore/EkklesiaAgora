import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { firebaseConfig } from "./firebase-config";

// Until the config is filled in, membership features show a "coming soon"
// notice instead of failing.
export const firebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app: FirebaseApp | undefined;

function firebaseApp() {
  if (!firebaseReady) throw new Error("Firebase is not configured yet.");
  app ??= getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
}

export const auth = (): Auth => getAuth(firebaseApp());
export const db = (): Firestore => getFirestore(firebaseApp());
export const storage = (): FirebaseStorage => getStorage(firebaseApp());
