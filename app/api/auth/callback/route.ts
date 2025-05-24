// app/api/auth/callback/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // Initialize Supabase client with cookie-based handler
  const supabase = createRouteHandlerClient({ cookies })

  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 })
  }

  // Exchange the code for session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error("OAuth callback failed:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Redirect to dashboard after successful login
  return NextResponse.redirect(`${new URL(request.url).origin}/dashboard`)
}