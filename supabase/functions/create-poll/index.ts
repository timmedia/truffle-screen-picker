// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.16.1/mod.ts";
import * as jose from "https://npm.tfl.dev/jose-browser-runtime@4.13.1";
import * as postgres from "https://deno.land/x/postgres@v0.14.2/mod.ts";

const MYCELIUM_PUBLIC_ES256_KEY = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEGzVELuVubW1DcXJPZ7cHssy4SXc0
d6inNpg1L8Lwo/YqSnNQwW+nJTQOm9q+ZAfJUjOgHpfMpyNYVOzaWunz2Q==
-----END PUBLIC KEY-----`;

// const MYCELIUM_API_URL = "https://mycelium.truffle.vip/graphql";
const MYCELIUM_API_URL = "https://mycelium.staging.bio/graphql";

const databaseUrl = Deno.env.get('SUPABASE_DB_URL')!
const pool = new postgres.Pool(databaseUrl, 3, true)

const accessTokenPayloadSchema = z.object({
  userId: z.string().uuid(),
});

const roleConnectionResponseSchema = z.object({
  data: z.object({
    roleConnection: z.object({
      nodes: z.array(z.object({
        orgId: z.string().uuid(),
        name: z.string()
      })),
    }),
  }),
});

/**
 * Checks whether user has the admin role for the specified org.
 * @param {string} accessToken
 * @param {string} orgId
 * @return {Promise<boolean>}
 */
async function verifyUserAdmin(accessToken: string, orgId: string) {
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
      (node) => node.name === "Admin" && node.orgId === orgId
    );
}

serve(async (request) => {
  let connection: postgres.PoolClient | null = null;

  try {
    const accessToken = z.string().parse(request.headers.get("x-access-token"));
    const orgId = z.string().uuid().parse(request.headers.get("x-org-id"));
    const publicKey = await jose.importSPKI(MYCELIUM_PUBLIC_ES256_KEY, "ES256");
    const { payload } = await jose.jwtVerify(accessToken, publicKey);
    const { userId } = accessTokenPayloadSchema.parse(payload);

    const isAdmin = await verifyUserAdmin(accessToken, orgId);
    if (!isAdmin) throw Error("User must be admin of org to create poll.")

    const pollId = crypto.randomUUID()

    connection = await pool.connect();
    await connection.queryArray`insert into "public"."Poll" (id, org_id, author_id)
                                values (${pollId}, ${orgId}, ${userId})`
    return new Response(
      JSON.stringify({ success: true, pollId }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error(error);
    return new Response(String(error?.message ?? error), { status: 500 });
  } finally {
    connection?.release();
  }
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
