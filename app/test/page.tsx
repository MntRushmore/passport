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

        // Test 4: Try direct query with RLS disabled
        try {
          const { data: directData, error: directError } = await supabase
            .from("users")
            .select("id, name, email")
            .eq("auth_id", data.user?.id)
            .single()

          if (directError) {
            throw new Error(`Direct query error: ${directError.message}`)
          }

          setResult((prev) => prev + `\n✓ User data retrieved via direct query: ${directData.name}`)
        } catch (directError) {
          setResult(
            (prev) =>
              prev +
              `\n❌ Error loading user data via direct query: ${directError instanceof Error ? directError.message : String(directError)}`,
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

  const checkRLSStatus = async () => {
    setLoading(true)
    setResult("Checking database access...")

    try {
      const supabase = getSupabaseBrowserClient()

      // Check if we have a session
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        setResult((prev) => prev + "\n⚠️ No active session. Please sign in first.")
        setLoading(false)
        return
      }

      // Try direct queries to each table
      const tables = ["users", "clubs", "workshops", "submissions", "club_members"]

      for (const table of tables) {
        try {
          const { data, error } = await supabase.from(table).select("*").limit(1)

          if (error) {
            setResult((prev) => prev + `\n❌ ${table} query failed: ${error.message}`)
          } else {
            setResult((prev) => prev + `\n✓ ${table} query successful: ${data.length} records`)
          }
        } catch (error) {
          setResult(
            (prev) => prev + `\n❌ Error querying ${table}: ${error instanceof Error ? error.message : String(error)}`,
          )
        }
      }

      setResult((prev) => prev + "\n\n✅ Database access check completed!")
    } catch (error) {
      console.error("Database check error:", error)
      setResult((prev) => prev + `\n\n❌ Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const runSetupScripts = async () => {
    setLoading(true)
    setResult("This button would run the setup scripts if implemented.\n\nTo set up your database:")

    setResult((prev) => prev + "\n\n1. Go to your Supabase dashboard")
    setResult((prev) => prev + "\n2. Navigate to the SQL Editor")
    setResult((prev) => prev + "\n3. Run the following SQL:")
    setResult(
      (prev) =>
        prev +
        "\n\n```sql\n-- Completely disable RLS on all tables temporarily\nALTER TABLE users DISABLE ROW LEVEL SECURITY;\nALTER TABLE clubs DISABLE ROW LEVEL SECURITY;\nALTER TABLE workshops DISABLE ROW LEVEL SECURITY;\nALTER TABLE submissions DISABLE ROW LEVEL SECURITY;\nALTER TABLE club_members DISABLE ROW LEVEL SECURITY;\n```",
    )

    setLoading(false)
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
                onClick={checkRLSStatus}
                disabled={loading}
                className="flex-1 bg-navy-700 hover:bg-navy-800 text-cream font-serif"
              >
                {loading ? "Checking..." : "Check Database Access"}
              </Button>
            </div>

            <Button
              onClick={runSetupScripts}
              disabled={loading}
              className="w-full bg-gold-600 hover:bg-gold-700 text-navy-800 font-serif"
            >
              {loading ? "Running..." : "Database Setup Instructions"}
            </Button>

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
