import * as functions from "firebase-functions";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { verifyAccessToken, verifyUserRole } from "./utils";
import { firestore } from "./admin";

const CreatePollData = z.object({
  accessToken: z.string(),
});

export default functions.https.onCall(async (data) => {
  try {
    const { accessToken } = CreatePollData.parse(data);
    const { orgId } = verifyAccessToken(accessToken);
    const isAdmin = await verifyUserRole(accessToken, "Admin");
    if (!isAdmin) throw new Error("User must be admin of org.");
    const pollId = uuidv4();
    await firestore.collection("admin").doc(orgId).update({ pollId });
    return { success: true, pollId };
  } catch (error) {
    console.log(error);
    return { success: false, error };
  }
});
