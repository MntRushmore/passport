/**
 * Initiate Slack OAuth flow
 */
export async function initiateSlackAuth(): Promise<void> {
  try {
    if (typeof window !== "undefined") {
      window.location.href = "https://slack.com/oauth/v2/authorize"
    }
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
