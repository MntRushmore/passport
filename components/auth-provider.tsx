"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { getSupabase } from "@/lib/supabase-simple"
import { performCompleteSignOut } from "@/lib/auth-handler"

export interface AppUser {
  id: string
  name: string
  email: string
  avatar: string | null
  clubId: string | null
  clubName: string | null
  role: string
  isNewUser?: boolean
}

// Define a simple user type for the context
type AuthUser = {
  id: string
  name: string
  email: string
  club?: string
  clubId?: string
  role?: string
  avatar?: string
}

type AuthContextType = {
  user: AuthUser | null
  signInWithSlack: () => Promise<void>
  signOut: () => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
  authError: string | null
  clearAuthError: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signInWithSlack: async () => {},
  signOut: async () => {},
  logout: async () => {},
  isAuthenticated: false,
  isLoading: true,
  authError: null,
  clearAuthError: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const router = useRouter()

  // Add this function to the AuthProvider component to handle hard redirects:
  const hardRedirect = (path: string) => {
    window.location.href = path
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = getSupabase()
        const { data: authData } = await supabase.auth.getUser()

        if (!authData.user) {
          setUser(null)
          setIsLoading(false)
          return
        }

        // Get user profile data
        const { data: profileData } = await supabase.from("users").select("*").eq("auth_id", authData.user.id).single()

        if (profileData) {
          setUser({
            id: authData.user.id,
            name: profileData.name || authData.user.user_metadata?.name || "",
            email: authData.user.email || "",
            club: profileData.club_name,
            clubId: profileData.club_id,
            role: profileData.role,
            avatar: profileData.avatar_url || authData.user.user_metadata?.avatar_url,
          })
        } else {
          // If no profile data, just use auth data
          setUser({
            id: authData.user.id,
            name: authData.user.user_metadata?.name || authData.user.user_metadata?.full_name || "",
            email: authData.user.email || "",
            avatar: authData.user.user_metadata?.avatar_url,
          })
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()

    // Set up auth state change listener
    const supabase = getSupabase()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchUser()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Sign in with Slack
  const signInWithSlack = async () => {
    setIsLoading(true)
    setAuthError(null)

    try {
      const supabase = getSupabase()

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "slack",
        options: {
          redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
        },
      })

      if (error) {
        setAuthError(error.message)
        setIsLoading(false)
        throw error
      }

      // The user will be redirected to Slack for authentication
      // After authentication, they will be redirected back to the callback URL
    } catch (error) {
      console.error("Slack sign in error:", error)
      setAuthError(error instanceof Error ? error.message : "Authentication failed")
      setIsLoading(false)
      throw error
    }
  }

  // Sign out
  const signOut = async () => {
    setIsLoading(true)

    try {
      await performCompleteSignOut()
      setUser(null)
    } catch (error) {
      console.error("Sign out error:", error)
      // Force a hard redirect to home as a fallback
      if (typeof window !== "undefined") {
        window.location.href = "/"
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Alias for signOut for backward compatibility
  const logout = signOut

  // Clear auth error
  const clearAuthError = () => {
    setAuthError(null)
  }

  // Context value
  const value = {
    user,
    signInWithSlack,
    signOut,
    logout,
    isAuthenticated: !!user,
    isLoading,
    authError,
    clearAuthError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
