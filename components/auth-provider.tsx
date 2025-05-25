"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

type AuthUser = {
  id: string
  name: string
  email: string
  avatar?: string
  role?: string
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

  // Placeholder fetch logic
  useEffect(() => {
    setIsLoading(true)
    try {
      const session = document.cookie
        .split("; ")
        .find((row) => row.startsWith("session="))
        ?.split("=")[1]
      if (session) {
        setUser({ id: "1", name: "Slack User", email: "user@example.com" }) // Replace with actual logic later
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signInWithSlack = () => {
    router.push("/api/auth/slack")
  }

  const signOut = () => {
    document.cookie = "session=; Max-Age=0; path=/"
    router.push("/login")
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
