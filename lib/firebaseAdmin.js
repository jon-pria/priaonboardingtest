import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getApps } from "firebase-admin/app";
import serviceAccount from "./firebase-key.json"; // ✅ Ensure this file exists in `/lib/`

// ✅ Initialize Firebase Admin (only once)
if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = getFirestore();

export { db };
