import type React from "react"
import AuthCheck from "@/components/auth-check"

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthCheck>
      <div className="min-h-screen bg-stone-100">{children}</div>
    </AuthCheck>
  )
}
