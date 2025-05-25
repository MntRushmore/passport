// /app/api/auth/signin/route.ts
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const redirectUrl = new URL("/api/auth/slack", request.url)
  return NextResponse.redirect(redirectUrl)
}