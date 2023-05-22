import * as functions from "firebase-functions";
import { z } from "zod";
import { stringifyError, verifyAccessToken, verifyUserRole } from "./utils";
import { firestore, db } from "./admin";

const DeletePollsData = z.object({
  accessToken: z.string(),
  ids: z.array(z.string().uuid()),
});

export default functions.https.onCall(async (data) => {
  try {
    const { accessToken, ids } = DeletePollsData.parse(data);
    const { orgId } = verifyAccessToken(accessToken);
    const isAdmin = await verifyUserRole(accessToken, "Admin");
    if (!isAdmin) throw new Error("User must be admin of org.");
    await Promise.all(
      ids.flatMap((id) => [
        firestore
          .collection("orgs")
          .doc(orgId)
          .collection("polls")
          .doc(id)
          .delete(),
        db.ref(`polls/${id}`).remove(),
      ])
    );
    functions.logger.info(`Deleted polls ${ids.join(", ")}`);
    return { success: true };
  } catch (error) {
    functions.logger.error(error);
    return { success: false, error: stringifyError(error) };
  }
});
