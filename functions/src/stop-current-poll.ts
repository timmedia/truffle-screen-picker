import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { z } from "zod";
import { stringifyError, verifyAccessToken, verifyUserRole } from "./utils";
import { firestore } from "./admin";
import type { StoredSetupSchema } from "./schemas";

const StopPollData = z.object({
  accessToken: z.string(),
});

export default functions.https.onCall(async (data) => {
  try {
    const { accessToken } = StopPollData.parse(data);
    const { orgId } = verifyAccessToken(accessToken);
    const isAdmin = await verifyUserRole(accessToken, "Admin");
    if (!isAdmin) throw new Error("User must be admin of org.");
    const snapshot = await firestore.collection("orgs").doc(orgId).get();
    const { pollId } = snapshot.data() as StoredSetupSchema;
    if (pollId === null) throw new Error("Specified org has no active poll.");
    await Promise.all([
      firestore.collection("orgs").doc(orgId).update({
        pollId: null,
        layout: null,
      }),
      firestore
        .collection("orgs")
        .doc(orgId)
        .collection("polls")
        .doc(pollId)
        .update({ stoppedAt: admin.firestore.FieldValue.serverTimestamp() }),
    ]);
    functions.logger.info(`Stopped Poll ${pollId}`);
    return { success: true };
  } catch (error) {
    functions.logger.error(error);
    return { success: false, error: stringifyError(error) };
  }
});
