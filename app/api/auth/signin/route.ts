// app/api/auth/signin/route.ts
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const redirectUri = `${new URL(request.url).origin}/api/auth/callback`
  const clientId = process.env.SLACK_CLIENT_ID!

  const slackAuthUrl = `https://slack.com/openid/connect/authorize?response_type=code&client_id=${clientId}&scope=openid%20email%20profile&redirect_uri=${encodeURIComponent(
    redirectUri
  )}`

  return NextResponse.redirect(slackAuthUrl)
}