import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self' https://*.supabase.co;
    frame-src 'self' https://*.supabase.co;
    form-action 'self';
  `
    .replace(/\s{2,}/g, " ")
    .trim()

  res.headers.set("Content-Security-Policy", cspHeader)

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Add debug logging
  console.log(`Middleware: Path=${req.nextUrl.pathname}, HasSession=${!!session}`)

  // Define public paths that don't require authentication
  const publicPaths = ["/", "/auth/callback", "/auth/signin", "/auth/signup", "/test"]
  const isPublicPath = publicPaths.some(
    (path) => req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith("/auth/"),
  )

  // If no session and trying to access a protected route, redirect to login
  if (!session && !isPublicPath) {
    console.log("Middleware: No session, redirecting to login")
    const redirectUrl = new URL("/", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // We'll let the client-side code handle redirections from the home page
  // to avoid conflicts with our direct redirection approach

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
