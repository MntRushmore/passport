// /app/api/auth/signin/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.redirect("/api/auth/slack")
}