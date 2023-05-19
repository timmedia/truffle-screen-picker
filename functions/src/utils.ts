import { verify } from "jsonwebtoken";
import { request, gql } from "graphql-request";
import { z } from "zod";
import { defineString } from "firebase-functions/params";

// from .env
const MYCELIUM_PUBLIC_ES256_KEY = defineString("MYCELIUM_PUBLIC_ES256_KEY");
const MYCELIUM_API_URL = defineString("VITE_MYCELIUM_API_URL");

const AccessTokenPayloadSchema = z.object({
  userId: z.string().uuid(),
  packageId: z.string().uuid(),
  // packageInstallId: z.string().uuid(),
  // orgUserId: z.string().uuid(),
  orgId: z.string().uuid(),
});

/* Checks whether user id matches provided access token. */
export function verifyAccessToken(accessToken: string) {
  const payload = verify(accessToken, MYCELIUM_PUBLIC_ES256_KEY.value(), {
    algorithms: ["ES256"],
  });
  return AccessTokenPayloadSchema.parse(payload);
}

const RoleConnectionResponseSchema = z.object({
  orgUser: z.object({
    roleConnection: z.object({
      nodes: z.array(
        z.object({
          id: z.string().uuid(),
          name: z.string(),
        })
      ),
    }),
  }),
});

/* Checks whether user has the admin role for the specified org. */
export async function verifyUserRole(accessToken: string, role: string) {
  const query = gql`
    query {
      orgUser {
        roleConnection {
          nodes {
            id
            name
          }
        }
      }
    }
  `;
  const data = RoleConnectionResponseSchema.parse(
    await request({
      url: MYCELIUM_API_URL.value(),
      document: query,
      requestHeaders: { "x-access-token": accessToken },
    })
  );
  return data.orgUser.roleConnection.nodes.some(({ name }) => name === role);
}

export function stringifyError(error: any) {
  if (error instanceof z.ZodError) {
    error = error.issues
      .map((issue) => `[${issue.path.join(", ")}] ${issue.message}`)
      .join("\n");
  } else if (error?.message) {
    error = error.message;
  }
  return typeof error === "string" ? error : JSON.stringify(error);
}
