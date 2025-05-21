import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Update the CSP header to allow Vercel's feedback script and Slack
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

  // Define public paths that don't require authentication
  const publicPaths = ["/", "/login", "/auth/callback", "/auth/signin", "/auth/signup", "/test"]
  const isPublicPath = publicPaths.some(
    (path) => req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith("/auth/"),
  )

  // For public paths, we don't need to check authentication
  if (isPublicPath) {
    return res
  }

  // For protected paths, redirect to login if not authenticated
  // Check for the presence of auth cookies
  const hasCookies = req.cookies
    .getAll()
    .some((cookie) => cookie.name.includes("supabase") || cookie.name.includes("sb-") || cookie.name.includes("auth"))

  if (!hasCookies) {
    console.log("Middleware: No auth cookies, redirecting to login")
    const redirectUrl = new URL("/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
