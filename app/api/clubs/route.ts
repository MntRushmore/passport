import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { name, location, description, userId, userName, userEmail, userAvatar } = body

    if (!name) {
      return NextResponse.json({ message: "Club name is required" }, { status: 400 })
    }

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

    const { data: user, error: userError } = await supabase
      .from("users")
      .upsert({
        auth_id: session.user.id,
        name: userName || session.user.user_metadata.name || "Club Leader",
        email: userEmail || session.user.email || "",
        avatar_url: userAvatar || session.user.user_metadata.avatar_url || null,
        club_id: club.id,
        role: "leader",
      })
      .select("id")
      .single()

    if (userError) {
      console.error("Error updating user:", userError)
      await supabase.from("clubs").delete().eq("id", club.id)

      return NextResponse.json({ message: `Failed to update user: ${userError.message}` }, { status: 500 })
    }

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
