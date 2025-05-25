// /app/api/auth/signin/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.redirect("https://passport.hackclub.com/api/auth/slack")
}