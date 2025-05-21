import { getSupabase } from "@/lib/supabase-simple" // Correct import path

/**
 * A minimal auth handler that doesn't rely on Supabase's auth state change events
 */
export async function handleSignIn(
  email: string,
  password: string,
): Promise<{
  success: boolean
  redirectTo: string
  error?: string
}> {
  try {
    const supabase = getSupabase()

    // Sign in with Supabase directly
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        redirectTo: "/",
        error: error.message,
      }
    }

    // Store auth in localStorage as a backup
    if (data.session) {
      try {
        localStorage.setItem(
          "auth_backup",
          JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
          }),
        )
      } catch (e) {
        console.error("Failed to store auth backup:", e)
      }
    }

    // Check if user has a club and determine redirect
    if (data.user) {
      try {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("club_id")
          .eq("auth_id", data.user.id)
          .single()

        if (userError) {
          if (userError.code === "PGRST116") {
            // User not found in database, redirect to onboarding
            return {
              success: true,
              redirectTo: "/onboarding",
            }
          }
          throw userError
        }

        if (!userData || !userData.club_id) {
          // User has no club, redirect to onboarding
          return {
            success: true,
            redirectTo: "/onboarding",
          }
        } else {
          // User has a club, redirect to dashboard
          return {
            success: true,
            redirectTo: "/dashboard",
          }
        }
      } catch (err) {
        console.error("Error checking user data after sign in:", err)
        // Default to dashboard
        return {
          success: true,
          redirectTo: "/dashboard",
          error: err instanceof Error ? err.message : "Error checking user data",
        }
      }
    }

    return {
      success: true,
      redirectTo: "/dashboard",
    }
  } catch (error) {
    console.error("Sign in error:", error)
    return {
      success: false,
      redirectTo: "/",
      error: error instanceof Error ? error.message : "Authentication failed",
    }
  }
}

/**
 * Perform a hard redirect with a delay to ensure auth state is settled
 */
export function performDelayedRedirect(path: string, delay = 500): void {
  setTimeout(() => {
    window.location.href = path
  }, delay)
}

/**
 * Perform a complete sign-out that clears all auth state
 */
export async function performCompleteSignOut(): Promise<void> {
  try {
    const supabase = getSupabase()
    await supabase.auth.signOut()

    // Clear any local storage or cookies
    try {
      localStorage.removeItem("supabase.auth.token")
      localStorage.removeItem("auth_backup")

      // Clear any other auth-related items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes("supabase") || key.includes("sb-") || key.includes("auth"))) {
          localStorage.removeItem(key)
        }
      }
    } catch (e) {
      console.error("Error clearing localStorage:", e)
    }

    // Force a hard navigation to clear any client-side state
    window.location.href = "/"
  } catch (error) {
    console.error("Error during sign out:", error)
    throw error
  }
}
