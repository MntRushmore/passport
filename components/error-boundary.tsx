"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Caught error:", error)
      setHasError(true)
      setError(error.error || new Error(error.message))
    }

    window.addEventListener("error", errorHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
    }
  }, [])

  if (hasError) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg border border-red-300 shadow-lg p-6">
          <h2 className="text-xl font-serif text-red-600 mb-4">Something went wrong</h2>
          <div className="bg-red-50 p-4 rounded mb-4 overflow-auto max-h-60">
            <p className="font-mono text-sm text-red-800">{error?.message || "Unknown error"}</p>
            {error?.stack && <pre className="mt-2 text-xs text-red-700 whitespace-pre-wrap">{error.stack}</pre>}
          </div>
          <div className="flex justify-between">
            <Button onClick={() => window.location.reload()} className="bg-navy-700 hover:bg-navy-800 text-cream">
              Reload Page
            </Button>
            <Button
              onClick={() => {
                setHasError(false)
                setError(null)
              }}
              variant="outline"
              className="border-navy-700 text-navy-700"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
