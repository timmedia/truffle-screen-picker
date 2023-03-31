import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { verify } from "jsonwebtoken";
import { uuid } from "uuidv4";
import { initializeApp } from "firebase-admin/app";
// import { type SubmitVoteData } from "../../models";

initializeApp();
const db = admin.database();
const firestore = admin.firestore();

const MYCELIUM_PUBLIC_ES256_KEY =
  "-----BEGIN PUBLIC KEY-----\n" +
  "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEGzVELuVubW1DcXJPZ7cHssy4SXc0\n" +
  "d6inNpg1L8Lwo/YqSnNQwW+nJTQOm9q+ZAfJUjOgHpfMpyNYVOzaWunz2Q==\n" +
  "-----END PUBLIC KEY-----";

export interface StoredSetup {
  currentPollId: string | null;
  previousPollIds: string[];
}

export interface SubmitVoteData {
  relX: number;
  relY: number;
  accessToken: string;
  userId: string;
  pollId: string;
  orgId: string;
}

export interface CreatePollData {
  accessToken: string;
  userId: string;
  orgId: string;
}

export interface StopCurrentPollData {
  accessToken: string;
  userId: string;
  orgId: string;
}

/**
 * Checks whether user id matches provided access token.
 * @param {string} accessToken
 * @param {string} userId
 * @return {boolean}
 */
function verifyUserId(accessToken: string, userId: string) {
  try {
    const payload = verify(accessToken, MYCELIUM_PUBLIC_ES256_KEY, {
      algorithms: ["ES256"],
    });
    if (typeof payload === "string") return false;
    const { userId: actualUserId } = payload;
    return actualUserId === userId;
  } catch (error) {
    return false;
  }
}

export const submitVote = functions.https.onCall(
  async (data: SubmitVoteData) => {
    const { accessToken, userId, relX, relY, pollId } = data;
    const isAllowed = verifyUserId(accessToken, userId);
    if (!isAllowed) return { success: false };
    await db.ref(`polls/${pollId}/${userId}`).set([relX, relY]);
    return { success: true };
  }
);

export const createPoll = functions.https.onCall(
  async (data: CreatePollData) => {
    const { accessToken, userId, orgId } = data;
    const isAllowed = verifyUserId(accessToken, userId);
    if (!isAllowed) return { success: false };
    // TODO: check whether user is authorized to create a poll
    // must somehow determine whether user is admin of channel of interest
    const currentPollId = uuid();
    await Promise.all([
      db.ref(`polls/${currentPollId}`).set([]),
      firestore.collection("admin").doc(orgId).update({ currentPollId }),
    ]);
    return { success: true, currentPollId };
  }
);

export const stopCurrentPoll = functions.https.onCall(
  async (data: StopCurrentPollData) => {
    const { accessToken, userId, orgId } = data;
    const isAllowed = verifyUserId(accessToken, userId);
    if (!isAllowed) return { success: false };
    const snapshot = await firestore.collection("admin").doc(orgId).get();
    const { currentPollId } = snapshot.data() as StoredSetup;
    await firestore
      .collection("admin")
      .doc(orgId)
      .update({
        currentPollId: null,
        previousPollIds: admin.firestore.FieldValue.arrayUnion(currentPollId),
      });
    return { success: true };
  }
);
