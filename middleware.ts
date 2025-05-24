import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

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

  // Define public paths that don't require authentication
  const publicPaths = [
    "/",
    "/login",
    "/auth/callback",
    "/api/auth/callback",
    "/auth/signin",
    "/auth/signup",
    "/test",
  ]
  const isPublicPath =
    publicPaths.some(
      (path) =>
        req.nextUrl.pathname === path ||
        req.nextUrl.pathname.startsWith(path.endsWith("/") ? path : path + "/")
    ) ||
    req.nextUrl.pathname.startsWith("/api/auth/")

  // For public paths, we don't need to check authentication
  if (isPublicPath) {
    return res
  }

  const hasCookies = req.cookies
    .getAll()
    .some((cookie) => cookie.name.includes("supabase") || cookie.name.includes("sb-") || cookie.name.includes("auth"))
  console.log('[middleware] hasCookies:', hasCookies, 'cookie names:', req.cookies.getAll().map(c => c.name));

  if (!hasCookies) {
    console.log("Middleware: No auth cookies, redirecting to login")
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
