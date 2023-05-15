import { initializeApp } from "firebase/app";
import {
  DocumentData,
  collection,
  doc,
  getFirestore,
  onSnapshot,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import type {
  CreatePollData,
  StopPollData,
  SavePollLayoutData,
  DeletePollLayoutData,
} from "./schemas";

const app = initializeApp({
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
});

const firestore = getFirestore(app);
const functions = getFunctions(app);

export const hostingBaseURL = `https://${
  import.meta.env.VITE_FIREBASE_PROJECT_ID
}.firebaseapp.com`;

export async function createPoll(data: CreatePollData) {
  const func = httpsCallable<
    CreatePollData,
    { success: boolean; pollId?: string; error?: Error }
  >(functions, "screenPoll-createPoll");
  const result = await func(data);
  return result.data;
}

export async function stopCurrentPoll(accessToken: string) {
  const func = httpsCallable<StopPollData, { success: boolean; error?: Error }>(
    functions,
    "screenPoll-stopCurrentPoll"
  );
  const result = await func({ accessToken });
  return result.data;
}

export function savePollLayout(data: SavePollLayoutData) {
  const func = httpsCallable<
    SavePollLayoutData,
    { success: boolean; error?: Error }
  >(functions, "screenPoll-savePollLayout");
  return func(data);
}

export async function deletePollLayout(data: DeletePollLayoutData) {
  const func = httpsCallable<
    DeletePollLayoutData,
    { success: boolean; error?: Error }
  >(functions, "screenPoll-deletePollLayout");
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

// listen to changes of all document in collection
export const onCollSnapshot = (
  collectionPath: string,
  callback: (data: DocumentData[]) => void
) => {
  const ref = collection(firestore, collectionPath);
  return onSnapshot(ref, (data) => {
    callback(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  });
};
