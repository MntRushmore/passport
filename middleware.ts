// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const pathname = request.nextUrl.pathname;

  const publicPaths = [
    "/api/auth/slack",
    "/api/auth/slack/callback",
    "/",
  ];

  const protectedPaths = ["/dashboard"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !session && !isPublic) {
    return NextResponse.redirect("https://passport.hackclub.com/");
  }

  return NextResponse.next();
}