import { initializeApp } from "firebase/app";
import {
  DocumentData,
  collection,
  doc,
  getFirestore,
  onSnapshot,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { SubmitVoteData } from "./schemas";

const app = initializeApp({
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
});
const firestore = getFirestore(app);
const functions = getFunctions(app);

export async function submitVote(data: SubmitVoteData) {
  const func = httpsCallable<
    SubmitVoteData,
    { success: boolean; error?: Error }
  >(functions, "screenPoll-submitVote");
  const result = await func(data);
  return result.data;
}

// listen to changes in document
export const onDocSnapshot = (
  collectionPath: string,
  documentName: string,
  callback: (data: DocumentData) => void
) => {
  const ref = doc(collection(firestore, collectionPath), documentName);
  return onSnapshot(ref, (doc) => {
    if (doc.exists()) callback(doc.data());
  });
};
