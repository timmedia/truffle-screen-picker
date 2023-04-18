import * as functions from "firebase-functions";
import { firestore } from "./admin";
import { StoredSetupSchema } from "./schemas";
import { z } from "zod";

export default functions.https.onRequest(async (request, response) => {
  const orgId = request.query?.orgId;
  if (typeof orgId !== "string") return response.redirect("/404.html");
  const snapshot = await firestore.collection("admin").doc(orgId).get();
  if (!snapshot.exists) return response.redirect("/404.html");
  const { pollId, previousPollId } = snapshot.data() as z.infer<
    typeof StoredSetupSchema
  >;
  let queryString = Object.entries(request.query)
    .filter(([key]) => key !== "orgId")
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`
    )
    .join("&");
  queryString = queryString.length > 0 ? `&${queryString}` : "";
  if (typeof pollId === "string") {
    return response.redirect(`/pollResults?pollId=${pollId}${queryString}`);
  } else if (previousPollId?.length > 0) {
    return response.redirect(
      `/pollResults?pollId=${previousPollId.at(-1)}${queryString}`
    );
  } else {
    return response.redirect("/404.html");
  }
});
