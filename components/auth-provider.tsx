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
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
  authError: string | null
  clearAuthError: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
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
            avatar: profileData.avatar_url,
          })
        } else {
          // If no profile data, just use auth data
          setUser({
            id: authData.user.id,
            name: authData.user.user_metadata?.name || "",
            email: authData.user.email || "",
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

  // Sign in with email
  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true)
    setAuthError(null)

    try {
      const supabase = getSupabase()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setAuthError(error.message)
        setIsLoading(false)
        throw error
      }

      // If we have a user, check if they have a club and redirect accordingly
      if (data.user) {
        try {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("club_id")
            .eq("auth_id", data.user.id)
            .single()

          if (!userError && userData) {
            if (userData.club_id) {
              hardRedirect("/dashboard")
            } else {
              hardRedirect("/onboarding")
            }
          } else {
            // Default to onboarding if there's an error
            hardRedirect("/onboarding")
          }
        } catch (err) {
          console.error("Error checking user data after sign in:", err)
          // Default to dashboard
          hardRedirect("/dashboard")
        }
      }
    } catch (error) {
      console.error("Email sign in error:", error)
      setAuthError(error instanceof Error ? error.message : "Authentication failed")
      setIsLoading(false)
      throw error
    }
  }

  // Sign up with email
  const signUpWithEmail = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    setAuthError(null)

    try {
      const supabase = getSupabase()

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) {
        setAuthError(error.message)
        throw error
      }

      // If user was created, try to sign in immediately
      if (data.user) {
        try {
          // Create user record in the database
          const userData = {
            auth_id: data.user.id,
            name: name,
            email: email,
            role: "leader",
          }

          await supabase.from("users").insert(userData)

          // Sign in
          await supabase.auth.signInWithPassword({
            email,
            password,
          })
        } catch (signInError) {
          console.error("Auto sign-in after signup failed:", signInError)
          setAuthError("Account created but sign-in failed. Please try signing in manually.")
        }
      }
    } catch (error) {
      console.error("Email sign up error:", error)
      setAuthError(error instanceof Error ? error.message : "Registration failed")
      throw error
    } finally {
      setIsLoading(false)
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
      window.location.href = "/"
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
    signInWithEmail,
    signUpWithEmail,
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
