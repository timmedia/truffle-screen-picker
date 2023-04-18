import * as functions from "firebase-functions";
import { z } from "zod";
import { verifyAccessToken } from "./utils";
import { db } from "./admin";

const SubmitVoteData = z.object({
  accessToken: z.string(),
  pollId: z.string().uuid(),
  x: z.number().lte(1).gte(0),
  y: z.number().lte(1).gte(0),
});

export default functions.https.onCall(async (data) => {
  try {
    const { accessToken, pollId, x, y } = SubmitVoteData.parse(data);
    const { userId } = verifyAccessToken(accessToken);
    await db.ref(`polls/${pollId}/${userId}`).set([x, y]);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
});
