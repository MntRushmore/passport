import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"

export async function GET(request: Request) {
  try {
    const clientId = process.env.SLACK_CLIENT_ID
    if (!clientId) throw new Error("SLACK_CLIENT_ID is missing")

    const redirectUri = `${new URL(request.url).origin}/api/auth/slack/callback`
    const state = crypto.randomUUID()

    cookies().set({
      name: "slack_oauth_state",
      value: state,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 300
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
  } catch (err) {
    console.error("Slack auth error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}