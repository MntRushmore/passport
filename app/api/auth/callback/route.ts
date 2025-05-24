// path: app/api/auth/callback/route.ts
import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  console.log("[/api/auth/callback] GET request received:", request.url);
  const supabase = createRouteHandlerClient({ cookies })
  const reqUrl = new URL(request.url)
  const origin = reqUrl.origin
  const error = reqUrl.searchParams.get("error")
  const error_description = reqUrl.searchParams.get("error_description")
  console.log("[/api/auth/callback] Parsed callback params → origin:", origin, "error:", error, "error_description:", error_description);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${error}&error_description=${error_description}`
    )
  }

  console.log("[/api/auth/callback] Exchanging code for session...");
  const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(request)
  console.log("[/api/auth/callback] exchangeCodeForSession result →", { data, sessionError });
  if (sessionError) {
    console.error("OAuth callback failed:", sessionError)
    return NextResponse.redirect(`${origin}/login?error=callback_failed`)
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}