"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const supabase = createPagesBrowserClient()

  const handleSlackLogin = async () => {
    setIsLoading(true)
    setError("")

    try {
      console.log("Redirecting to Slack...")

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "slack_oidc",
        options: {
          redirectTo: "https://v0-hack-club-passport-app.vercel.app/auth/callback",
        },
      })

      if (error) throw error

    } catch (err) {
      console.error("Login error:", err)
      setError(err instanceof Error ? err.message : "Failed to sign in with Slack")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
      <Card className="w-full max-w-md border-gold-500 bg-cream">
        <CardHeader>
          <div className="flex items-center mb-2">
            <Button asChild variant="ghost" className="mr-2 h-8 w-8 p-0">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <CardTitle className="text-center font-serif text-navy-700">Welcome to Hack Club</CardTitle>
          </div>
          <CardDescription className="text-center font-mono text-sm">
            Sign in with your Slack account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>
          )}

          <div className="space-y-4">
            <Button
              onClick={handleSlackLogin}
              className="w-full bg-[#4A154B] hover:bg-[#3a1139] text-white font-medium py-3 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting to Slack...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.687 8.834a2.528 2.528 0 0 1-2.521 2.521 2.527 2.527 0 0 1-2.521-2.521V2.522A2.527 2.527 0 0 1 15.166 0a2.528 2.528 0 0 1 2.521 2.522v6.312zM15.166 18.956a2.528 2.528 0 0 1 2.521 2.522A2.528 2.528 0 0 1 15.166 24a2.527 2.527 0 0 1-2.521-2.522v-2.522h2.521zM15.166 17.687a2.527 2.527 0 0 1-2.521-2.521 2.526 2.526 0 0 1 2.521-2.521h6.312A2.527 2.527 0 0 1 24 15.166a2.528 2.528 0 0 1-2.522 2.521h-6.312z" />
                  </svg>
                  Sign in with Slack
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-xs font-mono text-stone-500">
                By signing in, you agree to the{" "}
                <a href="#" className="text-navy-700 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-navy-700 hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
