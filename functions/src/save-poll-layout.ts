import * as functions from "firebase-functions";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { verifyAccessToken, verifyUserRole } from "./utils";
import { firestore } from "./admin";

const SavePollLayoutData = z.object({
  accessToken: z.string(),
  name: z.string(),
  areas: z
    .array(
      z.object({
        x: z.number().gte(0).lte(1),
        y: z.number().gte(0).lte(1),
        width: z.number().gte(0).lte(1),
        height: z.number().gte(0).lte(1),
      })
    )
    .min(1),
});

export default functions.https.onCall(async (data) => {
  try {
    const { accessToken, areas, name } = SavePollLayoutData.parse(data);
    const { orgId } = verifyAccessToken(accessToken);
    const isAdmin = await verifyUserRole(accessToken, "Admin");
    if (!isAdmin) throw new Error("User must be admin of org.");
    const layoutId = uuidv4();
    await firestore
      .collection("admin")
      .doc(orgId)
      .collection("layouts")
      .doc(layoutId)
      .set({ areas, name });
    return { success: true, layoutId };
  } catch (error) {
    console.log(error);
    return { success: false, error };
  }
});
