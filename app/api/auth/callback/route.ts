// path: app/api/auth/callback/route.ts
import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const reqUrl = new URL(request.url)
  const origin = reqUrl.origin
  const error = reqUrl.searchParams.get("error")
  const error_description = reqUrl.searchParams.get("error_description")

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${error}&error_description=${error_description}`
    )
  }

  // Handle OAuth callback and store session
  const { data, error: sessionError } = await supabase.auth.getSessionFromUrl({ storeSession: true })
  if (sessionError) {
    console.error("OAuth callback failed:", sessionError)
    return NextResponse.redirect(`${origin}/login?error=callback_failed`)
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}