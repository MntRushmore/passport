"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, CheckCircle, Camera, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { api, apiHandler, type Workshop, type Submission } from "@/lib/api"

export default function SubmitWorkshopPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const workshopId = params.workshop as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [eventCode, setEventCode] = useState("")
  const [notes, setNotes] = useState("")
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push("/")
      return
    }

    // Load workshop and check for existing submission
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Load workshop
        const workshopData = await api.getWorkshop(workshopId)
        setWorkshop(workshopData)

        // Load submissions to check if this workshop is already submitted
        const submissions = await api.getSubmissions()
        const submission = submissions.find((s) => s.workshopId === workshopId && s.clubId === user.clubId)

        if (submission) {
          setExistingSubmission(submission)
          setEventCode(submission.eventCode)
          setNotes(submission.notes || "")
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load workshop data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, router, workshopId, toast])

  if (!user) {
    return null // Don't render anything while redirecting
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-navy-700 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 font-mono text-sm text-navy-700">Loading workshop...</p>
        </div>
      </div>
    )
  }

  if (!workshop) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md border-gold-500 bg-cream">
          <CardContent className="pt-6">
            <p className="text-center font-serif text-navy-700">Workshop not found</p>
            <div className="flex justify-center mt-4">
              <Button asChild className="bg-navy-700 hover:bg-navy-800 text-cream font-serif">
                <Link href="/passport">Back to Passport</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate event code
    if (!eventCode.trim()) {
      toast({
        title: "Event Code Required",
        description: "Please enter the workshop event code provided by Hack Club.",
        variant: "destructive",
      })
      return
    }

    // Validate photo upload if this is a new submission
    if (!existingSubmission && !fileName) {
      toast({
        title: "Photo Required",
        description: "Please upload a photo of your workshop.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create submission data
      const submissionData = {
        workshopId: workshop.id,
        clubId: user.clubId!,
        userId: user.id,
        eventCode: eventCode,
        photoUrl: fileName || "existing-photo.jpg", // In a real app, we'd upload the file
        notes: notes,
      }

      // Submit to API
      await apiHandler(() => api.createSubmission(submissionData), {
        loadingMessage: "Submitting workshop...",
        successMessage: "Workshop submitted successfully!",
        errorMessage: "Failed to submit workshop",
        toast,
      })

      // Show success state
      setIsSuccess(true)

      // Redirect after a delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Submission error:", error)
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md border-gold-500 bg-cream">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-serif text-navy-700 mb-2">Submission Complete!</h2>
            <p className="font-mono text-sm text-stone-600 mb-6">
              Your {workshop.title} workshop has been successfully submitted.
            </p>
            <div className="flex justify-center">
              <Button asChild className="bg-navy-700 hover:bg-navy-800 text-cream font-serif">
                <Link href="/dashboard">Return to Dashboard</Link>
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
        <div className="flex justify-between items-center mb-4">
          <Button asChild variant="ghost" className="text-navy-700">
            <Link href="/passport" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Passport
            </Link>
          </Button>
          <h1 className="text-2xl font-serif font-bold text-navy-700">
            {existingSubmission ? "View Submission" : "Submit Workshop"}
          </h1>
          <div className="w-[100px]"></div>
        </div>

        <Card className="border-gold-500 bg-cream mb-6 overflow-hidden">
          <CardHeader className="navy-header pb-2">
            <CardTitle className="text-cream font-serif text-lg flex items-center">
              <span className="mr-2">{workshop.emoji}</span> {workshop.title} Workshop
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="font-mono text-sm text-stone-700 mb-6 leading-relaxed">{workshop.description}</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="clubName" className="font-serif text-navy-700">
                  Club Name
                </Label>
                <Input
                  id="clubName"
                  defaultValue={user.clubName || ""}
                  className="border-gold-500 bg-white font-mono text-sm"
                  required
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leaderName" className="font-serif text-navy-700">
                  Club Leader
                </Label>
                <Input
                  id="leaderName"
                  defaultValue={user.name}
                  className="border-gold-500 bg-white font-mono text-sm"
                  required
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventCode" className="font-serif text-navy-700">
                  Workshop Event Code
                </Label>
                <Input
                  id="eventCode"
                  value={eventCode}
                  onChange={(e) => setEventCode(e.target.value)}
                  placeholder="Enter the event code (e.g. GLAZE-123)"
                  className="border-gold-500 bg-white font-mono text-sm"
                  required
                  disabled={!!existingSubmission}
                />
                <p className="text-xs font-mono text-stone-500 mt-1">Enter the event code provided for this workshop</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="font-serif text-navy-700">
                  Workshop Photo
                </Label>
                {existingSubmission ? (
                  <div className="border border-gold-500 rounded-md p-4 bg-white">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-stone-200 rounded mr-3 flex items-center justify-center text-xs">
                        <span className="text-2xl">{workshop.emoji}</span>
                      </div>
                      <div>
                        <p className="text-navy-700 font-medium">workshop-photo.jpg</p>
                        <p className="text-xs text-stone-500 mt-1">
                          Uploaded {new Date(existingSubmission.submissionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gold-500 rounded-md p-6 text-center bg-white">
                    <Camera className="h-8 w-8 mx-auto text-navy-700 mb-2" />
                    <p className="font-mono text-xs text-stone-600 mb-2">
                      {fileName ? fileName : "Take a photo of your workshop and upload it here"}
                    </p>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      required={!existingSubmission}
                      onChange={handleFileChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-gold-500 text-navy-700 font-mono text-xs"
                      onClick={() => document.getElementById("image")?.click()}
                    >
                      {fileName ? "Change Photo" : "Upload Photo"}
                    </Button>
                  </div>
                )}
                <p className="text-xs font-mono text-stone-500 mt-1">
                  Please include your club members in the photo if possible
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="font-serif text-navy-700">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share any additional information about your workshop experience"
                  className="border-gold-500 bg-white font-mono text-sm min-h-[100px]"
                  disabled={!!existingSubmission}
                />
              </div>

              {!existingSubmission && (
                <Button
                  type="submit"
                  className="w-full bg-navy-700 hover:bg-navy-800 text-cream font-serif py-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Workshop"
                  )}
                </Button>
              )}

              {existingSubmission && (
                <div className="flex justify-center">
                  <Button asChild className="bg-navy-700 hover:bg-navy-800 text-cream font-serif">
                    <Link href="/passport">Return to Passport</Link>
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
