// app/api/auth/slack/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  console.log("Starting Slack OAuth token exchange");
  console.log("Client ID:", process.env.SLACK_CLIENT_ID);
  console.log("Client Secret starts with:", process.env.SLACK_CLIENT_SECRET?.slice(0, 5));
  console.log("Redirect URI:", process.env.SLACK_REDIRECT_URI);
  console.log("Code from Slack:", code);

  const res = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      code,
      redirect_uri: process.env.SLACK_REDIRECT_URI!,
    }),
  });

  const data = await res.json();

  console.log("Slack OAuth response:", data);

  if (!data.ok) {
    console.error("Slack error:", data);
    return NextResponse.json({ error: "Slack auth failed", details: data }, { status: 400 });
  }

  if (!data.authed_user || !data.authed_user.id || !data.authed_user.access_token) {
    console.error("Missing authed_user in Slack response:", data);
    return NextResponse.json({ error: "Slack response missing user info" }, { status: 400 });
  }

  const slackUserId = data.authed_user.id;
  const slackAccessToken = data.authed_user.access_token;

  const userInfoRes = await fetch("https://slack.com/api/users.identity", {
    headers: { Authorization: `Bearer ${slackAccessToken}` },
    method: "GET",
  });

  const userInfo = await userInfoRes.json();

  if (!userInfo.user || !userInfo.user.email || !userInfo.user.name) {
    console.error("Missing expected identity fields in userInfo:", userInfo);
    return NextResponse.json({ error: "Slack identity info incomplete", details: userInfo }, { status: 400 });
  }

  const email = userInfo.user.email;
  const name = userInfo.user.name;

  const user = await prisma.user.upsert({
    where: { slackId: slackUserId },
    update: { email, name },
    create: {
      slackId: slackUserId,
      email,
      name,
    },
  });

  const cookieStore = cookies();
  cookieStore.set("session", user.id.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days sure
  });

  console.log("Slack user authenticated:", user);

  return NextResponse.redirect("https://passport.hackclub.com/dashboard");
}