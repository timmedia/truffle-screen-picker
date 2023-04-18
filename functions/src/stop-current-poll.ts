import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { z } from "zod";
import { verifyAccessToken, verifyUserRole } from "./utils";
import { firestore } from "./admin";
import { StoredSetupSchema } from "./schemas";

const StopPollData = z.object({
  accessToken: z.string(),
});

export default functions.https.onCall(async (data) => {
  try {
    const { accessToken } = StopPollData.parse(data);
    const { orgId } = verifyAccessToken(accessToken);
    const isAdmin = await verifyUserRole(accessToken, "Admin");
    if (!isAdmin) throw new Error("User must be admin of org.");
    const snapshot = await firestore.collection("admin").doc(orgId).get();
    const { pollId } = snapshot.data() as z.infer<typeof StoredSetupSchema>;
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
