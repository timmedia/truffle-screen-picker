import * as functions from "firebase-functions";
import { z } from "zod";
import { verifyAccessToken, verifyUserRole } from "./utils";
import { firestore } from "./admin";
import { PollLayout } from "./schemas";

const SavePollLayoutData = PollLayout.extend({
  accessToken: z.string(),
  id: z.string().uuid(),
});

export default functions.https.onCall(async (data) => {
  try {
    const { accessToken, areas, name, id } = SavePollLayoutData.parse(data);
    const { orgId } = verifyAccessToken(accessToken);
    const isAdmin = await verifyUserRole(accessToken, "Admin");
    if (!isAdmin) throw new Error("User must be admin of org.");
    await firestore
      .collection("orgs")
      .doc(orgId)
      .collection("layouts")
      .doc(id)
      .set({ areas, name });
    functions.logger.info(`Saved Layout ${id}`);
    return { success: true };
  } catch (error) {
    functions.logger.error(error);
    return { success: false, error };
  }
});
