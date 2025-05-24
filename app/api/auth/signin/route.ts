// app/api/auth/signin/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'slack',
    options: {
      redirectTo: `${new URL(request.url).origin}/api/auth/callback`,
    },
  })
  if (error || !data.url) {
    // something went wrong; send back to login with a message
    const params = new URLSearchParams({
      error: error?.message ?? "signin_failed",
    }).toString()
    return NextResponse.redirect(`${new URL(request.url).origin}/login?${params}`)
  }
  // redirect the browser up to Slack
  return NextResponse.redirect(data.url)
}