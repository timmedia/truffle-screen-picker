import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as postgres from "https://deno.land/x/postgres@v0.14.2/mod.ts";
import { getAccessToken, getOrgId, verifyUserAdmin } from "../utils.ts";

const databaseUrl = Deno.env.get("SUPABASE_DB_URL")!;
const pool = new postgres.Pool(databaseUrl, 3, true);

serve(async (request) => {
  let connection: postgres.PoolClient | null = null;

  try {
    const accessToken = getAccessToken(request);
    const orgId = getOrgId(request);
    const isAdmin = await verifyUserAdmin(accessToken, orgId);
    if (!isAdmin) throw Error("User must be admin of org to create poll.");

    connection = await pool.connect();
    await connection.queryObject(`update "public"."Poll" 
                                  set ended_at=now() 
                                  where org_id='${orgId}' and ended_at is null`);

    return new Response(
      JSON.stringify({ success: true }),
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
