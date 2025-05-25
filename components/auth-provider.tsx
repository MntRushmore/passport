"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

type AuthUser = {
  id: string
  slackId: string
  name: string
  email: string
  avatar?: string
  createdAt?: string
}

type AuthContextType = {
  user: AuthUser | null
  signInWithSlack: () => void
  signOut: () => void
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
  authError: string | null
  clearAuthError: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signInWithSlack: () => {},
  signOut: () => {},
  logout: () => {},
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

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Session check failed:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const signInWithSlack = () => {
    router.push("/api/auth/slack")
  }

  const signOut = async () => {
    try {
      setIsLoading(true)
      
      // Call the logout API endpoint
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      
      if (response.ok) {
        setUser(null)
        router.push("/login")
      } else {
        console.error("Logout failed:", response.statusText)
        // Still clear local state even if API call fails
        setUser(null)
        router.push("/login")
      }
    } catch (error) {
      console.error("Sign out error:", error)
      // Clear local state even if there's an error
      setUser(null)
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = signOut

  const clearAuthError = () => {
    setAuthError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signInWithSlack,
        signOut,
        logout,
        isAuthenticated: !!user,
        isLoading,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
