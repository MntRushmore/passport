// app/api/auth/slack/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID!,
    scope: process.env.SLACK_SCOPE!,
    redirect_uri: process.env.SLACK_REDIRECT_URI!,
  });

  return NextResponse.redirect(`https://slack.com/oauth/v2/authorize?${params}`);
}