/**
 * Check for any lingering auth state and report it
 */
export async function checkForLingeringAuth(): Promise<void> {
  if (typeof window === "undefined") return

  const results: string[] = []

  // Check localStorage
  try {
    if (typeof localStorage !== "undefined") {
      let authItemsFound = 0
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (
          key &&
          (key.includes("auth") || key.includes("session") || key.includes("sb-"))
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

  // Check cookies
  try {
    if (typeof document !== "undefined") {
      let authCookiesFound = 0
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.trim().split("=")
        if (
          name &&
          (name.includes("auth") || name.includes("session") || name.includes("sb-"))
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

  if (typeof window !== "undefined" && typeof alert === "function") {
    alert(`Auth State Check Results:\n\n${results.join("\n")}`)
  } else {
    console.log("Auth State Check Results:", results)
  }
}
