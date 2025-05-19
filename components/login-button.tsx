"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Slack } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function LoginButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { signInWithSlack } = useAuth()
  const { toast } = useToast()

  const handleLogin = async () => {
    setIsLoading(true)

    try {
      await signInWithSlack()
      // The redirect will happen automatically via the OAuth flow
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
      setIsLoading(false)
    }
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
