"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function AuthCallbackPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = getSupabaseBrowserClient()

      try {
        // Try to get the session from the URL
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (!data.session) {
          throw new Error("No session found")
        }

        // Check if this is a new user
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("auth_id", data.session.user.id)
          .single()

        if (userError && userError.code === "PGRST116") {
          // User not found, redirect to onboarding
          router.push("/onboarding")
        } else if (userError) {
          throw userError
        } else {
          // Existing user, redirect to dashboard
          router.push("/dashboard")
        }
      } catch (err) {
        console.error("Error in auth callback:", err)
        setError(err instanceof Error ? err.message : "Authentication failed")
        toast({
          title: "Authentication Error",
          description: err instanceof Error ? err.message : "Failed to complete authentication",
          variant: "destructive",
        })

        // Redirect to home after a delay
        setTimeout(() => {
          router.push("/")
        }, 3000)
      }
    }

    handleCallback()
  }, [router, toast])

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100">
      <div className="text-center">
        {error ? (
          <div>
            <div className="text-red-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-serif text-navy-700 mb-2">Authentication Failed</h2>
            <p className="text-sm font-mono text-stone-600 mb-4">{error}</p>
            <p className="text-sm font-mono text-stone-500">Redirecting you back to the home page...</p>
          </div>
        ) : (
          <>
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-navy-700 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 font-mono text-sm text-navy-700">Completing authentication...</p>
          </>
        )}
      </div>
    </div>
  )
}
