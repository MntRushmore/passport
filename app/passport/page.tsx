"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, LogOut, Home, Camera, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PassportPage } from "@/components/passport-page"
import { PageTransition } from "@/components/page-transition"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { api, type Workshop, type Submission } from "@/lib/api"

export default function PassportView() {
  const [currentPage, setCurrentPage] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])

  const { user, logout } = useAuth()
  const router = useRouter()

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
          <p className="mt-4 font-mono text-sm text-navy-700">Loading passport...</p>
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

  const goToNextPage = () => {
    if (currentPage < enhancedWorkshops.length - 1 && !transitioning) {
      setTransitioning(true)
      setTimeout(() => {
        setCurrentPage(currentPage + 1)
        setTransitioning(false)
      }, 300)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 0 && !transitioning) {
      setTransitioning(true)
      setTimeout(() => {
        setCurrentPage(currentPage - 1)
        setTransitioning(false)
      }, 300)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center p-4 md:p-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-navy-700 font-serif flex items-center">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>

          <h1 className="text-2xl font-serif font-bold text-navy-700">Food Passport</h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full h-8 w-8 p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="bg-navy-700 text-cream">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center justify-start p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-sm text-navy-700">{user.name}</p>
                  <p className="w-[200px] truncate text-xs text-stone-500">{user.club}</p>
                </div>
              </div>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {enhancedWorkshops.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-md border border-gold-500">
            <div className="mx-auto w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-4">
              <Camera className="h-6 w-6 text-stone-400" />
            </div>
            <h3 className="text-lg font-serif text-navy-700 mb-2">No Workshops Available</h3>
            <p className="text-sm font-mono text-stone-500 max-w-md mx-auto">
              There are no workshops available at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <>
            {/* Passport Navigation */}
            <div className="flex items-center justify-center mb-6 gap-2">
              {enhancedWorkshops.map((workshop, index) => (
                <button
                  key={workshop.id}
                  onClick={() => {
                    if (index !== currentPage && !transitioning) {
                      setTransitioning(true)
                      setTimeout(() => {
                        setCurrentPage(index)
                        setTransitioning(false)
                      }, 300)
                    }
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                    ${
                      index === currentPage
                        ? "bg-navy-700 text-cream border-2 border-gold-500 scale-110"
                        : workshop.completed
                          ? "bg-cream text-navy-700 border border-gold-500"
                          : "bg-stone-200 text-stone-400 border border-stone-300"
                    } transition-all hover:scale-105`}
                  disabled={transitioning}
                  aria-label={`Go to ${workshop.title} workshop`}
                >
                  {workshop.emoji}
                </button>
              ))}
            </div>

            {/* Main Passport Display */}
            <div className="relative">
              <PageTransition currentPage={currentPage}>
                <PassportPage workshop={enhancedWorkshops[currentPage]} />
              </PageTransition>

              {/* Navigation Controls */}
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={goToPrevPage}
                  disabled={currentPage === 0 || transitioning}
                  className="border-gold-500 text-navy-700"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <span className="font-mono text-sm text-navy-700 flex items-center">
                  Page {currentPage + 1} of {enhancedWorkshops.length}
                </span>

                <Button
                  variant="outline"
                  onClick={goToNextPage}
                  disabled={currentPage === enhancedWorkshops.length - 1 || transitioning}
                  className="border-gold-500 text-navy-700"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Action Button */}
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => {
                    router.push(`/submit/${enhancedWorkshops[currentPage].id}`)
                  }}
                  className="bg-navy-700 hover:bg-navy-800 text-cream font-serif"
                >
                  {enhancedWorkshops[currentPage].completed ? (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      View Submission
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Submit Workshop
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
