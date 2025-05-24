import { createServerClient } from "@supabase/ssr"
import { cookies, headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const cookieStore = cookies()
  const headerStore = headers()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: () => cookieStore,
      headers: () => headerStore,
    }
  )

  const code = new URL(request.url).searchParams.get("code")

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 })
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error("Callback failed:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.redirect(`${new URL(request.url).origin}/dashboard`)
}