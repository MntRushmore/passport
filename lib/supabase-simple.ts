import type { Database } from "@/types/supabase"
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs"

// Create a single instance for the browser
const createBrowserClient = () => createBrowserSupabaseClient()
let browserClient: ReturnType<typeof createBrowserSupabaseClient> | null = null

export function getSupabase() {
  if (typeof window === "undefined") {
  
    return createBrowserClient()
  }

  
  if (!browserClient) {
    browserClient = createBrowserClient()
  }

  return browserClient
}


export async function getCurrentUser() {
  const supabase = getSupabase()
  const { data } = await supabase.auth.getUser()
  return data.user
}
