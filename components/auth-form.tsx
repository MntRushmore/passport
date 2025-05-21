"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { initiateSlackAuth, performCompleteSignOut } from "@/lib/auth-handler"

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const { authError, clearAuthError, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    setIsLoading(authLoading)
  }, [authLoading])

  const handleSlackSignIn = async () => {
    setFormError(null)
    clearAuthError()
    setIsLoading(true)

    try {
      // Use our simplified auth handler
      await initiateSlackAuth()

      // The user will be redirected to Slack for authentication
    } catch (error) {
      console.error("Sign in error:", error)
      setFormError(error instanceof Error ? error.message : "Authentication failed")
      setIsLoading(false)
    }
  }

  const handleClearAllAuth = async () => {
    if (typeof window !== "undefined" && window.confirm("This will clear all authentication data. Continue?")) {
      await performCompleteSignOut()
    }
  }

  return (
    <Card className="w-full border-gold-500 bg-cream">
      <CardHeader>
        <CardTitle className="text-center font-serif text-navy-700">Welcome to Hack Club</CardTitle>
        <CardDescription className="text-center font-mono text-sm">
          Sign in with your Slack account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(authError || formError) && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError || formError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Button
            onClick={handleSlackSignIn}
            className="w-full bg-[#4A154B] hover:bg-[#3a1139] text-white font-medium py-3 flex items-center justify-center"
            disabled={isLoading || authLoading}
          >
            {isLoading || authLoading ? (
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
        </div>
      </CardContent>
      <CardFooter className="flex flex-col">
        <p className="text-xs font-mono text-stone-500 text-center">
          By signing in, you agree to the{" "}
          <a href="#" className="text-navy-700 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-navy-700 hover:underline">
            Privacy Policy
          </a>
        </p>
        <Button onClick={handleClearAllAuth} variant="outline" size="sm" className="mt-4 text-xs">
          Clear All Auth Data
        </Button>
      </CardFooter>
    </Card>
  )
}
