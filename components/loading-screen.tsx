import { Loader2 } from "lucide-react"

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy-700 mx-auto" />
        <p className="mt-4 font-mono text-sm text-navy-700">{message}</p>
      </div>
    </div>
  )
}
