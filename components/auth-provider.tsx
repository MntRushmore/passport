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

  // Extract user data from auth session
  const extractUserFromAuth = (authUser: any): AppUser => {
    return {
      id: authUser.id,
      name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "New User",
      email: authUser.email || "",
      avatar: authUser.user_metadata?.avatar_url || null,
      clubId: null,
      clubName: null,
      role: "leader",
      isNewUser: true,
    }
  }

  // Load user data from database with fallback
  const loadUserFromDatabase = async (authId: string): Promise<AppUser | null> => {
    const supabase = getSupabaseBrowserClient()

    try {
      // First try with a simple query to avoid recursion
      const { data: basicUserData, error: basicError } = await supabase
        .from("users")
        .select("id, name, email, avatar_url, club_id, role")
        .eq("auth_id", authId)
        .single()

      if (basicError) {
        console.error("Error loading basic user data:", basicError)
        return null
      }

      // If we have club_id, get the club name in a separate query
      let clubName = null
      if (basicUserData.club_id) {
        const { data: clubData, error: clubError } = await supabase
          .from("clubs")
          .select("name")
          .eq("id", basicUserData.club_id)
          .single()

        if (!clubError && clubData) {
          clubName = clubData.name
        }
      }

      return {
        id: basicUserData.id,
        name: basicUserData.name,
        email: basicUserData.email,
        avatar: basicUserData.avatar_url,
        clubId: basicUserData.club_id,
        clubName: clubName,
        role: basicUserData.role,
        isNewUser: false,
      }
    } catch (error) {
      console.error("Exception in loadUserFromDatabase:", error)
      return null
    }
  }

  // Create user in database
  const createUserInDatabase = async (authUser: any): Promise<AppUser | null> => {
    const supabase = getSupabaseBrowserClient()

    try {
      const userData = {
        auth_id: authUser.id,
        name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "New User",
        email: authUser.email || "",
        avatar_url: authUser.user_metadata?.avatar_url || null,
        role: "leader",
      }

      const { data, error } = await supabase.from("users").insert(userData).select("id").single()

      if (error) {
        console.error("Error creating initial user:", error)
        return null
      }

      return {
        id: data.id,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar_url,
        clubId: null,
        clubName: null,
        role: "leader",
        isNewUser: true,
      }
    } catch (error) {
      console.error("Exception in createUserInDatabase:", error)
      return null
    }
  }

  // Initialize auth state
  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    const initializeAuth = async () => {
      setIsLoading(true)

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          setUser(null)
          setIsLoading(false)
          return
        }

        // Try to load user from database
        let userData = await loadUserFromDatabase(session.user.id)

        // If user doesn't exist in database, create one
        if (!userData) {
          try {
            userData = await createUserInDatabase(session.user)
          } catch (error) {
            console.error("Failed to create user:", error)
          }

          // If we still don't have user data, use a fallback
          if (!userData) {
            userData = extractUserFromAuth(session.user)
          }
        }

        // Set user state
        setUser(userData)

        // Handle routing based on user state
        if (userData.isNewUser || !userData.clubId) {
          if (!window.location.pathname.includes("/onboarding")) {
            router.push("/onboarding")
          }
        } else if (window.location.pathname === "/") {
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session) {
          setIsLoading(true)

          // Try to load user from database
          let userData = await loadUserFromDatabase(session.user.id)

          // If user doesn't exist in database, create one
          if (!userData) {
            try {
              userData = await createUserInDatabase(session.user)
            } catch (error) {
              console.error("Failed to create user:", error)
            }

            // If we still don't have user data, use a fallback
            if (!userData) {
              userData = extractUserFromAuth(session.user)
            }
          }

          // Set user state
          setUser(userData)

          // Handle routing based on user state
          if (userData.isNewUser || !userData.clubId) {
            if (!window.location.pathname.includes("/onboarding")) {
              router.push("/onboarding")
            }
          } else if (window.location.pathname === "/") {
            router.push("/dashboard")
          }

          setIsLoading(false)
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

  // Sign in with email
  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true)
    setAuthError(null)

    try {
      const supabase = getSupabaseBrowserClient()

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setAuthError(error.message)
        throw error
      }
    } catch (error) {
      console.error("Email sign in error:", error)
      setAuthError(error instanceof Error ? error.message : "Authentication failed")
      throw error
    } finally {
      setIsLoading(false)
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
