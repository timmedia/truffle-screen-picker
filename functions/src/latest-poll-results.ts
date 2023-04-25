import * as functions from "firebase-functions";
import { firestore } from "./admin";
import type { StoredSetupSchema } from "./schemas";

export default functions.https.onRequest(async (request, response) => {
  const orgId = request.query?.orgId;
  if (typeof orgId !== "string") return response.redirect("/404.html");
  const snapshot = await firestore.collection("orgs").doc(orgId).get();
  if (!snapshot.exists) return response.redirect("/404.html");
  const { pollId } = snapshot.data() as StoredSetupSchema;
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
    // TODO: implement automatic redirection to latest poll

    // } else if (previousPollId?.length > 0) {
    //   return response.redirect(
    //     `/pollResults?pollId=${previousPollId.at(-1)}${queryString}`
    //   );
  } else {
    return response.redirect("/404.html");
  }
});
