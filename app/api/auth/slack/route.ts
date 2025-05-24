// app/api/auth/slack/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const clientId = process.env.SLACK_CLIENT_ID!
  const redirectUri = `${new URL(request.url).origin}/api/auth/slack/callback`
  const state = crypto.randomUUID()

  cookies().set({
    name: "slack_oauth_state",
    value: state,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 300  // 5 minutes
  })

  const url = new URL("https://slack.com/oauth/v2/authorize")
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("redirect_uri", redirectUri)
  url.searchParams.set("state", state)
  url.searchParams.set("user_scope", [
    "identity.basic",
    "identity.email",
    "identity.team",
    "identity.avatar",
  ].join(","))

  return NextResponse.redirect(url.toString())
}