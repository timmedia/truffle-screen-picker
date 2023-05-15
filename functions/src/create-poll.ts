import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { verifyAccessToken, verifyUserRole } from "./utils";
import { firestore } from "./admin";
import { PollLayout } from "./schemas";

const CreatePollData = z.object({
  accessToken: z.string(),
  layout: PollLayout.nullable(),
});

export default functions.https.onCall(async (data) => {
  try {
    const { accessToken, layout } = CreatePollData.parse(data);
    const { orgId, userId } = verifyAccessToken(accessToken);
    const isAdmin = await verifyUserRole(accessToken, "Admin");
    if (!isAdmin) throw new Error("User must be admin of org.");
    const pollId = uuidv4();
    // store poll layout embedded in poll doc such that result visualization
    // can still be accessed even should the poll layout document be deleted
    await Promise.all([
      firestore
        .collection("orgs")
        .doc(orgId)
        .collection("polls")
        .doc(pollId)
        .set({
          layout,
          authorId: userId,
          startedAt: admin.firestore.FieldValue.serverTimestamp(),
          stoppedAt: null,
        }),
      firestore
        .collection("orgs")
        .doc(orgId)
        .set({ pollId, layout }, { merge: true }),
    ]);
    functions.logger.info(`New Poll ${pollId}`);
    return { success: true, pollId };
  } catch (error) {
    functions.logger.error(error);
    return { success: false, error };
  }
});
