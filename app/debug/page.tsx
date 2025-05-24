"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPage() {
  const router = useRouter()

  const handleManualRedirect = (path: string) => {
    router.push(path)
  }

  return (
    <div className="min-h-screen bg-stone-100 p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Auth Provider User:</h3>
            <pre className="bg-stone-50 p-4 rounded overflow-auto max-h-40 text-sm">
              No auth provider configured
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Session Info:</h3>
            <pre className="bg-stone-50 p-4 rounded overflow-auto max-h-40 text-sm">
              Supabase removed — session info unavailable
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">User Info:</h3>
            <pre className="bg-stone-50 p-4 rounded overflow-auto max-h-40 text-sm">
              Supabase removed — user info unavailable
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium mb-2">Manual Navigation:</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleManualRedirect("/dashboard")}>Go to Dashboard</Button>
              <Button onClick={() => handleManualRedirect("/onboarding")}>Go to Onboarding</Button>
              <Button onClick={() => handleManualRedirect("/passport")}>Go to Passport</Button>
              <Button onClick={() => handleManualRedirect("/")}>Go to Home</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
