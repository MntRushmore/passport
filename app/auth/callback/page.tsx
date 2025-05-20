"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle, Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = getSupabaseBrowserClient()

      // Check if there's an error in the URL
      const errorParam = searchParams.get("error")
      const errorDescription = searchParams.get("error_description")

      if (errorParam) {
        setError(`Authentication Error: ${errorParam}`)
        setErrorDetails(errorDescription)
        return
      }

      try {
        // Get the code from the URL if it exists
        const code = searchParams.get("code")

        if (code) {
          console.log("Exchanging code for session")
          // Exchange the code for a session
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            throw exchangeError
          }
        }

        // Try to get the session
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (!data.session) {
          throw new Error("No session found")
        }

        console.log("Session found, checking if user exists in database")

        // Check if this is a new user
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, club_id")
          .eq("auth_id", data.session.user.id)
          .single()

        if (userError) {
          if (userError.code === "PGRST116") {
            // User not found in our database, redirect to onboarding
            console.log("User not found in database, redirecting to onboarding")
            router.push("/onboarding")
          } else {
            throw userError
          }
        } else {
          // Existing user
          if (userData.club_id) {
            // User has a club, redirect to dashboard
            console.log("User has a club, redirecting to dashboard")
            router.push("/dashboard")
          } else {
            // User doesn't have a club, redirect to onboarding
            console.log("User doesn't have a club, redirecting to onboarding")
            router.push("/onboarding")
          }
        }
      } catch (err) {
        console.error("Error in auth callback:", err)
        setError(err instanceof Error ? err.message : "Authentication failed")
        setErrorDetails("There was a problem completing the authentication process. Please try again.")

        toast({
          title: "Authentication Error",
          description: err instanceof Error ? err.message : "Failed to complete authentication",
          variant: "destructive",
        })
      }
    }

    handleCallback()
  }, [router, toast, searchParams])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
        <div className="max-w-md w-full bg-white rounded-lg border border-gold-500 shadow-lg p-6 text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-serif text-navy-700 mb-2">{error}</h2>
          {errorDetails && <p className="text-sm font-mono text-stone-600 mb-4">{errorDetails}</p>}

          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
            <Button asChild className="bg-navy-700 hover:bg-navy-800 text-cream font-serif">
              <Link href="/">Return to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy-700 mx-auto" />
        <p className="mt-4 font-mono text-sm text-navy-700">Completing authentication...</p>
      </div>
    </div>
  )
}
