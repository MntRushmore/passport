"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Slack } from "lucide-react"

export function LoginButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleLogin = async () => {
    setIsLoading(true)

    // Simulate Slack authentication
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Call the login function from auth context
    login({
      id: "user123",
      name: "Alex Chen",
      club: { name: "Coding Chefs", clubCode: "chefs001" },
      email: "alex@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    })

    setIsLoading(false)
    router.push("/passport")
  }

  return (
    <Button
      onClick={handleLogin}
      disabled={isLoading}
      className="bg-[#4A154B] hover:bg-[#3e1240] text-white font-mono text-sm py-6 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,_rgba(255,255,255,0)_0%,_rgba(255,255,255,0.1)_50%,_rgba(255,255,255,0)_100%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      <Slack className="mr-2 h-5 w-5" />
      {isLoading ? "Authenticating..." : "Sign in with Slack"}
    </Button>
  )
}
