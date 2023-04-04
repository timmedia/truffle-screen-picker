import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { verify } from "jsonwebtoken";
import { uuid } from "uuidv4";
import { initializeApp } from "firebase-admin/app";
import { request, gql } from "graphql-request";

initializeApp();
const db = admin.database();
const firestore = admin.firestore();

const MYCELIUM_PUBLIC_ES256_KEY =
  "-----BEGIN PUBLIC KEY-----\n" +
  "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEGzVELuVubW1DcXJPZ7cHssy4SXc0\n" +
  "d6inNpg1L8Lwo/YqSnNQwW+nJTQOm9q+ZAfJUjOgHpfMpyNYVOzaWunz2Q==\n" +
  "-----END PUBLIC KEY-----";

export interface StoredSetup {
  currentPollId: string | null;
  previousPollIds: string[];
}

export interface SubmitVoteData {
  relX: number;
  relY: number;
  accessToken: string;
  userId: string;
  pollId: string;
  orgId: string;
}

export interface CreatePollData {
  accessToken: string;
  userId: string;
  orgId: string;
}

export interface StopCurrentPollData {
  accessToken: string;
  userId: string;
  orgId: string;
}

/**
 * Checks whether user id matches provided access token.
 * @param {string} accessToken
 * @param {string} userId
 * @return {boolean}
 */
function verifyUserId(accessToken: string, userId: string) {
  try {
    const payload = verify(accessToken, MYCELIUM_PUBLIC_ES256_KEY, {
      algorithms: ["ES256"],
    });
    if (typeof payload === "string") return false;
    const { userId: actualUserId } = payload;
    return actualUserId === userId;
  } catch (error) {
    return false;
  }
}

/**
 * Checks whether user has the admin role for the specified org.
 * @param {string} accessToken
 * @param {string} orgId
 * @return {Promise<boolean>}
 */
async function verifyUserAdmin(accessToken: string, orgId: string) {
  const endpoint = "https://mycelium.staging.bio/graphql";
  const query = gql`
    query RoleConnectionQuery(
      $input: RoleConnectionInput
      $first: Int
      $after: String
      $last: Int
      $before: String
    ) {
      roleConnection(
        input: $input
        first: $first
        after: $after
        last: $last
        before: $before
      ) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          id
          orgId
          name
          slug
          rank
          isSuperAdmin
        }
      }
    }
  `;
  const data = (await request({
    url: endpoint,
    document: query,
    variables: { input: { orgId } },
    requestHeaders: { "x-access-token": accessToken },
  })) as any;
  return data.roleConnection.nodes.some(
    (node: any) => node.name === "Admin" && node.orgId === orgId
  );
}

export const submitVote = functions.https.onCall(
  async (data: SubmitVoteData) => {
    const { accessToken, userId, relX, relY, pollId } = data;
    const isAllowed = verifyUserId(accessToken, userId);
    if (!isAllowed) {
      return {
        success: false,
        error: new Error("Access token does not match user id."),
      };
    }
    await db.ref(`polls/${pollId}/${userId}`).set([relX, relY]);
    return { success: true };
  }
);

export const createPoll = functions.https.onCall(
  async (data: CreatePollData) => {
    const { accessToken, userId, orgId } = data;
    const isAllowed = verifyUserId(accessToken, userId);
    if (!isAllowed) {
      return {
        success: false,
        error: new Error("Access token does not match user id."),
      };
    }
    const isAdmin = await verifyUserAdmin(accessToken, orgId);
    if (!isAdmin) {
      return { success: false, error: new Error("User must be an admin.") };
    }
    const currentPollId = uuid();
    await Promise.all([
      db.ref(`polls/${currentPollId}`).set([]),
      firestore.collection("admin").doc(orgId).update({ currentPollId }),
    ]);
    return { success: true, currentPollId };
  }
);

export const stopCurrentPoll = functions.https.onCall(
  async (data: StopCurrentPollData) => {
    const { accessToken, userId, orgId } = data;
    const isAllowed = verifyUserId(accessToken, userId);
    if (!isAllowed) {
      return {
        success: false,
        error: new Error("Access token does not match user id."),
      };
    }
    const isAdmin = await verifyUserAdmin(accessToken, orgId);
    if (!isAdmin) {
      return { success: false, error: new Error("User must be an admin.") };
    }
    const snapshot = await firestore.collection("admin").doc(orgId).get();
    const { currentPollId } = snapshot.data() as StoredSetup;
    await firestore
      .collection("admin")
      .doc(orgId)
      .update({
        currentPollId: null,
        previousPollIds: admin.firestore.FieldValue.arrayUnion(currentPollId),
      });
    return { success: true };
  }
);

export const latestPollResults = functions.https.onRequest(
  async (request, response) => {
    const orgId = request.query?.orgId;
    if (typeof orgId !== "string") response.redirect("/404.html");
    const snapshot = await firestore
      .collection("admin")
      .doc(orgId as string)
      .get();
    if (!snapshot.exists) response.redirect("/404.html");
    const setup = snapshot.data() as StoredSetup;
    if (typeof setup.currentPollId === "string") {
      response.redirect(`/pollResults?pollId=${setup.currentPollId}`);
    } else if (setup.previousPollIds?.length > 0) {
      response.redirect(
        `/pollResults?pollId=${
          setup.previousPollIds[setup.previousPollIds.length - 1]
        }`
      );
    } else {
      response.redirect("/404.html");
    }
  }
);
