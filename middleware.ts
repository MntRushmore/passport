import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Add Content Security Policy headers to allow Slack OAuth
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self' https://*.supabase.co https://api.slack.com;
    frame-src 'self' https://*.supabase.co https://slack.com;
    form-action 'self';
  `
    .replace(/\s{2,}/g, " ")
    .trim()

  res.headers.set("Content-Security-Policy", cspHeader)

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Public paths that don't require authentication
  const publicPaths = ["/", "/auth/callback"]
  const isPublicPath = publicPaths.includes(req.nextUrl.pathname)

  // Onboarding path - only accessible for authenticated users without a club
  const isOnboardingPath = req.nextUrl.pathname === "/onboarding"

  // If user is not signed in and the current path is not public,
  // redirect the user to the home page
  if (!session && !isPublicPath) {
    const redirectUrl = new URL("/", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is signed in but trying to access the home page,
  // redirect to dashboard
  if (session && req.nextUrl.pathname === "/") {
    const redirectUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
