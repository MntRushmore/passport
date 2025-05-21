import type { ReactNode } from "react"
import AuthCheck from "@/components/auth-check"

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return <AuthCheck>{children}</AuthCheck>
}
