import * as functions from "firebase-functions";
import { z } from "zod";
import { stringifyError, verifyAccessToken, verifyUserRole } from "./utils";
import { firestore } from "./admin";

const DeletePollLayoutData = z.object({
  accessToken: z.string(),
  layoutId: z.string().uuid(),
});

export default functions.https.onCall(async (data) => {
  try {
    const { accessToken, layoutId } = DeletePollLayoutData.parse(data);
    const { orgId } = verifyAccessToken(accessToken);
    const isAdmin = await verifyUserRole(accessToken, "Admin");
    if (!isAdmin) throw new Error("User must be admin of org.");
    await firestore
      .collection("orgs")
      .doc(orgId)
      .collection("layouts")
      .doc(layoutId)
      .delete();
    functions.logger.info(`Deleted Layout ${layoutId}`);
    return { success: true };
  } catch (error) {
    functions.logger.error(error);
    return { success: false, error: stringifyError(error) };
  }
});
