// /app/api/auth/signin/route.ts
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/api/auth/slack", request.url))
}