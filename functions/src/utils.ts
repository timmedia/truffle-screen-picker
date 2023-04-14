import { verify } from "jsonwebtoken";
import { request, gql } from "graphql-request";
import { z } from "zod";
import { MYCELIUM_API_URL, MYCELIUM_PUBLIC_ES256_KEY } from "./mycelium";

export const AccessTokenPayloadSchema = z.object({
  userId: z.string().uuid(),
  packageId: z.string().uuid(),
  packageInstallId: z.string().uuid(),
  orgUserId: z.string().uuid(),
  orgId: z.string().uuid(),
});

/* Checks whether user id matches provided access token. */
export function verifyAccessToken(accessToken: string) {
  const payload = verify(accessToken, MYCELIUM_PUBLIC_ES256_KEY, {
    algorithms: ["ES256"],
  });
  return AccessTokenPayloadSchema.parse(payload);
}

export const RoleConnectionResponseSchema = z.object({
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
      url: MYCELIUM_API_URL,
      document: query,
      requestHeaders: { "x-access-token": accessToken },
    })
  );
  return data.orgUser.roleConnection.nodes.some(({ name }) => name === role);
}
