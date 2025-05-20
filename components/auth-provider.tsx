"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { api, type User } from "@/lib/api"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: User | null
  signInWithSlack: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
  authError: string | null
  clearAuthError: () => void
  debugInfo: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    // Check for existing session
    const loadUser = async () => {
      try {
        const currentUser = await api.getCurrentUser()
        setUser(currentUser)

        // If this is a new user, redirect to onboarding
        if (currentUser?.isNewUser) {
          router.push("/onboarding")
        }
      } catch (error) {
        console.error("Error loading user:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        const currentUser = await api.getCurrentUser()
        setUser(currentUser)

        // If this is a new user, redirect to onboarding
        if (currentUser?.isNewUser) {
          router.push("/onboarding")
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const signInWithSlack = async () => {
    setIsLoading(true)
    setAuthError(null)
    setDebugInfo(null)

    try {
      // Get the current origin for debugging
      const origin = window.location.origin
      setDebugInfo(`Origin: ${origin}`)

      await api.signInWithSlack()
      // Note: User will be set by the auth state change listener after redirect
    } catch (error) {
      console.error("Slack sign in error:", error)
      setIsLoading(false)

      // Check for specific provider not enabled error
      if (error instanceof Error && error.message.includes("provider is not enabled")) {
        setAuthError(
          "Slack authentication is not enabled. Please use email login or contact the administrator to enable Slack authentication.",
        )
      } else if (error instanceof Error && error.message.includes("content is blocked")) {
        setAuthError(
          "The authentication redirect was blocked. This may be due to Content Security Policy settings. Please try email login or contact the administrator.",
        )
        // Add more debug info
        setDebugInfo(
          `Error: ${error.message}. This typically happens when the redirect URL is not properly configured or is being blocked by browser security settings.`,
        )
      } else {
        setAuthError(error instanceof Error ? error.message : "Authentication failed")
      }
      throw error
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true)
    setAuthError(null)
    try {
      await api.signInWithEmail(email, password)
    } catch (error) {
      console.error("Email sign in error:", error)
      setAuthError(error instanceof Error ? error.message : "Authentication failed")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    setAuthError(null)
    try {
      await api.signUpWithEmail(email, password, name)
    } catch (error) {
      console.error("Email sign up error:", error)
      setAuthError(error instanceof Error ? error.message : "Registration failed")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      await api.signOut()
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearAuthError = () => {
    setAuthError(null)
    setDebugInfo(null)
  }

  const value = {
    user,
    signInWithSlack,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    isAuthenticated: !!user,
    isLoading,
    authError,
    clearAuthError,
    debugInfo,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
