import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { verifyAccessToken, verifyUserRole as verifyRole } from "./utils";
import { z } from "zod";

const StoredSetupSchema = z.object({
  pollId: z.string().uuid().nullable(),
  previousPollId: z.array(z.string().uuid()),
});

initializeApp();
const db = admin.database();
const firestore = admin.firestore();

const SubmitVoteData = z.object({
  accessToken: z.string(),
  pollId: z.string().uuid(),
  x: z.number().lte(1).gte(0),
  y: z.number().lte(1).gte(0),
});

export const submitVote = functions.https.onCall(async (data) => {
  try {
    const { accessToken, pollId, x, y } = SubmitVoteData.parse(data);
    const { userId } = verifyAccessToken(accessToken);
    await db.ref(`polls/${pollId}/${userId}`).set([x, y]);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
});

const CreatePollData = z.object({
  accessToken: z.string(),
});

export const createPoll = functions.https.onCall(async (data) => {
  try {
    const { accessToken } = CreatePollData.parse(data);
    const { orgId } = verifyAccessToken(accessToken);
    const isAdmin = await verifyRole(accessToken, "Admin");
    if (!isAdmin) throw new Error("User must be admin of org.");
    const pollId = crypto.randomUUID();
    await firestore.collection("admin").doc(orgId).update({ pollId });
    return { success: true, pollId };
  } catch (error) {
    console.log(error);
    return { success: false, error };
  }
});

const StopPollData = z.object({
  accessToken: z.string(),
  orgId: z.string().uuid(),
});

export const stopCurrentPoll = functions.https.onCall(async (data) => {
  try {
    const { accessToken, orgId } = StopPollData.parse(data);
    const isAdmin = await verifyRole(accessToken, "Admin");
    if (!isAdmin) throw new Error("User must be admin of org.");
    const snapshot = await firestore.collection("admin").doc(orgId).get();
    const { pollId } = StoredSetupSchema.parse(snapshot.data());
    if (pollId === null) throw new Error("Specified org has no active poll.");
    await firestore
      .collection("admin")
      .doc(orgId)
      .update({
        pollId: null,
        previousPollId: admin.firestore.FieldValue.arrayUnion(pollId),
      });
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, error };
  }
});

export const latestPollResults = functions.https.onRequest(
  async (request, response) => {
    const orgId = request.query?.orgId;
    if (typeof orgId !== "string") return response.redirect("/404.html");
    const snapshot = await firestore.collection("admin").doc(orgId).get();
    if (!snapshot.exists) return response.redirect("/404.html");
    const { pollId, previousPollId } = StoredSetupSchema.parse(snapshot.data());
    let queryString = Object.entries(request.query)
      .filter(([key]) => key !== "orgId")
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`
      )
      .join("&");
    queryString = queryString.length > 0 ? `&${queryString}` : "";
    if (typeof pollId === "string") {
      return response.redirect(`/pollResults?pollId=${pollId}${queryString}`);
    } else if (previousPollId?.length > 0) {
      return response.redirect(
        `/pollResults?pollId=${previousPollId.at(-1)}${queryString}`
      );
    } else {
      return response.redirect("/404.html");
    }
  }
);
