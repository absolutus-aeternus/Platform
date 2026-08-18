import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    // ─── Authentication check: require admin role ───
    const authHeader = req.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing or invalid authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const token = authHeader.replace("Bearer ", "")
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

    // Verify the caller is an admin using the service role client
    const authClient = createClient(supabaseUrl, supabaseKey)

    // Get user from token
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Check if user has admin role
    const { data: userData, error: roleError } = await authClient
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (roleError || !userData || !["ADMIN", "SUPER_ADMIN"].includes(userData.role)) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    }

    // ─── Execute SQL (admin only) ───
    const { sql } = await req.json()

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase.rpc("exec_sql", { sql })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ result: data }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
