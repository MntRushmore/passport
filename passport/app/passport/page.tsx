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

// Enhanced workshop data
const workshops = [
  {
    id: "glaze",
    title: "Glaze",
    emoji: "🍩",
    description:
      "Create a delicious donut-themed web app with interactive glazing features and custom toppings. Learn about CSS animations and interactive elements.",
    completed: true,
    submissionDate: "2023-04-15",
    eventCode: "GLAZE-123",
    difficulty: "beginner",
    duration: "1-2 hours",
    skills: ["CSS", "JavaScript", "Animation"],
  },
  {
    id: "grub",
    title: "Grub",
    emoji: "🍟",
    description:
      "Build a fast food ordering system with real-time updates and notifications. Explore state management and form handling in web applications.",
    completed: false,
    submissionDate: null,
    eventCode: null,
    difficulty: "intermediate",
    duration: "2-3 hours",
    skills: ["React", "State Management", "Forms"],
  },
  {
    id: "boba",
    title: "Boba Drops",
    emoji: "🧋",
    description:
      "Design a bubble tea customization app with drag-and-drop functionality. Learn about advanced UI interactions and custom animations.",
    completed: false,
    submissionDate: null,
    eventCode: null,
    difficulty: "intermediate",
    duration: "2-3 hours",
    skills: ["Drag & Drop", "UI Design", "JavaScript"],
  },
  {
    id: "swirl",
    title: "Swirl",
    emoji: "🍦",
    description:
      "Create an ice cream shop simulator with flavor mixing and topping options. Dive into color theory and dynamic content generation.",
    completed: true,
    submissionDate: "2023-05-02",
    eventCode: "SWIRL-456",
    difficulty: "advanced",
    duration: "3-4 hours",
    skills: ["Canvas API", "Color Theory", "JavaScript"],
  },
]

export default function PassportView() {
  const [currentPage, setCurrentPage] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  if (!user) {
    return null // Don't render anything while redirecting
  }

  const goToNextPage = () => {
    if (currentPage < workshops.length - 1 && !transitioning) {
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

        {/* Passport Navigation */}
        <div className="flex items-center justify-center mb-6 gap-2">
          {workshops.map((workshop, index) => (
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
            <PassportPage workshop={workshops[currentPage]} />
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
              Page {currentPage + 1} of {workshops.length}
            </span>

            <Button
              variant="outline"
              onClick={goToNextPage}
              disabled={currentPage === workshops.length - 1 || transitioning}
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
                console.log(`Navigating to /submit/${workshops[currentPage].id}`)
                router.push(`/submit/${workshops[currentPage].id}`)
              }}
              className="bg-navy-700 hover:bg-navy-800 text-cream font-serif"
            >
              {workshops[currentPage].completed ? (
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
      </div>
    </div>
  )
}
