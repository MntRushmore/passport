// app/api/auth/slack/callback/route.ts
import { NextResponse } from "next/server"
import fetch from "node-fetch"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  // verify `state` matches the one you stored!

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 })
  }

  const res = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      redirect_uri: `${new URL(request.url).origin}/api/auth/slack/callback`,
    }),
  })
  const json = await res.json()
  if (!json.ok) {
    console.error("Slack OAuth failed", json.error)
    return NextResponse.json({ error: json.error }, { status: 500 })
  }

  // now you have `json.authed_user.access_token`
  // fetch identity or store session however you like

  return NextResponse.redirect("/dashboard")
}