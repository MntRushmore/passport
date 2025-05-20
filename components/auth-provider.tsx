"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { api, type User } from "@/lib/api"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: User | null
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
  authError: string | null
  clearAuthError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    // Check for existing session
    const loadUser = async () => {
      try {
        // First check if we have a session
        const { data: sessionData } = await supabase.auth.getSession()

        if (!sessionData.session) {
          setUser(null)
          setIsLoading(false)
          return
        }

        const currentUser = await api.getCurrentUser()
        setUser(currentUser)

        // If this is a new user, redirect to onboarding
        if (currentUser?.isNewUser) {
          console.log("New user detected, redirecting to onboarding")
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
      console.log("Auth state changed:", event, session?.user?.email)

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        try {
          const currentUser = await api.getCurrentUser()
          setUser(currentUser)

          // If this is a new user, redirect to onboarding
          if (currentUser?.isNewUser) {
            console.log("New user detected after auth change, redirecting to onboarding")
            router.push("/onboarding")
          } else if (currentUser && !window.location.pathname.includes("/dashboard")) {
            router.push("/dashboard")
          }
        } catch (error) {
          console.error("Error getting user after auth change:", error)
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        router.push("/")
      }
    })

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true)
    setAuthError(null)
    try {
      await api.signInWithEmail(email, password)
      // The auth state change listener will handle the redirect
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
  }

  const value = {
    user,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    isAuthenticated: !!user,
    isLoading,
    authError,
    clearAuthError,
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
