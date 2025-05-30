import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"

// Singleton pattern for PrismaClient
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const cookieStore = await cookies()
  const savedState = cookieStore.get("slack_oauth_state")?.value

  console.log("OAuth callback hit")
  console.log("Code:", code)
  console.log("State:", state)
  console.log("Saved cookie state:", savedState)

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 })
  }

  if (!state || state !== savedState) {
    console.error("OAuth state mismatch or missing")
    return NextResponse.json({ error: "Invalid or missing state" }, { status: 400 })
  }

  try {
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
    console.log("Slack token response:", json)

    if (!json.ok) {
      console.error("Slack OAuth failed", json.error)
      return NextResponse.json({ error: json.error }, { status: 500 })
    }

    const accessToken = json.authed_user?.access_token
    if (!accessToken) {
      console.error("Missing access token")
      return NextResponse.json({ error: "Missing access token" }, { status: 500 })
    }

    const userRes = await fetch("https://slack.com/api/users.identity", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    const userJson = await userRes.json()
    console.log("Slack user identity response:", userJson)

    if (!userJson.ok) {
      console.error("Fetch identity failed", userJson.error)
      return NextResponse.json({ error: userJson.error }, { status: 500 })
    }

    const slackUser = userJson.user

    const user = await prisma.user.upsert({
      where: { slackId: slackUser.id },
      update: {
        name: slackUser.name ?? "Unknown",
        email: slackUser.email ?? "",
        avatar: slackUser.image_72 ?? null,
      },
      create: {
        slackId: slackUser.id,
        name: slackUser.name ?? "Unknown",
        email: slackUser.email ?? "",
        avatar: slackUser.image_72 ?? null,
      },
    })

    const isNewUser = user.createdAt.getTime() === user.updatedAt.getTime()
    const redirectPath = isNewUser || !user.clubId ? "/onboarding" : "/dashboard"

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined")
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    const resFinal = NextResponse.redirect(new URL(redirectPath, request.url))
    
    // Set the session cookie
  resFinal.cookies.set("session", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7,
  domain: "passport.hackclub.com",
})

    // Clear the OAuth state cookie
    resFinal.cookies.delete("slack_oauth_state")

    return resFinal
  } catch (err) {
    console.error("OAuth callback error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}