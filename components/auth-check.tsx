"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase-simple"
import { LoadingScreen } from "@/components/loading-screen"

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = getSupabase()
        const { data } = await supabase.auth.getSession()

        if (!data.session) {
          // No session, redirect to login
          window.location.href = "/login"
          return
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Auth check error:", error)
        // On error, redirect to login
        window.location.href = "/login"
      }
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />
  }

  return <>{children}</>
}
