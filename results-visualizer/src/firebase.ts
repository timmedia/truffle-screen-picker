import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { getDatabase, onValue, ref } from "firebase/database";
import { SavedPoll } from "./schemas";

const app = initializeApp({
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
});

const firestore = getFirestore(app);
const db = getDatabase(app);

export function pollDataSubscription(
  pollId: string,
  callback: (data: [number, number][]) => void
) {
  const unsubscribe = onValue(ref(db, `polls/${pollId}`), (snapshot) => {
    if (!snapshot.exists()) return callback([]);
    const data = snapshot.val() as { [key: string]: [number, number] };
    callback(Object.values(data || []));
  });
  return { unsubscribe };
}

export async function getPollLayout(pollId: string, orgId: string) {
  const pollRef = doc(firestore, `/orgs/${orgId}/polls/${pollId}`);
  const pollSnapshot = await getDoc(pollRef);
  // TODO: inform user that poll does not exist
  if (!pollSnapshot.exists()) return null;
  const data = pollSnapshot.data() as SavedPoll;
  return data.layout;
}
