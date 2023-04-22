import * as functions from "firebase-functions";
import { z } from "zod";
import { verifyAccessToken, verifyUserRole } from "./utils";
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
      .collection("admin")
      .doc(orgId)
      .collection("layouts")
      .doc(layoutId)
      .delete();
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, error };
  }
});
