"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { getSupabase } from "@/lib/supabase-simple"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle, Loader2 } from "lucide-react"
import { performDelayedRedirect } from "@/lib/auth-handler"

export default function AuthCallbackPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {

    const handleCallback = async () => {
      try {
        const supabase = getSupabase()

        const errorParam = searchParams.get("error")
        const errorDescription = searchParams.get("error_description")

        if (errorParam) {
          setError(`Authentication Error: ${errorParam}`)
          setErrorDetails(errorDescription)
          setIsProcessing(false)
          return
        }

  
        const code = searchParams.get("code")
        if (code) {
          console.log("Exchanging code for session")
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession()

          if (exchangeError) {
            throw exchangeError
          }
        }

        // Get current session
        const { data, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          throw sessionError
        }

        if (!data.session) {
          throw new Error("No session found")
        }

        console.log("Session found, checking user data")

  
        try {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("club_id")
            .eq("auth_id", data.session.user.id)
            .single()

          if (userError) {
            if (userError.code === "PGRST116") {
              console.log("User not found in database, creating new user record")


              const { user } = data.session
              const userData = {
                auth_id: user.id,
                name:
                  user.user_metadata?.name ||
                  user.user_metadata?.full_name ||
                  user.email?.split("@")[0] ||
                  "Hack Club Member",
                email: user.email || "",
                avatar_url: user.user_metadata?.avatar_url,
                role: "leader",
              }

              await supabase.from("users").insert(userData)

              console.log("User created, redirecting to onboarding")
              performDelayedRedirect("/onboarding")
              return
            }
            throw userError
          }

        
          if (!userData || !userData.club_id) {
            console.log("User has no club, redirecting to onboarding")
            performDelayedRedirect("/onboarding")
          } else {
            console.log("User has club, redirecting to dashboard")
            performDelayedRedirect("/dashboard")
          }
        } catch (err) {
          console.error("Error checking user club:", err)
          performDelayedRedirect("/onboarding")
        }
      } catch (err) {
        console.error("Error in auth callback:", err)
        setError(err instanceof Error ? err.message : "Authentication failed")
        setErrorDetails("There was a problem completing the authentication process. Please try again.")
        setIsProcessing(false)

        toast({
          title: "Authentication Error",
          description: err instanceof Error ? err.message : "Failed to complete authentication",
          variant: "destructive",
        })
      }
    }

    handleCallback()
  }, [toast, searchParams])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
        <div className="max-w-md w-full bg-white rounded-lg border border-gold-500 shadow-lg p-6 text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-serif text-navy-700 mb-2">{error}</h2>
          {errorDetails && <p className="text-sm font-mono text-stone-600 mb-4">{errorDetails}</p>}

          <div className="flex justify-center gap-3 mt-6">
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
