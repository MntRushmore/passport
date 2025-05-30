import type React from "react"
import AuthCheck from "@/components/auth-check"

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
