import { NextResponse } from "next/server"

export async function POST(request: Request) {
  return NextResponse.json({ message: "Supabase removed – endpoint not implemented" }, { status: 501 })
}
