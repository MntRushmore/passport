import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

export async function middleware(req: NextRequest) {
  console.log('[middleware] incoming path:', req.nextUrl.pathname);
  console.log("[middleware] cookies:", req.cookies.getAll())
  try {
    const res = NextResponse.next()

    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel.live;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https: https://*.slack.com;
      font-src 'self';
      connect-src 'self' https://*.vercel.live https://*.slack.com;
      frame-src 'self' https://*.slack.com;
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
      "/api/auth/slack",
      "/api/auth/slack/callback",
      "/auth/signup",
      "/dashboard",
      "/test",
      "/api/auth/user"
    ]
    const isPublicPath =
      publicPaths.includes(req.nextUrl.pathname) ||
      publicPaths.some((path) => req.nextUrl.pathname.startsWith(path + "/"))

  
    if (isPublicPath) {
      return res
    }

    console.log("[middleware] all cookies:", req.cookies.getAll())
    const sessionToken = req.cookies.get("session")?.value
    console.log("[middleware] session cookie:", sessionToken)

    if (!sessionToken && !isPublicPath) {
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
