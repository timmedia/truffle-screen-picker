// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.16.1/mod.ts";
import * as jose from "https://npm.tfl.dev/jose-browser-runtime";
import * as postgres from "https://deno.land/x/postgres@v0.14.2/mod.ts";

const MYCELIUM_PUBLIC_ES256_KEY = "-----BEGIN PUBLIC KEY-----\n" +
  "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEGzVELuVubW1DcXJPZ7cHssy4SXc0\n" +
  "d6inNpg1L8Lwo/YqSnNQwW+nJTQOm9q+ZAfJUjOgHpfMpyNYVOzaWunz2Q==\n" +
  "-----END PUBLIC KEY-----";

const databaseUrl = Deno.env.get('SUPABASE_DB_URL')!

// Create a database pool with three connections that are lazily established
const pool = new postgres.Pool(databaseUrl, 3, true)

const voteSchema = z.object({
  accessToken: z.string(),
  pollId: z.string().uuid(),
  x: z.number().gte(0).lte(1),
  y: z.number().gte(0).lte(1),
});

const accessTokenPayloadSchema = z.object({
  userId: z.string().uuid(),
})

serve(async (req) => {
  const request = await req.json();
  let connection: postgres.PoolClient | null = null;

  try {
    const { accessToken, pollId, x, y } = voteSchema.parse(request);
    const publicKey = await jose.importSPKI(MYCELIUM_PUBLIC_ES256_KEY, "ES256")
    const { payload } = await jose.jwtVerify(accessToken, publicKey)
    const { userId } = accessTokenPayloadSchema.parse(payload)

    connection = await pool.connect();
     await connection.queryObject`insert into "public"."Vote"(poll_id, user_id, x, y) values (${pollId}, ${userId}, ${x}, ${y})`
  } catch (err) {
    console.error(err);
    return new Response(String(err?.message ?? err), { status: 500 });
  } finally {
    connection?.release()
  }
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { "Content-Type": "application/json" } },
  );
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
