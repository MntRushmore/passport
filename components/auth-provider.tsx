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

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/auth/user")
        if (!res.ok) throw new Error("Failed to fetch user")
        const data = await res.json()

        setUser(data)

        // Redirect logic
        if (data.isNewUser || !data.clubId) {
          router.push("/onboarding")
        } else {
          router.push("/dashboard")
        }
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
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
