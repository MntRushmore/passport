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
  const error = searchParams.get("error")
  
  // Handle OAuth errors from Slack
  if (error) {
    console.error("Slack OAuth error:", error)
    return NextResponse.redirect(new URL(`/login?error=${error}`, request.url))
  }

  const cookieStore = await cookies()
  const savedState = cookieStore.get("slack_oauth_state")?.value

  console.log("OAuth callback received")
  console.log("Code present:", !!code)
  console.log("State matches:", state === savedState)

  if (!code) {
    console.error("Missing authorization code")
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url))
  }

  if (!state || state !== savedState) {
    console.error("OAuth state mismatch or missing")
    return NextResponse.redirect(new URL("/login?error=invalid_state", request.url))
  }

  // Validate required environment variables
  if (!process.env.SLACK_CLIENT_ID || !process.env.SLACK_CLIENT_SECRET) {
    console.error("Missing Slack OAuth configuration")
    return NextResponse.redirect(new URL("/login?error=config_error", request.url))
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        redirect_uri: `${new URL(request.url).origin}/api/auth/slack/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      console.error("Slack token exchange failed:", tokenResponse.status, tokenResponse.statusText)
      return NextResponse.redirect(new URL("/login?error=token_exchange_failed", request.url))
    }

    const tokenData = await tokenResponse.json()
    console.log("Slack token response:", { ok: tokenData.ok, error: tokenData.error })

    if (!tokenData.ok) {
      console.error("Slack OAuth failed:", tokenData.error)
      return NextResponse.redirect(new URL(`/login?error=slack_${tokenData.error}`, request.url))
    }

    const accessToken = tokenData.authed_user?.access_token
    if (!accessToken) {
      console.error("Missing access token in response")
      return NextResponse.redirect(new URL("/login?error=missing_token", request.url))
    }

    // Fetch user information from Slack
    const userResponse = await fetch("https://slack.com/api/users.identity", {
      headers: { 
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json"
      },
    })

    if (!userResponse.ok) {
      console.error("Slack user fetch failed:", userResponse.status, userResponse.statusText)
      return NextResponse.redirect(new URL("/login?error=user_fetch_failed", request.url))
    }

    const userData = await userResponse.json()
    console.log("Slack user identity response:", { ok: userData.ok, error: userData.error })

    if (!userData.ok) {
      console.error("Failed to fetch user identity:", userData.error)
      return NextResponse.redirect(new URL(`/login?error=identity_${userData.error}`, request.url))
    }

    const slackUser = userData.user
    if (!slackUser?.id) {
      console.error("Invalid user data received from Slack")
      return NextResponse.redirect(new URL("/login?error=invalid_user_data", request.url))
    }

    // Create or update user in database
    const user = await prisma.user.upsert({
      where: { slackId: slackUser.id },
      update: {
        name: slackUser.name || slackUser.real_name || "Unknown User",
        email: slackUser.email || null,
        avatar: slackUser.image_72 || slackUser.image_48 || slackUser.image_24 || null,
      },
      create: {
        slackId: slackUser.id,
        name: slackUser.name || slackUser.real_name || "Unknown User",
        email: slackUser.email || null,
        avatar: slackUser.image_72 || slackUser.image_48 || slackUser.image_24 || null,
      },
    })

    console.log("User upserted:", { id: user.id, slackId: user.slackId, name: user.name })

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured")
      return NextResponse.redirect(new URL("/login?error=config_error", request.url))
    }

    // Create JWT session token
    const sessionToken = jwt.sign(
      { 
        userId: user.id,
        slackId: user.slackId,
        iat: Math.floor(Date.now() / 1000)
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    )

    // Create redirect response
    const response = NextResponse.redirect(new URL("/dashboard", request.url))
    
    // Set the session cookie
    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // Clear the OAuth state cookie
    response.cookies.delete("slack_oauth_state")

    console.log("Authentication successful, redirecting to dashboard")
    return response
  } catch (err) {
    console.error("OAuth callback error:", err)
    return NextResponse.redirect(new URL("/login?error=internal_error", request.url))
  }
}