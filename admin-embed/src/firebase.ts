import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const app = initializeApp({
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
});

export const firestore = getFirestore(app);
export const functions = getFunctions(app);
