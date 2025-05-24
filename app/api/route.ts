import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Get all cookies for debugging
    const allCookies = request.headers.get("cookie")?.split("; ") || []
    const authCookies = allCookies.filter(
      (c) => c.includes("supabase") || c.includes("sb-") || c.includes("auth") || c.includes("session"),
    )

    return NextResponse.json({
      hasSession: false,
      sessionUserId: null,
      authCookies,
      cookieCount: allCookies.length,
      authCookieCount: authCookies.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Auth debug error:", error)

    return NextResponse.json(
      {
        error: "Server error",
        message: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 },
    )
  }
}
