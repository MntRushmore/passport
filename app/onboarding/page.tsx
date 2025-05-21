"use client"

import type React from "react"
import { getSupabase } from "@/lib/supabase-simple"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { LoadingScreen } from "@/components/loading-screen"
import { CheckCircle, MapPin, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function OnboardingPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [progress, setProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [clubName, setClubName] = useState("")
  const [clubLocation, setClubLocation] = useState("")
  const [clubDescription, setClubDescription] = useState("")
  const [leaderName, setLeaderName] = useState("")
  const [leaderEmail, setLeaderEmail] = useState("")

  useEffect(() => {
    if (user) {
      setLeaderName(user.name || "")
      setLeaderEmail(user.email || "")
    }
  }, [user])

  useEffect(() => {
    setProgress(Math.min(100, (step / 3) * 100))
  }, [step])

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        console.log("No user, redirecting to home")
        router.push("/")
      } else if (user.clubId && !user.isNewUser) {
        console.log("User already has a club, redirecting to dashboard")
        router.push("/dashboard")
      }
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (!clubName.trim()) {
        throw new Error("Club name is required")
      }

      if (!user) {
        throw new Error("You must be signed in to create a club")
      }

      // Check if we have a valid session before proceeding
      const supabase = getSupabase()
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Session error:", sessionError)
        throw new Error("Authentication error: " + sessionError.message)
      }

      if (!sessionData.session) {
        console.error("No active session")
        throw new Error("No active session. Please sign in again.")
      }

      console.log("Creating club with session:", sessionData.session.user.id)

      const clubData = {
        name: clubName,
        location: clubLocation,
        description: clubDescription,
        userId: user.id,
        userName: leaderName || user.name,
        userEmail: leaderEmail || user.email,
        userAvatar: user.avatar,
      }

      // Add auth token to the request
      const response = await fetch("/api/clubs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify(clubData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Club creation API error:", errorData)
        throw new Error(errorData.message || "Failed to create club")
      }

      setIsComplete(true)
      toast({
        title: "Club created successfully!",
        description: "You're now ready to start your food passport journey.",
      })

      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Club creation error:", error)
      setError(error instanceof Error ? error.message : "Failed to create club")
      toast({
        title: "Error creating club",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToNextStep = () => {
    if (step === 1 && !clubName.trim()) {
      toast({
        title: "Club name required",
        description: "Please enter a name for your club",
        variant: "destructive",
      })
      return
    }

    setStep(Math.min(3, step + 1))
  }

  const goToPreviousStep = () => {
    setStep(Math.max(1, step - 1))
  }

  if (authLoading) {
    return <LoadingScreen message="Loading your profile..." />
  }

  if (!user) {
    return <LoadingScreen message="Please sign in to continue..." />
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md border-gold-500 bg-cream">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-serif text-navy-700 mb-2">Welcome to Hack Club!</h2>
            <p className="mt-2 text-stone-600 font-mono text-sm">
              Your club has been created successfully. You're now ready to start your food passport journey!
            </p>
            <div className="flex justify-center">
              <Button
                className="bg-navy-700 hover:bg-navy-800 text-cream font-serif"
                onClick={() => router.push("/dashboard")}
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center p-4 md:p-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-serif font-bold text-navy-800">Welcome to Hack Club</h1>
          <p className="mt-2 text-stone-600 font-mono text-sm">Let's set up your club to get started</p>
        </div>

        <div className="mb-6">
          <Progress value={progress} className="h-2 bg-stone-200" indicatorClassName="bg-navy-700" />
          <div className="flex justify-between mt-2">
            <span className="text-xs font-mono text-stone-600">Step {step} of 3</span>
            <span className="text-xs font-mono text-stone-600">{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="border-gold-500 bg-cream mb-6 overflow-hidden">
          <CardHeader className="navy-header pb-2">
            <CardTitle className="text-cream font-serif text-lg">
              {step === 1 ? "Club Details" : step === 2 ? "Club Profile" : "Club Leader"}
            </CardTitle>
            <CardDescription className="text-cream/80 font-mono text-xs">
              {step === 1
                ? "Basic information about your club"
                : step === 2
                  ? "Tell us more about your club"
                  : "Confirm your information"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="clubName" className="font-serif text-navy-700">
                      Club Name*
                    </Label>
                    <Input
                      id="clubName"
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                      placeholder="Enter your club name"
                      className="border-gold-500 bg-white font-mono text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clubLocation" className="font-serif text-navy-700">
                      Location
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                      <Input
                        id="clubLocation"
                        value={clubLocation}
                        onChange={(e) => setClubLocation(e.target.value)}
                        placeholder="Enter your club location"
                        className="border-gold-500 bg-white font-mono text-sm pl-8"
                      />
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="clubDescription" className="font-serif text-navy-700">
                      Club Description
                    </Label>
                    <Textarea
                      id="clubDescription"
                      value={clubDescription}
                      onChange={(e) => setClubDescription(e.target.value)}
                      placeholder="Tell us about your club"
                      className="border-gold-500 bg-white font-mono text-sm"
                      required
                    />
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="leaderName" className="font-serif text-navy-700">
                      Leader Name
                    </Label>
                    <Input
                      id="leaderName"
                      value={leaderName}
                      onChange={(e) => setLeaderName(e.target.value)}
                      placeholder="Enter your name"
                      className="border-gold-500 bg-white font-mono text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leaderEmail" className="font-serif text-navy-700">
                      Leader Email
                    </Label>
                    <Input
                      id="leaderEmail"
                      value={leaderEmail}
                      onChange={(e) => setLeaderEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="border-gold-500 bg-white font-mono text-sm"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex justify-between">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={goToPreviousStep}
                    className="bg-navy-700 hover:bg-navy-800 text-cream font-serif"
                  >
                    Previous
                  </Button>
                )}
                {step < 3 && (
                  <Button
                    type="button"
                    onClick={goToNextStep}
                    className="bg-navy-700 hover:bg-navy-800 text-cream font-serif"
                  >
                    Next
                  </Button>
                )}
                {step === 3 && (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-navy-700 hover:bg-navy-800 text-cream font-serif"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
