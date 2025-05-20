"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { User } from "@/types/supabase"

export interface AppUser {
  id: string
  name: string
  email: string
  avatar: string | null
  clubId: string | null
  clubName: string | null
  role: User["role"]
  isNewUser?: boolean
}

type AuthContextType = {
  user: AppUser | null
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
  authError: string | null
  clearAuthError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const router = useRouter()

  // Add this function to the AuthProvider component to handle hard redirects:
  const hardRedirect = (path: string) => {
    window.location.href = path
  }

  // Initialize auth state
  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    const initializeAuth = async () => {
      setIsLoading(true)

      try {
        // Get the current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session error:", sessionError)
          setUser(null)
          setIsLoading(false)
          return
        }

        // If no session, clear user state and return
        if (!session) {
          setUser(null)
          setIsLoading(false)
          return
        }

        // Create a fallback user from auth data
        const fallbackUser = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "New User",
          email: session.user.email || "",
          avatar: session.user.user_metadata?.avatar_url || null,
          clubId: null,
          clubName: null,
          role: "leader" as const,
          isNewUser: true,
        }

        try {
          // Try to get user data using direct query first (since RPC might not exist yet)
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id, name, email, avatar_url, club_id, role")
            .eq("auth_id", session.user.id)
            .single()

          if (userError) {
            // If user doesn't exist in the database yet
            if (userError.code === "PGRST116") {
              console.log("New user detected, needs to create profile")
              setUser(fallbackUser)

              // Redirect to onboarding if not already there
              if (!window.location.pathname.includes("/onboarding")) {
                router.push("/onboarding")
              }
            } else {
              console.error("Error loading user data:", userError)
              setUser(fallbackUser)
            }
            setIsLoading(false)
            return
          }

          // Set user data from direct query
          let clubName = null
          if (userData.club_id) {
            try {
              const { data: clubData } = await supabase.from("clubs").select("name").eq("id", userData.club_id).single()

              if (clubData) {
                clubName = clubData.name
              }
            } catch (clubError) {
              console.error("Error fetching club name:", clubError)
            }
          }

          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            avatar: userData.avatar_url,
            clubId: userData.club_id,
            clubName: clubName,
            role: userData.role,
            isNewUser: false,
          })

          // Handle routing
          if (!userData.club_id) {
            if (!window.location.pathname.includes("/onboarding")) {
              router.push("/onboarding")
            }
          } else if (window.location.pathname === "/") {
            router.push("/dashboard")
          }
        } catch (error) {
          console.error("Error in user data fetching:", error)
          setUser(fallbackUser)

          // Redirect to onboarding as a fallback
          if (!window.location.pathname.includes("/onboarding")) {
            router.push("/onboarding")
          }
        }
      } catch (error) {
        console.error("Error in auth initialization:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    // Initialize auth state
    initializeAuth()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event)

      if (event === "SIGNED_OUT") {
        setUser(null)
        router.push("/")
        return
      }

      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
        // Just trigger initialization again on sign in
        initializeAuth()
      }
    })

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  // Sign in with email
  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true)
    setAuthError(null)

    try {
      const supabase = getSupabaseBrowserClient()

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
      const supabase = getSupabaseBrowserClient()

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
      const supabase = getSupabaseBrowserClient()
      await supabase.auth.signOut()
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
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

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
