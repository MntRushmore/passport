// path: app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  console.log("[/api/auth/callback] GET request received:", request.url);
  // Create Supabase client using cookie-based handler
  const supabase = createRouteHandlerClient({ cookies });

  const reqUrl = new URL(request.url);
  const origin = reqUrl.origin;
  const error = reqUrl.searchParams.get("error");
  const error_description = reqUrl.searchParams.get("error_description");
  console.log(
    "[/api/auth/callback] Parsed callback params →",
    { origin, error, error_description }
  );

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${error}&error_description=${encodeURIComponent(
        error_description ?? ""
      )}`
    );
  }

  const code = reqUrl.searchParams.get("code");
  console.log("[OAuth Callback] URL Search Params:", reqUrl.searchParams);
  console.log("[OAuth Callback] Extracted code:", code);

  if (!code) {
    console.error("[OAuth Callback] ❌ No code found in query params!");
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  console.log("[OAuth Callback] Sending to Supabase:", { code });
  console.log("[/api/auth/callback] Exchanging code for session with:", code);
  const { data, error: sessionError } =
    await supabase.auth.exchangeCodeForSession({ code });
  console.log(
    "[/api/auth/callback] exchangeCodeForSession result →",
    { data, sessionError }
  );

  if (sessionError) {
    console.error("OAuth callback failed:", sessionError);
    const errorMsg = encodeURIComponent(sessionError.message);
    return NextResponse.redirect(
      `${origin}/login?error=callback_failed&error_description=${errorMsg}`
    );
  }

  return NextResponse.redirect(`${new URL(request.url).origin}/dashboard`);
}