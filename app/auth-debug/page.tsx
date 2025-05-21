"use client"

import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { performDelayedRedirect } from "@/lib/auth-handler"

export default function AuthDebugPage() {
  const [sessionInfo, setSessionInfo] = useState<string>("Loading session info...")
  const [userInfo, setUserInfo] = useState<string>("Loading user info...")
  const [localStorageInfo, setLocalStorageInfo] = useState<string>("Loading localStorage info...")

  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          setSessionInfo(`Error: ${error.message}`)
        } else {
          setSessionInfo(data.session ? JSON.stringify(data.session, null, 2) : "No active session")
        }
      } catch (err) {
        setSessionInfo(`Error checking session: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    const checkUser = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase.auth.getUser()

        if (error) {
          setUserInfo(`Error: ${error.message}`)
        } else if (data.user) {
          // Try to get user data from database
          try {
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("id, name, email, club_id, role")
              .eq("auth_id", data.user.id)
              .single()

            if (userError) {
              setUserInfo(`Auth user found, but database error: ${userError.message}`)
            } else {
              setUserInfo(`User found: ${JSON.stringify(userData, null, 2)}`)
            }
          } catch (dbErr) {
            setUserInfo(`Error querying database: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`)
          }
        } else {
          setUserInfo("No user found")
        }
      } catch (err) {
        setUserInfo(`Error checking user: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    const checkLocalStorage = () => {
      try {
        const authBackup = localStorage.getItem("auth_backup")
        setLocalStorageInfo(authBackup ? `Auth backup found: ${authBackup}` : "No auth backup found")
      } catch (err) {
        setLocalStorageInfo(`Error checking localStorage: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    checkSession()
    checkUser()
    checkLocalStorage()
  }, [])

  const handleManualRedirect = (path: string) => {
    performDelayedRedirect(path)
  }

  const handleSignOut = async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      await supabase.auth.signOut()
      localStorage.removeItem("auth_backup")
      alert("Signed out successfully")
      window.location.href = "/"
    } catch (error) {
      alert(`Error signing out: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Session Info:</h3>
            <pre className="bg-stone-50 p-4 rounded overflow-auto max-h-40 text-sm">{sessionInfo}</pre>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">User Info:</h3>
            <pre className="bg-stone-50 p-4 rounded overflow-auto max-h-40 text-sm">{userInfo}</pre>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">LocalStorage Info:</h3>
            <pre className="bg-stone-50 p-4 rounded overflow-auto max-h-40 text-sm">{localStorageInfo}</pre>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium mb-2">Manual Navigation:</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleManualRedirect("/dashboard")}>Go to Dashboard</Button>
              <Button onClick={() => handleManualRedirect("/onboarding")}>Go to Onboarding</Button>
              <Button onClick={() => handleManualRedirect("/passport")}>Go to Passport</Button>
              <Button onClick={() => handleManualRedirect("/")}>Go to Home</Button>
              <Button onClick={handleSignOut} variant="destructive">
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
