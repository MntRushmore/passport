// app/api/auth/signin/route.ts
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const redirectUri = `${new URL(request.url).origin}/api/auth/callback`
  const clientId = process.env.SLACK_CLIENT_ID!

  const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=openid%20email&redirect_uri=${encodeURIComponent(
    redirectUri
  )}`

  return NextResponse.redirect(slackAuthUrl)
}