"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { LoadingScreen } from "@/components/loading-screen"

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      try {
        const hasSessionCookie = document.cookie
          .split("; ")
          .some((cookie) => cookie.startsWith("session="))

        if (!hasSessionCookie) {
          window.location.href = "/login"
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Auth check error:", error)
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