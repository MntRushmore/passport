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

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const publicPaths = ["/", "/auth/callback"]
  const isPublicPath = publicPaths.some(
    (path) => req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith("/auth/"),
  )

  const isOnboardingPath = req.nextUrl.pathname === "/onboarding"

  if (!session && !isPublicPath) {
    const redirectUrl = new URL("/", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  if (session && req.nextUrl.pathname === "/") {
    const redirectUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
