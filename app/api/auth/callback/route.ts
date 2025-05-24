// app/api/auth/signin/route.ts
import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  // Initialize Supabase client with cookie-based handler
  const supabase = createRouteHandlerClient({ cookies })

  // Start Slack OIDC login; this sets the PKCE code_verifier in a cookie
  const { data, error } = await supabase.auth.signInWithOpenIDConnect({
    provider: "slack_oidc",
    options: {
      redirectTo: `${new URL(request.url).origin}/api/auth/callback`,
    },
  })

  if (error) {
    console.error("OIDC sign-in error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Redirect browser to Slack's login page (data.url)
  return NextResponse.redirect(data.url)
}