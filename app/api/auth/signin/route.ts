// app/api/auth/signin/route.ts
import { NextResponse } from "next/server"
import { cookies, headers } from "next/headers"
import { createServerClient } from "@supabase/ssr"

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

  const { data, error } = await supabase.auth.signInWithOpenIDConnect({
    provider: 'slack_oidc',
    options: {
      redirectTo: `${new URL(request.url).origin}/api/auth/callback`,
    },
  })

  if (error || !data?.url) {
    const params = new URLSearchParams({
      error: error?.message ?? "signin_failed",
    }).toString()
    return NextResponse.redirect(`${new URL(request.url).origin}/login?${params}`)
  }

  return NextResponse.redirect(data.url)
}