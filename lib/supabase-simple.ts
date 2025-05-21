import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Create a single instance for the browser
const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

// Singleton pattern to avoid multiple instances
let browserClient: ReturnType<typeof createClient<Database>> | null = null

export function getSupabase() {
  if (typeof window === "undefined") {
    // Server-side: create a new client each time
    return createBrowserClient()
  }

  // Client-side: reuse the same client
  if (!browserClient) {
    browserClient = createBrowserClient()
  }

  return browserClient
}

// Simple function to get the current user
export async function getCurrentUser() {
  const supabase = getSupabase()
  const { data } = await supabase.auth.getUser()
  return data.user
}
