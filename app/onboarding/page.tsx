"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { api, apiHandler } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, CheckCircle, MapPin, Info, Users } from "lucide-react"

export default function OnboardingPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [clubName, setClubName] = useState("")
  const [clubLocation, setClubLocation] = useState("")
  const [clubDescription, setClubDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [isComplete, setIsComplete] = useState(false)

  // Redirect if user is already authenticated and has a club
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/")
      } else if (user.clubId && !user.isNewUser) {
        router.push("/dashboard")
      }
    }
  }, [user, authLoading, router])

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clubName.trim()) {
      toast({
        title: "Club name required",
        description: "Please enter a name for your club",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a club",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await apiHandler(
        () =>
          api.createClub({
            name: clubName,
            location: clubLocation,
            description: clubDescription,
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            userAvatar: user.avatar || undefined,
          }),
        {
          loadingMessage: "Creating your club...",
          successMessage: "Club created successfully!",
          errorMessage: "Failed to create club",
          toast,
        },
      )

      // Show success state
      setIsComplete(true)

      // Redirect after a delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Club creation error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-navy-700 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 font-mono text-sm text-navy-700">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to home
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md border-gold-500 bg-cream">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-serif text-navy-700 mb-2">Welcome to Hack Club!</h2>
            <p className="font-mono text-sm text-stone-600 mb-6">
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
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-serif font-bold text-navy-800">Welcome to Hack Club</h1>
          <p className="mt-2 text-stone-600 font-mono text-sm">Let's set up your club to get started</p>
        </div>

        <Card className="border-gold-500 bg-cream mb-6 overflow-hidden">
          <CardHeader className="navy-header pb-2">
            <CardTitle className="text-cream font-serif text-lg">Create Your Club</CardTitle>
            <CardDescription className="text-cream/80 font-mono text-xs">
              Step {step} of 2: {step === 1 ? "Club Details" : "Club Profile"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleCreateClub} className="space-y-6">
              {step === 1 ? (
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
                        placeholder="City, State, Country"
                        className="border-gold-500 bg-white font-mono text-sm pl-10"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      className="bg-navy-700 hover:bg-navy-800 text-cream font-serif"
                      onClick={() => setStep(2)}
                    >
                      Next Step
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16 border-2 border-gold-500">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-navy-700 text-cream text-xl">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div>
                      <h2 className="font-serif text-navy-700 text-xl">{user.name}</h2>
                      <p className="font-mono text-sm text-stone-600">Club Leader</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clubDescription" className="font-serif text-navy-700 flex items-center">
                      <Info className="h-4 w-4 mr-1" /> About Your Club
                    </Label>
                    <Textarea
                      id="clubDescription"
                      value={clubDescription}
                      onChange={(e) => setClubDescription(e.target.value)}
                      placeholder="Tell us about your club, its mission, and what you hope to achieve..."
                      className="border-gold-500 bg-white font-mono text-sm min-h-[120px]"
                    />
                  </div>

                  <div className="bg-stone-50 p-4 rounded-md border border-gold-500 mb-4">
                    <div className="flex items-center mb-2">
                      <Users className="h-4 w-4 text-navy-700 mr-2" />
                      <h3 className="font-serif text-navy-700 text-sm">Club Members</h3>
                    </div>
                    <p className="font-mono text-xs text-stone-600">
                      You'll be able to add members to your club after setup. As the creator, you're automatically the
                      club leader.
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gold-500 text-navy-700 font-serif"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="bg-navy-700 hover:bg-navy-800 text-cream font-serif"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Club...
                        </>
                      ) : (
                        "Create Club"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-xs font-mono text-stone-500">
          <p>
            By creating a club, you agree to the{" "}
            <a href="#" className="text-navy-700 underline">
              Hack Club Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
