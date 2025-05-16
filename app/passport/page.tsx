"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { CSSTransition, TransitionGroup } from "react-transition-group"
import { WorkshopPage } from "@/components/workshop-page"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
  },
]

export default function PassportPage() {
  const [currentPage, setCurrentPage] = useState(0)
  const [direction, setDirection] = useState("forward")
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
    if (currentPage < workshops.length - 1) {
      setDirection("forward")
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setDirection("backward")
      setCurrentPage(currentPage - 1)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-navy-700 font-serif">
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

        <div className="relative">
          <TransitionGroup className="relative">
            <CSSTransition
              key={currentPage}
              timeout={600}
              classNames={direction === "forward" ? "page-flip" : "page-flip-reverse"}
            >
              <Card className="passport-page w-full aspect-[3/4] overflow-hidden shadow-passport">
                <div className="passport-binding"></div>
                <div className="passport-watermark">HACK CLUB</div>
                <div className="passport-corner passport-corner-tl"></div>
                <div className="passport-corner passport-corner-tr"></div>
                <div className="passport-corner passport-corner-bl"></div>
                <div className="passport-corner passport-corner-br"></div>
                <WorkshopPage workshop={workshops[currentPage]} />
                <div className="passport-page-number">{currentPage + 1}</div>
              </Card>
            </CSSTransition>
          </TransitionGroup>

          <div className="absolute bottom-4 left-0 right-0 flex justify-between px-4">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevPage}
              disabled={currentPage === 0}
              className="bg-cream border-gold-500 text-navy-700 z-10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-mono text-xs text-navy-700 bg-cream px-2 py-1 rounded border border-gold-500 z-10">
              {currentPage + 1} / {workshops.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextPage}
              disabled={currentPage === workshops.length - 1}
              className="bg-cream border-gold-500 text-navy-700 z-10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button asChild className="bg-navy-700 hover:bg-navy-800 text-cream font-serif">
            <Link href={`/submit/${workshops[currentPage].id}`}>
              {workshops[currentPage].completed ? "Update Submission" : "Submit Workshop"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
