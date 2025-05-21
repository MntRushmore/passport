"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getSupabase } from "@/lib/supabase-simple"
import { LogOut, Loader2 } from "lucide-react"

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      const supabase = getSupabase()
      await supabase.auth.signOut()

      // Force a hard navigation to home
      window.location.href = "/"
    } catch (error) {
      console.error("Sign out error:", error)
      alert("Failed to sign out. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleSignOut} variant="ghost" size="sm" disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </>
      )}
    </Button>
  )
}
