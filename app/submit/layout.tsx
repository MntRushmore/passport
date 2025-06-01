import type React from "react"
export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-stone-100">{children}</div>
}

// This layout component wraps the submit page in a full-screen background