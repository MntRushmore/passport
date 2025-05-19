"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { api, type User } from "@/lib/api"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: User | null
  signInWithSlack: () => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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
    try {
      await api.signInWithSlack()
      // Note: User will be set by the auth state change listener after redirect
    } catch (error) {
      console.error("Slack sign in error:", error)
      setIsLoading(false)
      throw error
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

  const value = {
    user,
    signInWithSlack,
    signOut,
    isAuthenticated: !!user,
    isLoading,
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
