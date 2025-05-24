// app/api/auth/slack/callback/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 })
  }

  // Exchange code for access token
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

  const accessToken = json.authed_user?.access_token
  if (!accessToken) {
    return NextResponse.json({ error: "Missing access token" }, { status: 500 })
  }

  // Fetch user identity
  const userRes = await fetch("https://slack.com/api/users.identity", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const userJson = await userRes.json()
  if (!userJson.ok) {
    console.error("Fetch identity failed", userJson.error)
    return NextResponse.json({ error: userJson.error }, { status: 500 })
  }

  const slackUser = userJson.user

  // Upsert into Postgres via Prisma
  const user = await prisma.user.upsert({
    where: { slackId: slackUser.id },
    update: {
      name: slackUser.name,
      email: slackUser.email,
      avatar: slackUser.image_72,
    },
    create: {
      slackId: slackUser.id,
      name: slackUser.name,
      email: slackUser.email,
      avatar: slackUser.image_72,
    },
  })

  // Sign JWT and set session cookie
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" })

  const resFinal = NextResponse.redirect("/dashboard")
  resFinal.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  })

  return resFinal
}