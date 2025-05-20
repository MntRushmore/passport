/**
 * Utility function to handle navigation in a way that works consistently
 * across development and production environments
 */
export function safeNavigate(path: string, useHardRedirect = false) {
  // For critical navigation paths like auth flows, use hard redirects
  if (useHardRedirect) {
    window.location.href = path
    return
  }

  // For normal navigation, use Next.js router if available
  try {
    // This is a client-side only function
    if (typeof window !== "undefined") {
      // If we're in a production environment or if the path is auth-related,
      // use a hard redirect to avoid any potential issues with client-side routing
      if (
        process.env.NODE_ENV === "production" ||
        path === "/dashboard" ||
        path === "/onboarding" ||
        path === "/" ||
        path.startsWith("/auth/")
      ) {
        window.location.href = path
      } else {
        // Let Next.js handle the navigation
        // We don't import the router here to avoid issues with server components
        // The caller should handle this case
        return false
      }
    }
  } catch (error) {
    console.error("Navigation error:", error)
    // Fallback to hard redirect
    window.location.href = path
  }

  return true
}
