import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies: request.cookies })

    // Get session from server
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      return NextResponse.json(
        {
          error: "Session error",
          message: sessionError.message,
        },
        { status: 500 },
      )
    }

    // Get all cookies for debugging
    const allCookies = request.cookies.getAll()
    const cookieNames = allCookies.map((cookie) => cookie.name)

    // Check for auth-related cookies
    const authCookies = cookieNames.filter(
      (name) => name.includes("supabase") || name.includes("sb-") || name.includes("auth") || name.includes("session"),
    )

    // Return the response
    return NextResponse.json({
      hasSession: !!sessionData.session,
      sessionUserId: sessionData.session?.user?.id || null,
      authCookies,
      cookieCount: allCookies.length,
      authCookieCount: authCookies.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Auth debug error:", error)

    // Return a more detailed error response
    return NextResponse.json(
      {
        error: "Server error",
        message: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 },
    )
  }
}
