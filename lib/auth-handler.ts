import { getSupabase } from "@/lib/supabase-simple"

/**
 * Initiate Slack OAuth flow
 */
export async function initiateSlackAuth(): Promise<void> {
  try {
    const supabase = getSupabase()

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "slack",
      options: {
        redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
      },
    })

    if (error) {
      throw error
    }

    // The user will be redirected to Slack for authentication
  } catch (error) {
    console.error("Slack auth initiation error:", error)
    throw error
  }
}

/**
 * Perform a hard redirect with a delay to ensure auth state is settled
 */
export function performDelayedRedirect(path: string, delay = 500): void {
  if (typeof window !== "undefined") {
    setTimeout(() => {
      window.location.href = path
    }, delay)
  }
}

/**
 * Perform a complete sign-out that clears all auth state
 */
export async function performCompleteSignOut(): Promise<void> {
  try {
    const supabase = getSupabase()
    await supabase.auth.signOut()

    // Clear any local storage or cookies
    if (typeof window !== "undefined") {
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
    }
  } catch (error) {
    console.error("Error during sign out:", error)
    throw error
  }
}
