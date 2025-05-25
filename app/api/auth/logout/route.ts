import { NextResponse } from "next/server"

export async function POST() {
  try {
    const response = NextResponse.json({ success: true })
    
    // Clear the session cookie
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
    })

    return response
  } catch (err) {
    console.error("Logout error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
