"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [result, setResult] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handlePlaceholder = () => {
    setLoading(true)
    setResult("This page used to test Supabase features.\n\nSupabase has been removed.\nReplace this logic with your own.")
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-stone-100 p-8 flex flex-col items-center">
      <Card className="w-full max-w-2xl border-gold-500">
        <CardHeader>
          <CardTitle className="text-center font-serif text-navy-700">Test Page</CardTitle>
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

            <Button
              onClick={handlePlaceholder}
              disabled={loading}
              className="w-full bg-navy-700 hover:bg-navy-800 text-cream font-serif"
            >
              {loading ? "Running..." : "Run Test"}
            </Button>

            {result && (
              <div className="mt-4 p-4 bg-white border border-gold-500 rounded-md">
                <h3 className="font-medium mb-2">Test Results:</h3>
                <pre className="whitespace-pre-wrap text-sm font-mono bg-stone-50 p-3 rounded overflow-auto max-h-80">
                  {result}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
