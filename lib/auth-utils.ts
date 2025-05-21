import { getSupabase } from "@/lib/supabase-simple"

/**
 * Check for any lingering auth state and report it
 */
export async function checkForLingeringAuth(): Promise<void> {
  // Make sure we're in the browser environment
  if (typeof window === "undefined") return

  const results: string[] = []

  // 1. Check Supabase session
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      results.push(`❌ Error checking session: ${error.message}`)
    } else if (data.session) {
      results.push(`⚠️ Active session found: User ID = ${data.session.user.id}`)
    } else {
      results.push("✅ No active Supabase session")
    }
  } catch (err) {
    results.push(`❌ Error checking Supabase session: ${err instanceof Error ? err.message : String(err)}`)
  }

  // 2. Check localStorage
  try {
    if (typeof localStorage !== "undefined") {
      let authItemsFound = 0
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (
          key &&
          (key.includes("supabase") || key.includes("auth") || key.includes("session") || key.includes("sb-"))
        ) {
          authItemsFound++
          results.push(`⚠️ Auth-related localStorage item found: ${key}`)
        }
      }

      if (authItemsFound === 0) {
        results.push("✅ No auth-related localStorage items found")
      }
    }
  } catch (e) {
    results.push(`❌ Error checking localStorage: ${e instanceof Error ? e.message : String(e)}`)
  }

  // 3. Check cookies
  try {
    if (typeof document !== "undefined") {
      let authCookiesFound = 0
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.trim().split("=")
        if (
          name &&
          (name.includes("supabase") || name.includes("auth") || name.includes("session") || name.includes("sb-"))
        ) {
          authCookiesFound++
          results.push(`⚠️ Auth-related cookie found: ${name}`)
        }
      })

      if (authCookiesFound === 0) {
        results.push("✅ No auth-related cookies found")
      }
    }
  } catch (e) {
    results.push(`❌ Error checking cookies: ${e instanceof Error ? e.message : String(e)}`)
  }

  // Display results
  if (typeof window !== "undefined" && typeof alert === "function") {
    alert(`Auth State Check Results:\n\n${results.join("\n")}`)
  } else {
    console.log("Auth State Check Results:", results)
  }
}
