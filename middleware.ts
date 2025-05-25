import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

export async function middleware(req: NextRequest) {
  console.log('[middleware] incoming path:', req.nextUrl.pathname);
  try {
    const res = NextResponse.next()

    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel.live;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https: https://*.slack.com;
      font-src 'self';
      connect-src 'self' https://*.supabase.co https://*.vercel.live https://*.slack.com;
      frame-src 'self' https://*.supabase.co https://*.slack.com;
      form-action 'self';
    `
      .replace(/\s{2,}/g, " ")
      .trim()

    res.headers.set("Content-Security-Policy", cspHeader)

    const publicPaths = [
      "/",
      "/login",
      "/auth/callback",
      "/api/auth/callback",
      "/auth/signin",
      "/api/auth/signin",
      "/auth/signup",
      "/test",
    ]
    const isPublicPath =
      publicPaths.includes(req.nextUrl.pathname) ||
      publicPaths.some((path) => req.nextUrl.pathname.startsWith(path + "/"))

  
    if (isPublicPath) {
      return res
    }

    const sessionToken = req.cookies.get("session")?.value
    console.log("[middleware] session cookie:", sessionToken)

    if (!sessionToken) {
      console.log("[middleware] No session cookie found, redirecting to login")
      const redirectUrl = new URL("/login", req.url)
      return NextResponse.redirect(redirectUrl)
    }

    try {
      const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET!)
      console.log("[middleware] JWT decoded:", decoded)
    } catch (err) {
      console.error("[middleware] Invalid session token:", err)
      const redirectUrl = new URL("/login", req.url)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (err) {
    console.error('[middleware] unexpected error on path', req.nextUrl.pathname, err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
