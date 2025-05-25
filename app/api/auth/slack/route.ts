import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    // Validate required environment variables
    const clientId = process.env.SLACK_CLIENT_ID
    if (!clientId) {
      console.error("SLACK_CLIENT_ID is not configured")
      return NextResponse.redirect(new URL("/login?error=config_error", request.url))
    }

    // Generate state for CSRF protection
    const state = crypto.randomUUID()
    const redirectUri = `${new URL(request.url).origin}/api/auth/slack/callback`

    console.log("Initiating Slack OAuth flow")
    console.log("Redirect URI:", redirectUri)
    console.log("State:", state)

    // Set state cookie for verification
    const response = NextResponse.redirect(
      new URL("https://slack.com/oauth/v2/authorize")
    )

    // Build OAuth URL with proper scopes
    const authUrl = new URL("https://slack.com/oauth/v2/authorize")
    authUrl.searchParams.set("client_id", clientId)
    authUrl.searchParams.set("redirect_uri", redirectUri)
    authUrl.searchParams.set("state", state)
    authUrl.searchParams.set("user_scope", [
      "identity.basic",
      "identity.email", 
      "identity.team",
      "identity.avatar",
    ].join(","))

    // Set secure state cookie
    response.cookies.set("slack_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 300, // 5 minutes
    })

    return NextResponse.redirect(authUrl.toString())
  } catch (err) {
    console.error("Slack auth initialization error:", err)
    return NextResponse.redirect(new URL("/login?error=init_error", request.url))
  }
}