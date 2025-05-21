// path: app/api/auth/callback/route.ts
import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const url = new URL(request.url)
  const error = url.searchParams.get("error")
  const error_description = url.searchParams.get("error_description")

  if (error) {
    return NextResponse.redirect( //pushing again
      `/login?error=${error}&error_description=${error_description}`
    )
  }

  const code = url.searchParams.get("code")
  if (!code) {
    return NextResponse.redirect(`/login?error=missing_code`)
  }

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession({ code })
  if (exchangeError) {
    console.error("OAuth exchange failed:", exchangeError)
    return NextResponse.redirect(`/login?error=exchange_failed`)
  }

  // at this point cookies are set for the session
  return NextResponse.redirect("/dashboard")
}