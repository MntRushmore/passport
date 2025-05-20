import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("Authorization")

    // Create server client
    const cookieStore = cookies()
    const supabase = createServerClient()

    // Get session - try multiple methods
    let session

    // Method 1: Try to get session from auth header if provided
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      const { data, error } = await supabase.auth.getUser(token)

      if (error) {
        console.error("Error getting user from token:", error)
      } else if (data.user) {
        console.log("Got user from token:", data.user.id)
        // We have a valid user from the token
        session = { user: data.user }
      }
    }

    // Method 2: Try to get session from cookies
    if (!session) {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Session error from cookies:", sessionError)
      } else if (sessionData.session) {
        console.log("Got session from cookies:", sessionData.session.user.id)
        session = sessionData.session
      }
    }

    // If we still don't have a session, return auth error
    if (!session) {
      console.error("No valid session found")
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    // Parse request body safely
    let body
    try {
      body = await request.json()
    } catch (e) {
      console.error("Error parsing request body:", e)
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 })
    }

    const { name, location, description, userId, userName, userEmail, userAvatar } = body

    if (!name) {
      return NextResponse.json({ message: "Club name is required" }, { status: 400 })
    }

    console.log("Creating club with data:", { name, location, description })

    // Create club
    const { data: club, error: clubError } = await supabase
      .from("clubs")
      .insert({
        name,
        location: location || null,
        description: description || null,
      })
      .select("id")
      .single()

    if (clubError) {
      console.error("Error creating club:", clubError)
      return NextResponse.json({ message: `Failed to create club: ${clubError.message}` }, { status: 500 })
    }

    console.log("Club created:", club)

    // Update user
    const { data: user, error: userError } = await supabase
      .from("users")
      .upsert({
        auth_id: session.user.id,
        name: userName || session.user.user_metadata?.name || "Club Leader",
        email: userEmail || session.user.email || "",
        avatar_url: userAvatar || session.user.user_metadata?.avatar_url || null,
        club_id: club.id,
        role: "leader",
      })
      .select("id")
      .single()

    if (userError) {
      console.error("Error updating user:", userError)

      // Rollback club creation
      await supabase.from("clubs").delete().eq("id", club.id)

      return NextResponse.json({ message: `Failed to update user: ${userError.message}` }, { status: 500 })
    }

    console.log("User updated:", user)

    return NextResponse.json({
      message: "Club created successfully",
      data: { clubId: club.id, userId: user.id },
    })
  } catch (error) {
    console.error("Error in club creation:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
