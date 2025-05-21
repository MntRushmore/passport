"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Award, Clock, ChevronRight } from "lucide-react"
import { api, type Workshop, type Submission } from "@/lib/api"
import { SignOutButton } from "@/components/sign-out-button"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push("/")
      return
    }

    // Load data
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Load workshops
        const workshopsData = await api.getWorkshops()
        setWorkshops(workshopsData)

        // Load submissions
        const submissionsData = await api.getSubmissions()
        // Filter submissions for current user's club
        const userSubmissions = submissionsData.filter((s) => s.clubId === user.clubId)
        setSubmissions(userSubmissions)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, router])

  if (!user) {
    return null // Don't render anything while redirecting
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-navy-700 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 font-mono text-sm text-navy-700">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Enhance workshops with completion status
  const enhancedWorkshops = workshops.map((workshop) => {
    const submission = submissions.find((s) => s.workshopId === workshop.id)
    return {
      ...workshop,
      completed: !!submission,
      submissionDate: submission?.submissionDate || null,
      eventCode: submission?.eventCode || null,
    }
  })

  const completedCount = enhancedWorkshops.filter((w) => w.completed).length
  const progressPercentage = (completedCount / enhancedWorkshops.length) * 100

  // Get the most recent submission
  const lastSubmission =
    submissions.length > 0
      ? submissions.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime())[0]
      : null

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center p-4 md:p-8">
      <div className="max-w-4xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-serif font-bold text-navy-700">Dashboard</h1>

          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 border-2 border-gold-500">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="bg-navy-700 text-cream text-xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <SignOutButton />
          </div>
        </div>

        <div className="mb-6">
          <Card className="border-gold-500 bg-cream overflow-hidden">
            <CardHeader className="navy-header pb-2">
              <CardTitle className="text-cream font-serif text-lg">Club Profile</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-gold-500">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="bg-navy-700 text-cream text-xl">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div>
                  <h2 className="font-serif text-navy-700 text-xl">{user.club}</h2>
                  <p className="font-mono text-sm text-stone-600">Leader: {user.name}</p>
                  <div className="mt-2">
                    {completedCount >= 3 ? (
                      <Badge className="bg-gold-500 text-navy-800 font-mono text-xs">GOLD STATUS</Badge>
                    ) : completedCount >= 1 ? (
                      <Badge className="bg-navy-700 text-cream font-mono text-xs">ACTIVE</Badge>
                    ) : (
                      <Badge variant="outline" className="border-navy-700 text-navy-700 font-mono text-xs">
                        NEW
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="ml-auto text-right">
                  <div className="font-mono text-sm text-navy-700">
                    <span className="text-3xl font-bold">{completedCount}</span>
                    <span className="text-stone-600">/{enhancedWorkshops.length}</span>
                  </div>
                  <p className="font-mono text-xs text-stone-600">workshops completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="border-gold-500 bg-cream">
            <CardHeader className="navy-header pb-2">
              <CardTitle className="text-cream font-serif text-lg flex items-center">
                <Award className="mr-2 h-4 w-4" /> Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Progress value={progressPercentage} className="h-3 bg-stone-200" />
              <p className="text-xs font-mono mt-3 text-stone-600">
                {completedCount === enhancedWorkshops.length
                  ? "All workshops completed!"
                  : `${enhancedWorkshops.length - completedCount} workshops remaining`}
              </p>

              <div className="mt-4 pt-4 border-t border-gold-500">
                <div className="grid grid-cols-4 gap-2">
                  {enhancedWorkshops.map((workshop) => (
                    <div
                      key={workshop.id}
                      className={`flex items-center justify-center aspect-square rounded-full text-2xl
                        ${
                          workshop.completed
                            ? "bg-navy-700 text-cream border-2 border-gold-500"
                            : "bg-stone-200 text-stone-400 border border-stone-300"
                        }`}
                    >
                      {workshop.emoji}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gold-500 bg-cream">
            <CardHeader className="navy-header pb-2">
              <CardTitle className="text-cream font-serif text-lg flex items-center">
                <Clock className="mr-2 h-4 w-4" /> Last Submission
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {lastSubmission ? (
                <div className="font-mono">
                  <div className="flex items-center mb-3">
                    <span className="text-3xl mr-3">
                      {enhancedWorkshops.find((w) => w.id === lastSubmission.workshopId)?.emoji || "🍽️"}
                    </span>
                    <span className="text-navy-700 font-serif text-lg">{lastSubmission.workshopTitle}</span>
                  </div>
                  <div className="bg-white p-3 rounded border border-gold-500">
                    <p className="text-xs text-stone-600 flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      Submitted on {new Date(lastSubmission.submissionDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-mono text-stone-600">No submissions yet</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-gold-500 bg-cream">
            <CardHeader className="navy-header pb-2">
              <CardTitle className="text-cream font-serif text-lg">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="font-mono">
                {completedCount < enhancedWorkshops.length ? (
                  <div>
                    <p className="text-sm text-navy-700 mb-3">Continue your journey:</p>
                    {enhancedWorkshops
                      .filter((w) => !w.completed)
                      .slice(0, 2)
                      .map((workshop) => (
                        <Link
                          key={workshop.id}
                          href={`/submit/${workshop.id}`}
                          className="flex items-center justify-between p-3 bg-white rounded border border-gold-500 mb-2 hover:bg-stone-50 transition-colors"
                        >
                          <div className="flex items-center">
                            <span className="text-xl mr-2">{workshop.emoji}</span>
                            <span className="text-navy-700">{workshop.title}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-navy-700" />
                        </Link>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-lg text-navy-700 font-serif mb-2">Congratulations!</p>
                    <p className="text-sm text-stone-600">You've completed all workshops</p>
                    <div className="text-3xl mt-2">🎉</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-gold-500 bg-cream mb-6">
          <CardHeader className="navy-header pb-2">
            <CardTitle className="text-cream font-serif text-lg">Workshop Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {enhancedWorkshops.map((workshop) => (
                <div
                  key={workshop.id}
                  className="border border-gold-500 rounded-md p-4 bg-white relative overflow-hidden"
                >
                  {workshop.completed && (
                    <div className="absolute top-0 right-0 w-16 h-16">
                      <div className="absolute transform rotate-45 bg-navy-700 text-xs text-cream font-mono py-1 text-center w-24 top-3 right-[-30px]">
                        COMPLETED
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <span className="text-3xl mr-2">{workshop.emoji}</span>
                      <span className="font-serif text-navy-700 text-lg">{workshop.title}</span>
                    </div>
                  </div>
                  {workshop.completed ? (
                    <p className="text-xs font-mono text-stone-600 mb-3">
                      Completed on {new Date(workshop.submissionDate!).toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="text-xs font-mono text-stone-600 mb-3">Workshop not yet completed</p>
                  )}
                  <Button
                    asChild
                    size="sm"
                    className={`w-full ${
                      workshop.completed
                        ? "bg-stone-100 hover:bg-stone-200 text-navy-700"
                        : "bg-navy-700 hover:bg-navy-800 text-cream"
                    } font-serif text-xs`}
                  >
                    <Link href={`/submit/${workshop.id}`}>
                      {workshop.completed ? "View Submission" : "Submit Workshop"}
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {user.role === "admin" && (
          <div className="flex justify-center">
            <Button asChild className="bg-navy-700 hover:bg-navy-800 text-cream font-serif">
              <Link href="/admin">Admin Dashboard</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
