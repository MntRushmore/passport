"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type User = {
  id: string
  name: string
  club?: {
    name: string
    clubCode: string
  }
  email: string
  avatar?: string
} | null

type AuthContextType = {
  user: User
  login: (user: User) => void
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check server-side authentication on initial load
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const sessionData = await response.json()
          setUser(sessionData.user ?? sessionData)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  const login = (userData: User) => {
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
    // Clear the session cookie by calling logout endpoint
    fetch('/api/auth/logout', { method: 'POST' })
  }

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
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
