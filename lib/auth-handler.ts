import { getSupabaseBrowserClient } from "@/lib/supabase" // Correct import path

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
    const supabase = getSupabaseBrowserClient()

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
    const supabase = getSupabaseBrowserClient()

    // 1. Sign out with Supabase (clears their session)
    await supabase.auth.signOut()

    // 2. Clear our backup
    try {
      localStorage.removeItem("auth_backup")
    } catch (e) {
      console.error("Failed to clear auth backup:", e)
    }

    // 3. Clear all localStorage items that might be related to auth
    try {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (
          key &&
          (key.includes("supabase") || key.includes("auth") || key.includes("session") || key.includes("sb-"))
        ) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key))
    } catch (e) {
      console.error("Failed to clear localStorage:", e)
    }

    // 4. Clear cookies related to auth - update this section
    try {
      // Clear cookies by setting them to expire in the past
      // This is more thorough than the previous approach
      const cookiesToClear = [
        "sb-access-token",
        "sb-refresh-token",
        "supabase-auth-token",
        "sb-provider-token",
        "sb-auth-token",
        // Add any other potential cookie names
        "sb-",
        "supabase-",
      ]

      // Try multiple approaches to clear cookies
      cookiesToClear.forEach((cookieName) => {
        // Clear with path=/
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`

        // Also try with domain specification if we're on a specific domain
        const domain = window.location.hostname
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain};`

        // Also try without path
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;`
      })

      // Also do the general approach for any cookies we might have missed
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.trim().split("=")
        if (
          name &&
          (name.includes("supabase") || name.includes("auth") || name.includes("session") || name.includes("sb-"))
        ) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;`
        }
      })
    } catch (e) {
      console.error("Failed to clear cookies:", e)
    }

    // 5. Force reload the page to ensure all state is cleared
    window.location.href = "/"
  } catch (error) {
    console.error("Error during sign out:", error)
    // Force reload anyway as a fallback
    window.location.href = "/"
  }
}
