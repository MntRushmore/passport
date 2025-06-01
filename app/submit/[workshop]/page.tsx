/* eslint-disable */
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, CheckCircle, Camera } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

const workshopData = {
  glaze: {
    title: "Glaze",
    emoji: "🍩",
    description: "Create a delicious donut-themed web app with interactive glazing features.",
  },
  grub: {
    title: "Grub",
    emoji: "🍟",
    description: "Build a fast food ordering system with real-time updates and notifications.",
  },
  boba: {
    title: "Boba Drops",
    emoji: "🧋",
    description: "Design a bubble tea customization app with drag-and-drop functionality.",
  },
  swirl: {
    title: "Toppings",
    emoji: "🍦",
    description: "Create an ice cream shop simulator with flavor mixing and topping options.",
  },
}

export default function SubmitWorkshopPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const workshopId = params.workshop as string
  const workshop = workshopData[workshopId as keyof typeof workshopData]

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [eventCode, setEventCode] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  if (!user) {
    return null // Don't render anything while redirecting
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
    e.preventDefault();

    if (!eventCode.trim()) {
      toast({
        title: "Event Code Required",
        description: "Please enter the workshop event code provided by Hack Club.",
        variant: "destructive",
      });
      return;
    }

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast({
        title: "Photo Required",
        description: "Please upload a photo of your workshop.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("eventCode", eventCode);
      formData.append("clubName", user.club?.name || "");
      formData.append("leaderName", user.name);
      formData.append("photo", file);
      formData.append("workshopSlug", workshopId);

      const response = await fetch("/api/workshop", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      setIsSuccess(true);
      toast({
        title: "Workshop Submitted!",
        description: `Your ${workshop.title} workshop has been successfully submitted.`,
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your workshop. Please try again.",
        variant: "destructive",
      });
    }
  };

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
          <h1 className="text-2xl font-serif font-bold text-navy-700">Submit Workshop</h1>
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
                  defaultValue={user.club?.name}
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
                />
                <p className="text-xs font-mono text-stone-500 mt-1">Enter the event code provided for this workshop</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="font-serif text-navy-700">
                  Upload Workshop Photo
                </Label>
                <div className="border-2 border-dashed border-gold-500 rounded-md p-6 text-center bg-white">
                  <Camera className="h-8 w-8 mx-auto text-navy-700 mb-2" />
                  <p className="font-mono text-xs text-stone-600 mb-2">
                    {fileName ? fileName : "Take a photo of your workshop and upload it here"}
                  </p>
                  <Input
                    id="image"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    required
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
                  placeholder="Share any additional information about your workshop experience"
                  className="border-gold-500 bg-white font-mono text-sm min-h-[100px]"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-navy-700 hover:bg-navy-800 text-cream font-serif py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Workshop"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
