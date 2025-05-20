"use client"

import { useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [result, setResult] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const testSignIn = async () => {
    setLoading(true)
    setResult("Testing sign in...")

    try {
      const supabase = getSupabaseBrowserClient()

      // Test 1: Check if Supabase client is initialized
      setResult((prev) => prev + "\n✓ Supabase client initialized")

      // Test 2: Try to get session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`)
      }
      setResult((prev) => prev + `\n✓ Session check: ${sessionData.session ? "Active session" : "No active session"}`)

      // Test 3: Try to sign in
      if (email && password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          throw new Error(`Sign in error: ${error.message}`)
        }

        setResult((prev) => prev + `\n✓ Sign in successful: ${data.user?.email}`)

        // Test 4: Try to get user data with a direct query to avoid RLS issues
        try {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id, name, email")
            .eq("auth_id", data.user?.id)
            .single()

          if (userError) {
            if (userError.code === "PGRST116") {
              setResult((prev) => prev + "\n⚠️ User not found in database")
            } else {
              throw new Error(`User data error: ${userError.message}`)
            }
          } else {
            setResult((prev) => prev + `\n✓ User data retrieved: ${userData.name}`)
          }
        } catch (userDataError) {
          setResult(
            (prev) =>
              prev +
              `\n❌ Error loading user data: ${userDataError instanceof Error ? userDataError.message : String(userDataError)}`,
          )
        }

        // Test 5: Try to get club data if user has a club
        try {
          const { data: clubData, error: clubError } = await supabase
            .from("users")
            .select("club_id")
            .eq("auth_id", data.user?.id)
            .single()

          if (!clubError && clubData && clubData.club_id) {
            const { data: club, error: clubDetailsError } = await supabase
              .from("clubs")
              .select("name")
              .eq("id", clubData.club_id)
              .single()

            if (clubDetailsError) {
              throw new Error(`Club data error: ${clubDetailsError.message}`)
            }

            setResult((prev) => prev + `\n✓ Club data retrieved: ${club.name}`)
          } else {
            setResult((prev) => prev + "\n⚠️ User has no club or club data couldn't be retrieved")
          }
        } catch (clubDataError) {
          setResult(
            (prev) =>
              prev +
              `\n❌ Error loading club data: ${clubDataError instanceof Error ? clubDataError.message : String(clubDataError)}`,
          )
        }
      } else {
        setResult((prev) => prev + "\n⚠️ No email/password provided for sign in test")
      }

      setResult((prev) => prev + "\n\n✅ All tests completed!")
    } catch (error) {
      console.error("Test error:", error)
      setResult((prev) => prev + `\n\n❌ Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const testRLS = async () => {
    setLoading(true)
    setResult("Testing RLS policies...")

    try {
      const supabase = getSupabaseBrowserClient()

      // Check if we have a session
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        setResult((prev) => prev + "\n⚠️ No active session. Please sign in first.")
        setLoading(false)
        return
      }

      // Test 1: Read users table
      try {
        const { data: users, error: usersError } = await supabase.from("users").select("id, name, email").limit(5)

        if (usersError) {
          throw new Error(`Users read error: ${usersError.message}`)
        }

        setResult((prev) => prev + `\n✓ Users read successful: Retrieved ${users.length} users`)
      } catch (usersError) {
        setResult(
          (prev) =>
            prev + `\n❌ Users read error: ${usersError instanceof Error ? usersError.message : String(usersError)}`,
        )
      }

      // Test 2: Read clubs table
      try {
        const { data: clubs, error: clubsError } = await supabase.from("clubs").select("id, name").limit(5)

        if (clubsError) {
          throw new Error(`Clubs read error: ${clubsError.message}`)
        }

        setResult((prev) => prev + `\n✓ Clubs read successful: Retrieved ${clubs.length} clubs`)
      } catch (clubsError) {
        setResult(
          (prev) =>
            prev + `\n❌ Clubs read error: ${clubsError instanceof Error ? clubsError.message : String(clubsError)}`,
        )
      }

      // Test 3: Read workshops table
      try {
        const { data: workshops, error: workshopsError } = await supabase.from("workshops").select("id, title").limit(5)

        if (workshopsError) {
          throw new Error(`Workshops read error: ${workshopsError.message}`)
        }

        setResult((prev) => prev + `\n✓ Workshops read successful: Retrieved ${workshops.length} workshops`)
      } catch (workshopsError) {
        setResult(
          (prev) =>
            prev +
            `\n❌ Workshops read error: ${workshopsError instanceof Error ? workshopsError.message : String(workshopsError)}`,
        )
      }

      setResult((prev) => prev + "\n\n✅ RLS tests completed!")
    } catch (error) {
      console.error("RLS test error:", error)
      setResult((prev) => prev + `\n\n❌ Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 p-8 flex flex-col items-center">
      <Card className="w-full max-w-2xl border-gold-500">
        <CardHeader>
          <CardTitle className="text-center font-serif text-navy-700">Supabase Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="border-gold-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="border-gold-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={testSignIn}
                disabled={loading}
                className="flex-1 bg-navy-700 hover:bg-navy-800 text-cream font-serif"
              >
                {loading ? "Testing..." : "Test Sign In"}
              </Button>

              <Button
                onClick={testRLS}
                disabled={loading}
                className="flex-1 bg-navy-700 hover:bg-navy-800 text-cream font-serif"
              >
                {loading ? "Testing..." : "Test RLS Policies"}
              </Button>
            </div>

            {result && (
              <div className="mt-4 p-4 bg-white border border-gold-500 rounded-md">
                <h3 className="font-medium mb-2">Test Results:</h3>
                <pre className="whitespace-pre-wrap text-sm font-mono bg-stone-50 p-3 rounded overflow-auto max-h-80">
                  {result}
                </pre>
              </div>
            )}

            <div className="mt-4 p-4 bg-stone-50 border border-stone-200 rounded-md">
              <h3 className="font-medium mb-2">Environment Check:</h3>
              <div className="text-sm font-mono">
                <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Not Set"}</p>
                <p>
                  NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Not Set"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
