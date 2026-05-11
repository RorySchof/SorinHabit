import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import "@supabase/functions-js/edge-runtime.d.ts"

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const { userId } = await req.json()

    const { error } = await supabase.auth.admin.deleteUser(userId)
    if (error) throw error

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }
})

