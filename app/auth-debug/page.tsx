"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { performCompleteSignOut } from "@/lib/auth-handler"
import { checkForLingeringAuth } from "@/lib/auth-utils"
import { Loader2 } from "lucide-react"

export default function AuthDebugPage() {
  const [apiData, setApiData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clientAuthData, setClientAuthData] = useState<any>(null)

  // Function to fetch data from our API endpoint
  const fetchAuthDebugData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/auth-debug", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      setApiData(data)

      // Also collect client-side auth data
      collectClientAuthData()
    } catch (err) {
      console.error("Error fetching auth debug data:", err)
      setError(err instanceof Error ? err.message : "Unknown error fetching auth data")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to collect client-side auth data
  const collectClientAuthData = () => {
    try {
      // Make sure we're in the browser environment
      if (typeof window === "undefined") return

      // Check localStorage
      const authItems = []
      if (typeof localStorage !== "undefined") {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (
            key &&
            (key.includes("supabase") || key.includes("auth") || key.includes("session") || key.includes("sb-"))
          ) {
            try {
              const value = localStorage.getItem(key)
              authItems.push({ key, value })
            } catch (e) {
              authItems.push({ key, value: "Error reading value" })
            }
          }
        }
      }

      // Check cookies
      const cookies = typeof document !== "undefined" ? document.cookie.split(";").map((cookie) => cookie.trim()) : []
      const authCookies = cookies.filter((cookie) => {
        const name = cookie.split("=")[0]
        return (
          name &&
          (name.includes("supabase") || name.includes("auth") || name.includes("session") || name.includes("sb-"))
        )
      })

      setClientAuthData({
        authItemsInLocalStorage: authItems,
        authItemsCount: authItems.length,
        authCookies,
        authCookiesCount: authCookies.length,
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      console.error("Error collecting client auth data:", err)
      setClientAuthData({ error: err instanceof Error ? err.message : "Unknown error" })
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchAuthDebugData()
  }, [])

  const handleSignOut = async () => {
    try {
      await performCompleteSignOut()
      // The page will reload after sign out
    } catch (error) {
      alert(`Error signing out: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 p-8">
      <Card className="max-w-4xl mx-auto mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Authentication Debug</span>
            <Button onClick={fetchAuthDebugData} variant="outline" size="sm" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Refresh Data
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
              <h3 className="font-bold mb-2">Error</h3>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium mb-2">Server-Side Auth State:</h3>
            {isLoading ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading server auth data...</span>
              </div>
            ) : (
              <pre className="bg-stone-50 p-4 rounded overflow-auto max-h-60 text-sm">
                {JSON.stringify(apiData, null, 2)}
              </pre>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Client-Side Auth State:</h3>
            {clientAuthData ? (
              <pre className="bg-stone-50 p-4 rounded overflow-auto max-h-60 text-sm">
                {JSON.stringify(clientAuthData, null, 2)}
              </pre>
            ) : (
              <div className="bg-stone-50 p-4 rounded text-center text-stone-500">No client auth data collected</div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium mb-2">Auth Actions:</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSignOut} variant="destructive">
                Complete Sign Out
              </Button>
              <Button onClick={checkForLingeringAuth} variant="outline">
                Check for Lingering Auth
              </Button>
              <Button onClick={() => (window.location.href = "/")} variant="outline">
                Go to Home
              </Button>
              <Button onClick={() => (window.location.href = "/dashboard")} variant="outline">
                Go to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-stone-500">
        <p>This page helps debug authentication issues by showing both server and client auth state.</p>
      </div>
    </div>
  )
}
