import { z } from "https://deno.land/x/zod@v3.16.1/mod.ts";
import * as jose from "https://npm.tfl.dev/jose-browser-runtime@4.13.1";

const MYCELIUM_PUBLIC_ES256_KEY = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEGzVELuVubW1DcXJPZ7cHssy4SXc0
d6inNpg1L8Lwo/YqSnNQwW+nJTQOm9q+ZAfJUjOgHpfMpyNYVOzaWunz2Q==
-----END PUBLIC KEY-----`;

// const MYCELIUM_API_URL = "https://mycelium.truffle.vip/graphql";
const MYCELIUM_API_URL = "https://mycelium.staging.bio/graphql";

const accessTokenPayloadSchema = z.object({
  userId: z.string().uuid(),
});

const roleConnectionResponseSchema = z.object({
  data: z.object({
    roleConnection: z.object({
      nodes: z.array(z.object({
        orgId: z.string().uuid(),
        name: z.string(),
      })),
    }),
  }),
});

/* Checks whether user has the admin role for the specified org. */
export async function verifyUserAdmin(accessToken: string, orgId: string) {
  const query = `
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
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          orgId
          name
        }
      }
    }
  `;

  const response = await fetch(MYCELIUM_API_URL, {
    method: "POST",
    body: JSON.stringify({ query, variables: { input: { orgId } } }),
    headers: {
      "Content-Type": "application/json",
      "x-org-id": orgId,
      "x-access-token": accessToken,
    },
  });

  const { data } = roleConnectionResponseSchema.parse(await response.json());
  return data.roleConnection.nodes.some(
    (node) => node.name === "Admin" && node.orgId === orgId,
  );
}

/* Checks whether user has the admin role for the specified org. */
export async function verifyAccessToken(accessToken: string) {
  const publicKey = await jose.importSPKI(MYCELIUM_PUBLIC_ES256_KEY, "ES256");
  const { payload } = await jose.jwtVerify(accessToken, publicKey);
  return accessTokenPayloadSchema.parse(payload);
}

/* Get access token from request header. */
export function getAccessToken(request: Request) {
  return z.string().parse(request.headers.get("x-access-token"));
}

/* Get access org id from request header. */
export function getOrgId(request: Request) {
  return z.string().uuid().parse(request.headers.get("x-org-id"));
}
